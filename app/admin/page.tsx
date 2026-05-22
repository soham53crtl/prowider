'use client'
import { useState, useEffect, useCallback } from 'react'

interface Provider {
  id: number
  name: string
  monthlyQuota: number
  leadsReceived: number
  remainingQuota: number
}

function Toast({ toast }: { toast: { msg: string; ok: boolean } | null }) {
  if (!toast) return null
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl text-sm font-medium border transition-all ${
      toast.ok
        ? 'bg-emerald-900/90 border-emerald-700/50 text-emerald-200'
        : 'bg-red-900/90 border-red-700/50 text-red-200'
    }`}>
      {toast.ok ? (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      )}
      {toast.msg}
    </div>
  )
}

export default function AdminPage() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [editingQuota, setEditingQuota] = useState<Record<number, string>>({})
  const [saving, setSaving] = useState<Record<number, boolean>>({})
  const [resetting, setResetting] = useState<Record<number, boolean>>({})
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3500)
  }

  const fetchProviders = useCallback(async () => {
    const res = await fetch('/api/dashboard')
    const data = await res.json()
    setProviders(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchProviders() }, [fetchProviders])

  const saveQuota = async (id: number) => {
    const quota = parseInt(editingQuota[id])
    if (isNaN(quota) || quota < 0) {
      showToast('Quota must be a positive number', false)
      return
    }
    setSaving(prev => ({ ...prev, [id]: true }))
    try {
      const res = await fetch(`/api/admin/providers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monthlyQuota: quota }),
      })
      if (res.ok) {
        showToast('Quota updated successfully')
        setEditingQuota(prev => { const n = { ...prev }; delete n[id]; return n })
        await fetchProviders()
      } else {
        const err = await res.json()
        showToast(err.error || 'Failed to update quota', false)
      }
    } finally {
      setSaving(prev => ({ ...prev, [id]: false }))
    }
  }

  const resetLeads = async (id: number, name: string) => {
    if (!confirm(`Reset lead counter for ${name} to 0?\n\nExisting lead assignments are preserved — only the quota counter is cleared.`)) return
    setResetting(prev => ({ ...prev, [id]: true }))
    try {
      const res = await fetch(`/api/admin/providers/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset' }),
      })
      if (res.ok) {
        showToast(`${name} counter reset to 0`)
        await fetchProviders()
      } else {
        const err = await res.json()
        showToast(err.error || 'Reset failed', false)
      }
    } finally {
      setResetting(prev => ({ ...prev, [id]: false }))
    }
  }

  const totalLeads = providers.reduce((s, p) => s + p.leadsReceived, 0)
  const totalCapacity = providers.reduce((s, p) => s + p.monthlyQuota, 0)
  const remainingCapacity = totalCapacity - totalLeads
  const fullProviders = providers.filter(p => p.remainingQuota === 0).length

  return (
    <main className="flex-1 bg-slate-950 p-6 md:p-8">
      <Toast toast={toast} />
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <p className="text-slate-400 text-sm mt-1">Manage provider quotas and reset lead counters</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <p className="text-3xl font-bold text-indigo-400">{totalLeads}</p>
            <p className="text-sm text-slate-400 mt-1.5">Leads This Month</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <p className="text-3xl font-bold text-emerald-400">{remainingCapacity}</p>
            <p className="text-sm text-slate-400 mt-1.5">Remaining Capacity</p>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <p className="text-3xl font-bold text-red-400">{fullProviders}</p>
            <p className="text-sm text-slate-400 mt-1.5">Providers at Full Quota</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
            <h2 className="font-semibold text-white">Provider Quotas</h2>
            <span className="text-xs text-slate-500">Click a quota number to edit it inline</span>
          </div>

          {loading ? (
            <div className="text-center text-slate-500 py-16 text-sm">Loading providers…</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 text-xs uppercase tracking-wider border-b border-slate-800">
                  <th className="text-left px-6 py-3.5">Provider</th>
                  <th className="text-center px-6 py-3.5">Leads</th>
                  <th className="text-center px-6 py-3.5">Monthly Quota</th>
                  <th className="text-center px-6 py-3.5">Remaining</th>
                  <th className="text-center px-6 py-3.5">Fill</th>
                  <th className="text-right px-6 py-3.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {providers.map(p => {
                  const fillPct = p.monthlyQuota > 0 ? Math.round((p.leadsReceived / p.monthlyQuota) * 100) : 0
                  const isEditing = editingQuota[p.id] !== undefined
                  return (
                    <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-medium text-white">{p.name}</span>
                      </td>
                      <td className="px-6 py-4 text-center text-indigo-400 font-semibold">
                        {p.leadsReceived}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-2">
                            <input
                              type="number"
                              min={0}
                              className="w-20 bg-slate-800 border border-indigo-500/50 rounded-lg px-2 py-1.5 text-center text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                              value={editingQuota[p.id]}
                              onChange={e => setEditingQuota(prev => ({ ...prev, [p.id]: e.target.value }))}
                              onKeyDown={e => { if (e.key === 'Enter') saveQuota(p.id) }}
                              autoFocus
                            />
                            <button
                              onClick={() => saveQuota(p.id)}
                              disabled={saving[p.id]}
                              className="text-xs bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-3 py-1.5 rounded-lg font-medium text-white transition"
                            >
                              {saving[p.id] ? '…' : 'Save'}
                            </button>
                            <button
                              onClick={() => setEditingQuota(prev => { const n = { ...prev }; delete n[p.id]; return n })}
                              className="text-xs text-slate-500 hover:text-white w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-800 transition"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setEditingQuota(prev => ({ ...prev, [p.id]: String(p.monthlyQuota) }))}
                            className="text-slate-200 hover:text-indigo-400 hover:underline transition font-medium"
                            title="Click to edit"
                          >
                            {p.monthlyQuota}
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`font-semibold ${
                          p.remainingQuota === 0 ? 'text-red-400' : p.remainingQuota <= 3 ? 'text-amber-400' : 'text-emerald-400'
                        }`}>
                          {p.remainingQuota}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center gap-1.5">
                          <span className="text-xs text-slate-500">{fillPct}%</span>
                          <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                fillPct >= 100 ? 'bg-red-500' : fillPct >= 70 ? 'bg-amber-500' : 'bg-indigo-500'
                              }`}
                              style={{ width: `${Math.min(fillPct, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => resetLeads(p.id, p.name)}
                          disabled={resetting[p.id] || p.leadsReceived === 0}
                          className="text-xs bg-slate-800 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 disabled:opacity-40 disabled:cursor-not-allowed text-slate-400 border border-slate-700 px-3 py-1.5 rounded-lg transition"
                        >
                          {resetting[p.id] ? 'Resetting…' : 'Reset Counter'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        <p className="text-xs text-slate-600 mt-4 text-center">
          Resetting a counter only clears the quota tracker — existing lead assignments are preserved in the database.
        </p>
      </div>
    </main>
  )
}
