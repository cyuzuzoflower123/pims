import { useEffect, useState } from 'react'
import { api } from '../api'

function medId(row) {
  return row.medId ?? row.medid
}

function catId(row) {
  return row.catId ?? row.catid
}

export default function Medicines() {
  const [medicines, setMedicines] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({
    TradeName: '',
    GenericName: '',
    UnitPrice: '',
    catId: '',
  })
  const [editing, setEditing] = useState(null)

  function idOfCat(row) {
    return row.catId ?? row.catid
  }

  async function load() {
    setLoading(true)
    try {
      const [m, c] = await Promise.all([api('/medicines'), api('/categories')])
      setMedicines(m)
      setCategories(c)
      if (!form.catId && c.length) {
        const first = c[0]
        setForm((f) => ({ ...f, catId: String(idOfCat(first)) }))
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

  async function add(e) {
    e.preventDefault()
    setMsg('')
    try {
      await api('/medicine', {
        method: 'POST',
        body: JSON.stringify({
          TradeName: form.TradeName,
          GenericName: form.GenericName,
          UnitPrice: Number(form.UnitPrice),
          catId: Number(form.catId),
        }),
      })
      setForm((f) => ({
        ...f,
        TradeName: '',
        GenericName: '',
        UnitPrice: '',
      }))
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
      await api(`/medicine/${medId(editing)}`, {
        method: 'PUT',
        body: JSON.stringify({
          TradeName: editing.TradeName,
          GenericName: editing.GenericName,
          UnitPrice: Number(editing.UnitPrice),
          catId: Number(catId(editing)),
        }),
      })
      setEditing(null)
      await load()
    } catch (err) {
      setMsg(err.message)
    }
  }

  async function remove(row) {
    if (!confirm('Delete this medicine?')) return
    setMsg('')
    try {
      await api(`/medicine/${medId(row)}`, { method: 'DELETE' })
      await load()
    } catch (err) {
      setMsg(err.message)
    }
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-semibold text-slate-900">Medicine</h1>
      <p className="mb-4 text-sm text-slate-600">
        Manage medicine catalog. Charges at sale time use unit price × quantity
        sold.
      </p>

      <form
        onSubmit={add}
        className="no-print mb-6 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-2 lg:grid-cols-4"
      >
        <label className="text-sm">
          <span className="font-medium text-slate-700">Trade name</span>
          <input
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            value={form.TradeName}
            onChange={(e) => setForm((f) => ({ ...f, TradeName: e.target.value }))}
            required
          />
        </label>
        <label className="text-sm">
          <span className="font-medium text-slate-700">Generic name</span>
          <input
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            value={form.GenericName}
            onChange={(e) =>
              setForm((f) => ({ ...f, GenericName: e.target.value }))
            }
            required
          />
        </label>
        <label className="text-sm">
          <span className="font-medium text-slate-700">Unit price</span>
          <input
            type="number"
            step="0.01"
            min="0"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            value={form.UnitPrice}
            onChange={(e) => setForm((f) => ({ ...f, UnitPrice: e.target.value }))}
            required
          />
        </label>
        <label className="text-sm">
          <span className="font-medium text-slate-700">Category</span>
          <select
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
            value={form.catId}
            onChange={(e) => setForm((f) => ({ ...f, catId: e.target.value }))}
            required
          >
            {categories.map((c) => (
              <option key={idOfCat(c)} value={idOfCat(c)}>
                #{idOfCat(c)} — {c.storageInstructions}
              </option>
            ))}
          </select>
        </label>
        <div className="md:col-span-2 lg:col-span-4">
          <button
            type="submit"
            className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800"
          >
            Add medicine
          </button>
        </div>
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
                <th className="px-4 py-3 font-semibold">Trade</th>
                <th className="px-4 py-3 font-semibold">Generic</th>
                <th className="px-4 py-3 font-semibold">Unit price</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {medicines.map((row) => (
                <tr key={medId(row)} className="border-b border-slate-100">
                  <td className="px-4 py-3">{medId(row)}</td>
                  <td className="px-4 py-3">{row.TradeName}</td>
                  <td className="px-4 py-3">{row.GenericName}</td>
                  <td className="px-4 py-3">{row.UnitPrice}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {row.categoryName ?? `#${catId(row)}`}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      className="mr-2 text-teal-700 hover:underline"
                      onClick={() => setEditing({ ...row, catId: catId(row) })}
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
            className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
          >
            <h2 className="mb-4 text-lg font-semibold">Edit medicine</h2>
            <label className="mb-3 block text-sm">
              <span className="font-medium">Trade name</span>
              <input
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                value={editing.TradeName}
                onChange={(e) =>
                  setEditing((x) => ({ ...x, TradeName: e.target.value }))
                }
                required
              />
            </label>
            <label className="mb-3 block text-sm">
              <span className="font-medium">Generic name</span>
              <input
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                value={editing.GenericName}
                onChange={(e) =>
                  setEditing((x) => ({ ...x, GenericName: e.target.value }))
                }
                required
              />
            </label>
            <label className="mb-3 block text-sm">
              <span className="font-medium">Unit price</span>
              <input
                type="number"
                step="0.01"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                value={editing.UnitPrice}
                onChange={(e) =>
                  setEditing((x) => ({ ...x, UnitPrice: e.target.value }))
                }
                required
              />
            </label>
            <label className="mb-4 block text-sm">
              <span className="font-medium">Category</span>
              <select
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
                value={editing.catId}
                onChange={(e) =>
                  setEditing((x) => ({ ...x, catId: Number(e.target.value) }))
                }
              >
                {categories.map((c) => (
                  <option key={idOfCat(c)} value={idOfCat(c)}>
                    #{idOfCat(c)} — {c.storageInstructions}
                  </option>
                ))}
              </select>
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
