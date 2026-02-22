import { useMutation, useQuery } from "@tanstack/react-query";
import client from "../client";
import type { Plan, UserSubscription } from "@/types/subscription";

export function usePlans() {
  return useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const { data } = await client.get<{ results: Plan[] }>(
        "/subscriptions/plans/"
      );
      return data.results ?? data;
    },
  });
}

export function useCurrentSubscription() {
  return useQuery({
    queryKey: ["subscription"],
    queryFn: async () => {
      const { data } = await client.get<UserSubscription>(
        "/subscriptions/current/"
      );
      return data;
    },
  });
}

export function useCheckout() {
  return useMutation({
    mutationFn: async (planId: string) => {
      const { data } = await client.post("/subscriptions/checkout/", {
        plan_id: planId,
      });
      return data as { checkout_url: string };
    },
  });
}

export function useCustomerPortal() {
  return useMutation({
    mutationFn: async () => {
      const { data } = await client.post("/subscriptions/portal/");
      return data as { portal_url: string };
    },
  });
}
