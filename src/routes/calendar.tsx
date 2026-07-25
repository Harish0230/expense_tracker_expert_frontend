import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar as CalIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { INR } from "@/lib/format";
import { EmptyState } from "@/components/EmptyState";
import { useTransactions } from "@/lib/hooks/useTransactions";
import { useCategories } from "@/lib/hooks/useCategories";
import type { Category, Transaction } from "@/lib/types";

type CalendarView = "monthly" | "weekly" | "daily";


export const Route = createFileRoute("/calendar")({
  head: () => ({ meta: [{ title: "Calendar — SpendWise AI" }] }),
  component: CalendarPage,
});

function CalendarPage() {
  const { data: transactions = [], isLoading } = useTransactions();
  const { data: categories = [] } = useCategories();

  const [cursor, setCursor] = useState(new Date());
  const [view, setView] = useState<"monthly" | "weekly" | "daily">("monthly");

  if (isLoading) {
    return (
      <div className="p-6">
        Loading calendar...
      </div>
    );
  }

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const monthLabel = cursor.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const grid = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const days = new Date(year, month + 1, 0).getDate();
    const cells: { date: Date | null }[] = [];
    for (let i = 0; i < firstDay; i++) cells.push({ date: null });
    for (let i = 1; i <= days; i++) cells.push({ date: new Date(year, month, i) });
    return cells;
  }, [year, month]);

  const txByDay = useMemo(() => {
    const m: Record<string, Transaction[]> = {};
    transactions.forEach((t) => {
      const k = t.date.slice(0, 10);
      if (!m[k]) m[k] = [];
      m[k].push(t);
    });
    return m;
  }, [transactions]);

  const selectedDayTx = txByDay[cursor.toISOString().slice(0, 10)] || [];

  if (transactions.length === 0) {
    return (
      <EmptyState
        icon={CalIcon}
        title="Your financial calendar awaits"
        description="Add transactions to see them mapped across days, weeks, and months."
      />
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
          <p className="text-muted-foreground">Visualize your money flow over time.</p>
        </div>
        <Tabs value={view} onValueChange={(v) => setView(v as any)}>
          <TabsList>
            <TabsTrigger value="daily">Day</TabsTrigger>
            <TabsTrigger value="weekly">Week</TabsTrigger>
            <TabsTrigger value="monthly">Month</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Card className="p-5 glass border-0">
        <div className="flex items-center justify-between mb-4">
          <Button variant="ghost" size="icon" onClick={() => setCursor(new Date(year, month - 1, 1))} aria-label="Previous">
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="font-semibold text-lg">{monthLabel}</div>
          <Button variant="ghost" size="icon" onClick={() => setCursor(new Date(year, month + 1, 1))} aria-label="Next">
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {view === "monthly" && (
          <div>
            <div className="grid grid-cols-7 gap-2 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className="text-xs font-semibold text-muted-foreground text-center">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {grid.map((cell, i) => {
                if (!cell.date) return <div key={i} className="aspect-square" />;
                const k = cell.date.toISOString().slice(0, 10);
                const day = txByDay[k] || [];
                const income = day.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
                const expense = day.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
                const isToday = k === new Date().toISOString().slice(0, 10);
                return (
                  <motion.button
                    key={i}
                    whileHover={{ scale: 1.03 }}
                    onClick={() => setCursor(cell.date!)}
                    className={`aspect-square rounded-xl border p-2 text-left transition-all overflow-hidden ${
                      isToday ? "border-primary bg-primary/10" : "border-border hover:bg-muted/40"
                    }`}
                  >
                    <div className="text-xs font-semibold">{cell.date.getDate()}</div>
                    {income > 0 && <div className="text-[10px] text-success truncate">+{INR(income)}</div>}
                    {expense > 0 && <div className="text-[10px] text-destructive truncate">-{INR(expense)}</div>}
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}

        {view === "weekly" && (
          <WeeklyView txByDay={txByDay} cursor={cursor} categories={categories} />
        )}

        {view === "daily" && (
          <DailyView dayTx={selectedDayTx} cursor={cursor} categories={categories} />
        )}
      </Card>
    </div>
  );
}

function WeeklyView({ txByDay, cursor, categories }: {
  txByDay: Record<string, Transaction[]>;
  cursor: Date;
  categories: Category[];
}) {
  const start = new Date(cursor);
  start.setDate(start.getDate() - start.getDay());
  return (
    <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
      {Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const k = d.toISOString().slice(0, 10);
        const day = txByDay[k] || [];
        return (
          <div key={i} className="rounded-xl border p-3 min-h-[160px]">
            <div className="text-xs uppercase text-muted-foreground tracking-wider">{d.toLocaleDateString("en-IN", { weekday: "short" })}</div>
            <div className="text-lg font-bold">{d.getDate()}</div>
            <div className="space-y-1 mt-2">
              {day.slice(0, 4).map((t: any) => (
                <div key={t.id} className="text-[11px] truncate">
                  <span className={t.type === "income" ? "text-success" : "text-destructive"}>
                    {t.type === "income" ? "+" : "-"}{INR(t.amount)}
                  </span>{" "}
                  <span className="text-muted-foreground">{t.title}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DailyView({ dayTx, cursor, categories }: {
  dayTx: Transaction[];
  cursor: Date;
  categories: Category[];
}) {
  return (
    <div>
      <div className="text-lg font-semibold mb-3">{cursor.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}</div>
      {dayTx.length === 0 ? (
        <div className="text-sm text-muted-foreground text-center py-12">No transactions on this day.</div>
      ) : (
        <div className="space-y-2">
          {dayTx.map((t: Transaction) => {
            const c = categories.find((x: Category) => x.id === t.categoryId);
            return (
              <div key={t.id} className="flex items-center gap-3 p-3 rounded-xl border">
                <div className="w-9 h-9 rounded-lg" style={{ background: `${c?.color}22`, color: c?.color }}></div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{t.title}</div>
                  <div className="text-xs text-muted-foreground">{c?.name}</div>
                </div>
                <div className={`font-semibold ${t.type === "income" ? "text-success" : "text-destructive"}`}>
                  {t.type === "income" ? "+" : "-"}{INR(t.amount)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
