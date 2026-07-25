import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Moon, Sun, Palette, Bell, Calendar, LogOut } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useAuthStore } from "@/lib/store";
import { useUpdateSettings } from "@/lib/hooks/useProfile";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — SpendWise AI" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { theme, dateFormat, notifyBudget, notifyGoals, notifyMonthly, toggleTheme, logout } = useAuthStore();
  const updateMutation = useUpdateSettings();
  const navigate = useNavigate();
  const isDark = theme === "dark";

  const handleThemeToggle = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    toggleTheme();
    updateMutation.mutate({ theme: newTheme });
  };

  const handleSetting = (key: string, value: any) => {
    updateMutation.mutate({ [key]: value }, {
      onSuccess: () => toast.success("Setting saved"),
      onError: () => toast.error("Failed to save setting"),
    });
  };

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Tune SpendWise AI to match how you work.</p>
      </div>

      <Section title="Appearance" icon={Palette}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            <div>
              <div className="font-medium">{isDark ? "Dark mode" : "Light mode"}</div>
              <div className="text-xs text-muted-foreground">Switch the entire interface theme.</div>
            </div>
          </div>
          <Switch checked={isDark} onCheckedChange={handleThemeToggle} aria-label="Toggle dark mode" />
        </div>
      </Section>

      <Section title="Preferences" icon={Calendar}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Currency</Label>
            <Input value="₹ INR (locked)" disabled />
          </div>
          <div>
            <Label>Date format</Label>
            <Select value={dateFormat} onValueChange={(v) => handleSetting("dateFormat", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="dd/MM/yyyy">DD/MM/YYYY</SelectItem>
                <SelectItem value="MM/dd/yyyy">MM/DD/YYYY</SelectItem>
                <SelectItem value="yyyy-MM-dd">YYYY-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Section>

      <Section title="Notifications" icon={Bell}>
        <Toggle label="Budget alerts" description="Warn me when I approach or exceed my monthly limit."
          checked={notifyBudget} onChange={(v) => handleSetting("notifyBudget", v)} />
        <Toggle label="Goal milestones" description="Celebrate when I hit savings targets."
          checked={notifyGoals} onChange={(v) => handleSetting("notifyGoals", v)} />
        <Toggle label="Monthly reports" description="Send me a summary at the end of each month."
          checked={notifyMonthly} onChange={(v) => handleSetting("notifyMonthly", v)} />
      </Section>

      <Section title="Account" icon={LogOut}>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Sign out</div>
            <div className="text-xs text-muted-foreground">You'll need to log in again to access your data.</div>
          </div>
          <Button variant="destructive" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, icon: Icon, children }: any) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="p-6 glass border-0">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg gradient-primary grid place-items-center text-primary-foreground">
            <Icon className="w-4 h-4" />
          </div>
          <h2 className="font-semibold">{title}</h2>
        </div>
        <div className="space-y-4">{children}</div>
      </Card>
    </motion.div>
  );
}

function Toggle({ label, description, checked, onChange }: {
  label: string; description: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <div className="font-medium">{label}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} aria-label={label} />
    </div>
  );
}
