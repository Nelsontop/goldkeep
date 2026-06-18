import { apiPost, apiPut, apiDelete, apiGet } from './client'
import {
  type AssetItem,
  getCachedAssets,
  setCachedAssets,
  addToAssetsCache,
  updateInAssetsCache,
  removeFromAssetsCache,
} from './cache'

export type { AssetItem }

export async function fetchAssets(classification?: string | null) {
  const cached = getCachedAssets()
  if (cached) {
    if (classification) return cached.filter(a => a.classification === classification)
    return cached
  }
  const params = classification ? `?classification=${classification}` : ''
  const data = await apiGet<AssetItem[]>(`/assets${params}`)
  if (!classification) {
    setCachedAssets(data)
  }
  return data
}

export async function fetchAsset(id: number) {
  const cached = getCachedAssets()
  if (cached) {
    const found = cached.find(a => a.id === id)
    if (found) return found
  }
  const data = await apiGet<AssetItem>(`/assets/${id}`)
  addToAssetsCache(data)
  return data
}

export async function createAsset(data: FormData) {
  const asset = await apiPost<AssetItem>('/assets', data)
  addToAssetsCache(asset)
  return asset
}

export async function updateAsset(id: number, data: FormData) {
  const asset = await apiPut<AssetItem>(`/assets/${id}`, data)
  updateInAssetsCache(id, asset)
  return asset
}

export async function deleteAsset(id: number) {
  await apiDelete(`/assets/${id}`)
  removeFromAssetsCache(id)
}

export async function uploadPhoto(file: File): Promise<string> {
  const form = new FormData()
  form.append('photo', file)
  const data = await apiPost<{ path: string }>('/assets/upload', form)
  return data.path
}
