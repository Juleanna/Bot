export type Platform = "telegram" | "viber" | "whatsapp";
export type BotStatus = "draft" | "active" | "paused" | "error";

export interface Bot {
  id: string;
  name: string;
  description: string;
  platform: Platform;
  status: BotStatus;
  webhook_url: string;
  welcome_message: string;
  fallback_message: string;
  is_active: boolean;
  messages_count: number;
  chat_users_count: number;
  created_at: string;
  updated_at: string;
}

export interface BotListItem {
  id: string;
  name: string;
  platform: Platform;
  status: BotStatus;
  is_active: boolean;
  messages_count: number;
  chat_users_count: number;
  created_at: string;
}

export interface CreateBotRequest {
  name: string;
  description?: string;
  platform: Platform;
  api_token: string;
  welcome_message?: string;
  fallback_message?: string;
}
