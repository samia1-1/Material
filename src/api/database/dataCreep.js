import request from '@/utils/request'

// 查询 蠕变 牌号列表
export function getListBrands() {
  return request({
    url: 'material/creep/select_trademark',
    method: 'GET',
  })
}
// 查询 蠕变 热处理制度列表
export function getListProcessingSystems() {
  return request({
    url: 'material/creep/select_heatTreatmentSystem',
    method: 'get',
  })
}
// 搜索 蠕变 数据列表
export function searchCreep(query) {
  return request({
    url: 'material/creep/select_creep',
    method: 'GET',
    params: query
  })
}

// 查询 蠕变 数据详细
export function getStretch(postId) {
  return request({
    url: '/system/post/' + postId,
    method: 'get'
  })
}

// 新增 拉伸性能.精铸试棒 数据
export function addStretch(data) {
  return request({
    url: '/system/post',
    method: 'post',
    data: data
  })
}

// 修改 拉伸性能.精铸试棒 数据
export function updateStretch(data) {
  return request({
    url: '/system/post',
    method: 'put',
    data: data
  })
}

// 删除 拉伸性能.精铸试棒 数据
export function delStretch(postId) {
  return request({
    url: '/system/post/' + postId,
    method: 'delete'
  })
}
