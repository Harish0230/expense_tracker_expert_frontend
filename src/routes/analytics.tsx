import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { motion } from "framer-motion";
import { Activity, TrendingUp, Sparkles, Flame } from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip as RTooltip,
  CartesianGrid, AreaChart, Area, BarChart, Bar,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnalytics } from "@/lib/hooks/useAnalytics";
import { useTransactions } from "@/lib/hooks/useTransactions";
import { INR, INRCompact } from "@/lib/format";
import { EmptyState } from "@/components/EmptyState";

export const Route = createFileRoute("/analytics")({
  head: () => ({ meta: [{ title: "Analytics — SpendWise AI" }] }),
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { data: analytics, isLoading } = useAnalytics(12);
  const { data: transactions = [] } = useTransactions();

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Spending heatmap — current month
  const heatmap = useMemo(() => {
    const arr = Array.from({ length: daysInMonth }, (_, i) => {
      const d = new Date(year, month, i + 1).toISOString().slice(0, 10);
      const total = transactions
        .filter((t) => t.type === "expense" && t.date.slice(0, 10) === d)
        .reduce((s, t) => s + t.amount, 0);
      return { day: i + 1, total, date: d };
    });
    const max = Math.max(1, ...arr.map((a) => a.total));
    return arr.map((a) => ({ ...a, intensity: a.total / max }));
  }, [transactions, daysInMonth, year, month]);

  // Health score based on server analytics
  const score = useMemo(() => {
    if (!analytics) return 0;
    const trends = analytics.monthlyTrends ?? [];
    const totalIncome = trends.reduce((s, t) => s + t.income, 0);
    const totalExpense = trends.reduce((s, t) => s + t.expense, 0);
    if (totalIncome === 0) return 0;
    const savingsRate = Math.max(0, (totalIncome - totalExpense) / totalIncome);
    const consistency = Math.min(1, transactions.length / 30);
    return Math.round(savingsRate * 70 + consistency * 30);
  }, [analytics, transactions]);

  const grade = score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Average" : "Poor";
  const gradeColor = score >= 80 ? "text-success" : score >= 60 ? "text-primary" : score >= 40 ? "text-warning" : "text-destructive";

  // Build charts from analytics data
  const incomeGrowth = useMemo(() => {
    return (analytics?.monthlyTrends ?? []).map((t) => ({
      label: new Date(t.month + "-01").toLocaleDateString("en-IN", { month: "short" }),
      Income: t.income,
    }));
  }, [analytics]);

  const topCats = useMemo(() => {
    return Object.entries(analytics?.expenseByCategory ?? {})
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [analytics]);

  // Forecast from monthly trends
  const forecast = useMemo(() => {
    const trends = analytics?.monthlyTrends ?? [];
    const past = trends.slice(-6).map((t) => ({
      label: new Date(t.month + "-01").toLocaleDateString("en-IN", { month: "short" }),
      Expense: t.expense,
      Forecast: null as number | null,
    }));
    const avg = past.reduce((s, p) => s + p.Expense, 0) / Math.max(1, past.length);
    const future = Array.from({ length: 3 }, (_, i) => {
      const d = new Date(year, month + i + 1, 1);
      return { label: d.toLocaleDateString("en-IN", { month: "short" }), Expense: null as any, Forecast: avg * (1 + i * 0.02) };
    });
    return [...past, ...future];
  }, [analytics, year, month]);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-[1600px] mx-auto">
        <Skeleton className="h-12 w-40" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Skeleton className="h-64 lg:col-span-2" />
          <Skeleton className="h-64" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-80" /><Skeleton className="h-80" />
        </div>
        <Skeleton className="h-72" />
      </div>
    );
  }

  if (transactions.length === 0) {
    return <EmptyState icon={Activity} title="Analytics will appear here"
      description="As you log income and expenses, SpendWise AI surfaces insights, forecasts, and your financial health score." />;
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">Deep insights into your spending patterns.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-6 glass border-0 lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="w-5 h-5 text-warning" />
            <h2 className="font-semibold">Spending Heatmap — {now.toLocaleDateString("en-IN", { month: "long", year: "numeric" })}</h2>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {heatmap.map((d) => (
              <motion.div key={d.day} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: d.day * 0.01 }}
                title={`${new Date(d.date).toLocaleDateString("en-IN")} — ${INR(d.total)}`}
                className="aspect-square rounded-lg flex flex-col items-center justify-center text-xs"
                style={{
                  background: d.total > 0 ? `oklch(0.55 0.22 275 / ${0.15 + d.intensity * 0.75})` : "var(--color-muted)",
                  color: d.intensity > 0.5 ? "white" : "var(--color-muted-foreground)",
                }}>
                <span className="font-semibold">{d.day}</span>
                {d.total > 0 && <span className="text-[9px] opacity-80">{INRCompact(d.total)}</span>}
              </motion.div>
            ))}
          </div>
        </Card>

        <Card className="p-6 glass border-0 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 gradient-mesh opacity-50" />
          <div className="relative z-10 text-center">
            <Sparkles className="w-6 h-6 mx-auto mb-2 text-primary" />
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Financial Health Score</div>
            <div className={`text-6xl font-bold ${gradeColor} my-2`}>{score}</div>
            <div className={`text-lg font-semibold ${gradeColor}`}>{grade}</div>
            <div className="text-xs text-muted-foreground mt-2">Based on savings rate & activity</div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="p-5 glass border-0">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-success" />
            <h3 className="font-semibold">Income Growth (12 months)</h3>
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={incomeGrowth}>
              <defs>
                <linearGradient id="incomeArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-chart-2)" stopOpacity={0.7} />
                  <stop offset="100%" stopColor="var(--color-chart-2)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="label" stroke="var(--color-muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickFormatter={(v) => INRCompact(v)} />
              <RTooltip formatter={(v: number) => INR(v)} contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
              <Area type="monotone" dataKey="Income" stroke="var(--color-chart-2)" strokeWidth={2} fill="url(#incomeArea)" />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5 glass border-0">
          <h3 className="font-semibold mb-4">Top Categories (All time)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topCats} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" horizontal={false} />
              <XAxis type="number" stroke="var(--color-muted-foreground)" fontSize={11} tickFormatter={(v) => INRCompact(v)} />
              <YAxis type="category" dataKey="name" stroke="var(--color-muted-foreground)" fontSize={11} width={80} />
              <RTooltip formatter={(v: number) => INR(v)} contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
              <Bar dataKey="value" radius={[0, 8, 8, 0]} fill="var(--color-chart-1)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <Card className="p-5 glass border-0">
        <h3 className="font-semibold mb-4">Expense Forecast (next 3 months)</h3>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={forecast}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
            <XAxis dataKey="label" stroke="var(--color-muted-foreground)" fontSize={11} />
            <YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickFormatter={(v) => INRCompact(v)} />
            <RTooltip formatter={(v: number) => INR(v || 0)} contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 12 }} />
            <Line type="monotone" dataKey="Expense" stroke="var(--color-chart-1)" strokeWidth={3} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="Forecast" stroke="var(--color-chart-3)" strokeWidth={2} strokeDasharray="6 4" dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
