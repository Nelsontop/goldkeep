import { useState, useEffect } from 'react'
import GoldChart from '../components/GoldChart'
import { fetchGoldPrices, type GoldPriceItem } from '../api/goldPrice'

export default function Trend() {
  const [prices, setPrices] = useState<GoldPriceItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGoldPrices().then(p => {
      setPrices(p)
      setLoading(false)
    })
  }, [])

  if (loading) {
    return <div className="px-4 py-12 text-center text-sm text-stone-400">加载中...</div>
  }

  const latestPrice = prices[prices.length - 1]?.price || 0

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <div className="text-xs text-stone-400">今日金价</div>
        <div className="mt-1 text-xl font-bold text-gold-600">
          ¥{latestPrice}/g
        </div>
        <div className="mt-0.5 text-xs text-stone-400">人民币/克</div>
      </div>
      <GoldChart prices={prices} />
    </div>
  )
}
