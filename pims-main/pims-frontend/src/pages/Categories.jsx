import { useEffect, useState } from 'react'
import { api } from '../api'

function idOf(row) {
  return row.catId ?? row.catid
}

export default function Categories() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({
    storageInstructions: '',
    AverageTaxRate: '',
  })
  const [editing, setEditing] = useState(null)

  async function load() {
    setLoading(true)
    try {
      const data = await api('/categories')
      setRows(data)
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

  async function add(e) {
    e.preventDefault()
    setMsg('')
    try {
      await api('/category', {
        method: 'POST',
        body: JSON.stringify({
          storageInstructions: form.storageInstructions,
          AverageTaxRate: Number(form.AverageTaxRate),
        }),
      })
      setForm({ storageInstructions: '', AverageTaxRate: '' })
      await load()
    } catch (err) {
      setMsg(err.message)
    }
  }

  async function saveEdit(e) {
    e.preventDefault()
    if (!editing) return
    setMsg('')
    try {
      await api(`/category/${idOf(editing)}`, {
        method: 'PUT',
        body: JSON.stringify({
          storageInstructions: editing.storageInstructions,
          AverageTaxRate: Number(editing.AverageTaxRate),
        }),
      })
      setEditing(null)
      await load()
    } catch (err) {
      setMsg(err.message)
    }
  }

  async function remove(row) {
    if (!confirm('Delete this category?')) return
    setMsg('')
    try {
      await api(`/category/${idOf(row)}`, { method: 'DELETE' })
      await load()
    } catch (err) {
      setMsg(err.message)
    }
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold text-slate-900">Categories</h1>
      <p className="mb-4 text-sm text-slate-600">
        Add, update, or delete categories. Inventory and sales use other screens
        only.
      </p>

      <form
        onSubmit={add}
        className="no-print mb-6 flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <label className="min-w-[200px] flex-1 text-sm">
          <span className="font-medium text-slate-700">Storage instructions</span>
          <input
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            value={form.storageInstructions}
            onChange={(e) =>
              setForm((f) => ({ ...f, storageInstructions: e.target.value }))
            }
            required
          />
        </label>
        <label className="w-32 text-sm">
          <span className="font-medium text-slate-700">Avg tax %</span>
          <input
            type="number"
            step="0.01"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            value={form.AverageTaxRate}
            onChange={(e) =>
              setForm((f) => ({ ...f, AverageTaxRate: e.target.value }))
            }
            required
          />
        </label>
        <button
          type="submit"
          className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
        >
          Add category
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
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">Storage</th>
                <th className="px-4 py-3 font-semibold">Avg tax %</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={idOf(row)} className="border-b border-slate-100">
                  <td className="px-4 py-3">{idOf(row)}</td>
                  <td className="px-4 py-3">{row.storageInstructions}</td>
                  <td className="px-4 py-3">{row.AverageTaxRate}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      className="mr-2 text-teal-700 hover:underline"
                      onClick={() => setEditing({ ...row })}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="text-red-600 hover:underline"
                      onClick={() => remove(row)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <form
            onSubmit={saveEdit}
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
          >
            <h2 className="mb-4 text-lg font-semibold">Edit category</h2>
            <label className="mb-3 block text-sm">
              <span className="font-medium">Storage instructions</span>
              <input
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                value={editing.storageInstructions}
                onChange={(e) =>
                  setEditing((x) => ({ ...x, storageInstructions: e.target.value }))
                }
                required
              />
            </label>
            <label className="mb-4 block text-sm">
              <span className="font-medium">Avg tax %</span>
              <input
                type="number"
                step="0.01"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                value={editing.AverageTaxRate}
                onChange={(e) =>
                  setEditing((x) => ({ ...x, AverageTaxRate: e.target.value }))
                }
                required
              />
            </label>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="rounded-lg px-4 py-2 text-slate-600 hover:bg-slate-100"
                onClick={() => setEditing(null)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-teal-700 px-4 py-2 text-white hover:bg-teal-800"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
