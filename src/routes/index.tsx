import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowDownRight, ArrowUpRight, Plus, Sparkles, Target,
  TrendingDown, TrendingUp, Wallet, AlertTriangle, Receipt,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as RTooltip, ResponsiveContainer,
  CartesianGrid, LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthStore, monthKey } from "@/lib/store";
import { INR, INRCompact } from "@/lib/format";
import { AnimatedCounter } from "@/components/AnimatedCounter";
import { EmptyState } from "@/components/EmptyState";
import { TransactionDialog } from "@/components/TransactionDialog";
import { useDashboard } from "@/lib/hooks/useDashboard";
import { useTransactions } from "@/lib/hooks/useTransactions";
import { useCategories } from "@/lib/hooks/useCategories";
import { useBudget } from "@/lib/hooks/useBudget";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Dashboard — SpendWise AI" }] }),
  component: Dashboard,
});

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
}

function Dashboard() {
  const user = useAuthStore((s) => s.user);
  const [open, setOpen] = useState(false);
  const [range, setRange] = useState<"weekly" | "monthly" | "yearly">("monthly");
  const now = new Date();

  const { data: dashboard, isLoading: dashLoading } = useDashboard();
  const { data: transactions = [] } = useTransactions();
  const { data: categories = [] } = useCategories();
  const { data: budget } = useBudget();

  const budgetPct = dashboard?.monthlyBudgetUsedPercent ?? 0;
  const expenseLimit = budget?.expenseLimit ?? 0;
  const totalExpense = dashboard?.totalExpense ?? 0;

  // Build chart data from raw transactions (so charts reflect current filter)
  const chartData = useMemo(() => {
    if (range === "weekly") {
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const key = d.toISOString().slice(0, 10);
        const dayTx = transactions.filter((t) => t.date.slice(0, 10) === key);
        return {
          label: d.toLocaleDateString("en-IN", { weekday: "short" }),
          Income: dayTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
          Expense: dayTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
        };
      });
    }
    if (range === "yearly") {
      return Array.from({ length: 12 }, (_, i) => {
        const d = new Date(now.getFullYear(), i, 1);
        const k = monthKey(d);
        const mTx = transactions.filter((t) => monthKey(t.date) === k);
        return {
          label: d.toLocaleDateString("en-IN", { month: "short" }),
          Income: mTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
          Expense: mTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
        };
      });
    }
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const k = monthKey(d);
      const mTx = transactions.filter((t) => monthKey(t.date) === k);
      return {
        label: d.toLocaleDateString("en-IN", { month: "short" }),
        Income: mTx.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
        Expense: mTx.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
      };
    });
  }, [transactions, range]);

  const trendData = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      const key = d.toISOString().slice(0, 10);
      const spend = transactions
        .filter((t) => t.type === "expense" && t.date.slice(0, 10) === key)
        .reduce((s, t) => s + t.amount, 0);
      return { label: d.getDate().toString(), Spend: spend };
    });
  }, [transactions]);

  const pieData = useMemo(() => {
    if (!dashboard?.expenseByCategory) return [];
    return Object.entries(dashboard.expenseByCategory).map(([name, value]) => {
      const c = categories.find((x) => x.name === name);
      return { name, value, color: c?.color || "#64748b" };
    });
  }, [dashboard, categories]);

  const recent = dashboard?.recentTransactions ?? [];
  const hasData = transactions.length > 0;

  if (dashLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-36" />)}
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-1">
            {now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
            {greeting()}{user?.name ? `, ${user.name.split(" ")[0]}` : ""} <span className="text-gradient">👋</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's your {now.toLocaleDateString("en-IN", { month: "long" })} financial snapshot.
          </p>
        </div>
        <Button size="lg" onClick={() => setOpen(true)} className="gradient-primary text-primary-foreground shadow-glow border-0 self-start md:self-auto">
          <Plus className="w-4 h-4 mr-2" /> Add Transaction
        </Button>
      </motion.div>

      {/* Budget alerts */}
      {expenseLimit > 0 && budgetPct >= 100 && (
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl p-5 border border-destructive/40 bg-destructive/10 flex items-start gap-3" role="alert">
          <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
          <div>
            <div className="font-semibold text-destructive">⚠ Monthly Budget Exceeded</div>
            <div className="text-sm text-foreground/80">You've gone over your monthly limit by {INR(totalExpense - expenseLimit)}.</div>
          </div>
        </motion.div>
      )}
      {expenseLimit > 0 && budgetPct >= 80 && budgetPct < 100 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="rounded-2xl p-5 border border-warning/40 bg-warning/10 flex items-start gap-3" role="alert">
          <AlertTriangle className="w-5 h-5 text-warning mt-0.5 shrink-0" />
          <div>
            <div className="font-semibold">⚠ You've used {budgetPct.toFixed(0)}% of your monthly budget.</div>
            <div className="text-sm text-muted-foreground">Slow down to stay on track.</div>
          </div>
        </motion.div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KPICard label="Total Income" value={dashboard?.totalIncome ?? 0} icon={ArrowDownRight} gradient="gradient-emerald" />
        <KPICard label="Total Expense" value={dashboard?.totalExpense ?? 0} icon={ArrowUpRight} gradient="gradient-warm" />
        <KPICard label="Remaining Balance" value={dashboard?.balance ?? 0} icon={Wallet} gradient="gradient-primary" />
        <BudgetKPICard spent={totalExpense} limit={expenseLimit} pct={budgetPct} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="p-5 glass border-0 xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg">Income vs Expense</h3>
              <p className="text-xs text-muted-foreground">Track your money flow</p>
            </div>
            <Tabs value={range} onValueChange={(v) => setRange(v as any)}>
              <TabsList>
                <TabsTrigger value="weekly">Week</TabsTrigger>
                <TabsTrigger value="monthly">Month</TabsTrigger>
                <TabsTrigger value="yearly">Year</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          {hasData ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <defs>
                  <linearGradient id="bIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={1} />
                    <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0.4} />
                  </linearGradient>
                  <linearGradient id="bExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={1} />
                    <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0.4} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="label" stroke="var(--color-muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={12} tickFormatter={(v) => INRCompact(v)} />
                <RTooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12 }} formatter={(v: number) => INR(v)} />
                <Legend />
                <Bar dataKey="Income" fill="url(#bIncome)" radius={[8,8,0,0]} />
                <Bar dataKey="Expense" fill="url(#bExpense)" radius={[8,8,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] grid place-items-center text-sm text-muted-foreground">Add transactions to see your flow chart.</div>
          )}
        </Card>

        <Card className="p-5 glass border-0">
          <h3 className="font-semibold text-lg mb-1">Expense Distribution</h3>
          <p className="text-xs text-muted-foreground mb-4">This month by category</p>
          {pieData.length ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} dataKey="value" innerRadius={60} outerRadius={100} paddingAngle={2}>
                  {pieData.map((d, i) => <Cell key={i} fill={d.color} />)}
                </Pie>
                <RTooltip formatter={(v: number) => INR(v)} contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] grid place-items-center text-sm text-muted-foreground text-center px-4">
              Log an expense to unlock your spending breakdown.
            </div>
          )}
        </Card>
      </div>

      {/* Trend + Recent */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <Card className="p-5 glass border-0 xl:col-span-2">
          <h3 className="font-semibold text-lg mb-1">30-Day Spending Trend</h3>
          <p className="text-xs text-muted-foreground mb-4">Daily expense over the past month</p>
          {hasData ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={trendData}>
                <defs>
                  <linearGradient id="lineSpend" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="var(--color-chart-1)" />
                    <stop offset="100%" stopColor="var(--color-chart-3)" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="label" stroke="var(--color-muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickFormatter={(v) => INRCompact(v)} />
                <RTooltip formatter={(v: number) => INR(v)} contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
                <Line type="monotone" dataKey="Spend" stroke="url(#lineSpend)" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[240px] grid place-items-center text-sm text-muted-foreground">No data yet — start tracking to see trends.</div>
          )}
        </Card>

        <Card className="p-5 glass border-0">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Recent Transactions</h3>
            <Link to="/transactions" className="text-xs text-primary font-medium hover:underline">View all</Link>
          </div>
          {recent.length === 0 ? (
            <div className="text-sm text-muted-foreground text-center py-10">
              <Receipt className="w-8 h-8 mx-auto mb-2 opacity-50" />
              No transactions yet
            </div>
          ) : (
            <div className="space-y-3">
              {recent.map((t) => {
                const c = categories.find((x) => x.name === t.categoryName);
                return (
                  <div key={t.id} className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl grid place-items-center shrink-0" style={{ background: `${c?.color || "#64748b"}22`, color: c?.color || "#64748b" }}>
                      {t.type === "income" ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{t.title}</div>
                      <div className="text-xs text-muted-foreground">{t.categoryName}</div>
                    </div>
                    <div className={`text-sm font-semibold ${t.type === "income" ? "text-success" : "text-destructive"}`}>
                      {t.type === "income" ? "+" : "-"}{INR(t.amount)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      {!hasData && (
        <EmptyState icon={Sparkles} title="Welcome to SpendWise AI"
          description="Start tracking your expenses and income to unlock personalized insights, budgets, and goals."
          actionLabel="Add your first transaction" onAction={() => setOpen(true)} />
      )}

      <TransactionDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}

function KPICard({ label, value, icon: Icon, gradient }: { label: string; value: number; icon: any; gradient: string }) {
  return (
    <motion.div whileHover={{ y: -3 }} transition={{ type: "spring", stiffness: 300 }}>
      <Card className="p-5 glass border-0 overflow-hidden relative">
        <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${gradient} opacity-20 blur-2xl`} />
        <div className={`w-10 h-10 rounded-xl ${gradient} grid place-items-center shadow-soft mb-4`}>
          <Icon className="w-5 h-5 text-primary-foreground" />
        </div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
        <div className="text-2xl md:text-3xl font-bold tracking-tight">
          <AnimatedCounter value={value} formatter={INR} />
        </div>
      </Card>
    </motion.div>
  );
}

function BudgetKPICard({ spent, limit, pct }: { spent: number; limit: number; pct: number }) {
  const over = limit > 0 && spent > limit;
  return (
    <motion.div whileHover={{ y: -3 }} transition={{ type: "spring", stiffness: 300 }}>
      <Card className="p-5 glass border-0 overflow-hidden relative">
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 rounded-xl gradient-emerald grid place-items-center shadow-soft">
            <Target className="w-5 h-5 text-primary-foreground" />
          </div>
          <Badge variant="outline" className={over ? "border-destructive/40 text-destructive bg-destructive/10" : "border-primary/30 text-primary bg-primary/10"}>
            {pct.toFixed(0)}%
          </Badge>
        </div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Monthly Budget</div>
        {limit > 0 ? (
          <>
            <div className="text-2xl font-bold tracking-tight mb-2">
              <AnimatedCounter value={spent} formatter={INR} /> <span className="text-sm font-normal text-muted-foreground">/ {INR(limit)}</span>
            </div>
            <Progress value={Math.min(100, pct)} className="h-2" />
          </>
        ) : (
          <Link to="/budget" className="text-sm text-primary font-medium hover:underline">Set a monthly target →</Link>
        )}
      </Card>
    </motion.div>
  );
}
