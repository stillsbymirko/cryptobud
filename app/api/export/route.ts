import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const year = searchParams.get('year')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    let where: any = { userId: session.user.id }

    if (year) {
      const yearNum = parseInt(year)
      where.date = {
        gte: new Date(`${yearNum}-01-01`),
        lte: new Date(`${yearNum}-12-31`),
      }
    } else if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: 'asc' },
    })

    // Create CSV content
    const headers = [
      'Datum',
      'Typ',
      'Cryptocurrency',
      'Menge',
      'Preis (EUR)',
      'Gesamt (EUR)',
      'Exchange',
      'Notizen',
    ]

    const rows = transactions.map((tx) => [
      new Date(tx.date).toLocaleDateString('de-DE'),
      tx.type.toUpperCase(),
      tx.cryptocurrency,
      tx.amount.toFixed(8),
      tx.priceEUR.toFixed(2),
      (tx.amount * tx.priceEUR).toFixed(2),
      tx.exchange,
      tx.notes || '',
    ])

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="transactions-${year || 'export'}.csv"`,
      },
    })
  } catch (error: any) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
