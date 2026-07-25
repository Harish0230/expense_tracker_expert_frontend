// ─── Backend response types ──────────────────────────────────────────────────

export type TxnType = "income" | "expense";
export type CategoryType = "income" | "expense" | "both";
export type NotificationType = "info" | "warning" | "danger" | "success";

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string;
  theme: string;
  dateFormat: string;
  notifyBudget: boolean;
  notifyGoals: boolean;
  notifyMonthly: boolean;
}

export interface Transaction {
  id: number;
  title: string;
  amount: number;
  type: TxnType;
  categoryId: number;
  categoryName: string;
  notes?: string;
  date: string;       // "YYYY-MM-DD"
  createdAt: string;
}

export interface Category {
  id: number;
  name: string;
  icon: string;
  color: string;
  type: CategoryType;
}

export interface Goal {
  id: number;
  name: string;
  target: number;
  saved: number;
  deadline: string;
  createdAt: string;
}

export interface BudgetAllocationItem {
  categoryId: number;
  percent: number;
}

export interface Budget {
  incomeTarget: number;
  expenseLimit: number;
  savingsGoal: number;
  allocations: BudgetAllocationItem[];
}

export interface Notification {
  id: number;
  title: string;
  body: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
}

export interface DashboardData {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  savingsRate: number;
  expenseByCategory: Record<string, number>;
  recentTransactions: Transaction[];
  monthlyBudgetUsedPercent: number;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expense: number;
}

export interface AnalyticsData {
  monthlyTrends: MonthlyTrend[];
  expenseByCategory: Record<string, number>;
  incomeByCategory: Record<string, number>;
  averageDailySpend: number;
  highestExpense: number;
  topCategory: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  user: UserProfile;
}
