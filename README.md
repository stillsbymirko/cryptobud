# CryptoBud 💰

A comprehensive cryptocurrency tax calculation application for German tax regulations (§23 EStG, §22 Nr. 3 EStG) with multi-user authentication and transaction management.

## Features ✨

### Core Features
- 🔐 **Multi-User Authentication**: NextAuth.js v5 with bcrypt-hashed credentials
- 📊 **Transaction Management**: Manual entry and CSV import from 6 major exchanges
- 💼 **Portfolio Tracking**: Real-time portfolio valuation with CoinGecko API integration
- 📈 **FIFO Tax Calculation**: German tax-compliant calculations with holding period tracking
- 💰 **Staking Tracker**: Monitor 256€ threshold (§22 Nr. 3 EStG)
- 📝 **Tax Reports**: Yearly reports segregating taxable vs. tax-free gains
- 🔄 **Real-Time Prices**: Live cryptocurrency prices for 27+ coins
- 📱 **Responsive Design**: Works on mobile, tablet, and desktop

### Security Features
- ✅ CSRF Protection
- ✅ Rate Limiting on API Routes
- ✅ Input Validation with Zod
- ✅ SQL Injection Prevention (Prisma ORM)
- ✅ XSS Protection
- ✅ Strict User Data Isolation
- ✅ Environment Variables for secrets

### Supported Exchanges
- Bitpanda
- 21Bitcoin
- Kraken
- Binance
- Coinbase
- Bitstamp

## Tech Stack 🛠️

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5
- **Validation**: Zod
- **Charts**: Recharts
- **API**: CoinGecko API

## Getting Started 🚀

### Prerequisites

- Node.js 18.x or higher
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/stillsbymirko/cryptobud.git
cd cryptobud
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/cryptobud?schema=public"

# NextAuth
NEXTAUTH_SECRET="your-super-secret-key-change-this-in-production"
NEXTAUTH_URL="http://localhost:3000"

# CoinGecko API (optional - free tier doesn't require key)
COINGECKO_API_KEY=

# Application
NODE_ENV=development
```

4. **Set up the database:**
```bash
# Run Prisma migrations
npx prisma migrate dev --name init

# (Optional) Open Prisma Studio to view database
npx prisma studio
```

5. **Run the development server:**
```bash
npm run dev
```

6. **Open your browser:**
Navigate to [http://localhost:3000](http://localhost:3000)

### Production Deployment

1. **Build the application:**
```bash
npm run build
```

2. **Start production server:**
```bash
npm start
```

## Database Schema 📁

### User Model
- Authentication and profile information
- One-to-many relationship with Transactions and Portfolio

### Transaction Model
- All cryptocurrency transactions (buy, sell, staking)
- Includes: date, cryptocurrency, amount, priceEUR, type, exchange, notes
- Indexed for efficient queries

### Portfolio Model
- Aggregated holdings per cryptocurrency
- Tracks: totalAmount, averageBuyPrice, lastUpdated
- Automatically updated when transactions are added/modified

## German Tax Regulations 🇩🇪

### §23 EStG - Private Sale Transactions
- **FIFO Method**: First-In-First-Out calculation for determining cost basis
- **1-Year Holding Period**: Gains from sales after holding for 1 year are tax-free
- **Short-Term Gains**: Gains from sales within 1 year are taxable
- The application tracks holding periods automatically

### §22 Nr. 3 EStG - Other Income
- **Staking Rewards**: Subject to this regulation
- **256€ Tax-Free Threshold**: Annual threshold for staking rewards
- **Above Threshold**: All rewards become taxable if threshold exceeded
- The application monitors your progress towards this threshold

## Usage Guide 📖

### Adding Transactions

#### Manual Entry
1. Navigate to **Transactions** page
2. Click **Add Transaction**
3. Fill in details: date, type, cryptocurrency, amount, value in EUR
4. Click **Add Transaction**

#### CSV Import
1. Export transactions from your exchange
2. Navigate to **Transactions** page
3. Click **Import CSV**
4. Select your CSV file
5. The exchange format will be auto-detected
6. Click **Import**

### Viewing Portfolio
1. Navigate to **Portfolio** page
2. View all holdings with:
   - Current prices (real-time)
   - Cost basis
   - Profit/Loss
   - Percentage gains
3. Click **Refresh Prices** to update

### Checking Tax Status
1. Navigate to **Dashboard**
2. View tax summary for current year:
   - Taxable gains
   - Tax-free gains
   - Staking rewards
3. See alerts if threshold exceeded

### Staking Tracker
1. Navigate to **Staking Tracker**
2. Monitor progress to 256€ threshold
3. View all staking transactions
4. See next tax-free sale dates

## API Routes 🔌

### Authentication
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/signin` - Sign in (via NextAuth)
- `POST /api/auth/signout` - Sign out

### Transactions
- `GET /api/transactions` - List transactions (with filters)
- `POST /api/transactions` - Create transaction
- `GET /api/transactions/[id]` - Get single transaction
- `PATCH /api/transactions/[id]` - Update transaction
- `DELETE /api/transactions/[id]` - Delete transaction
- `POST /api/transactions/import` - Import CSV

### Portfolio
- `GET /api/portfolio` - Get portfolio with current prices

### Tax
- `GET /api/tax?year=2024` - Get tax calculations for year

### CoinGecko
- `GET /api/coingecko?symbols=BTC,ETH` - Get current prices

## Project Structure 📂

```
cryptobud/
├── app/                        # Next.js App Router
│   ├── api/                   # API routes
│   ├── auth/                  # Auth pages
│   ├── dashboard/             # Dashboard page
│   ├── portfolio/             # Portfolio page
│   ├── staking/               # Staking tracker
│   ├── transactions/          # Transactions page
│   ├── globals.css           # Global styles
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page
├── components/                # React components
│   ├── layout/               # Layout components
│   └── SessionProvider.tsx   # Auth provider
├── lib/                       # Business logic
│   ├── auth/                 # Auth configuration
│   ├── parsers/              # CSV parsers
│   ├── prisma/               # Prisma client
│   ├── tax/                  # Tax calculation engine
│   └── utils/                # Utility functions
├── prisma/                    # Database
│   └── schema.prisma         # Database schema
├── types/                     # TypeScript types
├── .env.example              # Environment variables template
├── middleware.ts             # Route protection
├── next.config.js            # Next.js configuration
├── package.json              # Dependencies
├── tailwind.config.js        # Tailwind configuration
└── tsconfig.json             # TypeScript configuration
```

## Scripts 📜

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Supported Cryptocurrencies 💎

The application supports 27+ cryptocurrencies including:
- BTC (Bitcoin)
- ETH (Ethereum)
- USDT (Tether)
- BNB (Binance Coin)
- SOL (Solana)
- XRP (Ripple)
- ADA (Cardano)
- DOGE (Dogecoin)
- And many more...

## Contributing 🤝

Contributions are welcome! Please feel free to submit a Pull Request.

## Important Disclaimers ⚠️

1. **Tax Advice**: This application is a tool to help organize cryptocurrency transactions. It does NOT constitute tax advice. Always consult with a qualified tax advisor for your specific situation.

2. **Accuracy**: While we strive for accuracy, the tax calculations are provided as-is. Verify all calculations with a tax professional.

3. **German Tax Law**: This application is specifically designed for German tax regulations. Tax laws in other countries may differ significantly.

4. **Price Data**: Cryptocurrency prices are fetched from CoinGecko API. Historical prices may not always be 100% accurate.

## License 📄

This project is open source and available for personal and educational use.

## Acknowledgments 🙏

- Data provided by [CoinGecko API](https://www.coingecko.com/api)
- Built with [Next.js](https://nextjs.org/)
- Database powered by [Prisma](https://www.prisma.io/)
- Authentication by [NextAuth.js](https://next-auth.js.org/)

---

Made with ❤️ by [stillsbymirko](https://github.com/stillsbymirko)

For questions, issues, or feature requests, please open an issue on GitHub.
