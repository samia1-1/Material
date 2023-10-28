import request from '@/utils/request'

// 查询 持久极限 牌号列表
export function getListBrands() {
  return request({
    url: 'material/enduring_limits/select_trademark',
    method: 'GET',
  })
}
// 查询 持久极限 热处理制度列表
export function getListProcessingSystems() {
  return request({
    url: 'material/enduring_limits/select_heatTreatmentSystem',
    method: 'get',
  })
}
// 搜索 持久极限 数据列表
export function searchExetremes(query) {
  return request({
    url: 'material/enduring_limits/select_enduring_limits',
    method: 'get',
    params: query
  })
}

// 搜索 持久极限 最大温度
export function getTemMax() {
  return request({
    url: 'material/enduring_limits/select_temperature_max',
    method: 'get',
  })
}
// 搜索 持久极限 最低温度
export function getTemMin() {
  return request({
    url: 'material/enduring_limits/select_temperature_min',
    method: 'get',
  })
}
// 搜索 持久极限 最大时间
export function getTimeMax() {
  return request({
    url: 'material/enduring_limits/select_time_max',
    method: 'get',
  })
}
// 搜索 持久极限 最小时间
export function getTimeMin() {
  return request({
    url: 'material/enduring_limits/select_time_min',
    method: 'get',
  })
}

// 查询 持久极限 数据详细
// export function getStretch(postId) {
//   return request({
//     url: '/system/post/' + postId,
//     method: 'get'
//   })
// }

// // 新增 持久极限 数据
// export function addStretch(data) {
//   return request({
//     url: '/system/post',
//     method: 'post',
//     data: data
//   })
// }

// // 修改 持久极限 数据
// export function updateStretch(data) {
//   return request({
//     url: '/system/post',
//     method: 'put',
//     data: data
//   })
// }

// // 删除 持久极限 数据
// export function delStretch(postId) {
//   return request({
//     url: '/system/post/' + postId,
//     method: 'delete'
//   })
// }
