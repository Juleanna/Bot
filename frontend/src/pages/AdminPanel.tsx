import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Users, Bot, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import client from "@/api/client";

type Tab = "stats" | "users" | "bots";

export default function AdminPanel() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>("stats");

  const { data: stats } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const { data } = await client.get("/dashboard/admin/stats/");
      return data as Record<string, number>;
    },
  });

  const { data: usersData } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: async () => {
      const { data } = await client.get("/auth/admin/users/");
      return data;
    },
    enabled: tab === "users",
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">{t("nav.admin")}</h1>

      <div className="flex gap-2">
        {(["stats", "users", "bots"] as Tab[]).map((t) => (
          <Button
            key={t}
            variant={tab === t ? "default" : "outline"}
            size="sm"
            onClick={() => setTab(t)}
          >
            {t === "stats" && <BarChart3 className="mr-1 h-4 w-4" />}
            {t === "users" && <Users className="mr-1 h-4 w-4" />}
            {t === "bots" && <Bot className="mr-1 h-4 w-4" />}
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </Button>
        ))}
      </div>

      {tab === "stats" && stats && (
        <div className="grid gap-4 md:grid-cols-3">
          {Object.entries(stats).map(([key, value]) => (
            <Card key={key} className="glass-hover hover:glow-sm transition-all duration-300">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {key.replace(/_/g, " ")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{(value as number).toLocaleString()}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {tab === "users" && usersData && (
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--glass-border)] bg-[var(--table-header-bg)]">
                  <th className="p-3 text-left font-medium text-muted-foreground">Email</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">Name</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">Bots</th>
                  <th className="p-3 text-left font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {((usersData as { results: Array<{ id: string; email: string; first_name: string; last_name: string; bots_count: number; is_active: boolean }> }).results ?? []).map(
                  (user) => (
                    <tr key={user.id} className="border-b border-[var(--table-row-border)] transition-colors hover:bg-[var(--table-row-hover)]">
                      <td className="p-3 text-foreground">{user.email}</td>
                      <td className="p-3 text-foreground">{user.first_name} {user.last_name}</td>
                      <td className="p-3 text-foreground">{user.bots_count}</td>
                      <td className="p-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${user.is_active ? "bg-green-500/15 text-green-400 border border-green-500/30" : "bg-red-500/15 text-red-400 border border-red-500/30"}`}>
                          {user.is_active ? "Active" : "Blocked"}
                        </span>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
