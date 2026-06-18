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
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-stone-700">黄金走势 · 近90日</h2>
        <span className="text-xs text-stone-400">人民币/克</span>
      </div>
      <div className="w-full" style={{ height: 'calc(100vh - 280px)' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={prices} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: '#a8a29e' }}
              tickFormatter={(v: string) => v.slice(5)}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={['dataMin - 5', 'dataMax + 5']}
              tick={{ fontSize: 10, fill: '#a8a29e' }}
              tickFormatter={(v: number) => `¥${v}`}
              width={48}
            />
            <Tooltip
              contentStyle={{ borderRadius: 8, border: '1px solid #e7e5e4', fontSize: 12 }}
              formatter={(v: unknown) => [`¥${String(v)}`, '金价']}
              labelFormatter={(l: unknown) => `日期: ${String(l)}`}
            />
            <Line
              type="monotone"
              dataKey="price"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#d97706' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
