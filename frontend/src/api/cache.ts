import { apiGet } from './client'

// ==================== Types ====================
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
  location: string
  created_at: string
}

export interface GoldPriceItem {
  date: string
  price: number
}

// ==================== Helpers ====================
const ONE_HOUR = 3600_000

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

// ==================== Assets Cache ====================
let assetsCache: AssetItem[] | null = null
let assetsCacheDate: string | null = null

export function getCachedAssets(): AssetItem[] | null {
  if (assetsCache && assetsCacheDate === todayStr()) return assetsCache
  return null
}

export function setCachedAssets(assets: AssetItem[]): void {
  assetsCache = assets
  assetsCacheDate = todayStr()
}

export function addToAssetsCache(asset: AssetItem): void {
  if (assetsCache) {
    assetsCache = [asset, ...assetsCache]
  }
}

export function updateInAssetsCache(id: number, asset: AssetItem): void {
  if (!assetsCache) return
  const idx = assetsCache.findIndex(a => a.id === id)
  if (idx !== -1) {
    assetsCache = [...assetsCache.slice(0, idx), asset, ...assetsCache.slice(idx + 1)]
  } else {
    assetsCache = [asset, ...assetsCache]
  }
}

export function removeFromAssetsCache(id: number): void {
  if (!assetsCache) return
  assetsCache = assetsCache.filter(a => a.id !== id)
}

// ==================== Latest Price Cache ====================
let latestPriceCache: GoldPriceItem | null = null
let lastProbeTime: number | null = null
let pendingProbe: Promise<void> | null = null

export function getCachedLatestPrice(): GoldPriceItem | null {
  return latestPriceCache
}

export function needsProbe(): boolean {
  if (!lastProbeTime) return false
  return (Date.now() - lastProbeTime) >= ONE_HOUR
}

async function doProbe(): Promise<void> {
  if (pendingProbe) return pendingProbe

  pendingProbe = (async () => {
    try {
      const data = await apiGet<GoldPriceItem>('/gold-prices/latest')
      const changed = !latestPriceCache || latestPriceCache.price !== data.price
      latestPriceCache = data
      lastProbeTime = Date.now()
      if (changed) {
        trendCache = null
        trendCacheDate = null
      }
    } finally {
      pendingProbe = null
    }
  })()

  return pendingProbe
}

export async function fetchLatestPrice(): Promise<GoldPriceItem> {
  if (latestPriceCache && !needsProbe()) return latestPriceCache
  await doProbe()
  return latestPriceCache!
}

// ==================== Trend Cache ====================
let trendCache: GoldPriceItem[] | null = null
let trendCacheDate: string | null = null

export function getCachedGoldPrices(): GoldPriceItem[] | null {
  if (trendCache && trendCacheDate === todayStr()) return trendCache
  return null
}

export async function fetchGoldPrices(): Promise<GoldPriceItem[]> {
  if (needsProbe()) {
    await doProbe()
  }

  const cached = getCachedGoldPrices()
  if (cached) return cached

  const data = await apiGet<GoldPriceItem[]>('/gold-prices')
  trendCache = data
  trendCacheDate = todayStr()
  return data
}
