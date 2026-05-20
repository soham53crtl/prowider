import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Prowider</h1>
        <p className="text-gray-400 text-lg">Mini Lead Distribution System</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 w-full max-w-3xl">
        <Link href="/request-service"
          className="bg-blue-600 hover:bg-blue-500 transition rounded-xl p-6 text-center font-semibold text-lg shadow-lg">
          📋 Request Service
          <p className="text-sm font-normal text-blue-200 mt-1">Submit a new lead</p>
        </Link>
        <Link href="/dashboard"
          className="bg-emerald-700 hover:bg-emerald-600 transition rounded-xl p-6 text-center font-semibold text-lg shadow-lg">
          📊 Dashboard
          <p className="text-sm font-normal text-emerald-200 mt-1">Provider lead view</p>
        </Link>
        <Link href="/test-tools"
          className="bg-orange-700 hover:bg-orange-600 transition rounded-xl p-6 text-center font-semibold text-lg shadow-lg">
          🛠 Test Tools
          <p className="text-sm font-normal text-orange-200 mt-1">Concurrency & webhooks</p>
        </Link>
        <Link href="/admin"
          className="bg-purple-700 hover:bg-purple-600 transition rounded-xl p-6 text-center font-semibold text-lg shadow-lg">
          ⚙️ Admin
          <p className="text-sm font-normal text-purple-200 mt-1">Manage quotas</p>
        </Link>
      </div>
    </main>
  )
}
