'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'

interface Lead {
  id: number
  name: string
  phone: string
  city: string
  service: string
  description: string
  createdAt: string
}

interface Provider {
  id: number
  name: string
  monthlyQuota: number
  leadsReceived: number
  remainingQuota: number
  leads: Lead[]
}

export default function Dashboard() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [flash, setFlash] = useState(false)
  const [connected, setConnected] = useState(false)

  const fetchData = useCallback(async () => {
    const res = await fetch('/api/dashboard')
    const data = await res.json()
    setProviders(data)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // SSE real-time updates
  useEffect(() => {
    const es = new EventSource('/api/sse')
    es.onopen = () => setConnected(true)
    es.onerror = () => setConnected(false)
    es.onmessage = (e) => {
      const event = JSON.parse(e.data)
      if (event.type === 'NEW_LEAD' || event.type === 'QUOTA_RESET') {
        fetchData()
        setFlash(true)
        setTimeout(() => setFlash(false), 1500)
      }
    }
    return () => es.close()
  }, [fetchData])

  const activeProvider = providers.find(p => p.id === selected)

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/" className="text-gray-400 hover:text-white text-sm mb-1 inline-block">← Back</Link>
            <h1 className="text-3xl font-bold">Provider Dashboard</h1>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className={`w-2.5 h-2.5 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className={connected ? 'text-green-400' : 'text-red-400'}>
              {connected ? 'Live' : 'Disconnected'}
            </span>
          </div>
        </div>

        {flash && (
          <div className="mb-4 bg-blue-900 text-blue-200 rounded-lg px-4 py-2 text-sm font-medium animate-pulse">
            ⚡ Dashboard updated with new data
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Provider list */}
          <div className="lg:col-span-1 flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Providers</h2>
            {providers.map(p => (
              <button
                key={p.id}
                onClick={() => setSelected(p.id === selected ? null : p.id)}
                className={`text-left rounded-xl p-4 transition border ${selected === p.id
                  ? 'bg-blue-900 border-blue-500'
                  : 'bg-gray-900 border-transparent hover:border-gray-700'
                }`}
              >
                <div className="flex justify-between items-start">
                  <span className="font-semibold">{p.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${p.remainingQuota > 5
                    ? 'bg-green-900 text-green-300'
                    : p.remainingQuota > 0
                    ? 'bg-yellow-900 text-yellow-300'
                    : 'bg-red-900 text-red-300'
                  }`}>
                    {p.remainingQuota} left
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-400">
                  {p.leadsReceived} leads received
                </div>
                <div className="mt-2 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all"
                    style={{ width: `${(p.leadsReceived / p.monthlyQuota) * 100}%` }}
                  />
                </div>
              </button>
            ))}
          </div>

          {/* Lead details */}
          <div className="lg:col-span-2">
            {activeProvider ? (
              <div>
                <h2 className="text-xl font-bold mb-1">{activeProvider.name}</h2>
                <p className="text-gray-400 text-sm mb-4">
                  Quota: {activeProvider.leadsReceived}/{activeProvider.monthlyQuota} used &nbsp;·&nbsp; {activeProvider.remainingQuota} remaining
                </p>
                {activeProvider.leads.length === 0 ? (
                  <div className="bg-gray-900 rounded-xl p-8 text-center text-gray-500">
                    No leads assigned yet.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {activeProvider.leads.map(lead => (
                      <div key={lead.id} className="bg-gray-900 rounded-xl p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">{lead.name}</p>
                            <p className="text-sm text-gray-400">{lead.phone} · {lead.city}</p>
                          </div>
                          <span className="text-xs bg-blue-900 text-blue-300 px-2 py-1 rounded-full">{lead.service}</span>
                        </div>
                        <p className="text-sm text-gray-300 mt-2">{lead.description}</p>
                        <p className="text-xs text-gray-600 mt-2">{new Date(lead.createdAt).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-gray-900 rounded-xl p-12 text-center text-gray-500 flex flex-col items-center gap-3">
                <span className="text-4xl">👈</span>
                <p>Select a provider to see their assigned leads</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
