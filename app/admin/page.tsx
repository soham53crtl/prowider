'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface Provider {
  id: number
  name: string
  monthlyQuota: number
  leadsReceived: number
  remainingQuota: number
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
    setTimeout(() => setToast(null), 3000)
  }

  const fetchProviders = useCallback(async () => {
    const res = await fetch('/api/dashboard')
    const data = await res.json()
    setProviders(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchProviders() }, [fetchProviders])

  const handleQuotaChange = (id: number, value: string) => {
    setEditingQuota(prev => ({ ...prev, [id]: value }))
  }

  const saveQuota = async (id: number) => {
    const raw = editingQuota[id]
    const quota = parseInt(raw)
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
        showToast('Quota updated')
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
    if (!confirm(`Reset lead count for ${name} to 0? This only resets the counter — existing lead assignments are kept.`)) return
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
  const fullProviders = providers.filter(p => p.remainingQuota === 0).length

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Link href="/" className="text-gray-400 hover:text-white text-sm mb-1 inline-block">← Back</Link>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-gray-400 text-sm mt-1">Manage provider quotas and reset lead counters</p>
        </div>

        {/* Toast */}
        {toast && (
          <div className={`mb-4 rounded-lg px-4 py-2 text-sm font-medium ${toast.ok ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
            {toast.ok ? '✓' : '✗'} {toast.msg}
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-gray-900 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-blue-400">{totalLeads}</p>
            <p className="text-sm text-gray-400 mt-1">Total Leads This Month</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-emerald-400">{totalCapacity - totalLeads}</p>
            <p className="text-sm text-gray-400 mt-1">Remaining Capacity</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-red-400">{fullProviders}</p>
            <p className="text-sm text-gray-400 mt-1">Providers at Full Quota</p>
          </div>
        </div>

        {/* Provider table */}
        {loading ? (
          <div className="text-center text-gray-500 py-16">Loading providers…</div>
        ) : (
          <div className="bg-gray-900 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-gray-800">
                  <th className="text-left px-5 py-3">Provider</th>
                  <th className="text-center px-5 py-3">Leads Received</th>
                  <th className="text-center px-5 py-3">Monthly Quota</th>
                  <th className="text-center px-5 py-3">Remaining</th>
                  <th className="text-center px-5 py-3">Fill %</th>
                  <th className="text-right px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {providers.map((p, i) => {
                  const fillPct = p.monthlyQuota > 0 ? Math.round((p.leadsReceived / p.monthlyQuota) * 100) : 0
                  const isEditing = editingQuota[p.id] !== undefined
                  return (
                    <tr
                      key={p.id}
                      className={`border-b border-gray-800 last:border-0 ${i % 2 === 0 ? '' : 'bg-gray-900/50'}`}
                    >
                      <td className="px-5 py-4 font-medium">{p.name}</td>
                      <td className="px-5 py-4 text-center text-blue-300">{p.leadsReceived}</td>

                      {/* Quota cell — inline edit */}
                      <td className="px-5 py-4 text-center">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-2">
                            <input
                              type="number"
                              min={0}
                              className="w-20 bg-gray-800 border border-blue-500 rounded px-2 py-1 text-center text-white focus:outline-none"
                              value={editingQuota[p.id]}
                              onChange={e => handleQuotaChange(p.id, e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') saveQuota(p.id) }}
                              autoFocus
                            />
                            <button
                              onClick={() => saveQuota(p.id)}
                              disabled={saving[p.id]}
                              className="text-xs bg-blue-600 hover:bg-blue-500 disabled:opacity-50 px-2 py-1 rounded font-medium"
                            >
                              {saving[p.id] ? '…' : 'Save'}
                            </button>
                            <button
                              onClick={() => setEditingQuota(prev => { const n = { ...prev }; delete n[p.id]; return n })}
                              className="text-xs text-gray-400 hover:text-white px-1"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleQuotaChange(p.id, String(p.monthlyQuota))}
                            className="text-gray-200 hover:text-blue-300 hover:underline transition"
                            title="Click to edit quota"
                          >
                            {p.monthlyQuota}
                          </button>
                        )}
                      </td>

                      <td className="px-5 py-4 text-center">
                        <span className={`font-semibold ${p.remainingQuota === 0 ? 'text-red-400' : p.remainingQuota <= 3 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                          {p.remainingQuota}
                        </span>
                      </td>

                      {/* Fill % with bar */}
                      <td className="px-5 py-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-xs text-gray-400">{fillPct}%</span>
                          <div className="w-20 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${fillPct >= 100 ? 'bg-red-500' : fillPct >= 70 ? 'bg-yellow-500' : 'bg-emerald-500'}`}
                              style={{ width: `${Math.min(fillPct, 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => resetLeads(p.id, p.name)}
                          disabled={resetting[p.id] || p.leadsReceived === 0}
                          className="text-xs bg-gray-800 hover:bg-red-900 hover:text-red-300 disabled:opacity-40 disabled:cursor-not-allowed text-gray-300 px-3 py-1.5 rounded-lg transition"
                        >
                          {resetting[p.id] ? 'Resetting…' : 'Reset Counter'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-xs text-gray-600 mt-4 text-center">
          Resetting a counter only clears the quota tracker — existing lead assignments in the database are preserved.
        </p>
      </div>
    </main>
  )
}
