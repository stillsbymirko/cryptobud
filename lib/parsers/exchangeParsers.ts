import Papa from "papaparse";
import { ParsedTransaction, CSVParser } from "./types";

// Bitpanda Parser
export const bitpandaParser: CSVParser = {
  name: "Bitpanda",
  validateHeaders: (headers: string[]) => {
    const requiredHeaders = ["Transaction ID", "Timestamp", "Transaction Type", "Asset", "Amount Asset", "Amount EUR"];
    return requiredHeaders.every(header => 
      headers.some(h => h.toLowerCase().includes(header.toLowerCase()))
    );
  },
  parse: async (csvData: string): Promise<ParsedTransaction[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const transactions: ParsedTransaction[] = results.data
              .map((row: any) => {
                const type = row["Transaction Type"]?.toLowerCase() || "";
                let txType: "buy" | "sell" | "staking" = "buy";
                
                if (type.includes("buy") || type.includes("deposit")) {
                  txType = "buy";
                } else if (type.includes("sell") || type.includes("withdrawal")) {
                  txType = "sell";
                } else if (type.includes("reward") || type.includes("staking")) {
                  txType = "staking";
                }

                return {
                  date: new Date(row["Timestamp"]),
                  cryptocurrency: row["Asset"]?.toUpperCase() || "",
                  amount: parseFloat(row["Amount Asset"]) || 0,
                  priceEUR: Math.abs(parseFloat(row["Amount EUR"]) || 0),
                  type: txType,
                  exchange: "Bitpanda",
                  notes: row["Transaction ID"] || "",
                };
              })
              .filter((tx) => tx.cryptocurrency && tx.amount > 0);

            resolve(transactions);
          } catch (error) {
            reject(error);
          }
        },
        error: (error: Error) => reject(error),
      });
    });
  },
};

// 21Bitcoin Parser
export const bitcoin21Parser: CSVParser = {
  name: "21Bitcoin",
  validateHeaders: (headers: string[]) => {
    const requiredHeaders = ["date", "type", "asset", "amount", "value_eur"];
    return requiredHeaders.every(header => 
      headers.some(h => h.toLowerCase() === header)
    );
  },
  parse: async (csvData: string): Promise<ParsedTransaction[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const transactions: ParsedTransaction[] = results.data
              .map((row: any) => {
                const type = row["type"]?.toLowerCase() || "";
                let txType: "buy" | "sell" | "staking" = "buy";
                
                if (type.includes("buy") || type.includes("purchase")) {
                  txType = "buy";
                } else if (type.includes("sell")) {
                  txType = "sell";
                } else if (type.includes("reward") || type.includes("staking")) {
                  txType = "staking";
                }

                return {
                  date: new Date(row["date"]),
                  cryptocurrency: row["asset"]?.toUpperCase() || "",
                  amount: parseFloat(row["amount"]) || 0,
                  priceEUR: Math.abs(parseFloat(row["value_eur"]) || 0),
                  type: txType,
                  exchange: "21Bitcoin",
                };
              })
              .filter((tx) => tx.cryptocurrency && tx.amount > 0);

            resolve(transactions);
          } catch (error) {
            reject(error);
          }
        },
        error: (error: Error) => reject(error),
      });
    });
  },
};

// Kraken Parser
export const krakenParser: CSVParser = {
  name: "Kraken",
  validateHeaders: (headers: string[]) => {
    const requiredHeaders = ["time", "type", "asset", "amount", "fee"];
    return requiredHeaders.every(header => 
      headers.some(h => h.toLowerCase().includes(header.toLowerCase()))
    );
  },
  parse: async (csvData: string): Promise<ParsedTransaction[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const transactions: ParsedTransaction[] = results.data
              .map((row: any) => {
                const type = row["type"]?.toLowerCase() || "";
                let txType: "buy" | "sell" | "staking" = "buy";
                
                if (type.includes("buy") || type.includes("deposit")) {
                  txType = "buy";
                } else if (type.includes("sell") || type.includes("withdrawal")) {
                  txType = "sell";
                } else if (type.includes("staking") || type.includes("reward")) {
                  txType = "staking";
                }

                const amount = parseFloat(row["amount"]) || 0;
                const fee = parseFloat(row["fee"]) || 0;
                const totalCost = parseFloat(row["cost"]) || 0;

                return {
                  date: new Date(row["time"]),
                  cryptocurrency: row["asset"]?.toUpperCase() || "",
                  amount: Math.abs(amount),
                  priceEUR: totalCost + fee,
                  type: txType,
                  exchange: "Kraken",
                };
              })
              .filter((tx) => tx.cryptocurrency && tx.amount > 0);

            resolve(transactions);
          } catch (error) {
            reject(error);
          }
        },
        error: (error: Error) => reject(error),
      });
    });
  },
};

// Binance Parser
export const binanceParser: CSVParser = {
  name: "Binance",
  validateHeaders: (headers: string[]) => {
    const requiredHeaders = ["Date(UTC)", "Coin", "Amount", "Operation"];
    return requiredHeaders.every(header => 
      headers.some(h => h.includes(header))
    );
  },
  parse: async (csvData: string): Promise<ParsedTransaction[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const transactions: ParsedTransaction[] = results.data
              .map((row: any) => {
                const operation = row["Operation"]?.toLowerCase() || "";
                let txType: "buy" | "sell" | "staking" = "buy";
                
                if (operation.includes("buy") || operation.includes("deposit")) {
                  txType = "buy";
                } else if (operation.includes("sell") || operation.includes("withdrawal")) {
                  txType = "sell";
                } else if (operation.includes("staking") || operation.includes("reward") || operation.includes("distribution")) {
                  txType = "staking";
                }

                const amount = parseFloat(row["Amount"]) || 0;
                const price = parseFloat(row["Price"]) || 0;

                return {
                  date: new Date(row["Date(UTC)"]),
                  cryptocurrency: row["Coin"]?.toUpperCase() || "",
                  amount: Math.abs(amount),
                  priceEUR: Math.abs(amount * price),
                  type: txType,
                  exchange: "Binance",
                };
              })
              .filter((tx) => tx.cryptocurrency && tx.amount > 0);

            resolve(transactions);
          } catch (error) {
            reject(error);
          }
        },
        error: (error: Error) => reject(error),
      });
    });
  },
};

// Coinbase Parser
export const coinbaseParser: CSVParser = {
  name: "Coinbase",
  validateHeaders: (headers: string[]) => {
    const requiredHeaders = ["Timestamp", "Transaction Type", "Asset", "Quantity Transacted", "Spot Price at Transaction"];
    return requiredHeaders.every(header => 
      headers.some(h => h.includes(header))
    );
  },
  parse: async (csvData: string): Promise<ParsedTransaction[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const transactions: ParsedTransaction[] = results.data
              .map((row: any) => {
                const type = row["Transaction Type"]?.toLowerCase() || "";
                let txType: "buy" | "sell" | "staking" = "buy";
                
                if (type.includes("buy") || type.includes("receive")) {
                  txType = "buy";
                } else if (type.includes("sell") || type.includes("send")) {
                  txType = "sell";
                } else if (type.includes("staking") || type.includes("reward") || type.includes("interest")) {
                  txType = "staking";
                }

                const amount = parseFloat(row["Quantity Transacted"]) || 0;
                const spotPrice = parseFloat(row["Spot Price at Transaction"]) || 0;

                return {
                  date: new Date(row["Timestamp"]),
                  cryptocurrency: row["Asset"]?.toUpperCase() || "",
                  amount: Math.abs(amount),
                  priceEUR: Math.abs(amount * spotPrice),
                  type: txType,
                  exchange: "Coinbase",
                };
              })
              .filter((tx) => tx.cryptocurrency && tx.amount > 0);

            resolve(transactions);
          } catch (error) {
            reject(error);
          }
        },
        error: (error: Error) => reject(error),
      });
    });
  },
};

// Bitstamp Parser
export const bitstampParser: CSVParser = {
  name: "Bitstamp",
  validateHeaders: (headers: string[]) => {
    const requiredHeaders = ["Datetime", "Type", "Amount", "Value"];
    return requiredHeaders.every(header => 
      headers.some(h => h.toLowerCase().includes(header.toLowerCase()))
    );
  },
  parse: async (csvData: string): Promise<ParsedTransaction[]> => {
    return new Promise((resolve, reject) => {
      Papa.parse(csvData, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const transactions: ParsedTransaction[] = results.data
              .map((row: any) => {
                const type = row["Type"]?.toLowerCase() || "";
                let txType: "buy" | "sell" | "staking" = "buy";
                
                if (type.includes("buy") || type.includes("deposit")) {
                  txType = "buy";
                } else if (type.includes("sell") || type.includes("withdrawal")) {
                  txType = "sell";
                } else if (type.includes("staking") || type.includes("reward")) {
                  txType = "staking";
                }

                // Extract cryptocurrency from sub type (e.g., "BTC/EUR")
                const subType = row["Sub Type"] || "";
                const crypto = subType.split("/")[0]?.toUpperCase() || "BTC";

                return {
                  date: new Date(row["Datetime"]),
                  cryptocurrency: crypto,
                  amount: Math.abs(parseFloat(row["Amount"]) || 0),
                  priceEUR: Math.abs(parseFloat(row["Value"]) || 0),
                  type: txType,
                  exchange: "Bitstamp",
                };
              })
              .filter((tx) => tx.cryptocurrency && tx.amount > 0);

            resolve(transactions);
          } catch (error) {
            reject(error);
          }
        },
        error: (error: Error) => reject(error),
      });
    });
  },
};

export const parsers: CSVParser[] = [
  bitpandaParser,
  bitcoin21Parser,
  krakenParser,
  binanceParser,
  coinbaseParser,
  bitstampParser,
];

export async function detectParser(csvData: string): Promise<CSVParser | null> {
  return new Promise((resolve) => {
    Papa.parse(csvData, {
      header: true,
      preview: 1,
      complete: (results) => {
        const headers = results.meta.fields || [];
        const parser = parsers.find((p) => p.validateHeaders(headers));
        resolve(parser || null);
      },
      error: () => resolve(null),
    });
  });
}
