import { useQuery } from "@tanstack/react-query";
import client from "../client";

interface DashboardOverview {
  total_bots: number;
  active_bots: number;
  total_messages: number;
  total_chat_users: number;
}

interface MessageChartItem {
  date: string;
  inbound: number;
  outbound: number;
}

interface UserChartItem {
  date: string;
  count: number;
}

export function useDashboardOverview() {
  return useQuery({
    queryKey: ["dashboard", "overview"],
    queryFn: async () => {
      const { data } = await client.get<DashboardOverview>(
        "/dashboard/overview/"
      );
      return data;
    },
  });
}

export function useMessagesChart(days = 30, botId?: string) {
  return useQuery({
    queryKey: ["dashboard", "messages", days, botId],
    queryFn: async () => {
      const { data } = await client.get<MessageChartItem[]>(
        "/dashboard/messages/",
        { params: { days, bot_id: botId } }
      );
      return data;
    },
  });
}

export function useUsersChart(days = 30, botId?: string) {
  return useQuery({
    queryKey: ["dashboard", "users", days, botId],
    queryFn: async () => {
      const { data } = await client.get<UserChartItem[]>(
        "/dashboard/users/",
        { params: { days, bot_id: botId } }
      );
      return data;
    },
  });
}
