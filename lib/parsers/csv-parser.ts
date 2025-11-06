export interface ParsedTransaction {
  date: Date
  cryptocurrency: string
  amount: number
  priceEUR: number
  type: 'buy' | 'sell' | 'staking'
  exchange: string
  notes?: string
}

export function parseCSV(content: string, exchange: string): ParsedTransaction[] {
  const lines = content.trim().split('\n')
  if (lines.length < 2) {
    throw new Error('CSV file is empty or invalid')
  }

  const parser = getParser(exchange)
  return parser(lines)
}

function getParser(exchange: string): (lines: string[]) => ParsedTransaction[] {
  switch (exchange.toLowerCase()) {
    case 'bitpanda':
      return parseBitpanda
    case '21bitcoin':
      return parse21Bitcoin
    case 'kraken':
      return parseKraken
    case 'binance':
      return parseBinance
    case 'coinbase':
      return parseCoinbase
    case 'bitstamp':
      return parseBitstamp
    default:
      throw new Error(`Unsupported exchange: ${exchange}`)
  }
}

// Bitpanda: Timestamp, Transaction Type, Asset, Amount, Fee, EUR Amount
function parseBitpanda(lines: string[]): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',')
    if (parts.length < 6) continue

    const timestamp = parts[0].trim()
    const transactionType = parts[1].trim().toLowerCase()
    const asset = parts[2].trim()
    const amount = parseFloat(parts[3].trim())
    const eurAmount = parseFloat(parts[5].trim())

    if (isNaN(amount) || isNaN(eurAmount) || amount === 0) continue

    const type = transactionType.includes('buy') ? 'buy' : 
                 transactionType.includes('sell') ? 'sell' : 
                 transactionType.includes('reward') ? 'staking' : 'buy'

    transactions.push({
      date: new Date(timestamp),
      cryptocurrency: asset,
      amount: Math.abs(amount),
      priceEUR: Math.abs(eurAmount / amount),
      type,
      exchange: 'Bitpanda',
    })
  }

  return transactions
}

// 21Bitcoin: Date, Type, Cryptocurrency, Amount, Price EUR
function parse21Bitcoin(lines: string[]): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',')
    if (parts.length < 5) continue

    const date = parts[0].trim()
    const type = parts[1].trim().toLowerCase()
    const cryptocurrency = parts[2].trim()
    const amount = parseFloat(parts[3].trim())
    const priceEUR = parseFloat(parts[4].trim())

    if (isNaN(amount) || isNaN(priceEUR) || amount === 0) continue

    transactions.push({
      date: new Date(date),
      cryptocurrency,
      amount: Math.abs(amount),
      priceEUR: Math.abs(priceEUR),
      type: type === 'sell' ? 'sell' : 'buy',
      exchange: '21Bitcoin',
    })
  }

  return transactions
}

// Kraken: txid, time, type, asset, amount, fee, balance
function parseKraken(lines: string[]): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',')
    if (parts.length < 7) continue

    const time = parts[1].trim()
    const type = parts[2].trim().toLowerCase()
    const asset = parts[3].trim()
    const amount = parseFloat(parts[4].trim())
    const fee = parseFloat(parts[5].trim())

    if (isNaN(amount) || amount === 0) continue

    // Kraken doesn't provide EUR price directly, so we'll need to handle this
    // For now, we'll set a placeholder that needs to be updated with actual price
    const transactionType = type.includes('buy') || type.includes('deposit') ? 'buy' : 
                            type.includes('sell') || type.includes('withdrawal') ? 'sell' : 
                            type.includes('staking') ? 'staking' : 'buy'

    transactions.push({
      date: new Date(time),
      cryptocurrency: asset.replace('X', '').replace('Z', ''),
      amount: Math.abs(amount),
      priceEUR: 0, // Would need price lookup
      type: transactionType,
      exchange: 'Kraken',
      notes: `Fee: ${fee}`,
    })
  }

  return transactions
}

// Binance: Date(UTC), Market, Type, Price, Amount, Total, Fee
function parseBinance(lines: string[]): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',')
    if (parts.length < 7) continue

    const date = parts[0].trim()
    const market = parts[1].trim()
    const type = parts[2].trim().toLowerCase()
    const price = parseFloat(parts[3].trim())
    const amount = parseFloat(parts[4].trim())
    const total = parseFloat(parts[5].trim())

    if (isNaN(amount) || isNaN(price) || amount === 0) continue

    // Extract cryptocurrency from market (e.g., BTCEUR -> BTC)
    const crypto = market.replace('EUR', '').replace('USDT', '')

    transactions.push({
      date: new Date(date),
      cryptocurrency: crypto,
      amount: Math.abs(amount),
      priceEUR: Math.abs(price),
      type: type === 'sell' ? 'sell' : 'buy',
      exchange: 'Binance',
    })
  }

  return transactions
}

// Coinbase: Timestamp, Transaction Type, Asset, Quantity, EUR Spot Price
function parseCoinbase(lines: string[]): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',')
    if (parts.length < 5) continue

    const timestamp = parts[0].trim()
    const transactionType = parts[1].trim().toLowerCase()
    const asset = parts[2].trim()
    const quantity = parseFloat(parts[3].trim())
    const eurSpotPrice = parseFloat(parts[4].trim())

    if (isNaN(quantity) || isNaN(eurSpotPrice) || quantity === 0) continue

    const type = transactionType.includes('buy') || transactionType.includes('receive') ? 'buy' : 
                 transactionType.includes('sell') || transactionType.includes('send') ? 'sell' : 
                 transactionType.includes('reward') || transactionType.includes('staking') ? 'staking' : 'buy'

    transactions.push({
      date: new Date(timestamp),
      cryptocurrency: asset,
      amount: Math.abs(quantity),
      priceEUR: Math.abs(eurSpotPrice),
      type,
      exchange: 'Coinbase',
    })
  }

  return transactions
}

// Bitstamp: Type, Datetime, Account, Amount, Value, Rate, Fee
function parseBitstamp(lines: string[]): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = []
  
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',')
    if (parts.length < 7) continue

    const type = parts[0].trim().toLowerCase()
    const datetime = parts[1].trim()
    const account = parts[2].trim()
    const amount = parseFloat(parts[3].trim())
    const value = parseFloat(parts[4].trim())
    const rate = parseFloat(parts[5].trim())

    if (isNaN(amount) || isNaN(rate) || amount === 0) continue

    // Extract cryptocurrency from account
    const crypto = account.replace(' wallet', '').toUpperCase()

    transactions.push({
      date: new Date(datetime),
      cryptocurrency: crypto,
      amount: Math.abs(amount),
      priceEUR: Math.abs(rate),
      type: type.includes('sell') ? 'sell' : 'buy',
      exchange: 'Bitstamp',
    })
  }

  return transactions
}
