import { useState, useEffect } from 'react'
import GoldChart from '../components/GoldChart'
import SummaryCards from '../components/SummaryCards'
import { fetchGoldPrices, type GoldPriceItem } from '../api/goldPrice'
import { fetchAssets, type AssetItem } from '../api/assets'

export default function Trend() {
  const [prices, setPrices] = useState<GoldPriceItem[]>([])
  const [assets, setAssets] = useState<AssetItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([fetchGoldPrices(), fetchAssets()]).then(([p, a]) => {
      setPrices(p)
      setAssets(a)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return <div className="px-4 py-12 text-center text-sm text-stone-400">加载中...</div>
  }

  return (
    <div className="space-y-4 px-4 py-4">
      <GoldChart prices={prices} />
      <SummaryCards assets={assets} latestPrice={prices[prices.length - 1]?.price || 0} />
    </div>
  )
}
