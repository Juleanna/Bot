import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import client from "../client";
import { useAuthStore } from "@/stores/authStore";
import type { LoginRequest, RegisterRequest, User } from "@/types/user";

export function useProfile() {
  const { isAuthenticated, setUser } = useAuthStore();
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data } = await client.get<User>("/auth/profile/");
      setUser(data);
      return data;
    },
    enabled: isAuthenticated,
  });
}

export function useLogin() {
  const { login } = useAuthStore();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const { data } = await client.post("/auth/login/", credentials);
      return data;
    },
    onSuccess: async (data) => {
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);
      const { data: user } = await client.get<User>("/auth/profile/");
      login(user, data.access, data.refresh);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useRegister() {
  const { login } = useAuthStore();
  return useMutation({
    mutationFn: async (payload: RegisterRequest) => {
      const { data } = await client.post("/auth/register/", payload);
      return data;
    },
    onSuccess: (data) => {
      login(data.user, data.tokens.access, data.tokens.refresh);
    },
  });
}

export function useLogout() {
  const { logout } = useAuthStore();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const refresh = localStorage.getItem("refresh_token");
      await client.post("/auth/logout/", { refresh });
    },
    onSettled: () => {
      logout();
      queryClient.clear();
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Partial<User> | FormData) => {
      const isFormData = payload instanceof FormData;
      const { data } = await client.patch<User>("/auth/profile/", payload, {
        headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (payload: { old_password: string; new_password: string }) => {
      const { data } = await client.post("/auth/password/change/", payload);
      return data;
    },
  });
}

export function useDeleteAccount() {
  const { logout } = useAuthStore();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await client.delete("/auth/profile/delete/");
    },
    onSuccess: () => {
      logout();
      queryClient.clear();
    },
  });
}
