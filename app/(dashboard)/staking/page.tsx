import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'
import { redirect } from 'next/navigation'

async function getStakingData(userId: string) {
  const currentYear = new Date().getFullYear()
  
  const stakingTransactions = await prisma.transaction.findMany({
    where: {
      userId,
      type: 'staking',
    },
    orderBy: { date: 'desc' },
  })

  // Calculate totals by year
  const yearlyTotals: Record<number, number> = {}
  
  stakingTransactions.forEach((tx) => {
    const year = new Date(tx.date).getFullYear()
    const value = tx.amount * tx.priceEUR
    
    if (!yearlyTotals[year]) {
      yearlyTotals[year] = 0
    }
    yearlyTotals[year] += value
  })

  const currentYearTotal = yearlyTotals[currentYear] || 0

  return {
    transactions: stakingTransactions,
    yearlyTotals,
    currentYearTotal,
    currentYear,
  }
}

export default async function StakingPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const data = await getStakingData(session.user.id)
  const threshold = 256
  const percentage = Math.min((data.currentYearTotal / threshold) * 100, 100)
  const exceedsThreshold = data.currentYearTotal > threshold

  return (
    <div className="px-4 sm:px-0">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Staking Tracker</h1>

      {/* Current Year Summary */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-semibold text-gray-900">
              Staking-Rewards {data.currentYear}
            </h2>
            <span className={`text-2xl font-bold ${exceedsThreshold ? 'text-warning' : 'text-profit'}`}>
              €{data.currentYearTotal.toFixed(2)}
            </span>
          </div>
          <p className="text-sm text-gray-500">
            Freigrenze: €{threshold.toFixed(2)} (§22 Nr. 3 EStG)
          </p>
        </div>

        {/* Progress Bar */}
        <div className="relative pt-1">
          <div className="flex mb-2 items-center justify-between">
            <div>
              <span className={`text-xs font-semibold inline-block ${exceedsThreshold ? 'text-warning' : 'text-primary'}`}>
                {percentage.toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="overflow-hidden h-4 mb-4 text-xs flex rounded-full bg-gray-200">
            <div
              style={{ width: `${percentage}%` }}
              className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                exceedsThreshold ? 'bg-warning' : 'bg-profit'
              }`}
            />
          </div>
        </div>

        {exceedsThreshold && (
          <div className="bg-warning/10 border-l-4 border-warning p-4 mt-4">
            <p className="text-sm text-warning font-medium">
              ⚠️ Achtung: Die Freigrenze von €256 wurde überschritten.
            </p>
            <p className="text-sm text-warning mt-1">
              Alle Staking-Rewards in {data.currentYear} sind steuerpflichtig (§22 Nr. 3 EStG).
            </p>
          </div>
        )}
      </div>

      {/* Yearly Breakdown */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Jahresübersicht
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(data.yearlyTotals)
            .sort(([a], [b]) => Number(b) - Number(a))
            .map(([year, total]) => (
              <div key={year} className="border rounded-lg p-4">
                <p className="text-sm text-gray-500">{year}</p>
                <p className={`text-xl font-bold ${Number(total) > threshold ? 'text-warning' : 'text-profit'}`}>
                  €{Number(total).toFixed(2)}
                </p>
                {Number(total) > threshold && (
                  <p className="text-xs text-warning mt-1">Über Freigrenze</p>
                )}
              </div>
            ))}
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Alle Staking-Rewards
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Datum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Coin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Menge
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Preis (EUR)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Wert (EUR)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Exchange
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Keine Staking-Rewards vorhanden
                  </td>
                </tr>
              ) : (
                data.transactions.map((tx) => {
                  const value = tx.amount * tx.priceEUR
                  const year = new Date(tx.date).getFullYear()
                  
                  return (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(tx.date).toLocaleDateString('de-DE')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {tx.cryptocurrency}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {tx.amount.toFixed(8)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        €{tx.priceEUR.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        €{value.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {tx.exchange}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-8 bg-blue-50 border-l-4 border-primary p-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              <strong>Wichtig:</strong> Staking-Rewards sind nach §22 Nr. 3 EStG als sonstige Einkünfte zu versteuern.
            </p>
            <p className="text-sm text-blue-700 mt-2">
              Es gilt eine Freigrenze von €256 pro Jahr. Wird diese überschritten, sind alle Staking-Rewards
              des Jahres steuerpflichtig, nicht nur der übersteigende Betrag.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
