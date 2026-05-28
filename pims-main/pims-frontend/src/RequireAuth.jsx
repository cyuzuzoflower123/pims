import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { api } from './api'

export function RequireAuth() {
  const [status, setStatus] = useState('pending')

  useEffect(() => {
    api('/session')
      .then(() => setStatus('in'))
      .catch(() => setStatus('out'))
  }, [])

  if (status === 'pending') {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        Checking session…
      </div>
    )
  }
  if (status === 'out') {
    return <Navigate to="/login" replace />
  }
  return <Outlet />
}
