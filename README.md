# CryptoBud 💰

A modern, real-time cryptocurrency tracking application built with Next.js. Track the top 10 cryptocurrencies with live prices, 24-hour changes, and market caps.

## Features ✨

- 🪙 Real-time tracking of top 10 cryptocurrencies
- 💵 Current prices in USD with proper formatting
- 📊 24-hour price change percentage (color-coded)
- 💎 Market capitalization in billions
- 🔄 Refresh button to update data on demand
- 📱 Fully responsive design
- 🎨 Modern dark theme with glass-morphism UI
- ⚡ Built with Next.js for optimal performance
- 🔒 No API key required (uses free CoinGecko API)

## Tech Stack 🛠️

- **Framework**: Next.js (React)
- **Styling**: CSS Modules with custom design
- **API**: CoinGecko API
- **HTTP Client**: Axios
- **Deployment**: Vercel-ready

## Getting Started 🚀

### Prerequisites

- Node.js 14.x or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/stillsbymirko/cryptobud.git
cd cryptobud
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file (optional):
```bash
cp .env.example .env.local
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Scripts 📜

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server

## Deployment 🌐

This project is configured for easy deployment on Vercel:

1. Push your code to GitHub
2. Import the project in Vercel
3. Deploy with zero configuration needed

## API Information 📡

This app uses the free CoinGecko API which doesn't require an API key for basic usage. The app fetches:
- Top 10 cryptocurrencies by market cap
- Current prices in USD
- 24-hour price changes
- Market capitalization data

## Project Structure 📁

```
cryptobud/
├── pages/
│   ├── _app.js          # App wrapper component
│   └── index.js         # Main page with crypto tracking
├── styles/
│   ├── globals.css      # Global styles
│   └── Home.module.css  # Home page styles
├── public/              # Static assets
├── vercel.json          # Vercel configuration
├── .env.example         # Environment variables template
└── package.json         # Dependencies and scripts
```

## Contributing 🤝

Contributions are welcome! Feel free to open issues or submit pull requests.

## License 📄

This project is open source and available for personal and educational use.

## Acknowledgments 🙏

- Data provided by [CoinGecko API](https://www.coingecko.com/api)
- Built with [Next.js](https://nextjs.org/)

---

Made with ❤️ by [stillsbymirko](https://github.com/stillsbymirko)
