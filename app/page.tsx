import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-8 text-primary">
          CryptoBuddy
        </h1>
        <p className="text-xl mb-8 text-gray-600">
          Deine Krypto-Steuer-Plattform für deutsches Recht
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Registrieren
          </Link>
        </div>
      </div>
    </main>
  )
}
