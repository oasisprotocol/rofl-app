export interface Pagination<T = object> {
  total: number
  sortOrder: string
  sortKey: string
  page: number
  limit: number
  data: T[]
}
