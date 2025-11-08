import { Transaction } from "@prisma/client";

export interface TaxCalculationResult {
  year: number;
  totalGains: number;
  taxableGains: number;
  taxFreeGains: number;
  stakingRewards: number;
  transactions: TransactionTaxAnalysis[];
  isTaxable: boolean;
  stakingThresholdExceeded: boolean;
}

export interface TransactionTaxAnalysis {
  transactionId: string;
  date: Date;
  cryptocurrency: string;
  amount: number;
  type: string;
  priceEUR: number;
  costBasis?: number;
  gain?: number;
  isTaxFree?: boolean;
  holdingPeriodDays?: number;
}

export interface FIFOQueue {
  cryptocurrency: string;
  purchases: PurchaseRecord[];
}

interface PurchaseRecord {
  date: Date;
  amount: number;
  pricePerUnit: number;
  remaining: number;
}

const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;
const STAKING_THRESHOLD_EUR = 256;

/**
 * Calculate tax according to German tax law:
 * §23 EStG: FIFO method with 1-year holding period for tax-free status
 * §22 Nr. 3 EStG: 256€ annual threshold for staking rewards
 */
export class FIFOTaxCalculator {
  private fifoQueues: Map<string, PurchaseRecord[]> = new Map();

  /**
   * Calculate taxes for a given year
   */
  calculateYearlyTax(transactions: Transaction[], year: number): TaxCalculationResult {
    // Reset FIFO queues
    this.fifoQueues.clear();

    // Filter and sort transactions
    const allTransactions = [...transactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    const yearTransactions = allTransactions.filter(
      (tx) => new Date(tx.date).getFullYear() === year
    );

    let totalGains = 0;
    let taxableGains = 0;
    let taxFreeGains = 0;
    let stakingRewards = 0;

    const analyzedTransactions: TransactionTaxAnalysis[] = [];

    // Process all transactions chronologically to build FIFO queues
    for (const tx of allTransactions) {
      const txDate = new Date(tx.date);
      const txYear = txDate.getFullYear();

      if (tx.type === "buy") {
        this.addPurchase(tx);
      } else if (tx.type === "sell" && txYear === year) {
        const analysis = this.processSale(tx);
        analyzedTransactions.push(analysis);

        if (analysis.gain) {
          totalGains += analysis.gain;
          if (analysis.isTaxFree) {
            taxFreeGains += analysis.gain;
          } else {
            taxableGains += analysis.gain;
          }
        }
      } else if (tx.type === "staking" && txYear === year) {
        stakingRewards += tx.priceEUR;
        analyzedTransactions.push({
          transactionId: tx.id,
          date: txDate,
          cryptocurrency: tx.cryptocurrency,
          amount: tx.amount,
          type: tx.type,
          priceEUR: tx.priceEUR,
        });
      }
    }

    return {
      year,
      totalGains,
      taxableGains,
      taxFreeGains,
      stakingRewards,
      transactions: analyzedTransactions,
      isTaxable: taxableGains > 0 || stakingRewards > STAKING_THRESHOLD_EUR,
      stakingThresholdExceeded: stakingRewards > STAKING_THRESHOLD_EUR,
    };
  }

  /**
   * Add a purchase to the FIFO queue
   */
  private addPurchase(transaction: Transaction): void {
    const queue = this.fifoQueues.get(transaction.cryptocurrency) || [];
    
    queue.push({
      date: new Date(transaction.date),
      amount: transaction.amount,
      pricePerUnit: transaction.priceEUR / transaction.amount,
      remaining: transaction.amount,
    });

    this.fifoQueues.set(transaction.cryptocurrency, queue);
  }

  /**
   * Process a sale using FIFO and calculate gains/losses
   */
  private processSale(transaction: Transaction): TransactionTaxAnalysis {
    const queue = this.fifoQueues.get(transaction.cryptocurrency) || [];
    let remainingToSell = transaction.amount;
    let totalCostBasis = 0;
    let oldestHoldingDays: number | undefined;
    let allTaxFree = true;

    const saleDate = new Date(transaction.date);

    while (remainingToSell > 0 && queue.length > 0) {
      const purchase = queue[0];
      const amountFromThisPurchase = Math.min(purchase.remaining, remainingToSell);
      
      // Calculate holding period
      const holdingPeriodMs = saleDate.getTime() - purchase.date.getTime();
      const holdingPeriodDays = Math.floor(holdingPeriodMs / (24 * 60 * 60 * 1000));

      if (oldestHoldingDays === undefined) {
        oldestHoldingDays = holdingPeriodDays;
      }

      // Check if this portion is tax-free (held > 1 year)
      if (holdingPeriodMs < ONE_YEAR_MS) {
        allTaxFree = false;
      }

      totalCostBasis += amountFromThisPurchase * purchase.pricePerUnit;
      purchase.remaining -= amountFromThisPurchase;
      remainingToSell -= amountFromThisPurchase;

      if (purchase.remaining <= 0) {
        queue.shift();
      }
    }

    const saleRevenue = transaction.priceEUR;
    const gain = saleRevenue - totalCostBasis;

    return {
      transactionId: transaction.id,
      date: saleDate,
      cryptocurrency: transaction.cryptocurrency,
      amount: transaction.amount,
      type: transaction.type,
      priceEUR: transaction.priceEUR,
      costBasis: totalCostBasis,
      gain,
      isTaxFree: allTaxFree,
      holdingPeriodDays: oldestHoldingDays,
    };
  }

  /**
   * Get next tax-free sale dates for portfolio holdings
   */
  getNextTaxFreeDates(transactions: Transaction[]): Map<string, Date | null> {
    this.fifoQueues.clear();

    const sortedTransactions = [...transactions].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Build FIFO queues
    for (const tx of sortedTransactions) {
      if (tx.type === "buy") {
        this.addPurchase(tx);
      } else if (tx.type === "sell") {
        this.processSale(tx);
      }
    }

    const nextTaxFreeDates = new Map<string, Date | null>();

    // For each cryptocurrency, find the oldest purchase
    for (const [crypto, queue] of this.fifoQueues.entries()) {
      if (queue.length > 0 && queue[0].remaining > 0) {
        const oldestPurchase = queue[0];
        const taxFreeDate = new Date(oldestPurchase.date.getTime() + ONE_YEAR_MS);
        nextTaxFreeDates.set(crypto, taxFreeDate);
      } else {
        nextTaxFreeDates.set(crypto, null);
      }
    }

    return nextTaxFreeDates;
  }
}

/**
 * Calculate staking rewards progress towards 256€ threshold
 */
export function calculateStakingProgress(transactions: Transaction[], year: number): {
  total: number;
  threshold: number;
  remaining: number;
  percentage: number;
  exceeded: boolean;
} {
  const stakingTransactions = transactions.filter(
    (tx) => tx.type === "staking" && new Date(tx.date).getFullYear() === year
  );

  const total = stakingTransactions.reduce((sum, tx) => sum + tx.priceEUR, 0);
  const remaining = Math.max(0, STAKING_THRESHOLD_EUR - total);
  const percentage = Math.min(100, (total / STAKING_THRESHOLD_EUR) * 100);
  const exceeded = total > STAKING_THRESHOLD_EUR;

  return {
    total,
    threshold: STAKING_THRESHOLD_EUR,
    remaining,
    percentage,
    exceeded,
  };
}
