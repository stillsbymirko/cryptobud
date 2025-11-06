import { prisma } from "@/lib/prisma/client";
import { Transaction } from "@prisma/client";

/**
 * Aggregate and update portfolio from transactions
 */
export async function updatePortfolio(userId: string, cryptocurrency: string): Promise<void> {
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      cryptocurrency,
    },
    orderBy: {
      date: "asc",
    },
  });

  let totalAmount = 0;
  let totalCost = 0;
  let totalBoughtAmount = 0;

  for (const tx of transactions) {
    if (tx.type === "buy" || tx.type === "staking") {
      totalAmount += tx.amount;
      totalCost += tx.priceEUR;
      totalBoughtAmount += tx.amount;
    } else if (tx.type === "sell") {
      totalAmount -= tx.amount;
    }
  }

  const averageBuyPrice = totalBoughtAmount > 0 ? totalCost / totalBoughtAmount : 0;

  if (totalAmount > 0) {
    await prisma.portfolio.upsert({
      where: {
        userId_cryptocurrency: {
          userId,
          cryptocurrency,
        },
      },
      update: {
        totalAmount,
        averageBuyPrice,
        lastUpdated: new Date(),
      },
      create: {
        userId,
        cryptocurrency,
        totalAmount,
        averageBuyPrice,
      },
    });
  } else {
    // Remove from portfolio if amount is 0
    await prisma.portfolio.deleteMany({
      where: {
        userId,
        cryptocurrency,
      },
    });
  }
}

/**
 * Update all portfolio entries for a user
 */
export async function updateAllPortfolios(userId: string): Promise<void> {
  const transactions = await prisma.transaction.findMany({
    where: { userId },
    select: { cryptocurrency: true },
    distinct: ["cryptocurrency"],
  });

  const cryptocurrencies = transactions.map((tx) => tx.cryptocurrency);

  for (const crypto of cryptocurrencies) {
    await updatePortfolio(userId, crypto);
  }
}

/**
 * Calculate portfolio statistics
 */
export async function calculatePortfolioStats(
  userId: string,
  currentPrices: { [key: string]: number }
): Promise<{
  totalValue: number;
  totalCost: number;
  totalGain: number;
  totalGainPercentage: number;
}> {
  const portfolios = await prisma.portfolio.findMany({
    where: { userId },
  });

  let totalValue = 0;
  let totalCost = 0;

  for (const portfolio of portfolios) {
    const currentPrice = currentPrices[portfolio.cryptocurrency] || 0;
    const value = portfolio.totalAmount * currentPrice;
    const cost = portfolio.totalAmount * portfolio.averageBuyPrice;

    totalValue += value;
    totalCost += cost;
  }

  const totalGain = totalValue - totalCost;
  const totalGainPercentage = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

  return {
    totalValue,
    totalCost,
    totalGain,
    totalGainPercentage,
  };
}
