export interface ParsedTransaction {
  date: Date;
  cryptocurrency: string;
  amount: number;
  priceEUR: number;
  type: "buy" | "sell" | "staking";
  exchange: string;
  notes?: string;
}

export interface CSVParser {
  name: string;
  parse: (csvData: string) => Promise<ParsedTransaction[]>;
  validateHeaders: (headers: string[]) => boolean;
}
