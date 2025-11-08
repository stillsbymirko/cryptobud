import { NextRequest, NextResponse } from "next/server";
import { getCurrentPrices, getSupportedCryptos } from "@/lib/utils/coingecko";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbolsParam = searchParams.get("symbols");

    if (!symbolsParam) {
      const supported = getSupportedCryptos();
      return NextResponse.json({ supported });
    }

    const symbols = symbolsParam.split(",").map((s) => s.trim().toUpperCase());
    const prices = await getCurrentPrices(symbols);

    return NextResponse.json({ prices });
  } catch (error) {
    console.error("CoinGecko API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch prices" },
      { status: 500 }
    );
  }
}
