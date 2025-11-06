"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";

interface PortfolioItem {
  id: string;
  cryptocurrency: string;
  totalAmount: number;
  averageBuyPrice: number;
  currentPrice: number;
  currentValue: number;
  costBasis: number;
  gain: number;
  gainPercentage: number;
}

export default function PortfolioPage() {
  const [portfolios, setPortfolios] = useState<PortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      setRefreshing(true);
      const response = await fetch("/api/portfolio");
      if (response.ok) {
        const data = await response.json();
        setPortfolios(data.portfolios || []);
      }
    } catch (error) {
      console.error("Failed to fetch portfolio:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-xl text-gray-600">Loading portfolio...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Portfolio</h1>
            <p className="text-gray-600">
              Your cryptocurrency holdings with real-time valuations
            </p>
          </div>
          <button
            onClick={fetchPortfolio}
            disabled={refreshing}
            className="btn-primary"
          >
            {refreshing ? "Refreshing..." : "🔄 Refresh Prices"}
          </button>
        </div>

        {portfolios.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-5xl mb-4">📊</div>
            <h2 className="text-xl font-semibold mb-2">No Holdings Yet</h2>
            <p className="text-gray-600 mb-6">
              Start by adding transactions to build your portfolio
            </p>
            <a href="/transactions" className="btn-primary inline-block">
              Add Transactions
            </a>
          </div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Asset
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">
                    Amount
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">
                    Avg. Buy Price
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">
                    Current Price
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">
                    Cost Basis
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">
                    Current Value
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">
                    P&L
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">
                    P&L %
                  </th>
                </tr>
              </thead>
              <tbody>
                {portfolios.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-4 px-4">
                      <div className="font-semibold">{item.cryptocurrency}</div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      {formatNumber(item.totalAmount)}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {formatCurrency(item.averageBuyPrice)}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {formatCurrency(item.currentPrice)}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {formatCurrency(item.costBasis)}
                    </td>
                    <td className="py-4 px-4 text-right font-semibold">
                      {formatCurrency(item.currentValue)}
                    </td>
                    <td
                      className={`py-4 px-4 text-right font-semibold ${
                        item.gain >= 0 ? "text-success" : "text-danger"
                      }`}
                    >
                      {formatCurrency(item.gain)}
                    </td>
                    <td
                      className={`py-4 px-4 text-right font-semibold ${
                        item.gainPercentage >= 0 ? "text-success" : "text-danger"
                      }`}
                    >
                      {formatPercentage(item.gainPercentage)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
