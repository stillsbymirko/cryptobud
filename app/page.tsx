import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="text-center max-w-2xl px-6">
        <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
          CryptoBud
        </h1>
        <p className="text-2xl text-gray-600 mb-8">
          Cryptocurrency Tax Calculator for German Tax Regulations
        </p>
        <p className="text-lg text-gray-500 mb-12 leading-relaxed">
          Track your crypto transactions, calculate taxes according to §23 EStG and §22 Nr. 3 EStG,
          and manage your portfolio with ease. FIFO calculation with 1-year holding period tracking
          and 256€ staking rewards threshold monitoring.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/auth/signin"
            className="bg-primary text-white px-8 py-4 rounded-xl font-semibold text-lg hover:opacity-90 transition-opacity"
          >
            Sign In
          </Link>
          <Link
            href="/auth/signup"
            className="bg-white text-primary px-8 py-4 rounded-xl font-semibold text-lg border-2 border-primary hover:bg-blue-50 transition-colors"
          >
            Sign Up
          </Link>
        </div>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="card">
            <div className="text-3xl mb-3">🔐</div>
            <h3 className="font-semibold text-lg mb-2">Secure & Private</h3>
            <p className="text-gray-600 text-sm">
              Multi-user authentication with encrypted data and user isolation
            </p>
          </div>
          <div className="card">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-semibold text-lg mb-2">FIFO Tax Calculation</h3>
            <p className="text-gray-600 text-sm">
              German tax-compliant calculations with holding period tracking
            </p>
          </div>
          <div className="card">
            <div className="text-3xl mb-3">📈</div>
            <h3 className="font-semibold text-lg mb-2">Real-Time Tracking</h3>
            <p className="text-gray-600 text-sm">
              Live prices and portfolio valuation with CoinGecko integration
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
