import request from '@/utils/request'

// 查询 资讯列表
export function getPaperList() {
  return request({
    url: 'material/paper/select_paperlist',
    method: 'GET'
  })
}

// 查询 资讯列表
export function getPaperListContent(query) {
  return request({
    url: 'material/paper/select_paper_content',
    method: 'GET',
    params: query
  })
}
