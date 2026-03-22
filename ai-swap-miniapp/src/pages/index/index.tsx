import { useState, useRef, useCallback, useEffect } from 'react'
import Taro, { useShareAppMessage } from '@tarojs/taro'
import { View, Text, Image, Video, Textarea, ScrollView } from '@tarojs/components'
import { request, uploadFile, downloadAndSaveVideo, BASE_URL } from '@/utils/request'
import './index.scss'

type SwapType = 'product' | 'clothing' | 'model' | 'i2v'

const DEFAULT_PROMPTS: Record<SwapType, string> = {
  product: '把上传图片中的产品，替换掉视频中的产品，保持视频的整体风格和运动轨迹不变，让替换后的画面自然流畅',
  clothing: '把上传图片中的服饰，替换掉视频中模特身上的服装，保持模特的动作姿态不变，让服饰在视频中自然展示',
  model: '把上传图片中的人物/模特，替换掉视频中的人物，保持原始视频的动作和场景不变，让替换后的人物动作自然协调',
  i2v: '将图片中的内容生成一段动态视频，画面自然流畅，运动幅度适中',
}

interface UploadedImage {
  id: string
  localPath: string
  serverUrl?: string
  uploading?: boolean
}

interface HistoryVideo {
  id: string
  title: string
  type: SwapType
  createdAt: string
  duration: string
  status: 'completed' | 'processing' | 'failed'
  hasEnglish: boolean
  desc: string
  videoUrl?: string
}

const SWAP_TYPES: { id: SwapType; label: string; icon: string }[] = [
  { id: 'product', label: '商品替换', icon: '🛍️' },
  { id: 'clothing', label: '服饰替换', icon: '👗' },
  { id: 'model', label: '模特替换', icon: '🧑' },
  { id: 'i2v', label: '图生视频', icon: '🎬' },
]

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10)
}

export default function IndexPage() {
  // ---- State ----
  const [swapType, setSwapType] = useState<SwapType>('product')
  const [videoPath, setVideoPath] = useState<string | null>(null)
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [uploadedVideoDuration, setUploadedVideoDuration] = useState<number | null>(null)
  const [productImages, setProductImages] = useState<UploadedImage[]>([])
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)

  const [videoPrompt, setVideoPrompt] = useState(DEFAULT_PROMPTS['product'])
  const [videoDuration, setVideoDuration] = useState(5)
  const [customDuration, setCustomDuration] = useState(false)
  const [enableVoiceover, setEnableVoiceover] = useState(false)
  const [productDesc, setProductDesc] = useState('')
  const [englishDesc, setEnglishDesc] = useState('')
  const [needEnglish, setNeedEnglish] = useState(false)

  const [isGeneratingDesc, setIsGeneratingDesc] = useState(false)
  const [isGeneratingEnDesc, setIsGeneratingEnDesc] = useState(false)
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false)

  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [taskId, setTaskId] = useState<string | null>(null)
  const [resultReady, setResultReady] = useState(false)
  const [resultVideoUrl, setResultVideoUrl] = useState<string | null>(null)
  const [voiceoverUrl, setVoiceoverUrl] = useState<string | null>(null)
  const [isGeneratingVoiceover, setIsGeneratingVoiceover] = useState(false)

  const [apiError, setApiError] = useState<string | null>(null)
  const [historyVideos, setHistoryVideos] = useState<HistoryVideo[]>([])

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const audioCtxRef = useRef<Taro.InnerAudioContext | null>(null)

  const effectiveDuration = swapType === 'i2v' ? videoDuration : (uploadedVideoDuration || videoDuration)

  // ---- Share ----
  useShareAppMessage(() => ({
    title: '先雄AI实验室 - 3分钟生成带货短视频',
    path: '/pages/index/index',
  }))

  // ---- Fetch History ----
  const fetchHistory = useCallback(async () => {
    try {
      const data = await request<{ success: boolean; history: HistoryVideo[] }>({
        url: '/api/ai-lab/history',
      })
      if (data.success) setHistoryVideos(data.history || [])
    } catch { /* ignore */ }
  }, [])

  useEffect(() => { fetchHistory() }, [fetchHistory])

  // ---- Poll Progress ----
  useEffect(() => {
    if (generating && taskId) {
      if (timerRef.current) clearInterval(timerRef.current)
      timerRef.current = setInterval(async () => {
        try {
          const data = await request<{
            status: string; progress: number; resultUrl?: string; error?: string
          }>({ url: `/api/ai-lab/generate-video/status?taskId=${taskId}` })

          setProgress(data.progress || 0)

          if (data.status === 'completed') {
            if (timerRef.current) clearInterval(timerRef.current)
            setResultReady(true)
            setGenerating(false)
            setResultVideoUrl(data.resultUrl || null)

            // Auto voiceover
            const shouldVoiceover = enableVoiceover || (needEnglish && !!englishDesc)
            if (shouldVoiceover) {
              const voiceText = (needEnglish && englishDesc) ? englishDesc : productDesc
              if (voiceText) {
                if (!enableVoiceover) setEnableVoiceover(true)
                setTimeout(() => handleGenerateVoiceover(voiceText), 500)
              }
            }

            // Save to history
            const typeLabels: Record<SwapType, string> = { product: '商品', clothing: '服饰', model: '模特', i2v: '图生' }
            request({
              url: '/api/ai-lab/history',
              method: 'POST',
              data: {
                title: `${typeLabels[swapType]}推广视频`,
                type: swapType,
                hasEnglish: needEnglish,
                desc: productDesc.slice(0, 50),
                videoUrl: data.resultUrl,
                imageUrls: uploadedImageUrls,
                originalVideoUrl: uploadedVideoUrl,
              },
            }).then(() => fetchHistory())
          } else if (data.status === 'failed') {
            if (timerRef.current) clearInterval(timerRef.current)
            setApiError(data.error || '视频生成失败')
            setGenerating(false)
          }
        } catch { /* retry */ }
      }, 2000)
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [generating, taskId])

  // ---- Cleanup audio ----
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.destroy()
        audioCtxRef.current = null
      }
    }
  }, [])

  // ---- Handlers ----
  const handleGenerateVoiceover = async (text?: string) => {
    const descText = text || productDesc
    if (!descText) { setApiError('请先生成或输入商品文案'); return }
    setIsGeneratingVoiceover(true)
    setVoiceoverUrl(null)
    try {
      const data = await request<{ success: boolean; url: string }>({
        url: '/api/ai-lab/generate-tts',
        method: 'POST',
        data: { text: descText, duration: effectiveDuration, returnUrl: true },
      })
      if (data.success && data.url) {
        const fullUrl = data.url.startsWith('http') ? data.url : `${BASE_URL}${data.url}`
        setVoiceoverUrl(fullUrl)
      }
    } catch (err: any) {
      setApiError('配音生成失败: ' + (err.message || '网络错误'))
    }
    setIsGeneratingVoiceover(false)
  }

  const handleVideoUpload = async () => {
    try {
      const res = await Taro.chooseMedia({
        count: 1,
        mediaType: ['video'],
        sourceType: ['album', 'camera'],
        maxDuration: 60,
      })
      const file = res.tempFiles[0]
      if (!file) return

      setVideoPath(file.tempFilePath)
      setUploadingVideo(true)
      setApiError(null)
      if (file.duration) setUploadedVideoDuration(Math.round(file.duration))

      const uploadRes = await uploadFile(file.tempFilePath, 'video')
      setUploadedVideoUrl(uploadRes.url)
      setUploadingVideo(false)
    } catch (err: any) {
      if (!err?.errMsg?.includes('cancel')) {
        setApiError('视频上传失败: ' + (err.message || ''))
      }
      setUploadingVideo(false)
    }
  }

  const handleImageUpload = async () => {
    const remaining = 5 - productImages.length
    if (remaining <= 0) return

    try {
      const res = await Taro.chooseImage({
        count: remaining,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
      })

      setUploadingImages(true)
      setApiError(null)

      const newImages: UploadedImage[] = res.tempFilePaths.map(p => ({
        id: genId(), localPath: p, uploading: true,
      }))
      setProductImages(prev => [...prev, ...newImages])

      const urls: string[] = []
      for (const img of newImages) {
        try {
          const uploadRes = await uploadFile(img.localPath, 'image')
          urls.push(uploadRes.url)
          setProductImages(prev =>
            prev.map(p => p.id === img.id ? { ...p, serverUrl: uploadRes.url, uploading: false } : p)
          )
        } catch { /* ignore single fail */ }
      }
      setUploadedImageUrls(prev => [...prev, ...urls])
      setUploadingImages(false)
    } catch (err: any) {
      if (!err?.errMsg?.includes('cancel')) {
        setApiError('图片上传失败')
      }
      setUploadingImages(false)
    }
  }

  const removeImage = (id: string) => {
    setProductImages(prev => {
      const removed = prev.find(p => p.id === id)
      if (removed?.serverUrl) {
        setUploadedImageUrls(urls => urls.filter(u => u !== removed.serverUrl))
      }
      return prev.filter(p => p.id !== id)
    })
  }

  const removeVideo = () => {
    setVideoPath(null)
    setUploadedVideoUrl(null)
    setUploadedVideoDuration(null)
  }

  const handleGeneratePrompt = async () => {
    const currentUrls = productImages.map(i => i.serverUrl).filter((u): u is string => !!u)
    if (currentUrls.length === 0) { setApiError('请先上传图片'); return }
    setIsGeneratingPrompt(true); setApiError(null)
    try {
      const data = await request<{ success: boolean; prompt: string; error?: string }>({
        url: '/api/ai-lab/generate-prompt', method: 'POST', data: { imageUrls: currentUrls },
      })
      if (data.success) setVideoPrompt(data.prompt)
      else setApiError(data.error || '提示词生成失败')
    } catch (err: any) { setApiError('提示词生成失败: ' + (err.message || '')) }
    setIsGeneratingPrompt(false)
  }

  const handleGenerateDesc = async () => {
    setIsGeneratingDesc(true); setApiError(null)
    try {
      const data = await request<{ success: boolean; desc: string; error?: string }>({
        url: '/api/ai-lab/generate-desc', method: 'POST',
        data: {
          swapType, imageCount: productImages.length, hasVideo: !!videoPath,
          videoUrl: resultVideoUrl || undefined,
          imageUrls: uploadedImageUrls.length > 0 ? uploadedImageUrls : undefined,
          uploadedVideoUrl: uploadedVideoUrl || undefined,
          videoDuration: effectiveDuration,
        },
      })
      if (data.success) setProductDesc(data.desc)
      else setApiError(data.error || '文案生成失败')
    } catch (err: any) { setApiError('文案生成失败: ' + (err.message || '')) }
    setIsGeneratingDesc(false)
  }

  const handleGenerateEnDesc = async () => {
    setIsGeneratingEnDesc(true); setApiError(null)
    try {
      const data = await request<{ success: boolean; translation: string; error?: string }>({
        url: '/api/ai-lab/translate', method: 'POST', data: { text: productDesc },
      })
      if (data.success) setEnglishDesc(data.translation)
      else setApiError(data.error || '翻译失败')
    } catch (err: any) { setApiError('翻译失败: ' + (err.message || '')) }
    setIsGeneratingEnDesc(false)
  }

  const canGenerate = productImages.length > 0 && !generating

  const handleGenerate = async () => {
    if (timerRef.current) clearInterval(timerRef.current)
    setGenerating(true); setProgress(0); setResultReady(false)
    setResultVideoUrl(null); setApiError(null)
    try {
      const data = await request<{ success: boolean; taskId: string; error?: string }>({
        url: '/api/ai-lab/generate-video', method: 'POST',
        data: {
          videoUrl: uploadedVideoUrl, imageUrls: uploadedImageUrls,
          desc: productDesc, swapType, needEnglish, englishDesc,
          videoPrompt, duration: videoDuration,
        },
      })
      if (data.success) setTaskId(data.taskId)
      else { setApiError(data.error || '创建任务失败'); setGenerating(false) }
    } catch (err: any) {
      setApiError('创建任务失败: ' + (err.message || '')); setGenerating(false)
    }
  }

  const handleReset = () => {
    setVideoPath(null); setProductImages([]); setProgress(0)
    setResultReady(false); setGenerating(false); setProductDesc('')
    setEnglishDesc(''); setNeedEnglish(false); setTaskId(null)
    setResultVideoUrl(null); setUploadedVideoUrl(null); setUploadedImageUrls([])
    setVideoPrompt(DEFAULT_PROMPTS['product']); setVideoDuration(5)
    setCustomDuration(false); setEnableVoiceover(false); setVoiceoverUrl(null)
    setIsGeneratingVoiceover(false); setIsGeneratingPrompt(false)
    setUploadedVideoDuration(null); setApiError(null)
    if (audioCtxRef.current) { audioCtxRef.current.stop(); audioCtxRef.current.destroy(); audioCtxRef.current = null }
  }

  const handlePlayVoiceover = () => {
    if (!voiceoverUrl) return
    if (!audioCtxRef.current) {
      audioCtxRef.current = Taro.createInnerAudioContext()
    }
    audioCtxRef.current.src = voiceoverUrl
    audioCtxRef.current.play()
  }

  // ---- Steps ----
  const steps = [
    { num: 1, label: '上传素材', done: productImages.length > 0 },
    { num: 2, label: '提示词', done: true },
    { num: 3, label: 'AI生成', done: resultReady },
    { num: 4, label: '文案发布', done: false },
  ]

  // ---- Render ----
  return (
    <View className='page-wrap'>
    <ScrollView scrollY className='page'>
      {/* Step Indicator */}
      <View className='steps-bar'>
          {steps.map((s, i) => {
            const isActive = !s.done && (i === 0 || steps[i - 1].done)
            const isCurrent = generating && s.num === 3
            return (
              <View key={s.num} className='step-item'>
                <View className={`step-circle ${s.done ? 'done' : isCurrent ? 'current' : isActive ? 'active' : ''}`}>
                  {s.done ? <Text className='step-check'>✓</Text> : <Text>{s.num}</Text>}
                </View>
                <Text className={`step-label ${s.done ? 'done' : isActive || isCurrent ? 'active' : ''}`}>{s.label}</Text>
                {i < steps.length - 1 && <View className={`step-line ${s.done ? 'done' : ''}`} />}
              </View>
            )
          })}
      </View>

      {/* Page Header Bar */}
      <View className='page-header-bar'>
        <View className='header-left'>
          <Text className='header-icon'>✨</Text>
          <Text className='header-label'>AI创作工作台</Text>
        </View>
        <View className='header-right' onClick={() => Taro.navigateTo({ url: '/pages/history/index' })}>
          <Text className='header-history'>我的作品{historyVideos.length > 0 ? `(${historyVideos.length})` : ''}</Text>
          <Text className='header-arrow'>›</Text>
        </View>
      </View>

      {/* Error Banner */}
      {apiError && (
        <View className='error-banner'>
          <Text className='error-text'>{apiError}</Text>
          <Text className='error-close' onClick={() => setApiError(null)}>✕</Text>
        </View>
      )}

      {/* ======= Main Workspace ======= */}
      <View className='workspace'>
          {/* Swap Type */}
          <View className='card'>
            <Text className='card-title'>选择创作模式</Text>
            <View className='type-grid'>
              {SWAP_TYPES.map(t => (
                <View
                  key={t.id}
                  className={`type-btn ${swapType === t.id ? 'active' : ''}`}
                  onClick={() => {
                    setSwapType(t.id)
                    setVideoPrompt(DEFAULT_PROMPTS[t.id])
                    setVideoDuration(t.id === 'i2v' ? 10 : 5)
                    setCustomDuration(false)
                  }}
                >
                  <Text className='type-icon'>{t.icon}</Text>
                  <Text className='type-label'>{t.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Video Upload */}
          {swapType !== 'i2v' && (
            <View className='card'>
              <View className='card-header'>
                <Text className='card-title'>🎬 原始视频</Text>
                <Text className='card-hint'>可选，不上传则AI生成</Text>
              </View>
              {!videoPath ? (
                <View className='upload-area' onClick={handleVideoUpload}>
                  <Text className='upload-icon'>📹</Text>
                  <Text className='upload-text'>点击上传视频</Text>
                  <Text className='upload-hint'>支持 MP4 / MOV，最大200MB</Text>
                </View>
              ) : (
                <View className='video-preview'>
                  <Video
                    src={videoPath}
                    className='preview-video'
                    controls
                    objectFit='contain'
                  />
                  <View className='remove-btn' onClick={removeVideo}><Text>✕</Text></View>
                  {uploadingVideo && (
                    <View className='upload-overlay'><Text className='loading-text'>上传中...</Text></View>
                  )}
                </View>
              )}
            </View>
          )}

          {/* Image Upload */}
          <View className='card'>
            <Text className='card-title'>
              🖼️ {swapType === 'i2v' ? '上传图片' : '商品图片'} ({productImages.length}/5)
            </Text>
            <View className='image-grid'>
              {productImages.map(img => (
                <View key={img.id} className='image-item'>
                  <Image src={img.localPath} className='image-thumb' mode='aspectFill' />
                  {img.uploading && (
                    <View className='upload-overlay'><Text className='loading-text'>...</Text></View>
                  )}
                  <View className='remove-btn-sm' onClick={() => removeImage(img.id)}>
                    <Text>✕</Text>
                  </View>
                </View>
              ))}
              {productImages.length < 5 && (
                <View className='image-add' onClick={handleImageUpload}>
                  <Text className='add-icon'>+</Text>
                  <Text className='add-text'>添加</Text>
                </View>
              )}
            </View>
          </View>

          {/* Video Prompt */}
          <View className='card'>
            <View className='card-header'>
              <Text className='card-title'>💡 AI提示词</Text>
              <Text className='card-hint'>描述你想要的视频效果</Text>
            </View>
            <Textarea
              value={videoPrompt}
              onInput={e => setVideoPrompt(e.detail.value)}
              placeholder='描述你想要AI生成的视频效果...'
              className='textarea'
              maxlength={500}
              autoHeight
            />
            <View className='prompt-actions'>
              <View className='btn-outline btn-xs' onClick={() => setVideoPrompt(DEFAULT_PROMPTS[swapType])}>
                <Text>恢复默认</Text>
              </View>
              {swapType === 'i2v' && (
                <View
                  className={`btn-primary btn-xs ${isGeneratingPrompt || uploadedImageUrls.length === 0 ? 'disabled' : ''}`}
                  onClick={() => { if (!isGeneratingPrompt && uploadedImageUrls.length > 0) handleGeneratePrompt() }}
                >
                  <Text>{isGeneratingPrompt ? '分析中...' : '✨ AI推荐'}</Text>
                </View>
              )}
            </View>
            {swapType === 'i2v' && (
              <View className='prompt-tip'>
                <Text>💡 图生视频以图片为起始画面，提示词应描述已有内容的动态效果</Text>
              </View>
            )}
          </View>

          {/* Duration (i2v only) */}
          {swapType === 'i2v' && (
            <View className='card'>
              <Text className='card-title'>⏱️ 视频时长</Text>
              <View className='duration-row'>
                {[5, 10].map(d => (
                  <View
                    key={d}
                    className={`duration-btn ${!customDuration && videoDuration === d ? 'active' : ''}`}
                    onClick={() => { setVideoDuration(d); setCustomDuration(false) }}
                  >
                    <Text>{d}秒</Text>
                  </View>
                ))}
                <View
                  className={`duration-btn ${customDuration ? 'active' : ''}`}
                  onClick={() => setCustomDuration(true)}
                >
                  <Text>自定义</Text>
                </View>
              </View>
              {customDuration && (
                <View className='custom-duration'>
                  <Textarea
                    value={String(videoDuration)}
                    onInput={e => {
                      const v = Math.max(1, Math.min(30, Number(e.detail.value) || 1))
                      setVideoDuration(v)
                    }}
                    className='duration-input'
                    maxlength={2}
                  />
                  <Text className='duration-unit'>秒 (1-30)</Text>
                </View>
              )}
            </View>
          )}

          {/* AI Voiceover */}
          <View className='card'>
            <View className='switch-row'>
              <View
                className={`switch-toggle ${enableVoiceover ? 'on' : ''}`}
                onClick={() => setEnableVoiceover(!enableVoiceover)}
              >
                <View className='switch-thumb' />
              </View>
              <Text className='switch-label'>
                🎵 AI配音{swapType === 'i2v' ? '（文案转语音）' : `（替换原视频声音${uploadedVideoDuration ? ` · ${uploadedVideoDuration}秒` : ''}）`}
              </Text>
            </View>
            {enableVoiceover && (
              <Text className='switch-tip'>
                {swapType === 'i2v'
                  ? `视频完成后自动基于文案生成${videoDuration}秒配音`
                  : `视频完成后自动基于文案生成AI配音`}
              </Text>
            )}
          </View>

          {/* Product Description */}
          <View className='card'>
            <View className='card-header'>
              <Text className='card-title'>📝 商品文案</Text>
              <View
                className={`btn-primary btn-xs ${isGeneratingDesc ? 'disabled' : ''}`}
                onClick={() => { if (!isGeneratingDesc) handleGenerateDesc() }}
              >
                <Text>{isGeneratingDesc ? 'AI生成中...' : '✨ AI生成文案'}</Text>
              </View>
            </View>
            <Textarea
              value={productDesc}
              onInput={e => setProductDesc(e.detail.value)}
              placeholder='上传商品图片后，点击「AI生成文案」自动生成...'
              className='textarea'
              maxlength={1000}
              autoHeight
            />

            {/* English toggle */}
            <View className='english-section'>
              <View className='switch-row'>
                <View
                  className={`switch-toggle ${needEnglish ? 'on' : ''}`}
                  onClick={() => setNeedEnglish(!needEnglish)}
                >
                  <View className='switch-thumb' />
                </View>
                <Text className='switch-label'>同时生成英文版本（含配音）</Text>
                {needEnglish && (
                  <View
                    className={`btn-blue btn-xs ${isGeneratingEnDesc || !productDesc ? 'disabled' : ''}`}
                    onClick={() => { if (!isGeneratingEnDesc && productDesc) handleGenerateEnDesc() }}
                  >
                    <Text>{isGeneratingEnDesc ? '翻译中...' : 'AI翻译'}</Text>
                  </View>
                )}
              </View>
              {needEnglish && (
                <Textarea
                  value={englishDesc}
                  onInput={e => setEnglishDesc(e.detail.value)}
                  placeholder='点击「AI翻译」自动生成英文...'
                  className='textarea textarea-sm'
                  maxlength={2000}
                  autoHeight
                />
              )}
            </View>
          </View>

          {/* Generate Button */}
          <View
            className={`generate-btn ${canGenerate ? '' : 'disabled'}`}
            onClick={() => { if (canGenerate) handleGenerate() }}
          >
            {generating ? (
              <Text className='gen-text'>⚡ AI生成中 {Math.round(progress)}%</Text>
            ) : (
              <Text className='gen-text'>
                🚀 {videoPath ? '开始AI替换生成' : swapType === 'i2v' ? '开始AI图生视频' : '开始AI视频生成'}
              </Text>
            )}
          </View>

          {/* Progress */}
          {generating && (
            <View className='card progress-card'>
              <View className='progress-header'>
                <Text className='progress-label'>
                  {progress < 30 ? '分析素材...' : progress < 60 ? '识别替换区域...' : progress < 90 ? '合成视频...' : '即将完成...'}
                </Text>
                <Text className='progress-pct'>{Math.min(Math.round(progress), 100)}%</Text>
              </View>
              <View className='progress-bar'>
                <View className='progress-fill' style={{ width: `${Math.min(progress, 100)}%` }} />
              </View>
            </View>
          )}

          {/* Result */}
          {resultReady && (
            <View className='card result-card'>
              <Text className='result-title'>✅ 生成完成</Text>

              {/* Result Video */}
              {resultVideoUrl && (
                <View className='result-video-wrap'>
                  <Video
                    src={resultVideoUrl.startsWith('http') ? resultVideoUrl : `${BASE_URL}${resultVideoUrl}`}
                    className='result-video'
                    controls
                    objectFit='contain'
                    showFullscreenBtn
                  />
                  <View className='result-badge'><Text>AI生成</Text></View>
                </View>
              )}

              {/* Voiceover */}
              {enableVoiceover && (
                <View className='voiceover-section'>
                  <View className='voiceover-header'>
                    <Text className='voiceover-title'>🎤 AI配音</Text>
                    <View
                      className={`btn-primary btn-xs ${isGeneratingVoiceover || !productDesc ? 'disabled' : ''}`}
                      onClick={() => { if (!isGeneratingVoiceover && productDesc) handleGenerateVoiceover() }}
                    >
                      <Text>{isGeneratingVoiceover ? '生成中...' : voiceoverUrl ? '🔄 重新生成' : '🎤 生成配音'}</Text>
                    </View>
                  </View>
                  {isGeneratingVoiceover && (
                    <Text className='voiceover-loading'>正在生成{effectiveDuration}秒配音...</Text>
                  )}
                  {voiceoverUrl && (
                    <View className='voiceover-actions'>
                      <View className='btn-primary btn-sm' onClick={handlePlayVoiceover}>
                        <Text>▶ 播放配音</Text>
                      </View>
                      <Text className='voiceover-done'>✅ 配音已生成</Text>
                    </View>
                  )}
                </View>
              )}

              {/* Actions */}
              <View className='result-actions'>
                <View className='btn-primary' onClick={() => { if (resultVideoUrl) downloadAndSaveVideo(resultVideoUrl) }}>
                  <Text>📥 下载视频</Text>
                </View>
                <View className='btn-outline' onClick={handleReset}>
                  <Text>🔄 重新生成</Text>
                </View>
              </View>
            </View>
          )}
        </View>
    </ScrollView>

    {/* Bottom Bar - 返回首页 */}
    <View className='bottom-bar' onClick={() => Taro.navigateBack()}>
      <Text className='bottom-bar-icon'>🏠</Text>
      <Text className='bottom-bar-text'>返回首页</Text>
    </View>
    </View>
  )
}
