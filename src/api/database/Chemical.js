import request from '@/utils/request'

// 查询 铸造高温合金成分.热处理 牌号列表
export function getListBrands() {
  return request({
    url: 'material/entry/select_trademark',
    method: 'GET',
  })
}
// 查询 铸造高温合金成分.热处理 最小温度
export function getMinTemepreture() {
  return request({
    url: 'material/entry/select_min',
    method: 'get',
  })
}
// 查询 铸造高温合金成分.热处理 最大温度
export function getMaxTemepreture() {
  return request({
    url: 'material/entry/select_max',
    method: 'get',
  })
}
// 搜索 铸造高温合金成分.热处理 当前条件下的数据列表
export function searchPerformanceEntry(query) {
  return request({
    url: 'material/entry/select_performance_entry',
    method: 'GET',
    params: query
  })
}
