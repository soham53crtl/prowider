'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/admin', label: 'Admin' },
  { href: '/request-service', label: 'Request Service' },
  { href: '/test-tools', label: 'Test Tools' },
]

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 flex-shrink-0">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow shadow-indigo-500/30">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="font-bold text-white text-lg tracking-tight">Prowider</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'bg-indigo-600/20 text-indigo-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <button
            onClick={handleLogout}
            className="text-sm text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg transition font-medium"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  )
}
