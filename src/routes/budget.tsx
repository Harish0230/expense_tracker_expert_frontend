import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PiggyBank, Target, Wallet, Save } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Skeleton } from "@/components/ui/skeleton";
import { useBudget, useUpdateBudget } from "@/lib/hooks/useBudget";
import { useCategories } from "@/lib/hooks/useCategories";
import { useTransactions } from "@/lib/hooks/useTransactions";
import { monthKey } from "@/lib/store";
import { INR } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/budget")({
  head: () => ({ meta: [{ title: "Budget Planner — SpendWise AI" }] }),
  component: BudgetPage,
});

function BudgetPage() {
  const { data: budget, isLoading: budgetLoading } = useBudget();
  const { data: categories = [] } = useCategories();
  const { data: transactions = [] } = useTransactions();
  const updateMutation = useUpdateBudget();

  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [savings, setSavings] = useState(0);
  const [allocs, setAllocs] = useState<Record<number, number>>({});

  // Sync local state when budget loads
  useEffect(() => {
    if (budget) {
      setIncome(budget.incomeTarget ?? 0);
      setExpense(budget.expenseLimit ?? 0);
      setSavings(budget.savingsGoal ?? 0);
      const m: Record<number, number> = {};
      (budget.allocations ?? []).forEach((a) => { m[a.categoryId] = a.percent; });
      setAllocs(m);
    }
  }, [budget]);

  const expenseCats = categories.filter((c) => c.type === "expense" || c.type === "both");
  const totalAlloc = Object.values(allocs).reduce((s, v) => s + v, 0);

  const thisMonth = monthKey(new Date());
  const monthExpenses = useMemo(() => {
    const m: Record<number, number> = {};
    transactions
      .filter((t) => t.type === "expense" && monthKey(t.date) === thisMonth)
      .forEach((t) => (m[t.categoryId] = (m[t.categoryId] || 0) + t.amount));
    return m;
  }, [transactions, thisMonth]);

  const save = () => {
    updateMutation.mutate({
      incomeTarget: income,
      expenseLimit: expense,
      savingsGoal: savings,
      allocations: Object.entries(allocs)
        .filter(([, p]) => p > 0)
        .map(([categoryId, percent]) => ({ categoryId: Number(categoryId), percent })),
    }, {
      onSuccess: () => toast.success("Budget plan saved"),
      onError: () => toast.error("Failed to save budget"),
    });
  };

  if (budgetLoading) {
    return (
      <div className="space-y-6 max-w-[1400px] mx-auto">
        <Skeleton className="h-12 w-56" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1,2,3].map(i => <Skeleton key={i} className="h-36" />)}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Budget Planner</h1>
        <p className="text-muted-foreground">Define monthly targets and allocate your spending mindfully.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <BudgetField label="Monthly Income Target" value={income} onChange={setIncome} icon={Wallet} gradient="gradient-emerald" />
        <BudgetField label="Monthly Expense Limit" value={expense} onChange={setExpense} icon={Target} gradient="gradient-warm" />
        <BudgetField label="Monthly Savings Goal" value={savings} onChange={setSavings} icon={PiggyBank} gradient="gradient-primary" />
      </div>

      <Card className="p-6 glass border-0">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold">Budget Allocation</h2>
            <p className="text-sm text-muted-foreground">Distribute your expense budget across categories.</p>
          </div>
          <div className={`text-sm font-semibold ${totalAlloc > 100 ? "text-destructive" : totalAlloc === 100 ? "text-success" : "text-muted-foreground"}`}>
            {totalAlloc.toFixed(0)}% allocated
          </div>
        </div>

        <div className="space-y-5">
          {expenseCats.map((c) => {
            const pct = allocs[c.id] ?? 0;
            const budgetForCat = (expense * pct) / 100;
            const spent = monthExpenses[c.id] || 0;
            const usage = budgetForCat > 0 ? Math.min(100, (spent / budgetForCat) * 100) : 0;
            const over = budgetForCat > 0 && spent > budgetForCat;
            return (
              <motion.div key={c.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: c.color }} />
                    <span className="font-medium truncate">{c.name}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-muted-foreground tabular-nums">
                      {INR(spent)} / {INR(budgetForCat)}
                    </span>
                    <Input type="number" min={0} max={100} value={pct}
                      onChange={(e) => setAllocs((a) => ({ ...a, [c.id]: Math.max(0, Math.min(100, +e.target.value || 0)) }))}
                      className="w-20 h-8 text-right" />
                    <span className="text-xs text-muted-foreground w-4">%</span>
                  </div>
                </div>
                <Slider value={[pct]} max={100} step={1}
                  onValueChange={(v) => setAllocs((a) => ({ ...a, [c.id]: v[0] }))} />
                {budgetForCat > 0 && (
                  <div className="space-y-1">
                    <Progress value={usage} className={`h-1.5 ${over ? "[&>div]:bg-destructive" : ""}`} />
                    {over && <p className="text-xs text-destructive">Overspending by {INR(spent - budgetForCat)}</p>}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end">
          <Button onClick={save} disabled={updateMutation.isPending} className="gradient-primary text-primary-foreground border-0 shadow-glow">
            <Save className="w-4 h-4 mr-2" />
            {updateMutation.isPending ? "Saving..." : "Save Budget Plan"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

function BudgetField({ label, value, onChange, icon: Icon, gradient }: {
  label: string; value: number; onChange: (n: number) => void; icon: any; gradient: string;
}) {
  return (
    <Card className="p-5 glass border-0 relative overflow-hidden">
      <div className={`absolute -right-6 -top-6 w-24 h-24 rounded-full ${gradient} opacity-20 blur-2xl`} />
      <div className={`w-10 h-10 rounded-xl ${gradient} grid place-items-center shadow-soft mb-3`}>
        <Icon className="w-5 h-5 text-primary-foreground" />
      </div>
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      <div className="relative mt-2">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
        <Input type="number" min={0} value={value || ""}
          onChange={(e) => onChange(+e.target.value || 0)}
          className="pl-7 text-lg font-semibold h-12" placeholder="0" />
      </div>
    </Card>
  );
}
