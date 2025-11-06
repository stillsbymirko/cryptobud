"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";

interface TaxData {
  year: number;
  stakingRewards: number;
  stakingProgress: {
    total: number;
    threshold: number;
    remaining: number;
    percentage: number;
    exceeded: boolean;
  };
  nextTaxFreeDates: Array<{
    cryptocurrency: string;
    date: string | null;
  }>;
}

interface StakingTransaction {
  id: string;
  date: string;
  cryptocurrency: string;
  amount: number;
  priceEUR: number;
}

export default function StakingPage() {
  const [taxData, setTaxData] = useState<TaxData | null>(null);
  const [stakingTransactions, setStakingTransactions] = useState<
    StakingTransaction[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchData();
  }, [selectedYear]);

  const fetchData = async () => {
    try {
      const [taxRes, transactionsRes] = await Promise.all([
        fetch(`/api/tax?year=${selectedYear}`),
        fetch(`/api/transactions?type=staking`),
      ]);

      if (taxRes.ok) {
        const taxDataRes = await taxRes.json();
        setTaxData(taxDataRes);
      }

      if (transactionsRes.ok) {
        const transactionsData = await transactionsRes.json();
        const yearTransactions = transactionsData.transactions.filter(
          (tx: StakingTransaction) =>
            new Date(tx.date).getFullYear() === selectedYear
        );
        setStakingTransactions(yearTransactions);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("de-DE");
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(value);
  };

  const availableYears = Array.from(
    { length: 5 },
    (_, i) => new Date().getFullYear() - i
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-xl text-gray-600">Loading staking data...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Staking Tracker</h1>
            <p className="text-gray-600">
              Monitor staking rewards and 256€ threshold (§22 Nr. 3 EStG)
            </p>
          </div>
          <div>
            <label className="label">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="input"
            >
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Threshold Progress Card */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-6">
            Annual Staking Rewards ({selectedYear})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <div className="text-sm text-gray-600 mb-1">Total Rewards</div>
              <div className="text-3xl font-bold">
                {formatCurrency(taxData?.stakingProgress.total || 0)}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600 mb-1">Tax-Free Threshold</div>
              <div className="text-3xl font-bold">
                {formatCurrency(taxData?.stakingProgress.threshold || 256)}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600 mb-1">
                {taxData?.stakingProgress.exceeded ? "Exceeded By" : "Remaining"}
              </div>
              <div
                className={`text-3xl font-bold ${
                  taxData?.stakingProgress.exceeded ? "text-danger" : "text-success"
                }`}
              >
                {formatCurrency(
                  taxData?.stakingProgress.exceeded
                    ? taxData.stakingProgress.total - taxData.stakingProgress.threshold
                    : taxData?.stakingProgress.remaining || 0
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Progress to threshold</span>
              <span className="font-medium">
                {taxData?.stakingProgress.percentage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-6">
              <div
                className={`h-6 rounded-full transition-all flex items-center justify-end pr-3 text-white text-xs font-medium ${
                  taxData?.stakingProgress.exceeded ? "bg-danger" : "bg-success"
                }`}
                style={{
                  width: `${Math.min(taxData?.stakingProgress.percentage || 0, 100)}%`,
                }}
              >
                {taxData && taxData.stakingProgress.percentage > 15 && (
                  <span>{formatCurrency(taxData.stakingProgress.total)}</span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 rounded-lg border">
            {taxData?.stakingProgress.exceeded ? (
              <div className="flex items-center gap-3">
                <span className="text-3xl">⚠️</span>
                <div>
                  <div className="font-semibold text-danger">
                    Tax Threshold Exceeded
                  </div>
                  <div className="text-sm text-gray-600">
                    Your staking rewards exceed the 256€ tax-free threshold. You must
                    report these rewards on your tax return.
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-3xl">✅</span>
                <div>
                  <div className="font-semibold text-success">
                    Within Tax-Free Threshold
                  </div>
                  <div className="text-sm text-gray-600">
                    Your staking rewards are currently below the 256€ threshold and are
                    tax-free.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Next Tax-Free Sale Dates */}
        {taxData && taxData.nextTaxFreeDates.length > 0 && (
          <div className="card">
            <h2 className="text-2xl font-bold mb-4">
              Next Tax-Free Sale Dates (§23 EStG)
            </h2>
            <p className="text-gray-600 mb-6">
              After holding for 1 year, sales become tax-free
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {taxData.nextTaxFreeDates
                .filter((item) => item.date)
                .map((item) => (
                  <div
                    key={item.cryptocurrency}
                    className="p-4 border border-gray-200 rounded-lg"
                  >
                    <div className="font-semibold text-lg mb-1">
                      {item.cryptocurrency}
                    </div>
                    <div className="text-sm text-gray-600">Tax-free from</div>
                    <div className="text-primary font-semibold">
                      {item.date ? formatDate(item.date) : "N/A"}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Staking Transactions Table */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">
            Staking Transactions ({selectedYear})
          </h2>

          {stakingTransactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">💰</div>
              <h3 className="text-xl font-semibold mb-2">
                No Staking Rewards in {selectedYear}
              </h3>
              <p className="text-gray-600">
                Add staking reward transactions to track your progress
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Cryptocurrency
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">
                      Amount
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">
                      Value (EUR)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stakingTransactions.map((tx) => (
                    <tr
                      key={tx.id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-4 px-4">{formatDate(tx.date)}</td>
                      <td className="py-4 px-4 font-semibold">
                        {tx.cryptocurrency}
                      </td>
                      <td className="py-4 px-4 text-right">
                        {formatNumber(tx.amount)}
                      </td>
                      <td className="py-4 px-4 text-right font-semibold">
                        {formatCurrency(tx.priceEUR)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-300 font-semibold">
                    <td colSpan={3} className="py-4 px-4 text-right">
                      Total:
                    </td>
                    <td className="py-4 px-4 text-right text-lg">
                      {formatCurrency(
                        stakingTransactions.reduce(
                          (sum, tx) => sum + tx.priceEUR,
                          0
                        )
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* Information Card */}
        <div className="card bg-blue-50 border border-blue-200">
          <h3 className="font-semibold text-lg mb-3">📚 About §22 Nr. 3 EStG</h3>
          <div className="space-y-2 text-sm text-gray-700">
            <p>
              <strong>Tax-Free Threshold:</strong> Staking rewards up to 256€ per year
              are tax-free in Germany.
            </p>
            <p>
              <strong>Above Threshold:</strong> Rewards exceeding 256€ must be reported
              as "Other Income" on your tax return.
            </p>
            <p>
              <strong>Important:</strong> This applies to staking rewards, mining income,
              and similar activities. Regular buy/sell transactions follow different
              rules (§23 EStG).
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
