import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bell, Moon, Search, Settings as SettingsIcon, Sun } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/store";
import { useNotifications } from "@/lib/hooks/useNotifications";

export function TopNav() {
  const { theme, toggleTheme, user } = useAuthStore();
  const { data: notifications = [] } = useNotifications();
  const unread = notifications.filter((n) => !n.read).length;
  const [query, setQuery] = useState("");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  return (
    <header className="sticky top-0 z-30 glass border-b">
      <div className="flex items-center gap-3 h-16 px-4 md:px-6">
        <SidebarTrigger className="shrink-0" />

        <div className="relative flex-1 max-w-xl hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search transactions, categories, goals..."
            aria-label="Search" className="pl-9 bg-background/50 border-border/60 focus-visible:ring-primary/40" />
        </div>

        <div className="flex-1 sm:hidden" />

        <Button variant="ghost" size="icon" aria-label="Toggle theme" onClick={toggleTheme} className="rounded-full">
          {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>

        <Link to="/notifications" aria-label="Notifications" className="relative">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="w-4 h-4" />
            {unread > 0 && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-destructive" />}
          </Button>
        </Link>

        <Link to="/settings" aria-label="Settings">
          <Button variant="ghost" size="icon" className="rounded-full">
            <SettingsIcon className="w-4 h-4" />
          </Button>
        </Link>

        <Link to="/profile" aria-label="Your profile" className="ml-1">
          <div className="w-9 h-9 rounded-full gradient-primary grid place-items-center text-primary-foreground font-semibold shadow-soft">
            {(user?.name || "U")[0].toUpperCase()}
          </div>
        </Link>
      </div>
    </header>
  );
}
