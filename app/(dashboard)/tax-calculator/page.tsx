import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'
import { redirect } from 'next/navigation'
import { calculateTax } from '@/lib/tax/calculator'

async function getTaxData(userId: string) {
  const transactions = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { date: 'asc' },
  })

  const currentYear = new Date().getFullYear()
  const taxData = calculateTax(transactions, currentYear)

  return taxData
}

export default async function TaxCalculatorPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const taxData = await getTaxData(session.user.id)

  // Check if staking rewards exceed threshold
  const stakingExceedsThreshold = taxData.stakingRewards > 256

  return (
    <div className="px-4 sm:px-0">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Steuerrechner {taxData.year}
      </h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-sm font-medium text-gray-500 mb-2">
            Steuerpflichtige Gewinne
          </p>
          <p className="text-3xl font-bold text-loss">
            €{taxData.taxableGains.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-1">§23 EStG</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-sm font-medium text-gray-500 mb-2">
            Steuerfreie Gewinne
          </p>
          <p className="text-3xl font-bold text-profit">
            €{taxData.taxFreeGains.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-1">&gt;1 Jahr Haltefrist</p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-sm font-medium text-gray-500 mb-2">
            Staking-Rewards
          </p>
          <p className={`text-3xl font-bold ${stakingExceedsThreshold ? 'text-warning' : 'text-profit'}`}>
            €{taxData.stakingRewards.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {stakingExceedsThreshold ? '⚠️ Freigrenze überschritten' : 'Unter Freigrenze'}
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <p className="text-sm font-medium text-gray-500 mb-2">
            Gesamtgewinne
          </p>
          <p className="text-3xl font-bold text-gray-900">
            €{taxData.totalGains.toFixed(2)}
          </p>
          <p className="text-xs text-gray-500 mt-1">Vor Steuern</p>
        </div>
      </div>

      {/* Tax Information */}
      <div className="bg-blue-50 border-l-4 border-primary p-4 mb-8">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-blue-700">
              <strong>§23 EStG:</strong> Gewinne aus Veräußerung von Kryptowährungen sind steuerfrei nach 1 Jahr Haltefrist.
            </p>
            <p className="text-sm text-blue-700 mt-2">
              <strong>§22 Nr. 3 EStG:</strong> Staking-Rewards haben eine Freigrenze von 256€ pro Jahr.
              Wird diese überschritten, sind alle Rewards steuerpflichtig.
            </p>
          </div>
        </div>
      </div>

      {/* Transaction Details */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Transaktionen {taxData.year}
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
                  Typ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Coin
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Menge
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gewinn/Verlust
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Notiz
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {taxData.transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    Keine Transaktionen in {taxData.year}
                  </td>
                </tr>
              ) : (
                taxData.transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(tx.date).toLocaleDateString('de-DE')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          tx.type === 'BUY'
                            ? 'bg-profit/10 text-profit'
                            : tx.type === 'SELL'
                            ? 'bg-loss/10 text-loss'
                            : 'bg-warning/10 text-warning'
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {tx.cryptocurrency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {tx.amount.toFixed(8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {tx.gainLoss !== undefined ? (
                        <span className={tx.gainLoss >= 0 ? 'text-profit' : 'text-loss'}>
                          €{tx.gainLoss.toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {tx.taxable ? (
                        <span className="px-2 py-1 text-xs font-medium rounded bg-loss/10 text-loss">
                          Steuerpflichtig
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium rounded bg-profit/10 text-profit">
                          Steuerfrei
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {tx.note}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
