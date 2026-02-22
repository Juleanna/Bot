from rest_framework import serializers

from apps.common.encryption import encrypt_token

from .models import Bot


class BotSerializer(serializers.ModelSerializer):
    api_token = serializers.CharField(write_only=True, required=False, allow_blank=True)
    messages_count = serializers.IntegerField(read_only=True, default=0)
    chat_users_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Bot
        fields = [
            "id", "name", "description", "platform", "status",
            "api_token", "webhook_url", "welcome_message",
            "fallback_message", "is_active", "messages_count",
            "chat_users_count", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "status", "webhook_url", "is_active", "created_at", "updated_at"]

    def create(self, validated_data):
        api_token = validated_data.pop("api_token", "")
        validated_data["owner"] = self.context["request"].user
        if api_token:
            validated_data["api_token_encrypted"] = encrypt_token(api_token)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        api_token = validated_data.pop("api_token", None)
        if api_token:
            validated_data["api_token_encrypted"] = encrypt_token(api_token)
        return super().update(instance, validated_data)


class BotListSerializer(serializers.ModelSerializer):
    messages_count = serializers.IntegerField(read_only=True, default=0)
    chat_users_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Bot
        fields = [
            "id", "name", "platform", "status", "is_active",
            "messages_count", "chat_users_count", "created_at",
        ]
