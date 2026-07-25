import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useCategories } from "@/lib/hooks/useCategories";
import { useCreateTransaction, useUpdateTransaction } from "@/lib/hooks/useTransactions";
import type { Transaction } from "@/lib/types";
import { toast } from "sonner";

const schema = z.object({
  title: z.string().min(1, "Title required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  type: z.enum(["income", "expense"]),
  categoryId: z.coerce.number().min(1, "Category required"),
  notes: z.string().optional(),
  date: z.string().min(1, "Date required"),
});

type FormVals = z.infer<typeof schema>;

export function TransactionDialog({
  open, onOpenChange, editing,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  editing?: Transaction | null;
}) {
  const { data: categories = [] } = useCategories();
  const createMutation = useCreateTransaction();
  const updateMutation = useUpdateTransaction();

  const today = new Date().toISOString().slice(0, 10);
  const form = useForm<FormVals>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", amount: 0, type: "expense", categoryId: 0, notes: "", date: today },
  });

  useEffect(() => {
    if (editing) {
      form.reset({
        title: editing.title,
        amount: editing.amount,
        type: editing.type,
        categoryId: editing.categoryId,
        notes: editing.notes || "",
        date: editing.date.slice(0, 10),
      });
    } else if (open) {
      form.reset({ title: "", amount: 0, type: "expense", categoryId: 0, notes: "", date: today });
    }
  }, [editing, open]);

  const type = form.watch("type");
  const filteredCats = categories.filter((c) => c.type === type || c.type === "both");

  const onSubmit = (values: FormVals) => {
    const body = {
      title: values.title,
      amount: values.amount,
      type: values.type,
      categoryId: values.categoryId,
      notes: values.notes,
      date: values.date,
    };

    if (editing) {
      updateMutation.mutate({ id: editing.id, body }, {
        onSuccess: () => { toast.success("Transaction updated"); onOpenChange(false); },
        onError: (e: any) => toast.error(e?.response?.data?.message ?? "Failed to update"),
      });
    } else {
      createMutation.mutate(body, {
        onSuccess: () => { toast.success("Transaction added"); onOpenChange(false); },
        onError: (e: any) => toast.error(e?.response?.data?.message ?? "Failed to add"),
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit" : "Add"} Transaction</DialogTitle>
          <DialogDescription>
            {editing ? "Update your transaction details." : "Record an income or expense."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <Label>Title</Label>
              <Input {...form.register("title")} placeholder="e.g. Grocery shopping" />
              {form.formState.errors.title && (
                <p className="text-xs text-destructive mt-1">{form.formState.errors.title.message}</p>
              )}
            </div>
            <div>
              <Label>Type</Label>
              <Select value={form.watch("type")} onValueChange={(v) => form.setValue("type", v as any)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="income">Income</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Amount (₹)</Label>
              <Input type="number" step="0.01" {...form.register("amount")} />
              {form.formState.errors.amount && (
                <p className="text-xs text-destructive mt-1">{form.formState.errors.amount.message}</p>
              )}
            </div>
            <div>
              <Label>Category</Label>
              <Select
                value={String(form.watch("categoryId") || "")}
                onValueChange={(v) => form.setValue("categoryId", Number(v))}>
                <SelectTrigger><SelectValue placeholder="Pick category" /></SelectTrigger>
                <SelectContent>
                  {filteredCats.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.categoryId && (
                <p className="text-xs text-destructive mt-1">{form.formState.errors.categoryId.message}</p>
              )}
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" {...form.register("date")} />
            </div>
            <div className="col-span-2">
              <Label>Notes</Label>
              <Textarea {...form.register("notes")} placeholder="Optional notes..." />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending} className="gradient-primary text-primary-foreground border-0">
              {isPending ? "Saving..." : editing ? "Save changes" : "Add transaction"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
