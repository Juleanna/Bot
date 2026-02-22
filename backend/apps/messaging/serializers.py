from rest_framework import serializers

from .models import ChatUser, FormSubmission, Message


class ChatUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatUser
        fields = [
            "id", "platform_user_id", "username", "first_name",
            "last_name", "metadata", "created_at",
        ]


class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = [
            "id", "chat_user", "direction", "content_type",
            "content", "is_error", "error_detail", "created_at",
        ]


class FormSubmissionSerializer(serializers.ModelSerializer):
    chat_user_name = serializers.CharField(source="chat_user.__str__", read_only=True)

    class Meta:
        model = FormSubmission
        fields = ["id", "chat_user", "chat_user_name", "data", "created_at"]
