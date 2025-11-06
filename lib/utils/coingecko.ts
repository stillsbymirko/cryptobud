import axios from "axios";

const COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface PriceCache {
  [key: string]: {
    price: number;
    timestamp: number;
  };
}

interface HistoricalPriceCache {
  [key: string]: {
    price: number;
    timestamp: number;
  };
}

const priceCache: PriceCache = {};
const historicalPriceCache: HistoricalPriceCache = {};

// Supported cryptocurrencies mapping (symbol -> CoinGecko ID)
const CRYPTO_IDS: { [key: string]: string } = {
  BTC: "bitcoin",
  ETH: "ethereum",
  USDT: "tether",
  BNB: "binancecoin",
  SOL: "solana",
  XRP: "ripple",
  USDC: "usd-coin",
  ADA: "cardano",
  DOGE: "dogecoin",
  TRX: "tron",
  TON: "the-open-network",
  LINK: "chainlink",
  MATIC: "matic-network",
  DOT: "polkadot",
  DAI: "dai",
  LTC: "litecoin",
  SHIB: "shiba-inu",
  BCH: "bitcoin-cash",
  LEO: "leo-token",
  AVAX: "avalanche-2",
  XLM: "stellar",
  UNI: "uniswap",
  ATOM: "cosmos",
  ETC: "ethereum-classic",
  XMR: "monero",
  APT: "aptos",
  ARB: "arbitrum",
};

/**
 * Get current price for a cryptocurrency in EUR
 */
export async function getCurrentPrice(symbol: string): Promise<number> {
  const cacheKey = `${symbol}-current`;
  const cached = priceCache[cacheKey];

  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.price;
  }

  try {
    const coinId = CRYPTO_IDS[symbol.toUpperCase()];
    if (!coinId) {
      throw new Error(`Unsupported cryptocurrency: ${symbol}`);
    }

    const response = await axios.get(`${COINGECKO_BASE_URL}/simple/price`, {
      params: {
        ids: coinId,
        vs_currencies: "eur",
      },
      headers: process.env.COINGECKO_API_KEY
        ? { "x-cg-demo-api-key": process.env.COINGECKO_API_KEY }
        : {},
    });

    const price = response.data[coinId]?.eur;
    if (!price) {
      throw new Error(`Price not found for ${symbol}`);
    }

    priceCache[cacheKey] = {
      price,
      timestamp: Date.now(),
    };

    return price;
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error);
    // Return cached price if available, even if expired
    if (cached) {
      return cached.price;
    }
    throw error;
  }
}

/**
 * Get prices for multiple cryptocurrencies
 */
export async function getCurrentPrices(symbols: string[]): Promise<{ [key: string]: number }> {
  const uniqueSymbols = [...new Set(symbols)];
  const prices: { [key: string]: number } = {};

  // Check cache first
  const uncachedSymbols: string[] = [];
  for (const symbol of uniqueSymbols) {
    const cacheKey = `${symbol}-current`;
    const cached = priceCache[cacheKey];
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      prices[symbol] = cached.price;
    } else {
      uncachedSymbols.push(symbol);
    }
  }

  if (uncachedSymbols.length === 0) {
    return prices;
  }

  try {
    const coinIds = uncachedSymbols
      .map((s) => CRYPTO_IDS[s.toUpperCase()])
      .filter(Boolean);

    if (coinIds.length === 0) {
      return prices;
    }

    const response = await axios.get(`${COINGECKO_BASE_URL}/simple/price`, {
      params: {
        ids: coinIds.join(","),
        vs_currencies: "eur",
      },
      headers: process.env.COINGECKO_API_KEY
        ? { "x-cg-demo-api-key": process.env.COINGECKO_API_KEY }
        : {},
    });

    for (const symbol of uncachedSymbols) {
      const coinId = CRYPTO_IDS[symbol.toUpperCase()];
      if (coinId && response.data[coinId]?.eur) {
        const price = response.data[coinId].eur;
        prices[symbol] = price;
        priceCache[`${symbol}-current`] = {
          price,
          timestamp: Date.now(),
        };
      }
    }
  } catch (error) {
    console.error("Error fetching multiple prices:", error);
  }

  return prices;
}

/**
 * Get historical price for a cryptocurrency at a specific date
 */
export async function getHistoricalPrice(symbol: string, date: Date): Promise<number> {
  const dateStr = date.toISOString().split("T")[0];
  const cacheKey = `${symbol}-${dateStr}`;
  const cached = historicalPriceCache[cacheKey];

  if (cached) {
    return cached.price;
  }

  try {
    const coinId = CRYPTO_IDS[symbol.toUpperCase()];
    if (!coinId) {
      throw new Error(`Unsupported cryptocurrency: ${symbol}`);
    }

    // Format date as dd-mm-yyyy for CoinGecko
    const [year, month, day] = dateStr.split("-");
    const formattedDate = `${day}-${month}-${year}`;

    const response = await axios.get(`${COINGECKO_BASE_URL}/coins/${coinId}/history`, {
      params: {
        date: formattedDate,
      },
      headers: process.env.COINGECKO_API_KEY
        ? { "x-cg-demo-api-key": process.env.COINGECKO_API_KEY }
        : {},
    });

    const price = response.data.market_data?.current_price?.eur;
    if (!price) {
      throw new Error(`Historical price not found for ${symbol} on ${dateStr}`);
    }

    historicalPriceCache[cacheKey] = {
      price,
      timestamp: Date.now(),
    };

    return price;
  } catch (error) {
    console.error(`Error fetching historical price for ${symbol}:`, error);
    throw error;
  }
}

/**
 * Get list of supported cryptocurrencies
 */
export function getSupportedCryptos(): string[] {
  return Object.keys(CRYPTO_IDS);
}

/**
 * Clear price cache
 */
export function clearCache(): void {
  Object.keys(priceCache).forEach((key) => delete priceCache[key]);
  Object.keys(historicalPriceCache).forEach((key) => delete historicalPriceCache[key]);
}
