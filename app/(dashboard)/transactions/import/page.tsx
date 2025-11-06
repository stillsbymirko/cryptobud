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
]

export default function ImportPage() {
  const router = useRouter()
  const [file, setFile] = useState<File | null>(null)
  const [exchange, setExchange] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!file || !exchange) {
      setError('Bitte wähle eine Datei und eine Exchange aus')
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('exchange', exchange)

      const response = await fetch('/api/transactions/import', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Import fehlgeschlagen')
      } else {
        setSuccess(`${data.count} Transaktionen erfolgreich importiert`)
        setTimeout(() => {
          router.push('/transactions')
        }, 2000)
      }
    } catch (err) {
      setError('Ein Fehler ist aufgetreten')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-4 sm:px-0">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">CSV Import</h1>

      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Exchange Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Exchange auswählen
            </label>
            <select
              value={exchange}
              onChange={(e) => setExchange(e.target.value)}
              required
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

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CSV-Datei
            </label>
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-lg p-8 text-center ${
                dragActive
                  ? 'border-primary bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <div className="space-y-2">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                {file ? (
                  <p className="text-sm text-gray-600">
                    Ausgewählt: <span className="font-medium">{file.name}</span>
                  </p>
                ) : (
                  <>
                    <p className="text-sm text-gray-600">
                      Datei hierher ziehen oder klicken zum Auswählen
                    </p>
                    <p className="text-xs text-gray-500">CSV bis 10MB</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-loss/10 text-loss px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-profit/10 text-profit px-4 py-3 rounded-md">
              {success}
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading || !file || !exchange}
              className="flex-1 py-2 px-4 bg-primary text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Importiere...' : 'Importieren'}
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

        {/* Exchange Info */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-2">
            Unterstützte Exchanges
          </h3>
          <ul className="text-sm text-gray-600 space-y-1">
            {EXCHANGES.map((ex) => (
              <li key={ex}>• {ex}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
