import Taro from '@tarojs/taro'

/** 后端API基础地址 */
export const BASE_URL = 'http://112.124.49.40'

/** 通用请求封装 */
export async function request<T = any>(options: {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: Record<string, string>
  showLoading?: boolean
  loadingText?: string
}): Promise<T> {
  const {
    url,
    method = 'GET',
    data,
    header = {},
    showLoading = false,
    loadingText = '加载中...',
  } = options

  if (showLoading) {
    Taro.showLoading({ title: loadingText, mask: true })
  }

  try {
    const res = await Taro.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        ...header,
      },
      timeout: 60000,
    })

    if (showLoading) Taro.hideLoading()

    if (res.statusCode >= 200 && res.statusCode < 300) {
      return res.data as T
    }

    const errMsg = res.data?.error || `请求失败(${res.statusCode})`
    throw new Error(errMsg)
  } catch (err: any) {
    if (showLoading) Taro.hideLoading()
    const msg = err?.message || err?.errMsg || '网络请求失败'
    throw new Error(msg)
  }
}

/** 上传文件到服务端 */
export async function uploadFile(filePath: string, type: 'video' | 'image'): Promise<{
  success: boolean
  url: string
  fileName: string
  size: number
  originalName: string
}> {
  return new Promise((resolve, reject) => {
    Taro.uploadFile({
      url: `${BASE_URL}/api/ai-lab/upload`,
      filePath,
      name: 'file',
      formData: { type },
      timeout: 120000,
      success(res) {
        try {
          const data = JSON.parse(res.data)
          if (data.success) {
            resolve(data)
          } else {
            reject(new Error(data.error || '上传失败'))
          }
        } catch {
          reject(new Error('上传响应解析失败'))
        }
      },
      fail(err) {
        reject(new Error(err.errMsg || '上传失败'))
      },
    })
  })
}

/** 下载视频并保存到相册 */
export async function downloadAndSaveVideo(videoUrl: string, title?: string) {
  Taro.showLoading({ title: '下载中...', mask: true })
  try {
    const fullUrl = videoUrl.startsWith('http') ? videoUrl : `${BASE_URL}${videoUrl}`
    const downloadRes = await Taro.downloadFile({ url: fullUrl })

    if (downloadRes.statusCode !== 200) {
      throw new Error('下载失败')
    }

    await Taro.saveVideoToPhotosAlbum({
      filePath: downloadRes.tempFilePath,
    })

    Taro.hideLoading()
    Taro.showToast({ title: '已保存到相册', icon: 'success' })
  } catch (err: any) {
    Taro.hideLoading()
    if (err?.errMsg?.includes('auth deny')) {
      Taro.showModal({
        title: '提示',
        content: '需要您授权保存到相册的权限',
        confirmText: '去设置',
        success(res) {
          if (res.confirm) Taro.openSetting({})
        },
      })
    } else {
      Taro.showToast({ title: '保存失败', icon: 'error' })
    }
  }
}
