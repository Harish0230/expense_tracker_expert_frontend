import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import * as Lucide from "lucide-react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "@/lib/hooks/useCategories";
import type { Category } from "@/lib/types";
import { toast } from "sonner";

export const Route = createFileRoute("/categories")({
  head: () => ({ meta: [{ title: "Categories — SpendWise AI" }] }),
  component: CategoriesPage,
});

const ICONS = [
  "Utensils","Plane","ShoppingBag","Receipt","Film","HeartPulse",
  "GraduationCap","TrendingUp","Wallet","Home","Car","Coffee",
  "Gift","Music","Book","Gamepad2","Briefcase","CreditCard",
  "MoreHorizontal","Tags",
];
const COLORS = [
  "#6366f1","#8b5cf6","#ec4899","#ef4444","#f59e0b",
  "#10b981","#14b8a6","#06b6d4","#3b82f6","#22c55e",
  "#64748b","#a855f7",
];

function IconRender({ name, ...props }: { name: string } & any) {
  const Icon = (Lucide as any)[name] || Lucide.Tag;
  return <Icon {...props} />;
}

function CategoriesPage() {
  const { data: categories = [], isLoading } = useCategories();
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("Tags");
  const [color, setColor] = useState(COLORS[0]);
  const [type, setType] = useState<"expense" | "income" | "both">("expense");

  const openNew = () => {
    setEditing(null); setName(""); setIcon("Tags"); setColor(COLORS[0]); setType("expense");
    setOpen(true);
  };
  const openEdit = (c: Category) => {
    setEditing(c); setName(c.name); setIcon(c.icon); setColor(c.color); setType(c.type as any);
    setOpen(true);
  };

  const save = () => {
    if (!name.trim()) return toast.error("Name is required");
    const body = { name, icon, color, type };
    if (editing) {
      updateMutation.mutate({ id: editing.id, body }, {
        onSuccess: () => { toast.success("Category updated"); setOpen(false); },
        onError: () => toast.error("Failed to update category"),
      });
    } else {
      createMutation.mutate(body, {
        onSuccess: () => { toast.success("Category added"); setOpen(false); },
        onError: () => toast.error("Failed to create category"),
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-[1400px] mx-auto">
        <Skeleton className="h-12 w-44" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {[1,2,3,4,5,6,7,8].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
          <p className="text-muted-foreground">Customize how you organize your transactions.</p>
        </div>
        <Button onClick={openNew} className="gradient-primary text-primary-foreground border-0 shadow-glow">
          <Plus className="w-4 h-4 mr-2" /> New Category
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {categories.map((c, i) => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
            <Card className="p-5 glass border-0 group relative overflow-hidden">
              <div className="w-12 h-12 rounded-2xl grid place-items-center mb-3 shadow-soft" style={{ background: `${c.color}22`, color: c.color }}>
                <IconRender name={c.icon} className="w-6 h-6" />
              </div>
              <div className="font-semibold truncate">{c.name}</div>
              <div className="text-xs text-muted-foreground capitalize">{c.type}</div>
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openEdit(c)}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button size="icon" variant="ghost" className="h-7 w-7"
                  onClick={() => deleteMutation.mutate(c.id, {
                    onSuccess: () => toast.success("Category removed"),
                    onError: () => toast.error("Failed to delete"),
                  })}>
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Edit" : "New"} Category</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Groceries" />
            </div>
            <div>
              <Label>Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                  <SelectItem value="both">Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Icon</Label>
              <div className="grid grid-cols-10 gap-2 mt-2 p-3 rounded-xl bg-muted/40 max-h-40 overflow-auto">
                {ICONS.map((n) => (
                  <button key={n} type="button" onClick={() => setIcon(n)} aria-label={n}
                    className={`p-2 rounded-lg transition-all ${icon === n ? "gradient-primary text-primary-foreground shadow-soft" : "hover:bg-background"}`}>
                    <IconRender name={n} className="w-4 h-4" />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Color</Label>
              <div className="flex gap-2 mt-2 flex-wrap">
                {COLORS.map((col) => (
                  <button key={col} type="button" onClick={() => setColor(col)} aria-label={col}
                    className={`w-8 h-8 rounded-full transition-transform ${color === col ? "ring-2 ring-offset-2 ring-foreground scale-110" : ""}`}
                    style={{ background: col }} />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={createMutation.isPending || updateMutation.isPending}
              className="gradient-primary text-primary-foreground border-0">
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
