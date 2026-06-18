import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../store/auth'

export default function Settings() {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const { logout, changePassword } = useAuth()
  const navigate = useNavigate()

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg('')
    if (newPassword.length < 4) {
      setMsg('密码至少4位')
      return
    }
    if (newPassword !== confirmPassword) {
      setMsg('两次密码不一致')
      return
    }
    setLoading(true)
    await changePassword(newPassword)
    setLoading(false)
    setMsg('密码修改成功')
    setNewPassword('')
    setConfirmPassword('')
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="space-y-4 px-4 py-4">
      <h2 className="text-lg font-semibold text-stone-800">设置</h2>

      {/* Change password */}
      <form onSubmit={handleChangePassword} className="rounded-xl bg-white p-4 shadow-sm space-y-3">
        <h3 className="text-sm font-medium text-stone-600">修改密码</h3>
        <input
          type="password"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
          placeholder="新密码（至少4位）"
          className="w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400"
        />
        <input
          type="password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          placeholder="确认新密码"
          className="w-full rounded-lg border border-stone-200 px-3 py-2.5 text-sm outline-none focus:border-gold-400 focus:ring-1 focus:ring-gold-400"
        />
        {msg && (
          <p className={`text-xs ${msg.includes('成功') ? 'text-green-600' : 'text-red-500'}`}>{msg}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-gold-500 py-2.5 text-sm font-medium text-white active:bg-gold-600 disabled:opacity-50"
        >
          {loading ? '保存中...' : '修改密码'}
        </button>
      </form>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full rounded-xl bg-stone-100 py-3 text-sm font-medium text-stone-600 active:bg-stone-200"
      >
        退出登录
      </button>
    </div>
  )
}
