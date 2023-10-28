import request from '@/utils/request'

// 查询 拉伸性能.精铸试棒 牌号列表
export function getListBrands() {
  return request({
    url: 'material/tensile_properties/select_trademark',
    method: 'GET',
  })
}
// 查询 拉伸性能.精铸试棒 热处理制度列表
export function getListProcessingSystems() {
  return request({
    url: 'material/tensile_properties/select_heatTreatmentSystem',
    method: 'get',
  })
}
// 搜索 拉伸性能.精铸试棒 数据列表
export function searchStretch(query) {
  return request({
    url: 'material/tensile_properties/select_tensile_properties',
    method: 'get',
    params: query
  })
}

// 预测 拉伸性能.精铸试棒 数据
export function predictStretch(query) {
  return request({
    url: 'material/tensile_properties/predict_tensile_properties',
    method: 'get',
    params: query
  })
}

// 修改 拉伸性能 最大温度
export function getTemMax() {
  return request({
    url: 'material/tensile_properties/select_temperature_max',
    method: 'GET',
  })
}
// 修改 拉伸性能 最小温度
export function getTemMin() {
  return request({
    url: 'material/tensile_properties/select_temperature_min',
    method: 'GET',
  })
}

// // 修改 拉伸性能.精铸试棒 数据
// export function updateStretch(data) {
//   return request({
//     url: '/system/post',
//     method: 'put',
//     data: data
//   })
// }


// // 删除 拉伸性能.精铸试棒 数据
// export function delStretch(postId) {
//   return request({
//     url: '/system/post/' + postId,
//     method: 'delete'
//   })
// }
