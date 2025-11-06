import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma/client";
import { getCurrentPrices } from "@/lib/utils/coingecko";
import { calculatePortfolioStats } from "@/lib/utils/portfolio";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const portfolios = await prisma.portfolio.findMany({
      where: { userId: session.user.id },
      orderBy: { lastUpdated: "desc" },
    });

    if (portfolios.length === 0) {
      return NextResponse.json({
        portfolios: [],
        stats: {
          totalValue: 0,
          totalCost: 0,
          totalGain: 0,
          totalGainPercentage: 0,
        },
      });
    }

    // Get current prices
    const cryptocurrencies = portfolios.map((p) => p.cryptocurrency);
    const currentPrices = await getCurrentPrices(cryptocurrencies);

    // Calculate stats
    const stats = await calculatePortfolioStats(session.user.id, currentPrices);

    // Enrich portfolios with current prices and values
    const enrichedPortfolios = portfolios.map((p) => {
      const currentPrice = currentPrices[p.cryptocurrency] || 0;
      const currentValue = p.totalAmount * currentPrice;
      const costBasis = p.totalAmount * p.averageBuyPrice;
      const gain = currentValue - costBasis;
      const gainPercentage = costBasis > 0 ? (gain / costBasis) * 100 : 0;

      return {
        ...p,
        currentPrice,
        currentValue,
        costBasis,
        gain,
        gainPercentage,
      };
    });

    return NextResponse.json({
      portfolios: enrichedPortfolios,
      stats,
      prices: currentPrices,
    });
  } catch (error) {
    console.error("Get portfolio error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
