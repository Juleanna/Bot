import { useTranslation } from "react-i18next";
import { Bot, MessageSquare, Users, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboardOverview, useMessagesChart } from "@/api/hooks/useDashboard";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function Dashboard() {
  const { t } = useTranslation("dashboard");
  const { data: overview } = useDashboardOverview();
  const { data: messagesData } = useMessagesChart(30);

  const stats = [
    { label: t("total_bots"), value: overview?.total_bots ?? 0, icon: Bot, color: "text-blue-400", bgColor: "bg-blue-500/15" },
    { label: t("active_bots"), value: overview?.active_bots ?? 0, icon: Activity, color: "text-green-400", bgColor: "bg-green-500/15" },
    { label: t("total_messages"), value: overview?.total_messages ?? 0, icon: MessageSquare, color: "text-purple-400", bgColor: "bg-purple-500/15" },
    { label: t("total_users"), value: overview?.total_chat_users ?? 0, icon: Users, color: "text-orange-400", bgColor: "bg-orange-500/15" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">{t("title")}</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="glass-hover hover:glow-sm transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.label}
              </CardTitle>
              <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value.toLocaleString()}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("messages_chart")}</CardTitle>
        </CardHeader>
        <CardContent>
          {messagesData && messagesData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={messagesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
                <XAxis dataKey="date" stroke="var(--chart-axis)" fontSize={12} />
                <YAxis stroke="var(--chart-axis)" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "var(--tooltip-bg)",
                    border: "1px solid var(--tooltip-border)",
                    borderRadius: "8px",
                    backdropFilter: "blur(20px)",
                    color: "var(--tooltip-text)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="inbound"
                  stackId="1"
                  stroke="#818cf8"
                  fill="#818cf8"
                  fillOpacity={0.15}
                  name="Inbound"
                />
                <Area
                  type="monotone"
                  dataKey="outbound"
                  stackId="1"
                  stroke="#a855f7"
                  fill="#a855f7"
                  fillOpacity={0.15}
                  name="Outbound"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-8 text-center text-muted-foreground">{t("no_data")}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
