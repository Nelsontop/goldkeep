import { useState, useMemo, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AssetCard from '../components/AssetCard'
import SummaryCards from '../components/SummaryCards'
import { useAssets, useLatestPrice } from '../hooks/useData'
import type { AssetItem } from '../api/assets'

type FilterKey = 'all' | 'jewelry' | 'gold_bar'
type SortKey = 'profit' | 'purchase_price' | 'purchase_date' | 'purchase_price_per_gram'

interface DropdownProps {
  items: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
  variant: 'light' | 'gold'
}

function Dropdown({ items, value, onChange, variant }: DropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const currentLabel = items.find(i => i.value === value)?.label ?? value

  const btnClass = variant === 'gold'
    ? 'bg-gold-500 text-white shadow-sm'
    : 'bg-white text-stone-500 shadow-sm'

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${btnClass}`}
      >
        {currentLabel}
        <svg className={`size-3 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-30 min-w-full rounded-xl bg-white py-1.5 shadow-lg ring-1 ring-stone-200">
          {items.map(item => (
            <button
              key={item.value}
              onClick={() => { onChange(item.value); setOpen(false) }}
              className={`block w-full whitespace-nowrap px-4 py-2 text-left text-xs transition-colors ${
                item.value === value
                  ? 'bg-gold-50 text-gold-600 font-medium'
                  : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

const filterItems = [
  { value: 'all', label: '全部' },
  { value: 'jewelry', label: '首饰' },
  { value: 'gold_bar', label: '金条' },
]

const sortDims: { key: SortKey; label: string }[] = [
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

      {/* Filter + Sort row */}
      <div className="flex gap-2">
        <Dropdown
          items={filterItems}
          value={filter}
          onChange={v => setFilter(v as FilterKey)}
          variant="light"
        />
        <SortDropdown
          sortBy={sortBy}
          sortDir={sortDir}
          onSortBy={setSortBy}
          onSortDir={setSortDir}
        />
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

function SortDropdown({
  sortBy, sortDir, onSortBy, onSortDir,
}: {
  sortBy: SortKey
  sortDir: 'asc' | 'desc'
  onSortBy: (k: SortKey) => void
  onSortDir: (d: 'asc' | 'desc') => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const currentLabel = sortDims.find(d => d.key === sortBy)!.label

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 rounded-full px-3.5 py-1.5 text-xs font-medium bg-gold-500 text-white shadow-sm transition-colors"
      >
        {currentLabel} {sortDir === 'desc' ? '↓' : '↑'}
        <svg className={`size-3 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-30 rounded-xl bg-white shadow-lg ring-1 ring-stone-200" style={{ minWidth: 152 }}>
          {/* Dimension options */}
          <div className="py-1.5">
            {sortDims.map(d => (
              <button
                key={d.key}
                onClick={() => { onSortBy(d.key); setOpen(false) }}
                className={`block w-full whitespace-nowrap px-4 py-2 text-left text-xs transition-colors ${
                  d.key === sortBy
                    ? 'bg-gold-50 text-gold-600 font-medium'
                    : 'text-stone-600 hover:bg-stone-50'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
          {/* Divider + Direction toggle */}
          <div className="border-t border-stone-100" />
          <div className="flex gap-1 p-1.5">
            <button
              onClick={() => { onSortDir('desc'); setOpen(false) }}
              className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                sortDir === 'desc'
                  ? 'bg-gold-500 text-white'
                  : 'text-stone-500 hover:bg-stone-50'
              }`}
            >
              ↓ 降序
            </button>
            <button
              onClick={() => { onSortDir('asc'); setOpen(false) }}
              className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                sortDir === 'asc'
                  ? 'bg-gold-500 text-white'
                  : 'text-stone-500 hover:bg-stone-50'
              }`}
            >
              ↑ 升序
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
