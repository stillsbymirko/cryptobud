# CryptoBuddy - Multi-User Crypto Tax Platform

Eine moderne Web-Applikation für Krypto-Steuerberechnungen nach deutschem Recht mit User-Authentication.

## 🚀 Features

### ✅ Fully Implemented

#### **Authentication System**
- Email/Password Registration mit bcrypt Hashing
- Secure Login mit Session-Management (NextAuth.js v5)
- Protected Routes mit Middleware
- User-spezifische Datenisolation
- Password Reset Ready

#### **Dashboard**
- Portfolio-Gesamtwert Anzeige in Echtzeit
- Staking-Rewards Tracking mit 256€ Freigrenze Alert (§22 Nr. 3 EStG)
- Top 5 Holdings Übersicht
- Letzte 5 Transaktionen
- Timeline für nächste steuerfreie Verkäufe (1-Jahr-Haltefrist)

#### **Transaction Management**
- Vollständige Transaktionsübersicht mit Sortierung
- CSV Import mit Drag & Drop
- **6 Exchange Parser**: Bitpanda, 21Bitcoin, Kraken, Binance, Coinbase, Bitstamp
- Manuelles Erstellen von Transaktionen
- Automatische Portfolio-Aktualisierung
- CSV Export nach Jahr oder Datumsbereich

#### **Tax Calculator (FIFO-Methode)**
- **§23 EStG**: 1-Jahr-Haltefrist für steuerfreie Veräußerungsgewinne
- **§22 Nr. 3 EStG**: 256€ Freigrenze für Staking-Rewards pro Jahr
- FIFO (First-In-First-Out) Berechnung
- Transaktionsweise Steueranalyse
- Jahresübersicht: Steuerpflichtige vs. steuerfreie Gewinne
- Holding Period Tracking

#### **Portfolio View**
- Alle Holdings mit aktuellen Werten
- Prozentuale Verteilung
- Durchschnittlicher Kaufpreis pro Asset
- Portfolio-Statistiken

#### **Staking Tracker**
- Alle Staking-Rewards chronologisch
- Fortschrittsbalken zur 256€ Freigrenze
- Jahresweise Aufschlüsselung
- Alert bei Überschreitung der Freigrenze

#### **Export & Reporting**
- CSV-Export aller Transaktionen
- Jahresberichte exportieren
- Filterbare Exporte nach Zeitraum

#### **Responsive UI**
- Minimalistisches Design mit Tailwind CSS
- Card-basiertes Layout
- Custom Color Scheme (Blue, Green, Red, Orange)
- Mobile-optimiert

### 🔨 Optional Erweiterungen (Nice-to-Have)

- CoinGecko API Integration für Live-Preise
- PDF-Export für Steuerberater
- Charts für Portfolio-Performance
- Email-Benachrichtigungen
- 2FA mit TOTP
- Multi-Language Support (DE/EN)
- Dark Mode

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

**Option A: Using Docker (Recommended)**
```bash
# Start PostgreSQL with Docker
docker run --name cryptobud-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=cryptobud -p 5432:5432 -d postgres:14

# Update your .env with:
# DATABASE_URL="postgresql://postgres:password@localhost:5432/cryptobud?schema=public"
```

**Option B: Local PostgreSQL**
- Install PostgreSQL 14+
- Create database: `createdb cryptobud`
- Update DATABASE_URL in .env

**Run Migrations:**
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

## 📖 Usage Guide

### Getting Started

1. **Register an Account**
   - Navigate to `/register`
   - Enter email, password (min 8 characters), and optional name
   - Click "Konto erstellen"

2. **Login**
   - Go to `/login`
   - Enter your credentials
   - You'll be redirected to the dashboard

### Importing Transactions

1. **Via CSV Import**
   - Go to "Transaktionen" → "CSV Import"
   - Select your exchange from the dropdown
   - Drag & drop your CSV file or click to browse
   - Click "Importieren"
   - Supported exchanges: Bitpanda, 21Bitcoin, Kraken, Binance, Coinbase, Bitstamp

2. **Manual Entry**
   - Go to "Transaktionen" → "Neue Transaktion"
   - Fill in the form:
     - Date: Transaction date
     - Type: Buy, Sell, or Staking Reward
     - Cryptocurrency: e.g., BTC, ETH
     - Amount: Number of coins
     - Price in EUR: Price per coin
     - Exchange: Where it was traded
     - Notes: Optional additional info
   - Click "Transaktion erstellen"

### Viewing Your Portfolio

- Navigate to "Portfolio" in the menu
- See all your holdings with:
  - Current amount
  - Average buy price
  - Current value
  - Percentage of portfolio

### Tax Calculations

- Go to "Steuerrechner"
- View for current year:
  - Taxable gains (< 1 year holding)
  - Tax-free gains (> 1 year holding)
  - Staking rewards and threshold status
  - Detailed transaction breakdown
- Export yearly tax report via "Jahresbericht exportieren"

### Staking Tracking

- Navigate to "Staking"
- Monitor:
  - Current year staking rewards
  - Progress towards 256€ threshold
  - Yearly breakdown
  - All staking transactions

### Exporting Data

**Transactions Export:**
- Go to "Transaktionen"
- Click "CSV Export" for current year
- Or use API: `/api/export?year=2024`

**Tax Report:**
- Go to "Steuerrechner"
- Click "Jahresbericht exportieren"

## 🎯 German Tax Law Compliance

### §23 EStG - Private Veräußerungsgeschäfte

- **1-Jahr-Haltefrist**: Gewinne aus dem Verkauf von Kryptowährungen sind steuerfrei, wenn zwischen Anschaffung und Veräußerung mehr als ein Jahr liegt.
- **Spekulationsfrist**: Innerhalb eines Jahres sind Gewinne als private Veräußerungsgewinne zu versteuern.
- **FIFO-Methode**: Die App verwendet die First-In-First-Out Methode zur Berechnung.

### §22 Nr. 3 EStG - Sonstige Einkünfte

- **Freigrenze 256€**: Staking-Rewards und andere sonstige Einkünfte haben eine Freigrenze von 256€ pro Jahr.
- **Wichtig**: Es handelt sich um eine Freigrenze, nicht einen Freibetrag. Wird die Grenze überschritten, sind alle Einkünfte steuerpflichtig.

### Berechnungslogik

1. **FIFO-Queue**: Bei Käufen werden Coins in eine FIFO-Queue eingefügt
2. **Verkauf**: Bei Verkäufen werden die ältesten Coins aus der Queue entnommen
3. **Haltefrist-Check**: Für jeden Verkauf wird die Haltedauer berechnet
4. **Staking**: Rewards werden separat getrackt und gegen die 256€-Grenze gerechnet

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

## 📊 CSV Format Examples

### Bitpanda
```csv
Timestamp,Transaction Type,Asset,Amount,Fee,EUR Amount
2024-01-15 10:30:00,buy,BTC,0.001,0.00001,50.00
```

### 21Bitcoin
```csv
Date,Type,Cryptocurrency,Amount,Price EUR
2024-01-15,buy,BTC,0.001,50000.00
```

### Kraken
```csv
txid,time,type,asset,amount,fee,balance
ABC123,2024-01-15 10:30:00,buy,XXBT,0.001,0.00001,0.001
```

### Binance
```csv
Date(UTC),Market,Type,Price,Amount,Total,Fee
2024-01-15 10:30:00,BTCEUR,buy,50000.00,0.001,50.00,0.05
```

### Coinbase
```csv
Timestamp,Transaction Type,Asset,Quantity,EUR Spot Price
2024-01-15T10:30:00Z,Buy,BTC,0.001,50000.00
```

### Bitstamp
```csv
Type,Datetime,Account,Amount,Value,Rate,Fee
buy,2024-01-15 10:30:00,BTC wallet,0.001,50.00,50000.00,0.05
```

## 🗄️ Database Schema

### User
```prisma
model User {
  id            String        @id @default(cuid())
  email         String        @unique
  password      String        // bcrypt hashed
  name          String?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  transactions  Transaction[]
  portfolios    Portfolio[]
}
```

### Transaction
```prisma
model Transaction {
  id              String   @id @default(cuid())
  userId          String
  date            DateTime
  cryptocurrency  String   // BTC, ETH, etc.
  amount          Float
  priceEUR        Float
  type            String   // buy, sell, staking
  exchange        String   // Bitpanda, Kraken, etc.
  notes           String?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  user            User     @relation(...)
}
```

### Portfolio
```prisma
model Portfolio {
  id              String   @id @default(cuid())
  userId          String
  cryptocurrency  String
  totalAmount     Float    // Current holdings
  averageBuyPrice Float    // Average cost basis
  lastUpdated     DateTime @updatedAt
  user            User     @relation(...)
}
```

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

1. **Push to GitHub**
```bash
git push origin main
```

2. **Import in Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Add Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all variables from .env:
     ```
     DATABASE_URL
     NEXTAUTH_SECRET
     NEXTAUTH_URL (set to your Vercel domain)
     ```

4. **Setup Database**
   - Use Vercel Postgres, Supabase, or any PostgreSQL provider
   - Update DATABASE_URL
   - Run migrations: `npx prisma migrate deploy`

5. **Deploy**
   - Click "Deploy"
   - Your app will be live at `your-app.vercel.app`

### Environment Variables for Production

```env
DATABASE_URL="postgresql://user:password@your-db-host:5432/cryptobud?schema=public"
NEXTAUTH_SECRET="your-production-secret-use-openssl-rand"
NEXTAUTH_URL="https://yourdomain.com"
```

### Database Providers

- **Vercel Postgres**: Built-in, easy setup
- **Supabase**: Free tier available, includes database backups
- **Railway**: PostgreSQL with simple deployment
- **AWS RDS**: Scalable, managed PostgreSQL
- **DigitalOcean**: Managed databases

## 🔒 Security Best Practices

✅ **Implemented:**
- CSRF Protection via NextAuth.js
- Password Hashing with bcrypt (cost factor 10)
- SQL Injection Prevention via Prisma ORM
- Input Validation with Zod schemas
- Environment Variables for secrets
- User Data Isolation (WHERE userId = currentUser)
- Session-based authentication
- Protected API routes

⚠️ **Additional Recommendations:**
- Use HTTPS only in production
- Implement rate limiting on API routes
- Regular security audits
- Keep dependencies updated
- Enable 2FA for user accounts (optional)
- Implement GDPR data export

## 🧪 Development

### Project Structure
```
cryptobud/
├── app/
│   ├── (auth)/           # Authentication pages
│   ├── (dashboard)/      # Protected dashboard pages
│   ├── api/              # API routes
│   └── globals.css       # Global styles
├── components/           # Reusable components
├── lib/
│   ├── db/              # Database client
│   ├── parsers/         # CSV parsers
│   └── tax/             # Tax calculation logic
├── prisma/
│   └── schema.prisma    # Database schema
├── types/               # TypeScript type definitions
└── middleware.ts        # Route protection
```

### Key Commands

```bash
# Development
npm run dev              # Start dev server
npm run build           # Build for production
npm run start           # Start production server

# Database
npx prisma studio       # Open Prisma Studio (DB GUI)
npx prisma migrate dev  # Create new migration
npx prisma generate     # Regenerate Prisma Client

# Code Quality
npm run lint            # Run ESLint
```

### Adding a New Exchange Parser

1. Open `lib/parsers/csv-parser.ts`
2. Add exchange to `EXCHANGES` constant
3. Implement parser function following existing patterns:
```typescript
function parseNewExchange(lines: string[]): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = []
  // Parse CSV lines
  return transactions
}
```
4. Add to `getParser` switch case
5. Test with sample CSV

## 📚 API Reference

### Authentication

**POST** `/api/register`
- Body: `{ email, password, name? }`
- Returns: `{ message, userId }`

**POST** `/api/auth/[...nextauth]`
- Handles login/logout via NextAuth.js

### Transactions

**POST** `/api/transactions`
- Creates manual transaction
- Body: `{ date, cryptocurrency, amount, priceEUR, type, exchange, notes? }`
- Returns: `{ message, transaction }`

**POST** `/api/transactions/import`
- Import CSV file
- Body: FormData with `file` and `exchange`
- Returns: `{ message, count }`

**GET** `/api/export?year=2024`
- Export transactions as CSV
- Query params: `year` or `startDate` & `endDate`
- Returns: CSV file

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
pg_isready

# Test connection
psql -d cryptobud -U postgres

# Reset database (⚠️ deletes all data)
npx prisma migrate reset
```

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Regenerate Prisma Client
npx prisma generate
```

### Prisma Issues
```bash
# Pull current DB schema
npx prisma db pull

# Push schema without migration
npx prisma db push
```

## 📝 License

ISC

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## 📧 Support

For support, please open an issue in the GitHub repository.
