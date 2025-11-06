"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";

interface Transaction {
  id: string;
  date: string;
  cryptocurrency: string;
  amount: number;
  priceEUR: number;
  type: string;
  exchange?: string;
  notes?: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [filterType, setFilterType] = useState<string>("");
  const [filterCrypto, setFilterCrypto] = useState<string>("");

  useEffect(() => {
    fetchTransactions();
  }, [filterType, filterCrypto]);

  const fetchTransactions = async () => {
    try {
      let url = "/api/transactions";
      const params = new URLSearchParams();
      if (filterType) params.append("type", filterType);
      if (filterCrypto) params.append("cryptocurrency", filterCrypto);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;

    try {
      const response = await fetch(`/api/transactions/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchTransactions();
      }
    } catch (error) {
      console.error("Failed to delete transaction:", error);
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case "buy":
        return "bg-blue-100 text-blue-800";
      case "sell":
        return "bg-red-100 text-red-800";
      case "staking":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-xl text-gray-600">Loading transactions...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Transactions</h1>
            <p className="text-gray-600">
              Manage your cryptocurrency transactions
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowImportModal(true)}
              className="btn-secondary"
            >
              📤 Import CSV
            </button>
            <button onClick={() => setShowAddModal(true)} className="btn-primary">
              ➕ Add Transaction
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="label">Filter by Type</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="input"
              >
                <option value="">All Types</option>
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
                <option value="staking">Staking</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="label">Filter by Cryptocurrency</label>
              <input
                type="text"
                value={filterCrypto}
                onChange={(e) => setFilterCrypto(e.target.value.toUpperCase())}
                placeholder="e.g., BTC, ETH"
                className="input"
              />
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        {transactions.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-5xl mb-4">📝</div>
            <h2 className="text-xl font-semibold mb-2">No Transactions Yet</h2>
            <p className="text-gray-600 mb-6">
              Add transactions manually or import from CSV
            </p>
            <div className="flex gap-3 justify-center">
              <button onClick={() => setShowImportModal(true)} className="btn-secondary">
                📤 Import CSV
              </button>
              <button onClick={() => setShowAddModal(true)} className="btn-primary">
                ➕ Add Transaction
              </button>
            </div>
          </div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Asset
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">
                    Amount
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">
                    Value (EUR)
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Exchange
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-4 px-4">{formatDate(tx.date)}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeColor(
                          tx.type
                        )}`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-4 px-4 font-semibold">
                      {tx.cryptocurrency}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {formatNumber(tx.amount)}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {formatCurrency(tx.priceEUR)}
                    </td>
                    <td className="py-4 px-4 text-gray-600">
                      {tx.exchange || "-"}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleDelete(tx.id)}
                        className="text-danger hover:underline text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <AddTransactionModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            fetchTransactions();
            setShowAddModal(false);
          }}
        />
      )}

      {/* Import CSV Modal */}
      {showImportModal && (
        <ImportCSVModal
          onClose={() => setShowImportModal(false)}
          onSuccess={() => {
            fetchTransactions();
            setShowImportModal(false);
          }}
        />
      )}
    </DashboardLayout>
  );
}

function AddTransactionModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    cryptocurrency: "",
    amount: "",
    priceEUR: "",
    type: "buy",
    exchange: "",
    notes: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          cryptocurrency: formData.cryptocurrency.toUpperCase(),
          amount: parseFloat(formData.amount),
          priceEUR: parseFloat(formData.priceEUR),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to add transaction");
      } else {
        onSuccess();
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Add Transaction</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-danger text-danger px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="label">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="input"
                required
              />
            </div>

            <div>
              <label className="label">Type</label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
                className="input"
                required
              >
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
                <option value="staking">Staking Reward</option>
              </select>
            </div>

            <div>
              <label className="label">Cryptocurrency</label>
              <input
                type="text"
                value={formData.cryptocurrency}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    cryptocurrency: e.target.value.toUpperCase(),
                  })
                }
                placeholder="e.g., BTC, ETH"
                className="input"
                required
              />
            </div>

            <div>
              <label className="label">Amount</label>
              <input
                type="number"
                step="any"
                value={formData.amount}
                onChange={(e) =>
                  setFormData({ ...formData, amount: e.target.value })
                }
                placeholder="0.00"
                className="input"
                required
              />
            </div>

            <div>
              <label className="label">Value in EUR</label>
              <input
                type="number"
                step="any"
                value={formData.priceEUR}
                onChange={(e) =>
                  setFormData({ ...formData, priceEUR: e.target.value })
                }
                placeholder="0.00"
                className="input"
                required
              />
            </div>

            <div>
              <label className="label">Exchange (optional)</label>
              <input
                type="text"
                value={formData.exchange}
                onChange={(e) =>
                  setFormData({ ...formData, exchange: e.target.value })
                }
                placeholder="e.g., Binance, Kraken"
                className="input"
              />
            </div>

            <div>
              <label className="label">Notes (optional)</label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Additional information"
                className="input"
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary flex-1" disabled={loading}>
                {loading ? "Adding..." : "Add Transaction"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function ImportCSVModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCsvFile(e.target.files[0]);
      setError("");
      setSuccess("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvFile) {
      setError("Please select a CSV file");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const csvData = await csvFile.text();

      const response = await fetch("/api/transactions/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvData }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to import CSV");
      } else {
        setSuccess(data.message);
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Import CSV</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-danger text-danger px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-success text-success px-4 py-3 rounded-lg text-sm">
                {success}
              </div>
            )}

            <div>
              <label className="label">Supported Exchanges</label>
              <div className="text-sm text-gray-600 mb-4">
                Bitpanda, 21Bitcoin, Kraken, Binance, Coinbase, Bitstamp
              </div>

              <label className="label">CSV File</label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="input"
                required
              />
              {csvFile && (
                <p className="text-sm text-gray-600 mt-2">
                  Selected: {csvFile.name}
                </p>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 px-4 py-3 rounded-lg text-sm">
              <div className="font-semibold mb-1">📝 Note</div>
              <div className="text-gray-700">
                The exchange format will be automatically detected. Make sure your CSV
                file follows the standard export format from your exchange.
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary flex-1" disabled={loading}>
                {loading ? "Importing..." : "Import"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
