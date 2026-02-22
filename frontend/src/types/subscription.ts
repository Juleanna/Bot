export interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string;
  price_monthly: string;
  price_yearly: string | null;
  max_bots: number;
  max_messages_per_month: number;
  max_chat_users: number;
  features: Record<string, boolean>;
  trial_days: number;
  sort_order: number;
}

export interface UserSubscription {
  id: string;
  plan: Plan;
  status: "trialing" | "active" | "past_due" | "canceled" | "unpaid";
  trial_end: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  messages_used_this_period: number;
  can_create_bot: boolean;
  can_send_message: boolean;
  created_at: string;
}
