import Link from 'next/link'

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500/10 border border-amber-500/30 rounded-2xl mb-6">
          <svg className="w-8 h-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-white mb-3">Access Not Granted</h1>
        <p className="text-slate-400 leading-relaxed mb-8">
          Your Google account is not registered in the Prowider system.
          Please contact the admin to request access.
        </p>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-8 text-left">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">What to do next</p>
          <ol className="space-y-2.5 text-sm text-slate-300">
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-indigo-600/20 text-indigo-400 text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-semibold">1</span>
              Share your Google email address with your administrator.
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-indigo-600/20 text-indigo-400 text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-semibold">2</span>
              Ask them to add your email to the <code className="text-indigo-400 bg-slate-800 px-1.5 py-0.5 rounded text-xs">ALLOWED_GOOGLE_EMAILS</code> list.
            </li>
            <li className="flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-indigo-600/20 text-indigo-400 text-xs flex items-center justify-center flex-shrink-0 mt-0.5 font-semibold">3</span>
              Return to the login page and try signing in again.
            </li>
          </ol>
        </div>

        <Link
          href="/login"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-xl transition shadow-lg shadow-indigo-500/20"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Login
        </Link>
      </div>
    </div>
  )
}
