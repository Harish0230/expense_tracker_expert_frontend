import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Target, Trash2, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { useGoals, useCreateGoal, useUpdateGoal, useDeleteGoal } from "@/lib/hooks/useGoals";
import type { Goal } from "@/lib/types";
import { INR } from "@/lib/format";
import { EmptyState } from "@/components/EmptyState";
import { toast } from "sonner";

export const Route = createFileRoute("/goals")({
  head: () => ({ meta: [{ title: "Goals — SpendWise AI" }] }),
  component: GoalsPage,
});

function GoalsPage() {
  const { data: goals = [], isLoading } = useGoals();
  const createMutation = useCreateGoal();
  const updateMutation = useUpdateGoal();
  const deleteMutation = useDeleteGoal();

  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [target, setTarget] = useState(0);
  const [saved, setSaved] = useState(0);
  const [deadline, setDeadline] = useState("");

  const save = () => {
    if (!name.trim() || !target) return toast.error("Fill name and target");
    createMutation.mutate({ name, target, saved: saved || 0, deadline }, {
      onSuccess: () => {
        setName(""); setTarget(0); setSaved(0); setDeadline("");
        setOpen(false);
        toast.success("Goal created");
      },
      onError: () => toast.error("Failed to create goal"),
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-[1400px] mx-auto">
        <Skeleton className="h-12 w-32" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => <Skeleton key={i} className="h-64" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Goals</h1>
          <p className="text-muted-foreground">Track milestones on the way to financial freedom.</p>
        </div>
        <Button onClick={() => setOpen(true)} className="gradient-primary text-primary-foreground border-0 shadow-glow">
          <Plus className="w-4 h-4 mr-2" /> New Goal
        </Button>
      </div>

      {goals.length === 0 ? (
        <EmptyState icon={Target} title="No goals yet"
          description="Set a savings target — like an emergency fund or a vacation — and we'll help you stay on pace."
          actionLabel="Create a goal" onAction={() => setOpen(true)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((g, i) => (
            <GoalCard key={g.id} goal={g} index={i}
              onUpdate={(id, body) => updateMutation.mutate({ id, body }, {
                onSuccess: () => toast.success("Goal updated"),
                onError: () => toast.error("Failed to update"),
              })}
              onDelete={(id) => deleteMutation.mutate(id, {
                onSuccess: () => toast.success("Goal deleted"),
                onError: () => toast.error("Failed to delete"),
              })} />
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>New Goal</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Goal name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Emergency Fund" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Target amount (₹)</Label>
                <Input type="number" value={target || ""} onChange={(e) => setTarget(+e.target.value || 0)} />
              </div>
              <div>
                <Label>Current saved (₹)</Label>
                <Input type="number" value={saved || ""} onChange={(e) => setSaved(+e.target.value || 0)} />
              </div>
            </div>
            <div>
              <Label>Target date</Label>
              <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={createMutation.isPending} className="gradient-primary text-primary-foreground border-0">
              {createMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function GoalCard({ goal, index, onUpdate, onDelete }: {
  goal: Goal; index: number;
  onUpdate: (id: number, body: { saved: number }) => void;
  onDelete: (id: number) => void;
}) {
  const pct = Math.min(100, (goal.saved / Math.max(1, goal.target)) * 100);
  const circumference = 2 * Math.PI * 52;
  const offset = circumference - (pct / 100) * circumference;
  const [contrib, setContrib] = useState("");

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
      <Card className="p-6 glass border-0 relative overflow-hidden">
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full gradient-primary opacity-20 blur-2xl" />
        <div className="flex items-start justify-between mb-4">
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-lg truncate">{goal.name}</h3>
            {goal.deadline && (
              <div className="text-xs text-muted-foreground">
                by {new Date(goal.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
              </div>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={() => onDelete(goal.id)} aria-label="Delete">
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        </div>

        <div className="flex items-center justify-center my-4">
          <div className="relative w-32 h-32">
            <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
              <circle cx="60" cy="60" r="52" stroke="var(--color-muted)" strokeWidth="10" fill="none" />
              <circle cx="60" cy="60" r="52" stroke="url(#goalgrad)" strokeWidth="10" fill="none"
                strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
                style={{ transition: "stroke-dashoffset 0.8s ease" }} />
              <defs>
                <linearGradient id="goalgrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="var(--color-chart-1)" />
                  <stop offset="100%" stopColor="var(--color-chart-3)" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 grid place-items-center text-center">
              <div>
                <div className="text-2xl font-bold">{pct.toFixed(0)}%</div>
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground">complete</div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center mb-4">
          <div className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{INR(goal.saved)}</span> of {INR(goal.target)}
          </div>
        </div>

        <div className="flex gap-2">
          <Input type="number" placeholder="Add to savings ₹" value={contrib} onChange={(e) => setContrib(e.target.value)} />
          <Button onClick={() => {
            const n = +contrib;
            if (!n) return;
            onUpdate(goal.id, { saved: goal.saved + n });
            setContrib("");
          }} className="gradient-emerald text-primary-foreground border-0">
            <TrendingUp className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
