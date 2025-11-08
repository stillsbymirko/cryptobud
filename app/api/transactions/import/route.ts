import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma/client";
import { detectParser } from "@/lib/parsers/exchangeParsers";
import { updateAllPortfolios } from "@/lib/utils/portfolio";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { csvData } = body;

    if (!csvData) {
      return NextResponse.json(
        { error: "CSV data is required" },
        { status: 400 }
      );
    }

    // Detect parser
    const parser = await detectParser(csvData);
    if (!parser) {
      return NextResponse.json(
        { error: "Could not detect exchange format. Supported exchanges: Bitpanda, 21Bitcoin, Kraken, Binance, Coinbase, Bitstamp" },
        { status: 400 }
      );
    }

    // Parse CSV
    const parsedTransactions = await parser.parse(csvData);

    if (parsedTransactions.length === 0) {
      return NextResponse.json(
        { error: "No valid transactions found in CSV" },
        { status: 400 }
      );
    }

    // Create transactions in database
    const transactions = await prisma.transaction.createMany({
      data: parsedTransactions.map((tx) => ({
        ...tx,
        userId: session.user.id!,
      })),
    });

    // Update all portfolios
    await updateAllPortfolios(session.user.id);

    return NextResponse.json(
      {
        message: `Successfully imported ${transactions.count} transactions from ${parser.name}`,
        count: transactions.count,
        exchange: parser.name,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("CSV import error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to import CSV" },
      { status: 500 }
    );
  }
}
