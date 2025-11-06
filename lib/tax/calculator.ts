import { Transaction } from '@prisma/client'

export interface TaxCalculation {
  year: number
  taxableGains: number
  taxFreeGains: number
  stakingRewards: number
  totalGains: number
  transactions: TaxTransaction[]
}

export interface TaxTransaction {
  id: string
  date: Date
  cryptocurrency: string
  amount: number
  type: string
  gainLoss?: number
  taxable: boolean
  note: string
}

export function calculateTax(transactions: Transaction[], year?: number): TaxCalculation {
  const currentYear = year || new Date().getFullYear()
  
  // Filter transactions for the year
  const yearTransactions = transactions.filter(
    (t) => new Date(t.date).getFullYear() === currentYear
  )

  // Sort by date (FIFO)
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  // Group by cryptocurrency
  const cryptoGroups = groupByCrypto(sortedTransactions)

  let taxableGains = 0
  let taxFreeGains = 0
  let stakingRewards = 0
  const taxTransactions: TaxTransaction[] = []

  // Process each cryptocurrency separately
  for (const [crypto, txs] of Object.entries(cryptoGroups)) {
    const { gains, staking, taxTxs } = processCryptoTransactions(
      txs as Transaction[],
      crypto,
      currentYear
    )

    taxableGains += gains.taxable
    taxFreeGains += gains.taxFree
    stakingRewards += staking
    taxTransactions.push(...taxTxs)
  }

  return {
    year: currentYear,
    taxableGains,
    taxFreeGains,
    stakingRewards,
    totalGains: taxableGains + taxFreeGains,
    transactions: taxTransactions,
  }
}

function groupByCrypto(transactions: Transaction[]): Record<string, Transaction[]> {
  return transactions.reduce((acc, tx) => {
    if (!acc[tx.cryptocurrency]) {
      acc[tx.cryptocurrency] = []
    }
    acc[tx.cryptocurrency].push(tx)
    return acc
  }, {} as Record<string, Transaction[]>)
}

function processCryptoTransactions(
  transactions: Transaction[],
  crypto: string,
  year: number
): {
  gains: { taxable: number; taxFree: number }
  staking: number
  taxTxs: TaxTransaction[]
} {
  const fifoQueue: Array<{ amount: number; price: number; date: Date }> = []
  let taxableGains = 0
  let taxFreeGains = 0
  let stakingRewards = 0
  const taxTxs: TaxTransaction[] = []

  for (const tx of transactions) {
    const txYear = new Date(tx.date).getFullYear()

    if (tx.type === 'buy') {
      // Add to FIFO queue
      fifoQueue.push({
        amount: tx.amount,
        price: tx.priceEUR,
        date: tx.date,
      })

      if (txYear === year) {
        taxTxs.push({
          id: tx.id,
          date: tx.date,
          cryptocurrency: tx.cryptocurrency,
          amount: tx.amount,
          type: 'BUY',
          taxable: false,
          note: `Kauf @ €${tx.priceEUR.toFixed(2)}`,
        })
      }
    } else if (tx.type === 'sell') {
      let remainingToSell = tx.amount
      let totalCost = 0
      let totalRevenue = tx.amount * tx.priceEUR

      while (remainingToSell > 0 && fifoQueue.length > 0) {
        const oldest = fifoQueue[0]
        const amountToUse = Math.min(remainingToSell, oldest.amount)

        totalCost += amountToUse * oldest.price

        // Check if holding period > 1 year (§23 EStG)
        const holdingPeriodDays = Math.floor(
          (new Date(tx.date).getTime() - new Date(oldest.date).getTime()) /
            (1000 * 60 * 60 * 24)
        )
        const isLongTerm = holdingPeriodDays >= 365

        const gain = amountToUse * (tx.priceEUR - oldest.price)

        if (txYear === year) {
          if (isLongTerm) {
            taxFreeGains += gain
          } else {
            taxableGains += gain
          }

          taxTxs.push({
            id: tx.id,
            date: tx.date,
            cryptocurrency: tx.cryptocurrency,
            amount: amountToUse,
            type: 'SELL',
            gainLoss: gain,
            taxable: !isLongTerm,
            note: `${isLongTerm ? 'Steuerfrei' : 'Steuerpflichtig'} (${holdingPeriodDays} Tage)`,
          })
        }

        oldest.amount -= amountToUse
        remainingToSell -= amountToUse

        if (oldest.amount <= 0) {
          fifoQueue.shift()
        }
      }
    } else if (tx.type === 'staking') {
      const reward = tx.amount * tx.priceEUR

      if (txYear === year) {
        stakingRewards += reward

        taxTxs.push({
          id: tx.id,
          date: tx.date,
          cryptocurrency: tx.cryptocurrency,
          amount: tx.amount,
          type: 'STAKING',
          gainLoss: reward,
          taxable: reward > 256, // §22 Nr. 3 EStG: 256€ threshold
          note: `Staking Reward €${reward.toFixed(2)}`,
        })
      }

      // Add staking rewards to FIFO queue as they become part of holdings
      fifoQueue.push({
        amount: tx.amount,
        price: tx.priceEUR,
        date: tx.date,
      })
    }
  }

  return {
    gains: { taxable: taxableGains, taxFree: taxFreeGains },
    staking: stakingRewards,
    taxTxs,
  }
}

export function getNextTaxFreeSales(transactions: Transaction[]): Array<{
  cryptocurrency: string
  amount: number
  date: Date
  daysUntilTaxFree: number
}> {
  const now = new Date()
  const sortedTransactions = [...transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  const cryptoGroups = groupByCrypto(sortedTransactions)
  const upcomingTaxFree: Array<{
    cryptocurrency: string
    amount: number
    date: Date
    daysUntilTaxFree: number
  }> = []

  for (const [crypto, txs] of Object.entries(cryptoGroups)) {
    const fifoQueue: Array<{ amount: number; date: Date }> = []

    for (const tx of txs as Transaction[]) {
      if (tx.type === 'buy' || tx.type === 'staking') {
        fifoQueue.push({ amount: tx.amount, date: tx.date })
      } else if (tx.type === 'sell') {
        let remainingToSell = tx.amount
        while (remainingToSell > 0 && fifoQueue.length > 0) {
          const oldest = fifoQueue[0]
          const amountToUse = Math.min(remainingToSell, oldest.amount)
          oldest.amount -= amountToUse
          remainingToSell -= amountToUse
          if (oldest.amount <= 0) {
            fifoQueue.shift()
          }
        }
      }
    }

    // Check remaining holdings for upcoming tax-free dates
    for (const holding of fifoQueue) {
      const purchaseDate = new Date(holding.date)
      const taxFreeDate = new Date(purchaseDate)
      taxFreeDate.setFullYear(taxFreeDate.getFullYear() + 1)

      if (taxFreeDate > now) {
        const daysUntilTaxFree = Math.ceil(
          (taxFreeDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        )

        upcomingTaxFree.push({
          cryptocurrency: crypto,
          amount: holding.amount,
          date: taxFreeDate,
          daysUntilTaxFree,
        })
      }
    }
  }

  return upcomingTaxFree.sort((a, b) => a.daysUntilTaxFree - b.daysUntilTaxFree)
}
