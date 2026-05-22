import Link from 'next/link'

const cards = [
  {
    href: '/request-service',
    title: 'Request Service',
    description: 'Submit a new lead and get matched with the right providers instantly.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    bg: 'bg-blue-600 hover:bg-blue-500',
    shadow: 'shadow-blue-500/20',
    badge: 'Public',
  },
  {
    href: '/dashboard',
    title: 'Dashboard',
    description: 'Monitor provider assignments and track leads in real time with live updates.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    bg: 'bg-emerald-600 hover:bg-emerald-500',
    shadow: 'shadow-emerald-500/20',
    badge: 'Live',
  },
  {
    href: '/admin',
    title: 'Admin Panel',
    description: 'Manage provider quotas, reset counters, and oversee system capacity.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    bg: 'bg-indigo-600 hover:bg-indigo-500',
    shadow: 'shadow-indigo-500/20',
    badge: 'Admin',
  },
  {
    href: '/test-tools',
    title: 'Test Tools',
    description: 'Run concurrency tests, simulate webhooks, and generate bulk leads.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
      </svg>
    ),
    bg: 'bg-amber-600 hover:bg-amber-500',
    shadow: 'shadow-amber-500/20',
    badge: 'Dev',
  },
]

export default function Home() {
  return (
    <main className="flex-1 bg-slate-950 p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10 pt-4">
          <p className="text-indigo-400 text-sm font-semibold uppercase tracking-wider mb-3">
            Lead Distribution Platform
          </p>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-3">
            Welcome back
          </h1>
          <p className="text-slate-400 text-lg max-w-xl">
            Route, manage, and track service leads across your provider network — all in one place.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-12">
          {cards.map(card => (
            <Link
              key={card.href}
              href={card.href}
              className={`group ${card.bg} ${card.shadow} shadow-lg rounded-2xl p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl block`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="bg-white/15 rounded-xl w-11 h-11 flex items-center justify-center">
                  {card.icon}
                </div>
                <span className="text-xs font-semibold bg-white/10 text-white/80 px-2 py-0.5 rounded-full">
                  {card.badge}
                </span>
              </div>
              <h3 className="font-bold text-white text-lg mb-1.5">{card.title}</h3>
              <p className="text-white/70 text-sm leading-relaxed">{card.description}</p>
            </Link>
          ))}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">System Status</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300 text-sm">Lead routing — Active</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300 text-sm">SSE stream — Online</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-slate-300 text-sm">Database — Connected</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
