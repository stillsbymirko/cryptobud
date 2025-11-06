import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'
import { parseCSV } from '@/lib/parsers/csv-parser'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await req.formData()
    const file = formData.get('file') as File
    const exchange = formData.get('exchange') as string

    if (!file || !exchange) {
      return NextResponse.json(
        { error: 'File and exchange are required' },
        { status: 400 }
      )
    }

    // Read file content
    const content = await file.text()

    // Parse CSV
    const parsedTransactions = parseCSV(content, exchange)

    if (parsedTransactions.length === 0) {
      return NextResponse.json(
        { error: 'No valid transactions found in CSV' },
        { status: 400 }
      )
    }

    // Save transactions to database
    const transactions = await prisma.transaction.createMany({
      data: parsedTransactions.map((tx) => ({
        userId: session.user.id,
        date: tx.date,
        cryptocurrency: tx.cryptocurrency,
        amount: tx.amount,
        priceEUR: tx.priceEUR,
        type: tx.type,
        exchange: tx.exchange,
        notes: tx.notes,
      })),
    })

    // Update portfolio
    await updatePortfolio(session.user.id, parsedTransactions)

    return NextResponse.json(
      { 
        message: 'Import successful',
        count: transactions.count 
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Import error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

async function updatePortfolio(userId: string, transactions: any[]) {
  // Group transactions by cryptocurrency
  const cryptoGroups = transactions.reduce((acc: any, tx) => {
    if (!acc[tx.cryptocurrency]) {
      acc[tx.cryptocurrency] = []
    }
    acc[tx.cryptocurrency].push(tx)
    return acc
  }, {})

  // Update or create portfolio entries
  for (const [crypto, txs] of Object.entries(cryptoGroups)) {
    const existingPortfolio = await prisma.portfolio.findUnique({
      where: {
        userId_cryptocurrency: {
          userId,
          cryptocurrency: crypto,
        },
      },
    })

    let totalAmount = existingPortfolio?.totalAmount || 0
    let totalValue = existingPortfolio 
      ? existingPortfolio.totalAmount * existingPortfolio.averageBuyPrice 
      : 0

    for (const tx of txs as any[]) {
      if (tx.type === 'buy' || tx.type === 'staking') {
        totalValue += tx.amount * tx.priceEUR
        totalAmount += tx.amount
      } else if (tx.type === 'sell') {
        totalAmount -= tx.amount
      }
    }

    const averageBuyPrice = totalAmount > 0 ? totalValue / totalAmount : 0

    await prisma.portfolio.upsert({
      where: {
        userId_cryptocurrency: {
          userId,
          cryptocurrency: crypto,
        },
      },
      update: {
        totalAmount,
        averageBuyPrice,
      },
      create: {
        userId,
        cryptocurrency: crypto,
        totalAmount,
        averageBuyPrice,
      },
    })
  }
}
