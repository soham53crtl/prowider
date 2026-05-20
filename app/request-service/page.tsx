'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Service {
  id: number
  name: string
}

export default function RequestService() {
  const [services, setServices] = useState<Service[]>([])
  const [form, setForm] = useState({ name: '', phone: '', city: '', serviceId: '', description: '' })
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/services').then(r => r.json()).then(setServices)
  }, [])

  const handleSubmit = async () => {
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
        setStatus({ type: 'success', message: `Lead submitted! Assigned to ${data.assignedProviderIds.length} providers.` })
        setForm({ name: '', phone: '', city: '', serviceId: '', description: '' })
      } else {
        setStatus({ type: 'error', message: data.error || 'Something went wrong.' })
      }
    } catch {
      setStatus({ type: 'error', message: 'Network error.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-lg mx-auto">
        <Link href="/" className="text-gray-400 hover:text-white text-sm mb-6 inline-block">← Back</Link>
        <h1 className="text-3xl font-bold mb-2">Request a Service</h1>
        <p className="text-gray-400 mb-8">Submit your service enquiry and we will connect you with providers.</p>

        <div className="bg-gray-900 rounded-2xl p-6 flex flex-col gap-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Full Name</label>
            <input
              className="w-full bg-gray-800 rounded-lg px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="John Doe"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Phone Number</label>
            <input
              className="w-full bg-gray-800 rounded-lg px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="9999999999"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">City</label>
            <input
              className="w-full bg-gray-800 rounded-lg px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Mumbai"
              value={form.city}
              onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Service Type</label>
            <select
              className="w-full bg-gray-800 rounded-lg px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-blue-500"
              value={form.serviceId}
              onChange={e => setForm(f => ({ ...f, serviceId: e.target.value }))}
            >
              <option value="">Select a service...</option>
              {services.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Description</label>
            <textarea
              className="w-full bg-gray-800 rounded-lg px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={3}
              placeholder="Describe your requirement..."
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>

          {status && (
            <div className={`rounded-lg px-4 py-3 text-sm font-medium ${status.type === 'success' ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
              {status.message}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || !form.name || !form.phone || !form.city || !form.serviceId || !form.description}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition rounded-lg py-3 font-semibold text-white"
          >
            {loading ? 'Submitting...' : 'Submit Enquiry'}
          </button>
        </div>
      </div>
    </main>
  )
}
