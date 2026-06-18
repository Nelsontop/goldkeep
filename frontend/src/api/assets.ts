import { apiGet, apiPost, apiPut, apiDelete } from './client'

export interface AssetItem {
  id: number
  name: string
  classification: 'jewelry' | 'gold_bar'
  subtype: string | null
  weight: number
  purchase_price_per_gram: number
  purchase_price: number
  purchase_date: string
  photo: string | null
  notes: string
  created_at: string
}

export async function fetchAssets(classification?: string | null) {
  const params = classification ? `?classification=${classification}` : ''
  return apiGet<AssetItem[]>(`/assets${params}`)
}

export async function fetchAsset(id: number) {
  return apiGet<AssetItem>(`/assets/${id}`)
}

export async function createAsset(data: FormData) {
  return apiPost<AssetItem>('/assets', data)
}

export async function updateAsset(id: number, data: FormData) {
  return apiPut<AssetItem>(`/assets/${id}`, data)
}

export async function deleteAsset(id: number) {
  return apiDelete(`/assets/${id}`)
}

export async function uploadPhoto(file: File): Promise<string> {
  const form = new FormData()
  form.append('photo', file)
  const data = await apiPost<{ path: string }>('/assets/upload', form)
  return data.path
}
