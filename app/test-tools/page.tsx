'use client'
import { useState } from 'react'
import Link from 'next/link'

interface Result {
  label: string
  response: string
  ok: boolean
  time: number
}

export default function TestTools() {
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState<string | null>(null)

  const addResult = (label: string, response: string, ok: boolean, time: number) => {
    setResults(prev => [{ label, response, ok, time }, ...prev].slice(0, 30))
  }

  const resetQuota = async (times = 1) => {
    const key = times > 1 ? 'webhook-multi' : 'webhook-single'
    setLoading(key)

    // Same eventId = idempotency test when called multiple times
    const eventId = `evt_quota_reset_${Date.now()}`

    const calls = Array.from({ length: times }, async (_, i) => {
      const start = Date.now()
      try {
        const res = await fetch('/api/webhook', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ eventId, action: 'reset_quota' }),
        })
        const data = await res.json()
        const elapsed = Date.now() - start
        addResult(
          `Webhook call ${times > 1 ? `#${i + 1}` : ''}`,
          JSON.stringify(data, null, 2),
          res.ok,
          elapsed
        )
      } catch (e) {
        addResult(`Webhook call #${i + 1}`, 'Network error', false, Date.now() - start)
      }
    })

    await Promise.all(calls)
    setLoading(null)
  }

  const bulkLeads = async () => {
    setLoading('bulk')
    const start = Date.now()
    try {
      const res = await fetch('/api/test/bulk-leads', { method: 'POST' })
      const data = await res.json()
      addResult('Bulk Lead Generation (10 concurrent)', JSON.stringify(data, null, 2), res.ok, Date.now() - start)
    } catch {
      addResult('Bulk Lead Generation', 'Network error', false, Date.now() - start)
    }
    setLoading(null)
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="text-gray-400 hover:text-white text-sm mb-6 inline-block">← Back</Link>
        <h1 className="text-3xl font-bold mb-1">Test Tools</h1>
        <p className="text-gray-400 mb-8">Internal testing panel — simulates payment webhooks and concurrency scenarios</p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <button
            onClick={() => resetQuota(1)}
            disabled={!!loading}
            className="bg-orange-700 hover:bg-orange-600 disabled:opacity-50 transition rounded-xl p-5 text-left"
          >
            <div className="text-xl mb-2">💳</div>
            <div className="font-semibold">Reset Quota</div>
            <div className="text-sm text-orange-300 mt-1">Simulate successful payment (webhook)</div>
          </button>

          <button
            onClick={() => resetQuota(5)}
            disabled={!!loading}
            className="bg-red-800 hover:bg-red-700 disabled:opacity-50 transition rounded-xl p-5 text-left"
          >
            <div className="text-xl mb-2">🔁</div>
            <div className="font-semibold">Duplicate Webhook ×5</div>
            <div className="text-sm text-red-300 mt-1">Same event ID — tests idempotency</div>
          </button>

          <button
            onClick={bulkLeads}
            disabled={!!loading}
            className="bg-purple-800 hover:bg-purple-700 disabled:opacity-50 transition rounded-xl p-5 text-left"
          >
            <div className="text-xl mb-2">⚡</div>
            <div className="font-semibold">Generate 10 Leads</div>
            <div className="text-sm text-purple-300 mt-1">Simultaneous — tests concurrency</div>
          </button>
        </div>

        {loading && (
          <div className="mb-4 text-sm text-yellow-400 animate-pulse">Running {loading}...</div>
        )}

        {results.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Results</h2>
            <div className="flex flex-col gap-3">
              {results.map((r, i) => (
                <div key={i} className={`rounded-xl p-4 border ${r.ok ? 'bg-gray-900 border-gray-800' : 'bg-red-950 border-red-800'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-sm">{r.label}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${r.ok ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                      {r.ok ? '✓ OK' : '✗ Error'} · {r.time}ms
                    </span>
                  </div>
                  <pre className="text-xs text-gray-300 overflow-x-auto whitespace-pre-wrap">{r.response}</pre>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
