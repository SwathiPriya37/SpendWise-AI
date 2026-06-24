export interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  month: number; // 1-12
  year: number;
}
