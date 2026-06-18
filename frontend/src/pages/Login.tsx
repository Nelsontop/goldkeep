import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../store/auth'

export default function Login() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const ok = await login(password)
    setLoading(false)
    if (ok) {
      navigate('/', { replace: true })
    } else {
      setError('密码错误')
    }
  }

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-3 text-5xl">🏆</div>
          <h1 className="text-2xl font-bold text-gold-800">攒金金</h1>
          <p className="mt-1 text-sm text-stone-400">个人黄金资产管理</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-6 shadow-sm">
          <label className="mb-1 block text-sm font-medium text-stone-600">
            登录密码
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="请输入密码"
            autoFocus
            className="w-full rounded-lg border border-stone-200 px-4 py-3 text-sm outline-none transition-colors focus:border-gold-400 focus:ring-1 focus:ring-gold-400"
          />
          {error && (
            <p className="mt-2 text-xs text-red-500">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading || !password}
            className="mt-4 w-full rounded-lg bg-gold-500 py-3 text-sm font-semibold text-white transition-colors active:bg-gold-600 disabled:opacity-50"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
      </div>
    </div>
  )
}
