import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import client from "../client";
import type { Bot, BotListItem, CreateBotRequest } from "@/types/bot";
import type { PaginatedResponse } from "@/types/api";

export function useBots(page = 1) {
  return useQuery({
    queryKey: ["bots", page],
    queryFn: async () => {
      const { data } = await client.get<PaginatedResponse<BotListItem>>(
        "/bots/",
        { params: { page } }
      );
      return data;
    },
  });
}

export function useBot(botId: string) {
  return useQuery({
    queryKey: ["bot", botId],
    queryFn: async () => {
      const { data } = await client.get<Bot>(`/bots/${botId}/`);
      return data;
    },
    enabled: !!botId,
  });
}

export function useCreateBot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateBotRequest) => {
      const { data } = await client.post<Bot>("/bots/", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bots"] });
    },
  });
}

export function useUpdateBot(botId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<CreateBotRequest>) => {
      const { data } = await client.patch<Bot>(`/bots/${botId}/`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bots"] });
      queryClient.invalidateQueries({ queryKey: ["bot", botId] });
    },
  });
}

export function useDeleteBot() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (botId: string) => {
      await client.delete(`/bots/${botId}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bots"] });
    },
  });
}

export function useActivateBot(botId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await client.post(`/bots/${botId}/activate/`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bots"] });
      queryClient.invalidateQueries({ queryKey: ["bot", botId] });
    },
  });
}

export function useDeactivateBot(botId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await client.post(`/bots/${botId}/deactivate/`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bots"] });
      queryClient.invalidateQueries({ queryKey: ["bot", botId] });
    },
  });
}

export function useTestConnection(botId: string) {
  return useMutation({
    mutationFn: async () => {
      const { data } = await client.post(`/bots/${botId}/test-connection/`);
      return data;
    },
  });
}
