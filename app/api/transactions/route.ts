import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'

const transactionSchema = z.object({
  date: z.string(),
  cryptocurrency: z.string(),
  amount: z.number().positive(),
  priceEUR: z.number().positive(),
  type: z.enum(['buy', 'sell', 'staking']),
  exchange: z.string(),
  notes: z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await req.json()
    const data = transactionSchema.parse(body)

    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        date: new Date(data.date),
        cryptocurrency: data.cryptocurrency.toUpperCase(),
        amount: data.amount,
        priceEUR: data.priceEUR,
        type: data.type,
        exchange: data.exchange,
        notes: data.notes,
      },
    })

    // Update portfolio
    await updatePortfolio(session.user.id, transaction)

    return NextResponse.json(
      { message: 'Transaction created', transaction },
      { status: 201 }
    )
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      )
    }
    console.error('Transaction creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}

async function updatePortfolio(userId: string, transaction: any) {
  const existingPortfolio = await prisma.portfolio.findUnique({
    where: {
      userId_cryptocurrency: {
        userId,
        cryptocurrency: transaction.cryptocurrency,
      },
    },
  })

  let totalAmount = existingPortfolio?.totalAmount || 0
  let totalValue = existingPortfolio 
    ? existingPortfolio.totalAmount * existingPortfolio.averageBuyPrice 
    : 0

  if (transaction.type === 'buy' || transaction.type === 'staking') {
    totalValue += transaction.amount * transaction.priceEUR
    totalAmount += transaction.amount
  } else if (transaction.type === 'sell') {
    totalAmount -= transaction.amount
  }

  const averageBuyPrice = totalAmount > 0 ? totalValue / totalAmount : 0

  await prisma.portfolio.upsert({
    where: {
      userId_cryptocurrency: {
        userId,
        cryptocurrency: transaction.cryptocurrency,
      },
    },
    update: {
      totalAmount: Math.max(0, totalAmount),
      averageBuyPrice,
    },
    create: {
      userId,
      cryptocurrency: transaction.cryptocurrency,
      totalAmount: Math.max(0, totalAmount),
      averageBuyPrice,
    },
  })
}
