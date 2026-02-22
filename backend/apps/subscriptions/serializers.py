from rest_framework import serializers

from .models import Plan, UserSubscription


class PlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plan
        fields = [
            "id", "name", "slug", "description", "price_monthly",
            "price_yearly", "max_bots", "max_messages_per_month",
            "max_chat_users", "features", "trial_days", "sort_order",
        ]


class UserSubscriptionSerializer(serializers.ModelSerializer):
    plan = PlanSerializer(read_only=True)
    can_create_bot = serializers.BooleanField(read_only=True)
    can_send_message = serializers.BooleanField(read_only=True)

    class Meta:
        model = UserSubscription
        fields = [
            "id", "plan", "status", "trial_end",
            "current_period_start", "current_period_end",
            "messages_used_this_period", "can_create_bot",
            "can_send_message", "created_at",
        ]
