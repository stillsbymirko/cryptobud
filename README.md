# CryptoBuddy - Multi-User Crypto Tax Platform

Eine moderne Web-Applikation für Krypto-Steuerberechnungen nach deutschem Recht mit User-Authentication.

## 🚀 Features

### ✅ Implemented (Phase 1)

- **Authentication System**
  - Email/Password Registration mit bcrypt
  - Secure Login mit Session-Management (NextAuth.js v5)
  - Protected Routes mit Middleware
  - User-spezifische Datenisolation

- **Database**
  - PostgreSQL mit Prisma ORM
  - User, Transaction, Portfolio Models
  - Proper relations und indices

- **Dashboard**
  - Portfolio-Gesamtwert Anzeige
  - Staking-Rewards Tracking mit 256€ Freigrenze Alert
  - Top Holdings Übersicht
  - Letzte Transaktionen

- **Responsive UI**
  - Minimalistisches Design mit Tailwind CSS
  - Card-basiertes Layout
  - Custom Color Scheme (Blue, Green, Red, Orange)

### 🔨 In Development (Phases 2-7)

- CSV Import für 6 Exchanges
- FIFO Tax Calculator (§23, §22 Nr. 3 EStG)
- Transaction Management (CRUD)
- Portfolio View mit Charts
- Staking Tracker
- PDF/CSV Export
- CoinGecko API Integration

## 🛠️ Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL mit Prisma ORM
- **Auth**: NextAuth.js v5 (Auth.js)
- **Validation**: Zod
- **Charts**: Recharts
- **Deployment**: Vercel-ready

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm oder yarn

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone <repository-url>
cd cryptobud
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/cryptobud?schema=public"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here-change-in-production"
NEXTAUTH_URL="http://localhost:3000"

# CoinGecko API (optional)
COINGECKO_API_KEY=""
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 4. Setup Database

```bash
# Run Prisma migrations
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
cryptobud/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   ├── transactions/
│   │   ├── portfolio/
│   │   ├── tax-calculator/
│   │   └── staking/
│   ├── api/
│   │   ├── auth/
│   │   └── register/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── ui/
├── lib/
│   ├── db/
│   │   └── prisma.ts
│   └── auth.ts
├── prisma/
│   └── schema.prisma
├── types/
│   └── next-auth.d.ts
├── middleware.ts
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

## 🗄️ Database Schema

### User
- Email/Password Authentication
- Relations zu Transactions und Portfolios

### Transaction
- Krypto-Transaktionen (buy/sell/staking)
- Support für 6 Exchanges
- Preis in EUR, Datum, Notizen

### Portfolio
- Aggregierte Holdings pro User
- Durchschnittlicher Kaufpreis
- Aktuelle Menge

## 🔒 Security Features

- ✅ CSRF Protection (NextAuth.js)
- ✅ Password Hashing (bcrypt)
- ✅ Input Validation (Zod)
- ✅ SQL Injection Prevention (Prisma)
- ✅ Protected API Routes
- ✅ User Data Isolation
- ✅ Environment Variables für Secrets

## 🎨 Design System

### Colors
- **Primary**: #007AFF (Blue)
- **Profit**: #34C759 (Green)
- **Loss**: #FF3B30 (Red)
- **Warning**: #FF9500 (Orange)

### Typography
- Font: Inter (Google Fonts)
- Responsive spacing und sizes

## 📱 Supported Exchanges (CSV Import - Coming Soon)

1. **Bitpanda**
2. **21Bitcoin**
3. **Kraken**
4. **Binance**
5. **Coinbase**
6. **Bitstamp**

## 📊 Tax Calculations (Coming Soon)

- **§23 EStG**: 1-Jahr-Haltefrist für steuerfreie Veräußerungsgewinne
- **§22 Nr. 3 EStG**: 256€ Freigrenze für Staking-Rewards
- **FIFO-Methode**: First-In-First-Out Berechnung

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import in Vercel
3. Add Environment Variables
4. Deploy

### Environment Variables for Production

```env
DATABASE_URL="your-production-database-url"
NEXTAUTH_SECRET="your-production-secret"
NEXTAUTH_URL="https://yourdomain.com"
```

## 📝 License

ISC

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## 📧 Support

For support, please open an issue in the GitHub repository.
