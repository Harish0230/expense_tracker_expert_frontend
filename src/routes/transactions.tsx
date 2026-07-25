import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Pencil, Trash2, Download, Receipt } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTransactions, useDeleteTransaction } from "@/lib/hooks/useTransactions";
import { useCategories } from "@/lib/hooks/useCategories";
import type { Transaction } from "@/lib/types";
import { INR } from "@/lib/format";
import { TransactionDialog } from "@/components/TransactionDialog";
import { EmptyState } from "@/components/EmptyState";
import { toast } from "sonner";

export const Route = createFileRoute("/transactions")({
  head: () => ({ meta: [{ title: "Transactions — SpendWise AI" }] }),
  component: TransactionsPage,
});

const PAGE_SIZE = 10;

function TransactionsPage() {
  const { data: transactions = [], isLoading } = useTransactions();
  const { data: categories = [] } = useCategories();
  const deleteMutation = useDeleteTransaction();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [confirm, setConfirm] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [cat, setCat] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [minAmt, setMinAmt] = useState("");
  const [maxAmt, setMaxAmt] = useState("");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return transactions.filter((t) => {
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
      if (type !== "all" && t.type !== type) return false;
      if (cat !== "all" && t.categoryId !== Number(cat)) return false;
      if (from && t.date < from) return false;
      if (to && t.date > to) return false;
      if (minAmt && t.amount < +minAmt) return false;
      if (maxAmt && t.amount > +maxAmt) return false;
      return true;
    });
  }, [transactions, search, type, cat, from, to, minAmt, maxAmt]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const exportCSV = () => {
    if (!filtered.length) return toast.error("No data to export");
    const rows = [
      ["Date", "Title", "Category", "Type", "Amount (INR)", "Notes"],
      ...filtered.map((t) => [t.date, t.title, t.categoryName, t.type, t.amount.toString(), t.notes || ""]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    download(csv, "transactions.csv", "text/csv");
  };

  const exportExcel = () => {
    if (!filtered.length) return toast.error("No data to export");
    const html = `<table><tr><th>Date</th><th>Title</th><th>Category</th><th>Type</th><th>Amount (INR)</th><th>Notes</th></tr>${filtered
      .map((t) => `<tr><td>${t.date}</td><td>${t.title}</td><td>${t.categoryName}</td><td>${t.type}</td><td>${t.amount}</td><td>${t.notes || ""}</td></tr>`)
      .join("")}</table>`;
    download(html, "transactions.xls", "application/vnd.ms-excel");
  };

  const exportPDF = () => {
    if (!filtered.length) return toast.error("No data to export");
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<html><head><title>Transactions</title>
      <style>body{font-family:sans-serif;padding:24px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #ddd;padding:8px;text-align:left;font-size:12px}th{background:#f4f4f5}</style>
      </head><body><h2>SpendWise AI — Transactions</h2><table><tr><th>Date</th><th>Title</th><th>Category</th><th>Type</th><th>Amount</th></tr>${filtered
        .map((t) => `<tr><td>${t.date}</td><td>${t.title}</td><td>${t.categoryName}</td><td>${t.type}</td><td>₹${t.amount.toLocaleString("en-IN")}</td></tr>`)
        .join("")}</table><script>window.print()</script></body></html>`);
    win.document.close();
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-[1600px] mx-auto">
        <Skeleton className="h-12 w-56" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground">Manage every entry in your financial ledger.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline"><Download className="w-4 h-4 mr-2" /> Export</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={exportCSV}>Export as CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={exportExcel}>Export as Excel</DropdownMenuItem>
              <DropdownMenuItem onClick={exportPDF}>Export as PDF</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={() => { setEditing(null); setOpen(true); }} className="gradient-primary text-primary-foreground border-0 shadow-glow">
            <Plus className="w-4 h-4 mr-2" /> Add Transaction
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4 glass border-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search title..." className="pl-9" />
          </div>
          <Select value={type} onValueChange={(v) => { setType(v); setPage(1); }}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="income">Income</SelectItem>
              <SelectItem value="expense">Expense</SelectItem>
            </SelectContent>
          </Select>
          <Select value={cat} onValueChange={(v) => { setCat(v); setPage(1); }}>
            <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} aria-label="From date" />
          <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} aria-label="To date" />
          <Input type="number" placeholder="Min ₹" value={minAmt} onChange={(e) => setMinAmt(e.target.value)} />
          <Input type="number" placeholder="Max ₹" value={maxAmt} onChange={(e) => setMaxAmt(e.target.value)} />
        </div>
      </Card>

      {transactions.length === 0 ? (
        <EmptyState icon={Receipt} title="No transactions added yet"
          description="Start tracking your expenses to unlock budgeting, goals, and analytics insights."
          actionLabel="Add your first transaction" onAction={() => { setEditing(null); setOpen(true); }} />
      ) : (
        <Card className="glass border-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40">
                <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Transaction</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageData.map((t, i) => {
                  const c = categories.find((x) => x.id === t.categoryId);
                  return (
                    <motion.tr key={t.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }} className="border-t hover:bg-muted/30">
                      <td className="px-4 py-3 whitespace-nowrap">{new Date(t.date).toLocaleDateString("en-IN")}</td>
                      <td className="px-4 py-3 font-medium">{t.title}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full" style={{ background: c?.color }} />
                          {t.categoryName}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={t.type === "income" ? "border-success/40 text-success bg-success/10" : "border-destructive/40 text-destructive bg-destructive/10"}>
                          {t.type}
                        </Badge>
                      </td>
                      <td className={`px-4 py-3 text-right font-semibold ${t.type === "income" ? "text-success" : "text-destructive"}`}>
                        {t.type === "income" ? "+" : "-"}{INR(t.amount)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="icon" onClick={() => { setEditing(t); setOpen(true); }} aria-label="Edit">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setConfirm(t.id)} aria-label="Delete">
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </td>
                    </motion.tr>
                  );
                })}
                {pageData.length === 0 && (
                  <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">No transactions match your filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <div className="text-xs text-muted-foreground">Page {page} of {pages} · {filtered.length} entries</div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
                <Button variant="outline" size="sm" disabled={page === pages} onClick={() => setPage((p) => p + 1)}>Next</Button>
              </div>
            </div>
          )}
        </Card>
      )}

      <TransactionDialog open={open} onOpenChange={setOpen} editing={editing} />

      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this transaction?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (confirm) {
                  deleteMutation.mutate(confirm, {
                    onSuccess: () => toast.success("Transaction deleted"),
                    onError: () => toast.error("Failed to delete"),
                  });
                }
                setConfirm(null);
              }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function download(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
  toast.success(`Exported ${filename}`);
}
