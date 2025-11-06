"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";

interface PortfolioStats {
  totalValue: number;
  totalCost: number;
  totalGain: number;
  totalGainPercentage: number;
}

interface TaxData {
  year: number;
  totalGains: number;
  taxableGains: number;
  taxFreeGains: number;
  stakingRewards: number;
  isTaxable: boolean;
  stakingThresholdExceeded: boolean;
  stakingProgress: {
    total: number;
    threshold: number;
    remaining: number;
    percentage: number;
    exceeded: boolean;
  };
}

export default function DashboardPage() {
  const [stats, setStats] = useState<PortfolioStats | null>(null);
  const [taxData, setTaxData] = useState<TaxData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [portfolioRes, taxRes] = await Promise.all([
        fetch("/api/portfolio"),
        fetch("/api/tax"),
      ]);

      if (portfolioRes.ok) {
        const portfolioData = await portfolioRes.json();
        setStats(portfolioData.stats);
      }

      if (taxRes.ok) {
        const taxDataRes = await taxRes.json();
        setTaxData(taxDataRes);
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

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-xl text-gray-600">Loading dashboard...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-600">
            Overview of your cryptocurrency portfolio and tax status
          </p>
        </div>

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card">
            <div className="text-sm text-gray-600 mb-1">Total Portfolio Value</div>
            <div className="text-3xl font-bold">
              {formatCurrency(stats?.totalValue || 0)}
            </div>
          </div>

          <div className="card">
            <div className="text-sm text-gray-600 mb-1">Total Cost Basis</div>
            <div className="text-3xl font-bold">
              {formatCurrency(stats?.totalCost || 0)}
            </div>
          </div>

          <div className="card">
            <div className="text-sm text-gray-600 mb-1">Total P&L</div>
            <div
              className={`text-3xl font-bold ${
                (stats?.totalGain || 0) >= 0 ? "text-success" : "text-danger"
              }`}
            >
              {formatCurrency(stats?.totalGain || 0)}
            </div>
          </div>

          <div className="card">
            <div className="text-sm text-gray-600 mb-1">P&L Percentage</div>
            <div
              className={`text-3xl font-bold ${
                (stats?.totalGainPercentage || 0) >= 0
                  ? "text-success"
                  : "text-danger"
              }`}
            >
              {formatPercentage(stats?.totalGainPercentage || 0)}
            </div>
          </div>
        </div>

        {/* Tax Overview */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">
            Tax Summary {taxData?.year || new Date().getFullYear()}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="text-sm text-gray-600 mb-1">Taxable Gains</div>
              <div className="text-2xl font-bold text-danger">
                {formatCurrency(taxData?.taxableGains || 0)}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600 mb-1">Tax-Free Gains</div>
              <div className="text-2xl font-bold text-success">
                {formatCurrency(taxData?.taxFreeGains || 0)}
              </div>
            </div>

            <div>
              <div className="text-sm text-gray-600 mb-1">Total Gains</div>
              <div className="text-2xl font-bold">
                {formatCurrency(taxData?.totalGains || 0)}
              </div>
            </div>
          </div>

          {taxData?.isTaxable && (
            <div className="mt-4 p-4 bg-warning bg-opacity-10 border border-warning rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⚠️</span>
                <div>
                  <div className="font-semibold">Tax Event Detected</div>
                  <div className="text-sm text-gray-600">
                    You have taxable gains or exceeded staking threshold. Consider consulting a tax advisor.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Staking Tracker */}
        <div className="card">
          <h2 className="text-2xl font-bold mb-4">Staking Rewards (§22 Nr. 3 EStG)</h2>

          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Progress to 256€ threshold</span>
              <span className="font-medium">
                {formatCurrency(taxData?.stakingProgress.total || 0)} /{" "}
                {formatCurrency(taxData?.stakingProgress.threshold || 256)}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className={`h-4 rounded-full transition-all ${
                  taxData?.stakingProgress.exceeded ? "bg-danger" : "bg-success"
                }`}
                style={{
                  width: `${Math.min(
                    taxData?.stakingProgress.percentage || 0,
                    100
                  )}%`,
                }}
              />
            </div>
          </div>

          <div className="text-sm text-gray-600">
            {taxData?.stakingProgress.exceeded ? (
              <span className="text-danger font-medium">
                ⚠️ Threshold exceeded! Staking rewards are taxable.
              </span>
            ) : (
              <span className="text-success">
                ✓ Remaining before threshold:{" "}
                {formatCurrency(taxData?.stakingProgress.remaining || 0)}
              </span>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <a href="/transactions" className="card hover:shadow-md transition-shadow cursor-pointer">
            <div className="text-3xl mb-2">📝</div>
            <div className="font-semibold text-lg mb-1">Add Transaction</div>
            <div className="text-sm text-gray-600">
              Manually add or import transactions from exchanges
            </div>
          </a>

          <a href="/portfolio" className="card hover:shadow-md transition-shadow cursor-pointer">
            <div className="text-3xl mb-2">💼</div>
            <div className="font-semibold text-lg mb-1">View Portfolio</div>
            <div className="text-sm text-gray-600">
              See all your holdings with real-time prices
            </div>
          </a>

          <a href="/staking" className="card hover:shadow-md transition-shadow cursor-pointer">
            <div className="text-3xl mb-2">💰</div>
            <div className="font-semibold text-lg mb-1">Staking Tracker</div>
            <div className="text-sm text-gray-600">
              Monitor staking rewards and tax implications
            </div>
          </a>
        </div>
      </div>
    </DashboardLayout>
  );
}
