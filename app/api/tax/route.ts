import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma/client";
import { FIFOTaxCalculator, calculateStakingProgress } from "@/lib/tax/fifoCalculator";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get("year");
    const year = yearParam ? parseInt(yearParam) : new Date().getFullYear();

    const transactions = await prisma.transaction.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "asc" },
    });

    if (transactions.length === 0) {
      return NextResponse.json({
        year,
        totalGains: 0,
        taxableGains: 0,
        taxFreeGains: 0,
        stakingRewards: 0,
        transactions: [],
        isTaxable: false,
        stakingThresholdExceeded: false,
        stakingProgress: {
          total: 0,
          threshold: 256,
          remaining: 256,
          percentage: 0,
          exceeded: false,
        },
      });
    }

    const calculator = new FIFOTaxCalculator();
    const taxResult = calculator.calculateYearlyTax(transactions, year);
    const stakingProgress = calculateStakingProgress(transactions, year);
    const nextTaxFreeDates = calculator.getNextTaxFreeDates(transactions);

    return NextResponse.json({
      ...taxResult,
      stakingProgress,
      nextTaxFreeDates: Array.from(nextTaxFreeDates.entries()).map(([crypto, date]) => ({
        cryptocurrency: crypto,
        date,
      })),
    });
  } catch (error) {
    console.error("Tax calculation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
