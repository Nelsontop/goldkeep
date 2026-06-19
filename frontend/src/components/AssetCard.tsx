import { Link } from 'react-router-dom'
import type { AssetItem } from '../api/assets'

const classLabel: Record<string, string> = {
  jewelry: '首饰',
  gold_bar: '金条',
}

function formatTag(asset: AssetItem, filter: string) {
  if (asset.classification === 'gold_bar') return '金条'
  if (filter === 'all') return asset.subtype ? `${classLabel[asset.classification]}·${asset.subtype}` : '首饰'
  return asset.subtype || '首饰'
}

export default function AssetCard({ asset, latestPrice, filter = 'all' }: { asset: AssetItem; latestPrice: number; filter?: string }) {
  const holdingValue = asset.weight * latestPrice
  const profit = asset.weight * (latestPrice - asset.purchase_price_per_gram)

  return (
    <Link
      to={`/assets/${asset.id}`}
      className="flex items-center gap-3 rounded-xl bg-surface-card-dark p-3 active:scale-[0.98] transition-transform"
    >
      <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-gold-100/10 text-2xl">
        {asset.photo ? (
          <img src={asset.photo} alt="" className="size-14 rounded-lg object-cover ring-1 ring-hairline-on-dark" />
        ) : (
          <svg viewBox="0 0 24 24" className="size-7">
            <rect x="3" y="5" width="18" height="14" rx="2" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1" />
            <rect x="6" y="8" width="12" height="2" rx="0.5" fill="#fcd34d" opacity="0.5" />
          </svg>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-body">{asset.name}</span>
          <span className={`shrink-0 rounded px-1.5 py-0.5 text-xs ${
            asset.classification === 'jewelry'
              ? 'bg-amber-500/10 text-amber-300'
              : 'bg-yellow-500/10 text-yellow-300'
          }`}>
            {formatTag(asset, filter)}
          </span>
        </div>
        <div className="mt-1 flex items-baseline gap-3 text-xs text-muted">
          <span>{asset.weight}g</span>
          <span>下单 ¥{asset.purchase_price_per_gram}/g</span>
        </div>
      </div>

      <div className="shrink-0 text-right">
        <div className="text-sm font-semibold text-gold-400">
          ¥{holdingValue.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}
        </div>
        <div className="text-xs text-muted">持有价值</div>
        <div className={`text-xs font-medium ${profit >= 0 ? 'text-trading-down' : 'text-trading-up'}`}>
          {profit >= 0 ? '+' : ''}¥{profit.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}
        </div>
      </div>
    </Link>
  )
}
