import uuid

from django.conf import settings
from django.db import models

from apps.common.models import TimeStampedModel


class Platform(models.TextChoices):
    TELEGRAM = "telegram", "Telegram"
    VIBER = "viber", "Viber"
    WHATSAPP = "whatsapp", "WhatsApp"


class BotStatus(models.TextChoices):
    DRAFT = "draft", "Draft"
    ACTIVE = "active", "Active"
    PAUSED = "paused", "Paused"
    ERROR = "error", "Error"


class Bot(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="bots"
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    platform = models.CharField(max_length=20, choices=Platform.choices)
    status = models.CharField(
        max_length=20, choices=BotStatus.choices, default=BotStatus.DRAFT
    )
    api_token_encrypted = models.TextField(blank=True)
    webhook_url = models.URLField(blank=True)
    webhook_secret = models.CharField(max_length=128, blank=True)
    welcome_message = models.TextField(blank=True, default="Hello! How can I help you?")
    fallback_message = models.TextField(
        blank=True, default="I didn't understand that. Please try again."
    )
    is_active = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["owner", "name"], name="unique_bot_name_per_owner"
            )
        ]

    def __str__(self):
        return f"{self.name} ({self.platform})"
