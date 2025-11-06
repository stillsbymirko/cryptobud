import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'
import { redirect } from 'next/navigation'
import { Portfolio, Transaction } from '@prisma/client'
import { getNextTaxFreeSales } from '@/lib/tax/calculator'

async function getDashboardData(userId: string) {
  const transactions = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
  })

  const portfolios = await prisma.portfolio.findMany({
    where: { userId },
  })

  // Calculate total value
  const totalValue = portfolios.reduce(
    (sum: number, p: Portfolio) => sum + p.totalAmount * p.averageBuyPrice,
    0
  )

  // Calculate staking rewards for current year
  const currentYear = new Date().getFullYear()
  const stakingRewards = transactions.filter(
    (t) =>
      t.type === 'staking' &&
      new Date(t.date).getFullYear() === currentYear
  )

  const stakingTotal = stakingRewards.reduce(
    (sum: number, t: Transaction) => sum + t.priceEUR * t.amount,
    0
  )

  // Get next tax-free sales
  const nextTaxFree = getNextTaxFreeSales(transactions).slice(0, 5)

  return {
    totalValue,
    stakingTotal,
    portfolios: portfolios.slice(0, 5),
    recentTransactions: transactions.slice(0, 5),
    nextTaxFree,
  }
}

export default async function DashboardPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const data = await getDashboardData(session.user.id)

  return (
    <div className="px-4 sm:px-0">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Portfolio-Gesamtwert
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  €{data.totalValue.toFixed(2)}
                </dd>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Staking-Rewards {new Date().getFullYear()}
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  €{data.stakingTotal.toFixed(2)}
                </dd>
                {data.stakingTotal > 256 && (
                  <p className="mt-2 text-sm text-warning">
                    ⚠️ Freigrenze überschritten
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-1">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Positionen
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  {data.portfolios.length}
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Holdings */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Top Holdings</h2>
        </div>
        <div className="p-6">
          {data.portfolios.length === 0 ? (
            <p className="text-gray-500">Keine Holdings vorhanden</p>
          ) : (
            <div className="space-y-4">
              {data.portfolios.map((portfolio) => (
                <div
                  key={portfolio.id}
                  className="flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {portfolio.cryptocurrency}
                    </p>
                    <p className="text-sm text-gray-500">
                      {portfolio.totalAmount.toFixed(8)} @{' '}
                      €{portfolio.averageBuyPrice.toFixed(2)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      €{(portfolio.totalAmount * portfolio.averageBuyPrice).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Letzte Transaktionen
          </h2>
        </div>
        <div className="p-6">
          {data.recentTransactions.length === 0 ? (
            <p className="text-gray-500">Keine Transaktionen vorhanden</p>
          ) : (
            <div className="space-y-4">
              {data.recentTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {transaction.type.toUpperCase()} {transaction.cryptocurrency}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(transaction.date).toLocaleDateString('de-DE')} •{' '}
                      {transaction.exchange}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      {transaction.amount.toFixed(8)}
                    </p>
                    <p className="text-sm text-gray-500">
                      €{transaction.priceEUR.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Next Tax-Free Sales */}
      {data.nextTaxFree.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Nächste steuerfreie Verkäufe
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {data.nextTaxFree.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {item.cryptocurrency}
                    </p>
                    <p className="text-sm text-gray-500">
                      {item.amount.toFixed(8)} Einheiten
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-profit">
                      in {item.daysUntilTaxFree} Tagen
                    </p>
                    <p className="text-sm text-gray-500">
                      {item.date.toLocaleDateString('de-DE')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
