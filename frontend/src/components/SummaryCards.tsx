import type { AssetItem } from '../api/assets'

export default function SummaryCards({ assets, latestPrice }: { assets: AssetItem[]; latestPrice: number }) {
  const totalWeight = assets.reduce((s, a) => s + a.weight, 0)
  const totalCost = assets.reduce((s, a) => s + a.purchase_price, 0)
  const totalValue = totalWeight * latestPrice
  const avgPrice = totalWeight > 0 ? totalCost / totalWeight : 0
  const profit = totalValue - totalCost
  const profitRate = totalCost > 0 ? (profit / totalCost) * 100 : 0

  return (
    <div className="space-y-3">
      {/* Row 1: total weight */}
      <div className="rounded-xl bg-white p-4 shadow-sm text-center">
        <div className="text-xs text-stone-400">总重量</div>
        <div className="mt-1 text-2xl font-bold text-stone-800">
          {totalWeight.toLocaleString('zh-CN', { maximumFractionDigits: 1 })}
          <span className="text-lg font-normal text-stone-500"> g</span>
        </div>
      </div>

      {/* Row 2: count, avg price, total cost */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-white p-3 shadow-sm text-center">
          <div className="text-xs text-stone-400">总件数</div>
          <div className="mt-1 text-lg font-bold text-stone-700">
            {assets.length}<span className="text-sm font-normal text-stone-400"> 件</span>
          </div>
        </div>
        <div className="rounded-xl bg-white p-3 shadow-sm text-center">
          <div className="text-xs text-stone-400">平均克价</div>
          <div className="mt-1 text-lg font-bold text-stone-700">
            ¥{avgPrice.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}
          </div>
        </div>
        <div className="rounded-xl bg-white p-3 shadow-sm text-center">
          <div className="text-xs text-stone-400">购入总价</div>
          <div className="mt-1 text-lg font-bold text-stone-700">
            ¥{totalCost.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}
          </div>
        </div>
      </div>

      {/* Row 3: estimated value, profit, profit rate */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl bg-white p-3 shadow-sm text-center">
          <div className="text-xs text-stone-400">预估价值</div>
          <div className="mt-1 text-lg font-bold text-gold-600">
            ¥{totalValue.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}
          </div>
        </div>
        <div className="rounded-xl bg-white p-3 shadow-sm text-center">
          <div className="text-xs text-stone-400">预估收益</div>
          <div className={`mt-1 text-lg font-bold ${profit >= 0 ? 'text-red-500' : 'text-green-600'}`}>
            {totalCost > 0
              ? `${profit >= 0 ? '+' : ''}¥${profit.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}`
              : '--'}
          </div>
        </div>
        <div className="rounded-xl bg-white p-3 shadow-sm text-center">
          <div className="text-xs text-stone-400">收益率</div>
          <div className={`mt-1 text-lg font-bold ${profitRate >= 0 ? 'text-red-500' : 'text-green-600'}`}>
            {totalCost > 0
              ? `${profitRate >= 0 ? '+' : ''}${profitRate.toFixed(1)}%`
              : '--'}
          </div>
        </div>
      </div>
    </div>
  )
}
