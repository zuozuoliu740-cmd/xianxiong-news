import { useState, useEffect, useCallback } from 'react'
import Taro, { useShareAppMessage, usePullDownRefresh } from '@tarojs/taro'
import { View, Text, Video, ScrollView } from '@tarojs/components'
import { request, downloadAndSaveVideo, BASE_URL } from '@/utils/request'
import './index.scss'

type SwapType = 'product' | 'clothing' | 'model' | 'i2v'

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

const TYPE_LABELS: Record<SwapType, { icon: string; text: string }> = {
  product: { icon: '🛍️', text: '商品' },
  clothing: { icon: '👗', text: '服饰' },
  model: { icon: '🧑', text: '模特' },
  i2v: { icon: '🎬', text: '图生' },
}

export default function HistoryPage() {
  const [historyVideos, setHistoryVideos] = useState<HistoryVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [previewVideo, setPreviewVideo] = useState<string | null>(null)

  useShareAppMessage(() => ({
    title: '先雄AI实验室 - 我的AI视频作品',
    path: '/pages/history/index',
  }))

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    try {
      const data = await request<{ success: boolean; history: HistoryVideo[] }>({
        url: '/api/ai-lab/history',
      })
      if (data.success) setHistoryVideos(data.history || [])
    } catch { /* ignore */ }
    setLoading(false)
  }, [])

  useEffect(() => { fetchHistory() }, [fetchHistory])

  usePullDownRefresh(() => {
    fetchHistory().then(() => Taro.stopPullDownRefresh())
  })

  const handleDelete = async (id: string) => {
    const res = await Taro.showModal({ title: '提示', content: '确定删除这个视频记录？' })
    if (!res.confirm) return
    try {
      await request({ url: '/api/ai-lab/history', method: 'DELETE', data: { id } })
      setHistoryVideos(prev => prev.filter(v => v.id !== id))
      Taro.showToast({ title: '已删除', icon: 'success' })
    } catch {
      Taro.showToast({ title: '删除失败', icon: 'error' })
    }
  }

  const handleDownload = (videoUrl: string) => {
    downloadAndSaveVideo(videoUrl)
  }

  const handlePreview = (videoUrl: string) => {
    const fullUrl = videoUrl.startsWith('http') ? videoUrl : `${BASE_URL}${videoUrl}`
    setPreviewVideo(fullUrl)
  }

  const goCreate = () => {
    Taro.navigateTo({ url: '/pages/index/index' })
  }

  return (
    <View className='history-page'>
      {/* Header Stats */}
      <View className='header-stats'>
        <View className='stat-item'>
          <Text className='stat-num'>{historyVideos.length}</Text>
          <Text className='stat-label'>全部</Text>
        </View>
        <View className='stat-divider' />
        <View className='stat-item'>
          <Text className='stat-num completed'>{historyVideos.filter(v => v.status === 'completed').length}</Text>
          <Text className='stat-label'>已完成</Text>
        </View>
        <View className='stat-divider' />
        <View className='stat-item'>
          <Text className='stat-num processing'>{historyVideos.filter(v => v.status === 'processing').length}</Text>
          <Text className='stat-label'>生成中</Text>
        </View>
      </View>

      {/* Video List */}
      <ScrollView scrollY className='video-list'>
        {loading ? (
          <View className='empty-box'>
            <Text className='empty-loading'>加载中...</Text>
          </View>
        ) : historyVideos.length === 0 ? (
          <View className='empty-box'>
            <View className='empty-icon-wrap'>
              <Text className='empty-icon'>🎥</Text>
            </View>
            <Text className='empty-title'>还没有视频作品</Text>
            <Text className='empty-desc'>开启你的AI创作之旅，3分钟生成带货短视频</Text>
            <View className='empty-action' onClick={goCreate}>
              <Text className='empty-action-text'>🚀 开始创作</Text>
            </View>
          </View>
        ) : (
          <View className='cards-wrap'>
            {historyVideos.map(v => {
              const typeInfo = TYPE_LABELS[v.type] || TYPE_LABELS.product
              return (
                <View key={v.id} className='video-card'>
                  {/* Thumbnail */}
                  <View className='card-thumb' onClick={() => v.videoUrl && handlePreview(v.videoUrl)}>
                    {v.videoUrl ? (
                      <Video
                        src={v.videoUrl.startsWith('http') ? v.videoUrl : `${BASE_URL}${v.videoUrl}`}
                        className='thumb-vid'
                        controls={false}
                        autoplay={false}
                        muted
                        showPlayBtn={false}
                        showProgress={false}
                        showFullscreenBtn={false}
                        objectFit='cover'
                      />
                    ) : (
                      <View className='thumb-empty'><Text>📹</Text></View>
                    )}
                    <View className='thumb-overlay'>
                      <Text className='play-icon'>▶</Text>
                    </View>
                    <View className='thumb-dur'><Text>{v.duration || '--'}</Text></View>
                    {v.status === 'processing' && (
                      <View className='thumb-status'><Text>生成中</Text></View>
                    )}
                    {v.status === 'failed' && (
                      <View className='thumb-status failed'><Text>失败</Text></View>
                    )}
                  </View>

                  {/* Info */}
                  <View className='card-body'>
                    <Text className='card-name'>{v.title}</Text>
                    {v.desc && <Text className='card-desc'>{v.desc}</Text>}
                    <View className='card-meta'>
                      <View className={`meta-tag tag-${v.type}`}>
                        <Text>{typeInfo.icon}{typeInfo.text}</Text>
                      </View>
                      {v.hasEnglish && (
                        <View className='meta-tag tag-en'><Text>EN</Text></View>
                      )}
                      <Text className='meta-time'>{v.createdAt}</Text>
                    </View>

                    {/* Actions */}
                    <View className='card-actions'>
                      {v.status === 'completed' && v.videoUrl && (
                        <>
                          <View className='act-btn act-download' onClick={() => handleDownload(v.videoUrl!)}>
                            <Text>📥 下载</Text>
                          </View>
                          <View className='act-btn act-play' onClick={() => handlePreview(v.videoUrl!)}>
                            <Text>▶ 播放</Text>
                          </View>
                        </>
                      )}
                      <View className='act-btn act-delete' onClick={() => handleDelete(v.id)}>
                        <Text>🗑️ 删除</Text>
                      </View>
                    </View>
                  </View>
                </View>
              )
            })}
          </View>
        )}
      </ScrollView>

      {/* Preview Modal */}
      {previewVideo && (
        <View className='preview-mask' onClick={() => setPreviewVideo(null)}>
          <View className='preview-modal' onClick={e => e.stopPropagation()}>
            <Video
              src={previewVideo}
              className='preview-player'
              controls
              autoplay
              showFullscreenBtn
              objectFit='contain'
            />
            <View className='preview-close' onClick={() => setPreviewVideo(null)}>
              <Text>✕ 关闭</Text>
            </View>
          </View>
        </View>
      )}

      {/* FAB */}
      {!loading && historyVideos.length > 0 && (
        <View className='fab-btn' onClick={goCreate}>
          <Text className='fab-icon'>+</Text>
          <Text className='fab-text'>新建</Text>
        </View>
      )}
    </View>
  )
}
