'use client'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export const DashboardCard = () => {
  const { data: session } = useSession()
  const pathname = usePathname()
  
  return (
    <div className="max-w-4xl mx-auto mb-12">
      <div className="bg-slate-800 border-2 border-slate-600 brutal-shadow-left p-6 rounded-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <p className="font-freeman text-xl mb-1 text-slate-300">
              Welcome back,
            </p>
            <h1 className="font-anton text-3xl text-white">
              {session?.user?.name}!
            </h1>
          </div>
          <Link 
            href="/api/auth/signout"
            className="button-primary bg-red-500 hover:bg-red-600 px-4 py-2 mt-4 sm:mt-0 duration-100 text-white"
          >
            Sign Out
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Link
            href="/marketplace"
            className={`border-2 border-slate-600 button-primary transition-all p-4 text-center font-freeman rounded-lg ${
              pathname === '/marketplace' ? 'neopop-gradient-primary text-white button-primary-pressed' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
            }`}
          >
            Marketplace
          </Link>
          <Link
            href="/transactions"
            className={`border-2 border-slate-600 button-primary transition-all p-4 text-center font-freeman rounded-lg ${
              pathname === '/transactions' ? 'neopop-gradient-primary text-white button-primary-pressed' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
            }`}
          >
            Transactions
          </Link>
          <Link
            href="/shared-links"
            className={`border-2 border-slate-600 button-primary transition-all p-4 text-center font-freeman rounded-lg ${
              pathname === '/shared-links' ? 'neopop-gradient-primary text-white button-primary-pressed' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
            }`}
          >
            Shared Links
          </Link>

          <Link
            href="/affiliates"
            className={`border-2 border-slate-600 button-primary transition-all p-4 text-center font-freeman rounded-lg ${
              pathname === '/affiliates' ? 'neopop-gradient-primary text-white button-primary-pressed' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
            }`}
          >
            Affiliates
          </Link>
          <Link
            href="/dashboard"
            className={`border-2 border-slate-600 button-primary transition-all p-4 text-center font-freeman rounded-lg ${
              pathname === '/dashboard' ? 'neopop-gradient-primary text-white button-primary-pressed' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
            }`}
          >
            Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}
