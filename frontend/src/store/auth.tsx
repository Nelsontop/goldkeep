import { createContext, useContext, useState, type ReactNode } from 'react'
import { loginApi, changePasswordApi } from '../api/auth'

interface AuthContextType {
  token: string | null
  login: (password: string) => Promise<boolean>
  logout: () => void
  changePassword: (newPassword: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))

  const login = async (password: string) => {
    try {
      const t = await loginApi(password)
      localStorage.setItem('token', t)
      setToken(t)
      return true
    } catch {
      return false
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
  }

  const changePassword = async (newPassword: string) => {
    await changePasswordApi(newPassword)
  }

  return (
    <AuthContext.Provider value={{ token, login, logout, changePassword }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
