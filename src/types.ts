export interface FinancialEntry {
  id: string;
  date: string;
  income: number;
  expenses: number;
  remarks: string;
}

export interface MonthlyData {
  month: string;
  totalIncome: number;
  totalExpenses: number;
  netProfitLoss: number;
}
