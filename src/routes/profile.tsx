import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Save, User, KeyRound } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/lib/store";
import { useUpdateProfile, useChangePassword } from "@/lib/hooks/useProfile";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/profile")({
  head: () => ({ meta: [{ title: "Profile — SpendWise AI" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const updateMutation = useUpdateProfile();
  const pwMutation = useChangePassword();

  const [draft, setDraft] = useState({ name: user?.name ?? "", email: user?.email ?? "", phone: user?.phone ?? "" });
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });

  const saveProfile = () => {
    updateMutation.mutate(draft, {
      onSuccess: () => toast.success("Profile saved"),
      onError: (e: any) => toast.error(e?.response?.data?.message ?? "Failed to save"),
    });
  };

  const savePassword = () => {
    if (!pw.current || !pw.next) return toast.error("Fill all password fields");
    if (pw.next !== pw.confirm) return toast.error("Passwords do not match");
    if (pw.next.length < 6) return toast.error("Password must be at least 6 characters");
    pwMutation.mutate({ currentPassword: pw.current, newPassword: pw.next }, {
      onSuccess: () => { toast.success("Password changed"); setPw({ current: "", next: "", confirm: "" }); },
      onError: (e: any) => toast.error(e?.response?.data?.message ?? "Failed to change password"),
    });
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">Personalize your SpendWise AI experience.</p>
      </div>

      {/* Profile info */}
      <Card className="p-8 glass border-0">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-center gap-6 mb-8">
          <div className="w-24 h-24 rounded-3xl gradient-primary grid place-items-center shadow-glow text-primary-foreground text-4xl font-bold">
            {(draft.name || "U")[0].toUpperCase()}
          </div>
          <div className="text-center sm:text-left">
            <div className="text-2xl font-bold">{draft.name || "Your Name"}</div>
            <div className="text-muted-foreground">{draft.email || "your@email.com"}</div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Full name</Label>
            <Input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Your name" />
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} placeholder="you@email.com" />
          </div>
          <div>
            <Label>Phone</Label>
            <Input value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} placeholder="+91" />
          </div>
          <div>
            <Label>Currency</Label>
            <Input value="₹ INR (Indian Rupee)" disabled />
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <Button onClick={saveProfile} disabled={updateMutation.isPending} className="gradient-primary text-primary-foreground border-0 shadow-glow">
            <Save className="w-4 h-4 mr-2" />
            {updateMutation.isPending ? "Saving..." : "Save changes"}
          </Button>
        </div>
      </Card>

      {/* Change password */}
      <Card className="p-8 glass border-0">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg gradient-primary grid place-items-center text-primary-foreground">
            <KeyRound className="w-4 h-4" />
          </div>
          <h2 className="font-semibold text-lg">Change Password</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Label>Current password</Label>
            <Input type="password" value={pw.current} onChange={(e) => setPw({ ...pw, current: e.target.value })} placeholder="••••••••" />
          </div>
          <div>
            <Label>New password</Label>
            <Input type="password" value={pw.next} onChange={(e) => setPw({ ...pw, next: e.target.value })} placeholder="Min 6 chars" />
          </div>
          <div>
            <Label>Confirm new password</Label>
            <Input type="password" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} placeholder="Repeat" />
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <Button onClick={savePassword} disabled={pwMutation.isPending} variant="outline">
            <KeyRound className="w-4 h-4 mr-2" />
            {pwMutation.isPending ? "Changing..." : "Change password"}
          </Button>
        </div>
      </Card>
    </div>
  );
}
