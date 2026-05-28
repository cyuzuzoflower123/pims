import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { api } from './api'

const linkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive
      ? 'bg-teal-700 text-white shadow'
      : 'text-slate-700 hover:bg-slate-200'
  }`

export default function Layout() {
  const navigate = useNavigate()

  async function logout() {
    try {
      await api('/logout', { method: 'POST' })
    } catch {
      /* still leave app */
    }
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="no-print border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <span className="text-lg font-semibold text-teal-800">PIMS</span>
          <nav className="flex flex-wrap items-center gap-1">
            <NavLink to="/categories" className={linkClass}>
              Categories
            </NavLink>
            <NavLink to="/medicine" className={linkClass}>
              Medicine
            </NavLink>
            <NavLink to="/inventory" className={linkClass}>
              Inventory
            </NavLink>
            <NavLink to="/sales" className={linkClass}>
              Sales
            </NavLink>
            <NavLink to="/reports" className={linkClass}>
              Reports
            </NavLink>
            <button
              type="button"
              onClick={logout}
              className="rounded-lg px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
            >
              Logout
            </button>
          </nav>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
