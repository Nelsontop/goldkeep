import GoldChart from '../components/GoldChart'
import { useGoldPrices } from '../hooks/useData'

export default function Trend() {
  const { prices, loading } = useGoldPrices()

  if (loading) {
    return <div className="px-4 py-12 text-center text-sm text-muted">加载中...</div>
  }

  const latestPrice = prices[prices.length - 1]?.price || 0

  return (
    <div className="space-y-4 px-4 py-4">
      <div className="rounded-xl bg-surface-card-dark p-6 text-center">
        <div className="text-xs text-muted">今日金价</div>
        <div className="mt-1 text-3xl font-bold text-gold-400">
          ¥{latestPrice}/g
        </div>
        <div className="mt-0.5 text-xs text-muted">人民币/克</div>
      </div>
      <GoldChart prices={prices} />
    </div>
  )
}
