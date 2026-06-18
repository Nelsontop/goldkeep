import type { AssetItem } from '../api/assets'

export default function SummaryCards({ assets, latestPrice }: { assets: AssetItem[]; latestPrice: number }) {
  const totalWeight = assets.reduce((s, a) => s + a.weight, 0)
  const totalValue = assets.reduce((s, a) => s + a.weight * latestPrice, 0)
  const totalGoldCost = assets.reduce((s, a) => s + a.weight * a.purchase_price_per_gram, 0)

  return (
    <div className="grid grid-cols-3 gap-3">
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <div className="text-xs text-stone-400">持有价值</div>
        <div className="mt-1 text-lg font-bold text-gold-600">
          ¥{totalValue.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}
        </div>
      </div>
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <div className="text-xs text-stone-400">总克重</div>
        <div className="mt-1 text-lg font-bold text-stone-800">
          {totalWeight.toLocaleString('zh-CN', { maximumFractionDigits: 1 })}g
        </div>
        <div className="mt-0.5 text-xs text-stone-400">{assets.length} 件</div>
      </div>
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <div className="text-xs text-stone-400">盈亏</div>
        <div className={`mt-1 text-lg font-bold ${totalValue >= totalGoldCost ? 'text-red-500' : 'text-green-600'}`}>
          {totalGoldCost > 0
            ? `${(((totalValue - totalGoldCost) / totalGoldCost) * 100).toFixed(1)}%`
            : '--'}
        </div>
        <div className="mt-0.5 text-xs text-stone-400">
          {totalGoldCost > 0 ? `¥${(totalValue - totalGoldCost).toLocaleString('zh-CN', { signDisplay: 'always', maximumFractionDigits: 0 })}` : '--'}
        </div>
      </div>
    </div>
  )
}
