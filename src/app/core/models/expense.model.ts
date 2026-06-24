export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string; // ISO String for easier storage
  notes?: string;
}
