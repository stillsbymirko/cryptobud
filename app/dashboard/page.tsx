"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  DollarSign, 
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from "lucide-react";

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
          <div className="flex flex-col items-center space-y-4">
            <Activity className="w-12 h-12 text-blue-500 animate-pulse" />
            <div className="text-xl text-slate-600 dark:text-slate-400">Loading dashboard...</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Overview of your cryptocurrency portfolio and tax status
          </p>
        </div>

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <Wallet className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              {(stats?.totalGainPercentage || 0) >= 0 ? (
                <TrendingUp className="w-5 h-5 text-green-500" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-500" />
              )}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Portfolio Value</div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(stats?.totalValue || 0)}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                <DollarSign className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total Cost Basis</div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(stats?.totalCost || 0)}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${
                (stats?.totalGain || 0) >= 0 
                  ? "bg-green-100 dark:bg-green-900/30" 
                  : "bg-red-100 dark:bg-red-900/30"
              }`}>
                {(stats?.totalGain || 0) >= 0 ? (
                  <ArrowUpRight className="w-6 h-6 text-green-600 dark:text-green-400" />
                ) : (
                  <ArrowDownRight className="w-6 h-6 text-red-600 dark:text-red-400" />
                )}
              </div>
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400 mb-1">Total P&L</div>
            <div
              className={`text-3xl font-bold ${
                (stats?.totalGain || 0) >= 0 
                  ? "text-green-600 dark:text-green-400" 
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {formatCurrency(stats?.totalGain || 0)}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-xl">
                <Activity className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="text-sm text-blue-100 mb-1">P&L Percentage</div>
            <div className="text-3xl font-bold text-white">
              {formatPercentage(stats?.totalGainPercentage || 0)}
            </div>
          </div>
        </div>

        {/* Tax Overview */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Tax Summary {taxData?.year || new Date().getFullYear()}
            </h2>
            {taxData?.isTaxable && (
              <div className="flex items-center space-x-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 rounded-full text-sm font-medium">
                <AlertTriangle className="w-4 h-4" />
                <span>Tax Event</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="p-6 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl border border-red-200 dark:border-red-800">
              <div className="text-sm text-red-800 dark:text-red-400 mb-2 font-medium">Taxable Gains</div>
              <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(taxData?.taxableGains || 0)}
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-800">
              <div className="text-sm text-green-800 dark:text-green-400 mb-2 font-medium">Tax-Free Gains</div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(taxData?.taxFreeGains || 0)}
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-600 rounded-xl border border-slate-300 dark:border-slate-600">
              <div className="text-sm text-slate-700 dark:text-slate-300 mb-2 font-medium">Total Gains</div>
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {formatCurrency(taxData?.totalGains || 0)}
              </div>
            </div>
          </div>

          {taxData?.isTaxable && (
            <div className="p-6 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-amber-900 dark:text-amber-300 mb-1">Tax Event Detected</div>
                  <div className="text-sm text-amber-800 dark:text-amber-400">
                    You have taxable gains or exceeded staking threshold. Consider consulting a tax advisor.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Staking Tracker */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 border border-slate-200 dark:border-slate-700 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            Staking Rewards (§22 Nr. 3 EStG)
          </h2>

          <div className="mb-6">
            <div className="flex justify-between text-sm mb-3">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Progress to 256€ threshold</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {formatCurrency(taxData?.stakingProgress.total || 0)} /{" "}
                {formatCurrency(taxData?.stakingProgress.threshold || 256)}
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  taxData?.stakingProgress.exceeded 
                    ? "bg-gradient-to-r from-red-500 to-red-600" 
                    : "bg-gradient-to-r from-green-500 to-green-600"
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

          <div className="flex items-start space-x-3">
            {taxData?.stakingProgress.exceeded ? (
              <>
                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                <span className="text-red-600 dark:text-red-400 font-medium">
                  Threshold exceeded! Staking rewards are taxable.
                </span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                <span className="text-green-600 dark:text-green-400 font-medium">
                  Remaining before threshold:{" "}
                  {formatCurrency(taxData?.stakingProgress.remaining || 0)}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a 
            href="/transactions" 
            className="group bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 shadow-sm hover:shadow-lg transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl group-hover:scale-110 transition-transform">
                <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
            </div>
            <div className="font-semibold text-lg text-slate-900 dark:text-white mb-1">Add Transaction</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Manually add or import transactions from exchanges
            </div>
          </a>

          <a 
            href="/portfolio" 
            className="group bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-500 shadow-sm hover:shadow-lg transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl group-hover:scale-110 transition-transform">
                <Wallet className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-purple-500 transition-colors" />
            </div>
            <div className="font-semibold text-lg text-slate-900 dark:text-white mb-1">View Portfolio</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              See all your holdings with real-time prices
            </div>
          </a>

          <a 
            href="/staking" 
            className="group bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 hover:border-green-500 dark:hover:border-green-500 shadow-sm hover:shadow-lg transition-all cursor-pointer"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl group-hover:scale-110 transition-transform">
                <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-green-500 transition-colors" />
            </div>
            <div className="font-semibold text-lg text-slate-900 dark:text-white mb-1">Staking Tracker</div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Monitor staking rewards and tax implications
            </div>
          </a>
        </div>
      </div>
    </DashboardLayout>
  );
}
