import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Users, CreditCard, LogOut, Loader2,
  IndianRupee, UserCheck, Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const ADMIN_EMAIL = "shadowmd.app@gmail.com";

type AdminTab = "dashboard" | "users" | "payments";

interface UserRow {
  id: string;
  email: string;
  created_at: string;
  plan_status: string;
}

interface PaymentRow {
  id: string;
  amount: number;
  status: string;
  created_at: string;
  razorpay_payment_id: string | null;
  user_email?: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const [tab, setTab] = useState<AdminTab>("dashboard");
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({ totalUsers: 0, totalPayments: 0, activeSubscriptions: 0, revenue: 0 });
  const [users, setUsers] = useState<UserRow[]>([]);
  const [payments, setPayments] = useState<PaymentRow[]>([]);

  // Auth guard
  useEffect(() => {
    if (!authLoading && (!user || user.email?.toLowerCase() !== ADMIN_EMAIL)) {
      navigate("/admin", { replace: true });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch(
        `https://${projectId}.supabase.co/functions/v1/admin-data`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) throw new Error("Failed to fetch admin data");
      const data = await res.json();

      setMetrics(data.metrics);
      setUsers(data.users || []);
      setPayments(data.payments || []);
    } catch (err) {
      console.error("Admin data fetch failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/", { replace: true });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || user.email?.toLowerCase() !== ADMIN_EMAIL) return null;

  const sidebarItems: { label: string; value: AdminTab; icon: typeof LayoutDashboard }[] = [
    { label: "Dashboard", value: "dashboard", icon: LayoutDashboard },
    { label: "Users", value: "users", icon: Users },
    { label: "Payments", value: "payments", icon: CreditCard },
  ];

  const metricCards = [
    { label: "Total Users", value: metrics.totalUsers, icon: Users, color: "text-primary" },
    { label: "Total Payments", value: metrics.totalPayments, icon: Receipt, color: "text-primary" },
    { label: "Active Subscriptions", value: metrics.activeSubscriptions, icon: UserCheck, color: "text-success" },
    { label: "Revenue", value: `₹${(metrics.revenue / 100).toLocaleString("en-IN")}`, icon: IndianRupee, color: "text-success" },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-56 border-r border-border/60 bg-card/50 flex flex-col">
        <div className="p-4 border-b border-border/40">
          <h2 className="text-sm font-bold text-foreground">Admin Panel</h2>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.value}
              onClick={() => setTab(item.value)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                tab === item.value
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-border/40">
          <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-muted-foreground" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 p-6 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {tab === "dashboard" && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {metricCards.map((m) => (
                    <Card key={m.label}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-xs font-medium text-muted-foreground">{m.label}</CardTitle>
                          <m.icon className={`h-4 w-4 ${m.color}`} />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-2xl font-bold">{m.value}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Recent users */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Recent Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Plan</TableHead>
                          <TableHead>Joined</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.slice(0, 5).map((u) => (
                          <TableRow key={u.id}>
                            <TableCell className="text-sm">{u.email}</TableCell>
                            <TableCell>
                              <Badge variant={u.plan_status === "active" ? "default" : "secondary"}>
                                {u.plan_status === "active" ? "Pro" : "Free"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(u.created_at).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                        {users.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center text-muted-foreground">No users yet</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}

            {tab === "users" && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold">Users</h1>
                <Card>
                  <CardContent className="pt-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Email</TableHead>
                          <TableHead>Plan</TableHead>
                          <TableHead>Joined</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {users.map((u) => (
                          <TableRow key={u.id}>
                            <TableCell className="text-sm">{u.email}</TableCell>
                            <TableCell>
                              <Badge variant={u.plan_status === "active" ? "default" : "secondary"}>
                                {u.plan_status === "active" ? "Pro" : "Free"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(u.created_at).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                        {users.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center text-muted-foreground">No users found</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}

            {tab === "payments" && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold">Payment Logs</h1>
                <Card>
                  <CardContent className="pt-6">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Payment ID</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payments.map((p) => (
                          <TableRow key={p.id}>
                            <TableCell className="text-sm font-mono">
                              {p.razorpay_payment_id || p.id.slice(0, 8)}
                            </TableCell>
                            <TableCell className="text-sm">₹{(p.amount / 100).toLocaleString("en-IN")}</TableCell>
                            <TableCell>
                              <Badge variant={p.status === "captured" ? "default" : "secondary"}>
                                {p.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {new Date(p.created_at).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                        {payments.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center text-muted-foreground">No payments yet</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
