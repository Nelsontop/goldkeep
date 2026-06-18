import { useState, useEffect } from 'react'
import { fetchAssets, fetchAsset } from '../api/assets'
import { fetchLatestPrice, fetchGoldPrices, getCachedLatestPrice, type GoldPriceItem } from '../api/goldPrice'
import type { AssetItem } from '../api/assets'

export function useAssets(classification?: string | null) {
  const [assets, setAssets] = useState<AssetItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAssets(classification).then(data => {
      setAssets(data)
      setLoading(false)
    })
  }, [classification])

  return { assets, loading }
}

export function useAsset(id: number) {
  const [asset, setAsset] = useState<AssetItem | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAsset(id).then(a => {
      setAsset(a)
      setLoading(false)
    })
  }, [id])

  return { asset, loading }
}

export function useLatestPrice() {
  const [latestPrice, setLatestPrice] = useState<number>(() => {
    const cached = getCachedLatestPrice()
    return cached?.price ?? 0
  })
  const [loading, setLoading] = useState(() => !getCachedLatestPrice())

  useEffect(() => {
    fetchLatestPrice().then(lp => {
      setLatestPrice(lp.price)
      setLoading(false)
    })
  }, [])

  return { latestPrice, loading }
}

export function useGoldPrices() {
  const [prices, setPrices] = useState<GoldPriceItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGoldPrices().then(data => {
      setPrices(data)
      setLoading(false)
    })
  }, [])

  return { prices, loading }
}
