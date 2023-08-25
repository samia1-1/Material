import request from '@/utils/request'

// 查询 友情链接
export function getFriendLink() {
  return request({
    url: 'material/database/select_database',
    method: 'GET',
  })
}
