import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'
import { redirect } from 'next/navigation'

async function getPortfolio(userId: string) {
  const portfolios = await prisma.portfolio.findMany({
    where: { userId },
    orderBy: { totalAmount: 'desc' },
  })

  const totalValue = portfolios.reduce(
    (sum: number, p) => sum + p.totalAmount * p.averageBuyPrice,
    0
  )

  return { portfolios, totalValue }
}

export default async function PortfolioPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const { portfolios, totalValue } = await getPortfolio(session.user.id)

  return (
    <div className="px-4 sm:px-0">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Portfolio</h1>

      {/* Total Value Card */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="text-center">
          <p className="text-sm font-medium text-gray-500 mb-2">
            Portfolio-Gesamtwert
          </p>
          <p className="text-4xl font-bold text-gray-900">
            €{totalValue.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Holdings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolios.length === 0 ? (
          <div className="col-span-full bg-white shadow rounded-lg p-8 text-center">
            <p className="text-gray-500">
              Keine Holdings vorhanden. Füge Transaktionen hinzu, um dein Portfolio zu sehen.
            </p>
          </div>
        ) : (
          portfolios.map((portfolio) => {
            const currentValue = portfolio.totalAmount * portfolio.averageBuyPrice
            const percentage = totalValue > 0 ? (currentValue / totalValue) * 100 : 0

            return (
              <div
                key={portfolio.id}
                className="bg-white shadow rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {portfolio.cryptocurrency}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {percentage.toFixed(2)}% des Portfolios
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Menge</span>
                    <span className="text-sm font-medium text-gray-900">
                      {portfolio.totalAmount.toFixed(8)}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Ø Kaufpreis</span>
                    <span className="text-sm font-medium text-gray-900">
                      €{portfolio.averageBuyPrice.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between pt-3 border-t border-gray-200">
                    <span className="text-sm font-medium text-gray-500">Wert</span>
                    <span className="text-lg font-bold text-gray-900">
                      €{currentValue.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Performance Summary */}
      {portfolios.length > 0 && (
        <div className="mt-8 bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Portfolio Zusammenfassung
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-500">Anzahl Assets</p>
              <p className="text-2xl font-bold text-gray-900">
                {portfolios.length}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Gesamtwert</p>
              <p className="text-2xl font-bold text-gray-900">
                €{totalValue.toFixed(2)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Größte Position</p>
              <p className="text-2xl font-bold text-gray-900">
                {portfolios[0]?.cryptocurrency || '-'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
