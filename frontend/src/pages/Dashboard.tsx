import { useState, useMemo, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AssetCard from '../components/AssetCard'
import SummaryCards from '../components/SummaryCards'
import { useAssets, useLatestPrice } from '../hooks/useData'
import type { AssetItem } from '../api/assets'

type FilterKey = 'all' | 'jewelry' | 'gold_bar'
type SortKey = 'profit' | 'purchase_price' | 'purchase_date' | 'purchase_price_per_gram'

const filterItems = [
  { value: 'all', label: '全部' },
  { value: 'jewelry', label: '首饰' },
  { value: 'gold_bar', label: '金条' },
]

const locationItems = [
  { value: 'all', label: '全部地点' },
  { value: '深圳市', label: '深圳市' },
  { value: '汕头市', label: '汕头市' },
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

function FilterDropdown({ items, value, onChange }: { items: { value: string; label: string }[]; value: string; onChange: (v: string) => void }) {
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

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 rounded-full bg-surface-card-dark px-3.5 py-1.5 text-xs font-medium text-body transition-colors"
      >
        {currentLabel}
        <svg className={`size-3 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-30 min-w-full rounded-xl bg-surface-card-dark py-1.5 ring-1 ring-hairline-on-dark">
          {items.map(item => (
            <button
              key={item.value}
              onClick={() => { onChange(item.value); setOpen(false) }}
              className={`block w-full whitespace-nowrap px-4 py-2 text-left text-xs transition-colors ${
                item.value === value
                  ? 'bg-gold-400/10 text-gold-400 font-medium'
                  : 'text-muted hover:bg-surface-elevated-dark'
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
        className="flex items-center gap-1 rounded-full bg-surface-card-dark px-3.5 py-1.5 text-xs font-medium text-body transition-colors"
      >
        {currentLabel} {sortDir === 'desc' ? '↓' : '↑'}
        <svg className={`size-3 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-30 rounded-xl bg-surface-card-dark ring-1 ring-hairline-on-dark" style={{ minWidth: 152 }}>
          {/* Dimension options */}
          <div className="py-1.5">
            {sortDims.map(d => (
              <button
                key={d.key}
                onClick={() => { onSortBy(d.key); setOpen(false) }}
                className={`block w-full whitespace-nowrap px-4 py-2 text-left text-xs transition-colors ${
                  d.key === sortBy
                    ? 'bg-gold-400/10 text-gold-400 font-medium'
                    : 'text-muted hover:bg-surface-elevated-dark'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
          {/* Divider + Direction toggle */}
          <div className="border-t border-hairline-on-dark" />
          <div className="flex gap-1 p-1.5">
            <button
              onClick={() => { onSortDir('desc'); setOpen(false) }}
              className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                sortDir === 'desc'
                  ? 'bg-gold-400 text-on-primary'
                  : 'text-muted hover:bg-surface-elevated-dark'
              }`}
            >
              ↓ 降序
            </button>
            <button
              onClick={() => { onSortDir('asc'); setOpen(false) }}
              className={`flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                sortDir === 'asc'
                  ? 'bg-gold-400 text-on-primary'
                  : 'text-muted hover:bg-surface-elevated-dark'
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

export default function Dashboard() {
  const [filter, setFilter] = useState<FilterKey>('all')
  const [locFilter, setLocFilter] = useState('all')
  const [sortBy, setSortBy] = useState<SortKey>('profit')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const { assets: allAssets, loading } = useAssets()
  const { latestPrice } = useLatestPrice()

  const filteredAssets = useMemo(() => {
    let filtered = filter === 'all'
      ? allAssets
      : allAssets.filter(a => a.classification === filter)

    if (locFilter !== 'all') {
      filtered = filtered.filter(a => (a.location || '深圳市') === locFilter)
    }

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
  }, [allAssets, filter, locFilter, sortBy, sortDir, latestPrice])

  return (
    <div className="space-y-4 px-4 py-4">
      <SummaryCards assets={allAssets} latestPrice={latestPrice} />

      {/* Filter + Sort row */}
      <div className="flex gap-2">
        <FilterDropdown items={filterItems} value={filter} onChange={v => setFilter(v as FilterKey)} />
        <FilterDropdown items={locationItems} value={locFilter} onChange={v => setLocFilter(v)} />
        <SortDropdown sortBy={sortBy} sortDir={sortDir} onSortBy={setSortBy} onSortDir={setSortDir} />
      </div>

      {/* Asset list */}
      {loading ? (
        <div className="py-12 text-center text-sm text-muted">加载中...</div>
      ) : filteredAssets.length === 0 ? (
        <div className="py-12 text-center text-sm text-muted">暂无资产，点击右下角 + 添加</div>
      ) : (
        <div className="space-y-2">
          {filteredAssets.map(a => <AssetCard key={a.id} asset={a} latestPrice={latestPrice} filter={filter} />)}
        </div>
      )}

      {/* FAB */}
      <Link
        to="/assets/new"
        className="fixed bottom-20 right-4 z-20 flex size-14 items-center justify-center rounded-full bg-gold-400 text-xl font-bold text-on-primary active:bg-gold-500 active:scale-95 transition-all"
      >
        +
      </Link>
    </div>
  )
}
