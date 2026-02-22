import uuid

from django.db import models

from apps.common.models import TimeStampedModel


class ChatUser(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    bot = models.ForeignKey("bots.Bot", on_delete=models.CASCADE, related_name="chat_users")
    platform_user_id = models.CharField(max_length=255)
    username = models.CharField(max_length=255, blank=True)
    first_name = models.CharField(max_length=255, blank=True)
    last_name = models.CharField(max_length=255, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    current_node = models.ForeignKey(
        "flows.FlowNode", null=True, blank=True, on_delete=models.SET_NULL
    )
    context_data = models.JSONField(default=dict, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["bot", "platform_user_id"], name="unique_chat_user_per_bot"
            )
        ]

    def __str__(self):
        return f"{self.first_name or self.username or self.platform_user_id}"


class MessageDirection(models.TextChoices):
    INBOUND = "inbound", "Inbound"
    OUTBOUND = "outbound", "Outbound"


class Message(TimeStampedModel):
    id = models.BigAutoField(primary_key=True)
    bot = models.ForeignKey("bots.Bot", on_delete=models.CASCADE, related_name="messages")
    chat_user = models.ForeignKey(ChatUser, on_delete=models.CASCADE, related_name="messages")
    direction = models.CharField(max_length=10, choices=MessageDirection.choices)
    content_type = models.CharField(max_length=20, default="text")
    content = models.JSONField(default=dict)
    platform_message_id = models.CharField(max_length=255, blank=True)
    flow_node = models.ForeignKey(
        "flows.FlowNode", null=True, blank=True, on_delete=models.SET_NULL
    )
    is_error = models.BooleanField(default=False)
    error_detail = models.TextField(blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["bot", "created_at"]),
            models.Index(fields=["chat_user", "created_at"]),
        ]


class FormSubmission(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    bot = models.ForeignKey("bots.Bot", on_delete=models.CASCADE, related_name="form_submissions")
    chat_user = models.ForeignKey(ChatUser, on_delete=models.CASCADE, related_name="form_submissions")
    flow_node = models.ForeignKey("flows.FlowNode", on_delete=models.SET_NULL, null=True)
    data = models.JSONField(default=dict)

    class Meta:
        ordering = ["-created_at"]
