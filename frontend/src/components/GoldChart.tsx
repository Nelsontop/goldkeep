import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { GoldPriceItem } from '../api/goldPrice'

export default function GoldChart({ prices }: { prices: GoldPriceItem[] }) {
  return (
    <div className="rounded-xl bg-surface-card-dark p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-body">黄金走势 · 近90日</h2>
        <span className="text-xs text-muted">人民币/克</span>
      </div>
      <div className="w-full" style={{ height: 'calc(100vh - 280px)' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={prices} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2b3139" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: '#707a8a' }}
              tickFormatter={(v: string) => v.slice(5)}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={['dataMin - 5', 'dataMax + 5']}
              tick={{ fontSize: 10, fill: '#707a8a' }}
              tickFormatter={(v: number) => `¥${v}`}
              width={48}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                border: '1px solid #2b3139',
                backgroundColor: '#1e2329',
                color: '#eaecef',
                fontSize: 12,
              }}
              formatter={(v: unknown) => [`¥${String(v)}`, '金价']}
              labelFormatter={(l: unknown) => `日期: ${String(l)}`}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#fbbf24"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#f59e0b' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
