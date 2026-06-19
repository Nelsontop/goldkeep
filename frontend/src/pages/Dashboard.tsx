import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import AssetCard from '../components/AssetCard'
import SummaryCards from '../components/SummaryCards'
import { useAssets, useLatestPrice } from '../hooks/useData'
import type { AssetItem } from '../api/assets'

type FilterKey = 'all' | 'jewelry' | 'gold_bar'
type SortKey = 'profit' | 'purchase_price' | 'purchase_date' | 'purchase_price_per_gram'

const filters: { key: FilterKey; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'jewelry', label: '首饰' },
  { key: 'gold_bar', label: '金条' },
]

const sortOptions: { key: SortKey; label: string }[] = [
  { key: 'profit', label: '持有收益' },
  { key: 'purchase_price', label: '买入总价' },
  { key: 'purchase_date', label: '买入日期' },
  { key: 'purchase_price_per_gram', label: '买入克价' },
]

function getProfit(a: AssetItem, latestPrice: number) {
  return a.weight * (latestPrice - a.purchase_price_per_gram)
}

export default function Dashboard() {
  const [filter, setFilter] = useState<FilterKey>('all')
  const [sortBy, setSortBy] = useState<SortKey>('profit')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const { assets: allAssets, loading } = useAssets()
  const { latestPrice } = useLatestPrice()

  const handleSort = (key: SortKey) => {
    if (key === sortBy) {
      setSortDir(d => d === 'desc' ? 'asc' : 'desc')
    } else {
      setSortBy(key)
      setSortDir('desc')
    }
  }

  const filteredAssets = useMemo(() => {
    const filtered = filter === 'all'
      ? allAssets
      : allAssets.filter(a => a.classification === filter)

    return [...filtered].sort((a, b) => {
      let va: number, vb: number
      switch (sortBy) {
        case 'profit':
          va = getProfit(a, latestPrice)
          vb = getProfit(b, latestPrice)
          break
        case 'purchase_price':
          va = a.purchase_price
          vb = b.purchase_price
          break
        case 'purchase_date':
          va = new Date(a.purchase_date).getTime()
          vb = new Date(b.purchase_date).getTime()
          break
        case 'purchase_price_per_gram':
          va = a.purchase_price_per_gram
          vb = b.purchase_price_per_gram
          break
        default:
          return 0
      }
      return sortDir === 'desc' ? vb - va : va - vb
    })
  }, [allAssets, filter, sortBy, sortDir, latestPrice])

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

      {/* Sort controls */}
      <div className="flex items-center gap-2">
        <span className="shrink-0 text-xs text-stone-400">排序</span>
        {sortOptions.map(o => (
          <button
            key={o.key}
            onClick={() => handleSort(o.key)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              sortBy === o.key
                ? 'bg-gold-500 text-white'
                : 'bg-white text-stone-500 shadow-sm active:bg-stone-100'
            }`}
          >
            {o.label}{sortBy === o.key ? (sortDir === 'desc' ? ' ↓' : ' ↑') : ''}
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
