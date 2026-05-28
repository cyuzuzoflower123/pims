import { useEffect, useState } from 'react'
import { api } from '../api'

function medId(row) {
  return row.medId ?? row.medid
}

function qtyHand(row) {
  const q = row.QuantityInHand ?? row.quantityinhand
  return Number(q)
}

export default function Inventory() {
  const [rows, setRows] = useState([])
  const [medicines, setMedicines] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({
    medId: '',
    QuantityInHand: '',
    expiryDate: '',
  })

  async function load() {
    setLoading(true)
    try {
      const [inv, med] = await Promise.all([
        api('/inventory'),
        api('/medicines'),
      ])
      setRows(inv)
      setMedicines(med)
      if (!form.medId && med.length) {
        setForm((f) => ({ ...f, medId: String(medId(med[0])) }))
      }
    } catch (e) {
      setMsg(e.message)
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
  }, [])

  async function addStock(e) {
    e.preventDefault()
    setMsg('')
    try {
      await api('/stock', {
        method: 'POST',
        body: JSON.stringify({
          medId: Number(form.medId),
          QuantityInHand: Number(form.QuantityInHand),
          expiryDate: form.expiryDate,
        }),
      })
      setForm((f) => ({ ...f, QuantityInHand: '', expiryDate: '' }))
      await load()
    } catch (err) {
      setMsg(err.message)
    }
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold text-slate-900">Inventory</h1>
      <p className="mb-4 text-sm text-slate-600">
        View stock levels and add new stock entries. Update and delete apply only
        to categories and medicine elsewhere.
      </p>

      <form
        onSubmit={addStock}
        className="no-print mb-6 flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <label className="min-w-[180px] text-sm">
          <span className="font-medium text-slate-700">Medicine</span>
          <select
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            value={form.medId}
            onChange={(e) => setForm((f) => ({ ...f, medId: e.target.value }))}
          >
            {medicines.map((m) => (
              <option key={medId(m)} value={medId(m)}>
                {m.TradeName}
              </option>
            ))}
          </select>
        </label>
        <label className="w-28 text-sm">
          <span className="font-medium text-slate-700">Qty on hand</span>
          <input
            type="number"
            min="0"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            value={form.QuantityInHand}
            onChange={(e) =>
              setForm((f) => ({ ...f, QuantityInHand: e.target.value }))
            }
            required
          />
        </label>
        <label className="min-w-[160px] text-sm">
          <span className="font-medium text-slate-700">Expiry</span>
          <input
            type="date"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            value={form.expiryDate}
            onChange={(e) => setForm((f) => ({ ...f, expiryDate: e.target.value }))}
            required
          />
        </label>
        <button
          type="submit"
          className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
        >
          Add stock
        </button>
      </form>

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
                <th className="px-4 py-3 font-semibold">Medicine</th>
                <th className="px-4 py-3 font-semibold">Qty on hand</th>
                <th className="px-4 py-3 font-semibold">Expiry</th>
                <th className="px-4 py-3 font-semibold">Unit price</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => {
                const low = qtyHand(row) < 10
                return (
                  <tr key={`${medId(row)}-${idx}`} className="border-b border-slate-100">
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-2">
                        {row.TradeName}
                        {low && (
                          <span
                            className="inline-block h-2.5 w-2.5 rounded-full bg-red-600 shadow ring-2 ring-red-200"
                            title="Below 10 units"
                            aria-label="Low stock: below 10 units"
                          />
                        )}
                        {low && (
                          <span className="text-xs font-medium text-red-600">
                            Low
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3">{row.QuantityInHand}</td>
                    <td className="px-4 py-3">
                      {row.expiryDate
                        ? String(row.expiryDate).slice(0, 10)
                        : '—'}
                    </td>
                    <td className="px-4 py-3">{row.UnitPrice}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
