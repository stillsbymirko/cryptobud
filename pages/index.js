import { useState, useEffect, useMemo } from 'react';
import Head from 'next/head';
import axios from 'axios';
import styles from '../styles/Home.module.css';

const BILLION = 1000000000;

// Currency formatter - created once for efficiency
const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

export default function Home() {
  const [cryptos, setCryptos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCryptoData = async () => {
    try {
      setRefreshing(true);
      setError(null);
      
      // Fetch top 10 cryptocurrencies from CoinGecko API
      const response = await axios.get(
        'https://api.coingecko.com/api/v3/coins/markets',
        {
          params: {
            vs_currency: 'usd',
            order: 'market_cap_desc',
            per_page: 10,
            page: 1,
            sparkline: false,
            price_change_percentage: '24h'
          }
        }
      );
      
      setCryptos(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching crypto data:', err);
      setError('Failed to fetch cryptocurrency data. Please try again later.');
      setLoading(false);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCryptoData();
  }, []);

  const handleRefresh = () => {
    fetchCryptoData();
  };

  const formatPrice = (price) => {
    return currencyFormatter.format(price);
  };

  const formatMarketCap = (marketCap) => {
    const billions = marketCap / BILLION;
    return `$${billions.toFixed(2)}B`;
  };

  const formatChange = (change) => {
    if (change === null || change === undefined) return 'N/A';
    return `${change >= 0 ? '+' : ''}${change.toFixed(2)}%`;
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>CryptoBud - Cryptocurrency Tracker</title>
        <meta name="description" content="Track top cryptocurrencies with real-time prices" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <header className={styles.header}>
          <h1 className={styles.title}>CryptoBud</h1>
          <p className={styles.subtitle}>Track the top 10 cryptocurrencies in real-time</p>
          <button 
            className={styles.refreshButton} 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : '🔄 Refresh Data'}
          </button>
        </header>

        {loading && (
          <div className={styles.loading}>
            Loading cryptocurrency data...
          </div>
        )}

        {error && (
          <div className={styles.error}>
            <p><strong>Error:</strong> {error}</p>
            <button 
              className={styles.refreshButton} 
              onClick={handleRefresh}
              style={{ marginTop: '1rem' }}
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && cryptos.length > 0 && (
          <div className={styles.cryptoGrid}>
            {cryptos.map((crypto, index) => (
              <div key={crypto.id} className={styles.cryptoCard}>
                <div className={styles.cryptoHeader}>
                  <span className={styles.cryptoRank}>#{index + 1}</span>
                  <span className={styles.cryptoSymbol}>{crypto.symbol}</span>
                  <span className={styles.cryptoName}>{crypto.name}</span>
                </div>
                
                <div className={styles.cryptoPrice}>
                  {formatPrice(crypto.current_price)}
                </div>
                
                <div 
                  className={`${styles.cryptoChange} ${
                    crypto.price_change_percentage_24h >= 0 
                      ? styles.positive 
                      : styles.negative
                  }`}
                >
                  {formatChange(crypto.price_change_percentage_24h)}
                </div>
                
                <div className={styles.cryptoMarketCap}>
                  <span className={styles.marketCapLabel}>Market Cap:</span>
                  {formatMarketCap(crypto.market_cap)}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
