import { useEffect, useMemo, useState } from 'react'
import { api } from '../api'

function medId(row) {
  return row.medId ?? row.medid
}

function lineKey() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

export default function Sales() {
  const [medicines, setMedicines] = useState([])
  const [lines, setLines] = useState([])
  const [pickMed, setPickMed] = useState('')
  const [pickQty, setPickQty] = useState('1')
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const today = useMemo(() => new Date().toISOString().slice(0, 10), [])

  useEffect(() => {
    api('/medicines')
      .then((m) => {
        setMedicines(m)
        if (m.length) setPickMed(String(medId(m[0])))
      })
      .catch((e) => setErr(e.message))
  }, [])

  const billLines = useMemo(
    () =>
      lines.map((l) => {
        const unit = Number(l.UnitPrice)
        const q = Number(l.qty)
        const totalAmount = unit * q
        return { ...l, totalAmount }
      }),
    [lines]
  )

  const grandTotal = useMemo(
    () => billLines.reduce((s, l) => s + l.totalAmount, 0),
    [billLines]
  )

  function addLine(e) {
    e.preventDefault()
    setMsg('')
    setErr('')
    const m = medicines.find((x) => String(medId(x)) === pickMed)
    if (!m) return
    const qty = Math.max(1, Number(pickQty) || 1)
    setLines((prev) => [
      ...prev,
      {
        key: lineKey(),
        medId: medId(m),
        TradeName: m.TradeName,
        UnitPrice: m.UnitPrice,
        qty,
      },
    ])
  }

  function removeLine(key) {
    setLines((prev) => prev.filter((l) => l.key !== key))
  }

  async function completeSale(e) {
    e.preventDefault()
    if (!lines.length) {
      setMsg('Add at least one line to the bill.')
      return
    }
    setBusy(true)
    setMsg('')
    setErr('')
    try {
      for (const l of billLines) {
        await api('/sales', {
          method: 'POST',
          body: JSON.stringify({
            medId: l.medId,
            quantitySold: l.qty,
            totalAmount: l.totalAmount,
            saleDate: today,
          }),
        })
      }
      setLines([])
      setMsg('Sale recorded.')
    } catch (saleErr) {
      setErr(saleErr.message)
    } finally {
      setBusy(false)
    }
  }

  function printBill() {
    window.print()
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="no-print">
        <h1 className="mb-4 text-2xl font-semibold text-slate-900">Sales</h1>
        <p className="mb-4 text-sm text-slate-600">
          Each line is charged as unit price × quantity. Completing the sale
          posts one row per medicine to the server.
        </p>

        <form
          onSubmit={addLine}
          className="no-print mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <label className="min-w-[200px] flex-1 text-sm">
            <span className="font-medium text-slate-700">Medicine</span>
            <select
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              value={pickMed}
              onChange={(e) => setPickMed(e.target.value)}
            >
              {medicines.map((m) => (
                <option key={medId(m)} value={medId(m)}>
                  {m.TradeName} — {m.UnitPrice}
                </option>
              ))}
            </select>
          </label>
          <label className="w-24 text-sm">
            <span className="font-medium text-slate-700">Qty</span>
            <input
              type="number"
              min="1"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              value={pickQty}
              onChange={(e) => setPickQty(e.target.value)}
            />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-900"
          >
            Add to bill
          </button>
        </form>

        {lines.length > 0 && (
          <form onSubmit={completeSale} className="no-print space-y-3">
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-slate-50">
                  <tr>
                    <th className="px-3 py-2">Trade name</th>
                    <th className="px-3 py-2">Qty</th>
                    <th className="px-3 py-2">Line total</th>
                    <th className="px-3 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {billLines.map((l) => (
                    <tr key={l.key} className="border-b border-slate-100">
                      <td className="px-3 py-2">{l.TradeName}</td>
                      <td className="px-3 py-2">{l.qty}</td>
                      <td className="px-3 py-2">{l.totalAmount.toFixed(2)}</td>
                      <td className="px-3 py-2">
                        <button
                          type="button"
                          className="text-red-600 hover:underline"
                          onClick={() => removeLine(l.key)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60"
            >
              {busy ? 'Saving…' : 'Complete sale'}
            </button>
          </form>
        )}

        {err && (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {err}
          </p>
        )}
        {msg && (
          <p className="mt-3 text-sm text-teal-800" role="status">
            {msg}
          </p>
        )}
      </div>

      <div className="bill-print rounded-xl border border-slate-300 bg-white p-6 shadow-md">
        <div className="mb-4 flex items-start justify-between gap-2">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Bill</h2>
            <p className="text-sm text-slate-500">Date: {today}</p>
          </div>
          <button
            type="button"
            onClick={printBill}
            className="no-print rounded-lg border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50"
          >
            Print bill
          </button>
        </div>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="py-2 pr-2">Trade name</th>
              <th className="py-2 pr-2">Qty sold</th>
              <th className="py-2">Total amount</th>
            </tr>
          </thead>
          <tbody>
            {billLines.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-6 text-center text-slate-400">
                  No lines yet
                </td>
              </tr>
            ) : (
              billLines.map((l) => (
                <tr key={l.key} className="border-b border-slate-100">
                  <td className="py-2 pr-2">{l.TradeName}</td>
                  <td className="py-2 pr-2">{l.qty}</td>
                  <td className="py-2">{l.totalAmount.toFixed(2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="mt-4 flex justify-between border-t border-slate-200 pt-3 text-base font-semibold">
          <span>Grand total</span>
          <span>{grandTotal.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}
