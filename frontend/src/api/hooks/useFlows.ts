import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import client from "../client";
import type { Flow, FlowListItem } from "@/types/flow";

export function useFlows(botId: string) {
  return useQuery({
    queryKey: ["flows", botId],
    queryFn: async () => {
      const { data } = await client.get<{ results: FlowListItem[] }>(
        `/bots/${botId}/flows/`
      );
      return data.results;
    },
    enabled: !!botId,
  });
}

export function useFlow(botId: string, flowId: string) {
  return useQuery({
    queryKey: ["flow", botId, flowId],
    queryFn: async () => {
      const { data } = await client.get<Flow>(
        `/bots/${botId}/flows/${flowId}/`
      );
      return data;
    },
    enabled: !!botId && !!flowId,
  });
}

export function useCreateFlow(botId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string }) => {
      const { data } = await client.post<Flow>(
        `/bots/${botId}/flows/`,
        payload
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flows", botId] });
    },
  });
}

export function useSaveFlow(botId: string, flowId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      name?: string;
      nodes: unknown[];
      edges: unknown[];
    }) => {
      const { data } = await client.put<Flow>(
        `/bots/${botId}/flows/${flowId}/`,
        payload
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flow", botId, flowId] });
      queryClient.invalidateQueries({ queryKey: ["flows", botId] });
    },
  });
}

export function usePublishFlow(botId: string, flowId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await client.post(
        `/bots/${botId}/flows/${flowId}/publish/`
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flows", botId] });
      queryClient.invalidateQueries({ queryKey: ["flow", botId, flowId] });
    },
  });
}

export function useValidateFlow(botId: string, flowId: string) {
  return useMutation({
    mutationFn: async () => {
      const { data } = await client.post(
        `/bots/${botId}/flows/${flowId}/validate/`
      );
      return data;
    },
  });
}

export function useDeleteFlow(botId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (flowId: string) => {
      await client.delete(`/bots/${botId}/flows/${flowId}/`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flows", botId] });
    },
  });
}

export function useDuplicateFlow(botId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (flowId: string) => {
      const { data } = await client.post<Flow>(
        `/bots/${botId}/flows/${flowId}/duplicate/`
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["flows", botId] });
    },
  });
}
