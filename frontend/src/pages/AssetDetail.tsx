import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { fetchAsset, deleteAsset, type AssetItem } from '../api/assets'
import { fetchLatestPrice } from '../api/goldPrice'

const classLabel: Record<string, string> = { jewelry: '首饰', gold_bar: '金条' }

export default function AssetDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [asset, setAsset] = useState<AssetItem | null>(null)
  const [latestPrice, setLatestPrice] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([fetchAsset(Number(id)), fetchLatestPrice()]).then(([a, lp]) => {
      setAsset(a)
      setLatestPrice(lp.price)
      setLoading(false)
    })
  }, [id])

  const handleDelete = async () => {
    if (!confirm('确定删除该资产？')) return
    await deleteAsset(Number(id))
    navigate('/')
  }

  if (loading) {
    return <div className="px-4 py-12 text-center text-sm text-stone-400">加载中...</div>
  }

  if (!asset) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-stone-400">资产不存在</p>
        <Link to="/" className="mt-2 text-sm text-gold-500">返回首页</Link>
      </div>
    )
  }

  const holdingValue = asset.weight * latestPrice
  const profit = asset.weight * (latestPrice - asset.purchase_price_per_gram)
  const profitPercent = asset.purchase_price_per_gram > 0
    ? (((latestPrice - asset.purchase_price_per_gram) / asset.purchase_price_per_gram) * 100).toFixed(1)
    : '--'

  return (
    <div className="space-y-4 px-4 py-4">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-stone-400 active:text-stone-600">
          ← 返回
        </button>
        <h2 className="text-lg font-semibold text-stone-800">资产详情</h2>
        <div className="flex-1" />
        <Link
          to={`/assets/${asset.id}/edit`}
          className="rounded-lg bg-stone-100 px-3 py-1.5 text-xs font-medium text-stone-600 active:bg-stone-200"
        >
          编辑
        </Link>
      </div>

      <div className="flex items-center justify-center rounded-xl bg-gold-100 py-12 text-6xl">
        {asset.photo ? (
          <img src={asset.photo} alt="" className="max-h-64 rounded-xl object-cover" />
        ) : (
          '🏆'
        )}
      </div>

      <div className="rounded-xl bg-white p-4 shadow-sm space-y-3">
        <h3 className="text-lg font-bold text-stone-800">{asset.name}</h3>
        <div className="flex items-center gap-2">
          <span className="rounded bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
            {asset.subtype ? `${classLabel[asset.classification]} · ${asset.subtype}` : classLabel[asset.classification]}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-y-3 text-sm">
          <div>
            <span className="text-stone-400">克重</span>
            <p className="font-semibold text-stone-800">{asset.weight}g</p>
          </div>
          <div>
            <span className="text-stone-400">下单克价</span>
            <p className="font-semibold text-stone-800">¥{asset.purchase_price_per_gram}/g</p>
          </div>
          <div>
            <span className="text-stone-400">买入总价</span>
            <p className="font-semibold text-stone-800">¥{asset.purchase_price.toLocaleString()}</p>
          </div>
          <div>
            <span className="text-stone-400">买入日期</span>
            <p className="font-semibold text-stone-800">{asset.purchase_date}</p>
          </div>
          <div>
            <span className="text-stone-400">持有价值</span>
            <p className="font-semibold text-gold-600">
              ¥{holdingValue.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>
        <div className="border-t border-stone-100 pt-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-stone-400">盈亏（按克价差）</span>
            <span className={`font-semibold ${profit >= 0 ? 'text-red-500' : 'text-green-600'}`}>
              {profit >= 0 ? '+' : ''}¥{profit.toLocaleString('zh-CN', { maximumFractionDigits: 0 })} ({profitPercent}%)
            </span>
          </div>
        </div>
        {asset.notes && (
          <div className="border-t border-stone-100 pt-3">
            <span className="text-xs text-stone-400">备注</span>
            <p className="mt-1 text-sm text-stone-600">{asset.notes}</p>
          </div>
        )}
      </div>

      <button
        onClick={handleDelete}
        className="w-full rounded-xl bg-red-50 py-3 text-sm font-medium text-red-500 active:bg-red-100"
      >
        删除资产
      </button>
    </div>
  )
}
