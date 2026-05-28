import { useEffect, useState } from 'react'
import { api } from '../api'

export default function Reports() {
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  async function load() {
    setLoading(true)
    setMsg('')
    try {
      const data = await api(`/report/daily?date=${encodeURIComponent(date)}`)
      setRows(data.rows || [])
    } catch (e) {
      setMsg(e.message)
      setRows([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let ignore = false
    ;(async () => {
      await Promise.resolve()
      if (ignore) return
      await load()
    })()
    return () => {
      ignore = true
    }
  }, [date])

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold text-slate-900">Daily report</h1>
      <p className="mb-4 text-sm text-slate-600">
        For the selected calendar day: trade name, quantity sold that day, and
        current remaining stock (sum of inventory rows for that medicine).
      </p>

      <label className="no-print mb-6 inline-flex flex-col text-sm font-medium text-slate-700">
        Report date
        <input
          type="date"
          className="mt-1 rounded-lg border border-slate-300 px-3 py-2"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </label>

      {msg && (
        <p className="mb-4 text-sm text-red-600" role="alert">
          {msg}
        </p>
      )}

      {loading ? (
        <p className="text-slate-500">Loading…</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-semibold">Trade name</th>
                <th className="px-4 py-3 font-semibold">Quantity sold</th>
                <th className="px-4 py-3 font-semibold">Remaining stock</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-slate-500">
                    No sales for this date.
                  </td>
                </tr>
              ) : (
                rows.map((r, i) => (
                  <tr key={`${r.TradeName}-${i}`} className="border-b border-slate-100">
                    <td className="px-4 py-3">{r.TradeName}</td>
                    <td className="px-4 py-3">{r.QuantitySold}</td>
                    <td className="px-4 py-3">{r.RemainingStock}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
