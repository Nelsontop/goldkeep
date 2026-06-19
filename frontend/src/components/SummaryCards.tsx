import type { AssetItem } from '../api/assets'

export default function SummaryCards({ assets, latestPrice }: { assets: AssetItem[]; latestPrice: number }) {
  const totalWeight = assets.reduce((s, a) => s + a.weight, 0)
  const totalCost = assets.reduce((s, a) => s + a.purchase_price, 0)
  const totalValue = totalWeight * latestPrice
  const avgPrice = totalWeight > 0 ? totalCost / totalWeight : 0
  const profit = totalValue - totalCost
  const profitRate = totalCost > 0 ? (profit / totalCost) * 100 : 0

  return (
    <div className="space-y-4">
      {/* Big stat: total weight */}
      <div className="py-2 text-center">
        <div className="text-xs text-muted">总重量</div>
        <div className="mt-1 text-4xl font-bold text-gold-400">
          {totalWeight.toLocaleString('zh-CN', { maximumFractionDigits: 1 })}
          <span className="text-xl font-normal text-gold-400/60"> g</span>
        </div>
      </div>

      {/* Row 1: count, avg price, total cost */}
      <div className="grid grid-cols-3 gap-3">
        <StatBadge label="总件数" value={`${assets.length}`} unit="件" />
        <StatBadge label="平均克价" value={`¥${avgPrice.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}`} />
        <StatBadge label="购入总价" value={`¥${totalCost.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}`} />
      </div>

      {/* Row 2: estimated value, profit, profit rate */}
      <div className="grid grid-cols-3 gap-3">
        <StatBadge label="预估价值" value={`¥${totalValue.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}`} accent />
        <StatBadge
          label="预估收益"
          value={totalCost > 0 ? `${profit >= 0 ? '+' : ''}¥${profit.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}` : '--'}
          dir={profit >= 0 ? 'up' : profit < 0 ? 'down' : undefined}
        />
        <StatBadge
          label="收益率"
          value={totalCost > 0 ? `${profitRate >= 0 ? '+' : ''}${profitRate.toFixed(1)}%` : '--'}
          dir={profit >= 0 ? 'up' : profit < 0 ? 'down' : undefined}
        />
      </div>
    </div>
  )
}

function StatBadge({ label, value, unit, accent, dir }: { label: string; value: string; unit?: string; accent?: boolean; dir?: 'up' | 'down' }) {
  let colorClass = 'text-body'
  if (accent) colorClass = 'text-gold-400'
  if (dir === 'up') colorClass = 'text-trading-down'
  if (dir === 'down') colorClass = 'text-trading-up'

  return (
    <div className="rounded-lg bg-surface-card-dark p-3 text-center">
      <div className="text-xs text-muted">{label}</div>
      <div className={`mt-1 text-lg font-bold ${colorClass}`}>
        {value}
        {unit && <span className="text-sm font-normal text-muted"> {unit}</span>}
      </div>
    </div>
  )
}
