import { useState } from 'react'
import { Link } from 'react-router-dom'
import AssetCard from '../components/AssetCard'
import SummaryCards from '../components/SummaryCards'
import { useAssets, useLatestPrice } from '../hooks/useData'

type FilterKey = 'all' | 'jewelry' | 'gold_bar'

const filters: { key: FilterKey; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'jewelry', label: '首饰' },
  { key: 'gold_bar', label: '金条' },
]

export default function Dashboard() {
  const [filter, setFilter] = useState<FilterKey>('all')
  const { assets: allAssets, loading } = useAssets()
  const { latestPrice } = useLatestPrice()

  const filteredAssets = filter === 'all'
    ? allAssets
    : allAssets.filter(a => a.classification === filter)

  return (
    <div className="space-y-4 px-4 py-4">
      <SummaryCards assets={allAssets} latestPrice={latestPrice} />

      {/* Filter tabs */}
      <div className="flex gap-2">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${
              filter === f.key
                ? 'bg-gold-500 text-white'
                : 'bg-white text-stone-500 shadow-sm active:bg-stone-100'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Asset list */}
      {loading ? (
        <div className="py-12 text-center text-sm text-stone-400">加载中...</div>
      ) : filteredAssets.length === 0 ? (
        <div className="py-12 text-center text-sm text-stone-400">暂无资产，点击右下角 + 添加</div>
      ) : (
        <div className="space-y-2">
          {filteredAssets.map(a => <AssetCard key={a.id} asset={a} latestPrice={latestPrice} filter={filter} />)}
        </div>
      )}

      {/* FAB */}
      <Link
        to="/assets/new"
        className="fixed bottom-20 right-4 z-20 flex size-14 items-center justify-center rounded-full bg-gold-500 text-2xl text-white shadow-lg active:bg-gold-600 active:scale-95 transition-all"
      >
        +
      </Link>
    </div>
  )
}
