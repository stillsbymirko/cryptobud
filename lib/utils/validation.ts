import { z } from "zod";

export const signUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
});

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const transactionSchema = z.object({
  date: z.string().or(z.date()),
  cryptocurrency: z.string().min(1, "Cryptocurrency is required"),
  amount: z.number().positive("Amount must be positive"),
  priceEUR: z.number().nonnegative("Price must be non-negative"),
  type: z.enum(["buy", "sell", "staking"], {
    errorMap: () => ({ message: "Type must be buy, sell, or staking" }),
  }),
  exchange: z.string().optional(),
  notes: z.string().optional(),
});

export const updateTransactionSchema = transactionSchema.partial();

export const csvImportSchema = z.object({
  csvData: z.string().min(1, "CSV data is required"),
  exchange: z.string().optional(),
});

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type TransactionInput = z.infer<typeof transactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type CSVImportInput = z.infer<typeof csvImportSchema>;
