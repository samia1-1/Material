import request from '@/utils/request'

// 查询 持久性能 牌号列表
export function getListBrands() {
  return request({
    url: 'material/durable_performance/select_trademark',
    method: 'GET',
  })
}
// 查询 持久性能 热处理制度列表
export function getListProcessingSystems() {
  return request({
    url: 'material/durable_performance/select_heatTreatmentSystem',
    method: 'get',
  })
}
// 搜索 持久性能 数据列表
export function searchPropertie(query) {
  return request({
    url: 'material/durable_performance/select_durable_performance',
    method: 'get',
    params: query
  })
}
// 搜索 持久性能 最大温度
export function getTemMax() {
  return request({
    url: 'material/durable_performance/select_temperature_max',
    method: 'get',
  })
}
// 搜索 持久性能 最低温度
export function getTemMin() {
  return request({
    url: 'material/durable_performance/select_temperature_min',
    method: 'get',
  })
}
// 搜索 持久性能 最大应力
export function getStressMax() {
  return request({
    url: 'material/durable_performance/select_stress_max',
    method: 'get',
  })
}
// 搜索 持久性能 最小应力
export function getStressMin() {
  return request({
    url: 'material/durable_performance/select_stress_min',
    method: 'get',
  })
}

// 查询 持久性能 数据详细
// export function getStretch(postId) {
//   return request({
//     url: '/system/post/' + postId,
//     method: 'get'
//   })
// }

// 新增 持久性能 数据
// export function addStretch(data) {
//   return request({
//     url: '/system/post',
//     method: 'post',
//     data: data
//   })
// }

// // 修改 持久性能 数据
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
