import { auth, signOut } from '@/lib/auth'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link href="/dashboard" className="flex items-center text-xl font-bold text-primary">
                CryptoBuddy
              </Link>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-primary"
                >
                  Dashboard
                </Link>
                <Link
                  href="/transactions"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
                >
                  Transaktionen
                </Link>
                <Link
                  href="/portfolio"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
                >
                  Portfolio
                </Link>
                <Link
                  href="/tax-calculator"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
                >
                  Steuerrechner
                </Link>
                <Link
                  href="/staking"
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900"
                >
                  Staking
                </Link>
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-4">
                {session.user.email}
              </span>
              <form
                action={async () => {
                  'use server'
                  await signOut()
                }}
              >
                <button
                  type="submit"
                  className="text-sm text-gray-500 hover:text-gray-900"
                >
                  Abmelden
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
