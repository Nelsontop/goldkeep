import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, TrendingUp, Settings } from 'lucide-react'

const tabs = [
  { to: '/', label: '资产', icon: LayoutDashboard },
  { to: '/trend', label: '走势', icon: TrendingUp },
  { to: '/settings', label: '设置', icon: Settings },
]

export default function Layout() {
  const { pathname } = useLocation()

  const hideNav = pathname === '/login' || pathname.startsWith('/assets/new') || pathname.match(/^\/assets\/[^/]+\/edit$/)

  return (
    <div className="mx-auto flex min-h-full max-w-lg flex-col bg-canvas-dark">
      <header className="sticky top-0 z-10 flex h-16 items-center border-b border-hairline-on-dark bg-canvas-dark/90 px-4 backdrop-blur">
        <h1 className="text-gold-400 font-semibold text-base tracking-wide">攒金金</h1>
      </header>

      <main className="flex-1 pb-safe">
        <Outlet />
      </main>

      {!hideNav && (
        <nav className="sticky bottom-0 z-10 flex border-t border-hairline-on-dark bg-surface-card-dark pb-safe">
          {tabs.map(t => (
            <NavLink
              key={t.to}
              to={t.to}
              end
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center gap-0.5 py-2 text-xs transition-colors ${
                  isActive ? 'text-gold-400' : 'text-muted'
                }`
              }
            >
              <t.icon className="size-5" />
              <span>{t.label}</span>
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  )
}
