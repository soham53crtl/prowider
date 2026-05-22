'use client'
import { useState, useEffect } from 'react'

interface Service {
  id: number
  name: string
}

export default function RequestService() {
  const [services, setServices] = useState<Service[]>([])
  const [form, setForm] = useState({ name: '', phone: '', city: '', serviceId: '', description: '' })
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/services').then(r => r.json()).then(setServices)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatus(null)
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, serviceId: parseInt(form.serviceId) }),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus({ type: 'success', message: `Your enquiry has been submitted! Assigned to ${data.assignedProviderIds.length} provider(s).` })
        setForm({ name: '', phone: '', city: '', serviceId: '', description: '' })
      } else {
        setStatus({ type: 'error', message: data.error || 'Something went wrong. Please try again.' })
      }
    } catch {
      setStatus({ type: 'error', message: 'Network error. Please check your connection.' })
    } finally {
      setLoading(false)
    }
  }

  const isValid = form.name && form.phone && form.city && form.serviceId && form.description

  return (
    <main className="flex-1 bg-slate-950 p-6 md:p-8">
      <div className="max-w-lg mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Request a Service</h1>
          <p className="text-slate-400 text-sm mt-1">
            Fill in your details and we&#39;ll connect you with the best available providers.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Full Name</label>
                <input
                  type="text"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Phone Number</label>
                <input
                  type="tel"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm"
                  placeholder="9999999999"
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">City</label>
                <input
                  type="text"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm"
                  placeholder="Mumbai"
                  value={form.city}
                  onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">Service Type</label>
                <select
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition text-sm"
                  value={form.serviceId}
                  onChange={e => setForm(f => ({ ...f, serviceId: e.target.value }))}
                  required
                >
                  <option value="" className="text-slate-500">Select a service…</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
              <textarea
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none text-sm"
                rows={4}
                placeholder="Describe your requirement in detail…"
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                required
              />
            </div>

            {status && (
              <div className={`rounded-xl px-4 py-3.5 text-sm font-medium flex items-start gap-3 ${
                status.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                  : 'bg-red-500/10 border border-red-500/30 text-red-300'
              }`}>
                {status.type === 'success' ? (
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
                {status.message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !isValid}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition shadow-lg shadow-indigo-500/20 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Submitting…
                </span>
              ) : 'Submit Enquiry'}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-600 text-xs mt-5">
          Your information is kept private and only shared with matched providers.
        </p>
      </div>
    </main>
  )
}
