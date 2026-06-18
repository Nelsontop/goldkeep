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

  return (
    <Link
      to={`/assets/${asset.id}`}
      className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm active:scale-[0.98] transition-transform"
    >
      <div className="flex size-14 shrink-0 items-center justify-center rounded-lg bg-gold-100 text-2xl">
        {asset.photo ? (
          <img src={asset.photo} alt="" className="size-14 rounded-lg object-cover" />
        ) : (
          '🏆'
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-sm font-medium text-stone-800">{asset.name}</span>
          <span className={`shrink-0 rounded px-1.5 py-0.5 text-xs ${
            asset.classification === 'jewelry'
              ? 'bg-amber-50 text-amber-700'
              : 'bg-yellow-50 text-yellow-700'
          }`}>
            {formatTag(asset, filter)}
          </span>
        </div>
        <div className="mt-1 flex items-baseline gap-3 text-xs text-stone-400">
          <span>{asset.weight}g</span>
          <span>下单 ¥{asset.purchase_price_per_gram}/g</span>
        </div>
      </div>

      <div className="shrink-0 text-right">
        <div className="text-sm font-semibold text-gold-600">
          ¥{holdingValue.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}
        </div>
        <div className="text-xs text-stone-400">持有价值</div>
      </div>
    </Link>
  )
}
