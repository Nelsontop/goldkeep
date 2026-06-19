import { Outlet, NavLink, useLocation } from 'react-router-dom'

function GoldBarIcon({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="size-6">
      <rect x="3" y="5" width="18" height="14" rx="2" fill={active ? '#f59e0b' : '#d6d3d1'} stroke={active ? '#b45309' : '#a8a29e'} strokeWidth="1" />
      <rect x="6" y="8" width="12" height="2" rx="0.5" fill={active ? '#fde68a' : '#e7e5e4'} opacity={active ? 0.5 : 0.4} />
    </svg>
  )
}

const tabs = [
  { to: '/', label: '资产' },
  { to: '/trend', label: '走势', icon: '📈' },
  { to: '/settings', label: '设置', icon: '⚙' },
]

export default function Layout() {
  const { pathname } = useLocation()

  const hideNav = pathname === '/login' || pathname.startsWith('/assets/new') || pathname.match(/^\/assets\/[^/]+\/edit$/)

  return (
    <div className="mx-auto flex min-h-full max-w-lg flex-col bg-stone-50">
      <header className="sticky top-0 z-10 border-b border-stone-200 bg-gold-50/90 px-4 py-3 backdrop-blur">
        <h1 className="text-center text-lg font-bold text-gold-800">攒金金</h1>
      </header>

      <main className="flex-1 pb-safe">
        <Outlet />
      </main>

      {!hideNav && (
        <nav className="sticky bottom-0 z-10 flex border-t border-stone-200 bg-white pb-safe">
          {tabs.map(t => (
            <NavLink
              key={t.to}
              to={t.to}
              end
              className={({ isActive }) =>
                `flex flex-1 flex-col items-center py-2 text-xs transition-colors ${
                  isActive ? 'text-gold-600' : 'text-stone-400'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {t.to === '/' ? (
                    <GoldBarIcon active={isActive} />
                  ) : (
                    <span className="text-xl">{t.icon}</span>
                  )}
                  <span>{t.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>
      )}
    </div>
  )
}
