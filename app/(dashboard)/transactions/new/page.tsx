'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const EXCHANGES = [
  'Bitpanda',
  '21Bitcoin',
  'Kraken',
  'Binance',
  'Coinbase',
  'Bitstamp',
  'Andere',
]

export default function NewTransactionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    cryptocurrency: '',
    amount: '',
    priceEUR: '',
    type: 'buy',
    exchange: '',
    notes: '',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          priceEUR: parseFloat(formData.priceEUR),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Fehler beim Erstellen')
      } else {
        router.push('/transactions')
      }
    } catch (err) {
      setError('Ein Fehler ist aufgetreten')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-4 sm:px-0">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        Neue Transaktion
      </h1>

      <div className="max-w-2xl mx-auto bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-loss/10 text-loss px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Datum *
              </label>
              <input
                type="date"
                name="date"
                required
                value={formData.date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Typ *
              </label>
              <select
                name="type"
                required
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              >
                <option value="buy">Kauf</option>
                <option value="sell">Verkauf</option>
                <option value="staking">Staking Reward</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cryptocurrency *
              </label>
              <input
                type="text"
                name="cryptocurrency"
                required
                placeholder="z.B. BTC, ETH"
                value={formData.cryptocurrency}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Exchange *
              </label>
              <select
                name="exchange"
                required
                value={formData.exchange}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              >
                <option value="">Bitte wählen...</option>
                {EXCHANGES.map((ex) => (
                  <option key={ex} value={ex}>
                    {ex}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Menge *
              </label>
              <input
                type="number"
                name="amount"
                required
                step="0.00000001"
                min="0"
                placeholder="0.00000000"
                value={formData.amount}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preis in EUR *
              </label>
              <input
                type="number"
                name="priceEUR"
                required
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.priceEUR}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notizen (optional)
            </label>
            <textarea
              name="notes"
              rows={3}
              placeholder="Zusätzliche Informationen..."
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 px-4 bg-primary text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              {loading ? 'Erstelle...' : 'Transaktion erstellen'}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Abbrechen
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
