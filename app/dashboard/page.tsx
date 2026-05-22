'use client'
import { useState, useEffect, useCallback } from 'react'

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

  useEffect(() => { fetchData() }, [fetchData])

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
  const totalLeads = providers.reduce((s, p) => s + p.leadsReceived, 0)
  const totalCapacity = providers.reduce((s, p) => s + p.monthlyQuota, 0)

  return (
    <main className="flex-1 bg-slate-950 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Provider Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">Real-time lead assignment across all providers</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-4 text-sm">
              <div className="text-center">
                <p className="text-xl font-bold text-indigo-400">{totalLeads}</p>
                <p className="text-slate-500 text-xs">Total Leads</p>
              </div>
              <div className="text-center">
                <p className="text-xl font-bold text-slate-300">{totalCapacity}</p>
                <p className="text-slate-500 text-xs">Total Capacity</p>
              </div>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
              connected ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
              {connected ? 'Live' : 'Disconnected'}
            </div>
          </div>
        </div>

        {flash && (
          <div className="mb-6 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Dashboard updated with new data
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 flex flex-col gap-3">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-1">
              Providers ({providers.length})
            </h2>
            {providers.length === 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center text-slate-500 text-sm">
                Loading providers…
              </div>
            )}
            {providers.map(p => {
              const fillPct = p.monthlyQuota > 0 ? Math.round((p.leadsReceived / p.monthlyQuota) * 100) : 0
              const isSelected = selected === p.id
              return (
                <button
                  key={p.id}
                  onClick={() => setSelected(p.id === selected ? null : p.id)}
                  className={`text-left rounded-xl p-4 transition-all border ${
                    isSelected
                      ? 'bg-indigo-600/10 border-indigo-500/50 shadow-lg shadow-indigo-500/10'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-white text-sm">{p.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      p.remainingQuota === 0
                        ? 'bg-red-500/10 text-red-400'
                        : p.remainingQuota <= 3
                        ? 'bg-amber-500/10 text-amber-400'
                        : 'bg-emerald-500/10 text-emerald-400'
                    }`}>
                      {p.remainingQuota} left
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-3">{p.leadsReceived} of {p.monthlyQuota} leads used</p>
                  <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        fillPct >= 100 ? 'bg-red-500' : fillPct >= 70 ? 'bg-amber-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${Math.min(fillPct, 100)}%` }}
                    />
                  </div>
                </button>
              )
            })}
          </div>

          <div className="lg:col-span-2">
            {activeProvider ? (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-xl font-bold text-white">{activeProvider.name}</h2>
                    <p className="text-slate-400 text-sm mt-0.5">
                      {activeProvider.leadsReceived}/{activeProvider.monthlyQuota} leads used &nbsp;·&nbsp; {activeProvider.remainingQuota} remaining
                    </p>
                  </div>
                  <span className="bg-indigo-600/10 text-indigo-400 text-xs font-semibold px-3 py-1.5 rounded-full border border-indigo-500/20">
                    {activeProvider.leads.length} assigned
                  </span>
                </div>

                {activeProvider.leads.length === 0 ? (
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-500">
                    <svg className="w-8 h-8 mx-auto mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    No leads assigned yet
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {activeProvider.leads.map(lead => (
                      <div key={lead.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-white">{lead.name}</p>
                            <p className="text-sm text-slate-400 mt-0.5">{lead.phone} · {lead.city}</p>
                          </div>
                          <span className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2.5 py-1 rounded-full font-medium">
                            {lead.service}
                          </span>
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed">{lead.description}</p>
                        <p className="text-xs text-slate-600 mt-3">
                          {new Date(lead.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-16 text-center flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-2">
                  <svg className="w-6 h-6 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </div>
                <p className="text-slate-400 font-medium">Select a provider</p>
                <p className="text-slate-600 text-sm">Click any provider on the left to see their assigned leads</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
