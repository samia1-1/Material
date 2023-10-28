import request from '@/utils/request'

export function getImageRecognition(data) {
  return request({
    url: 'image_recognition/updateAvatarUrl',
    method: 'POST',
    data
  })
}
