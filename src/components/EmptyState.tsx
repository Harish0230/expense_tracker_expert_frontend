import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function EmptyState({
  icon: Icon = Sparkles,
  title,
  description,
  actionLabel,
  onAction,
  children,
}: {
  icon?: any;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-3xl p-10 md:p-14 text-center flex flex-col items-center"
    >
      <div className="relative mb-6">
        <div className="absolute inset-0 gradient-primary blur-2xl opacity-40 rounded-full" />
        <div className="relative w-20 h-20 rounded-2xl gradient-primary grid place-items-center shadow-glow">
          <Icon className="w-9 h-9 text-primary-foreground" />
        </div>
      </div>
      <h3 className="text-xl md:text-2xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-md mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="lg" className="gradient-primary text-primary-foreground shadow-glow border-0">
          {actionLabel}
        </Button>
      )}
      {children}
    </motion.div>
  );
}
