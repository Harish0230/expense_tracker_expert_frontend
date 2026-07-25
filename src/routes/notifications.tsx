import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Bell, Check, Trash2, AlertTriangle, Info, CheckCircle2, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useNotifications, useMarkNotificationRead,
  useMarkAllNotificationsRead, useClearNotifications,
} from "@/lib/hooks/useNotifications";
import { EmptyState } from "@/components/EmptyState";
import { toast } from "sonner";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "Notifications — SpendWise AI" }] }),
  component: NotificationsPage,
});

const ICONS: Record<string, any> = {
  info: Info, warning: AlertTriangle, danger: AlertCircle, success: CheckCircle2,
};
const TONES: Record<string, string> = {
  info: "text-primary bg-primary/10 border-primary/30",
  warning: "text-warning bg-warning/10 border-warning/30",
  danger: "text-destructive bg-destructive/10 border-destructive/30",
  success: "text-success bg-success/10 border-success/30",
};

function NotificationsPage() {
  const { data: notifications = [], isLoading } = useNotifications();
  const markReadMutation = useMarkNotificationRead();
  const markAllMutation = useMarkAllNotificationsRead();
  const clearMutation = useClearNotifications();

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-3xl mx-auto">
        <Skeleton className="h-12 w-48" />
        {[1,2,3].map(i => <Skeleton key={i} className="h-24" />)}
      </div>
    );
  }

  if (notifications.length === 0) {
    return <EmptyState icon={Bell} title="You're all caught up"
      description="Budget warnings, goal milestones, and monthly summaries will appear here." />;
  }

  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">{unread} unread</p>
        </div>
        <div className="flex gap-2">
          {unread > 0 && (
            <Button variant="outline" onClick={() => markAllMutation.mutate(undefined, {
              onSuccess: () => toast.success("All marked as read"),
            })}>
              <Check className="w-4 h-4 mr-2" /> Mark all read
            </Button>
          )}
          <Button variant="outline" onClick={() => clearMutation.mutate(undefined, {
            onSuccess: () => toast.success("Notifications cleared"),
          })}>
            <Trash2 className="w-4 h-4 mr-2" /> Clear all
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {notifications.map((n, i) => {
          const Icon = ICONS[n.type] || Info;
          return (
            <motion.div key={n.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}>
              <Card className={`p-4 glass border ${n.read ? "opacity-70" : ""} flex items-start gap-3`}>
                <div className={`w-10 h-10 rounded-xl border grid place-items-center shrink-0 ${TONES[n.type]}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold">{n.title}</div>
                  <div className="text-sm text-muted-foreground">{n.body}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {new Date(n.createdAt).toLocaleString("en-IN")}
                  </div>
                </div>
                {!n.read && (
                  <Button variant="ghost" size="icon" aria-label="Mark read"
                    onClick={() => markReadMutation.mutate(n.id)}>
                    <Check className="w-4 h-4" />
                  </Button>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
