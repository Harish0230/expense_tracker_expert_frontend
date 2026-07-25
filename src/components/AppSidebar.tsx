import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Receipt, PiggyBank, Tags, LineChart,
  Calendar, Target, Bell, User, Settings as SettingsIcon, Sparkles,
} from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar,
} from "@/components/ui/sidebar";
import { useAuthStore } from "@/lib/store";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Transactions", url: "/transactions", icon: Receipt },
  { title: "Budget Planner", url: "/budget", icon: PiggyBank },
  { title: "Categories", url: "/categories", icon: Tags },
  { title: "Analytics", url: "/analytics", icon: LineChart },
  { title: "Calendar", url: "/calendar", icon: Calendar },
  { title: "Goals", url: "/goals", icon: Target },
  { title: "Notifications", url: "/notifications", icon: Bell },
  { title: "Profile", url: "/profile", icon: User },
  { title: "Settings", url: "/settings", icon: SettingsIcon },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const user = useAuthStore((s) => s.user);

  return (
    <Sidebar collapsible="icon" className="border-r">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2.5 px-2 py-3">
          <div className="w-9 h-9 rounded-xl gradient-primary grid place-items-center shadow-glow shrink-0">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <div className="font-bold text-base tracking-tight">SpendWise</div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">AI Tracker</div>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const active = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                      <Link to={item.url}
                        className={`flex items-center gap-3 rounded-lg transition-all ${active ? "gradient-primary text-primary-foreground shadow-soft hover:opacity-95" : "hover:bg-sidebar-accent"}`}>
                        <item.icon className="w-4 h-4 shrink-0" />
                        {!collapsed && <span className="font-medium">{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t">
        <Link to="/profile" className="flex items-center gap-3 p-2 rounded-xl hover:bg-sidebar-accent transition-colors">
          <div className="w-9 h-9 rounded-full gradient-emerald grid place-items-center text-primary-foreground font-semibold shrink-0">
            {(user?.name || "U")[0].toUpperCase()}
          </div>
          {!collapsed && (
            <div className="leading-tight min-w-0">
              <div className="text-sm font-semibold truncate">{user?.name || "Your Profile"}</div>
              <div className="text-xs text-muted-foreground truncate">{user?.email || "Set up your account"}</div>
            </div>
          )}
        </Link>
      </SidebarFooter>
    </Sidebar>
  );
}
