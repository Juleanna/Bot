from django.db import models

from apps.common.models import TimeStampedModel


class WebhookEventStatus(models.TextChoices):
    RECEIVED = "received", "Received"
    PROCESSED = "processed", "Processed"
    FAILED = "failed", "Failed"


class WebhookEvent(TimeStampedModel):
    id = models.BigAutoField(primary_key=True)
    source = models.CharField(max_length=30)  # telegram, viber, whatsapp, stripe
    bot = models.ForeignKey(
        "bots.Bot", on_delete=models.CASCADE, null=True, blank=True, related_name="webhook_events"
    )
    event_type = models.CharField(max_length=100, blank=True)
    payload = models.JSONField(default=dict)
    status = models.CharField(
        max_length=20, choices=WebhookEventStatus.choices, default=WebhookEventStatus.RECEIVED
    )
    error_message = models.TextField(blank=True)
    processing_time_ms = models.PositiveIntegerField(null=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["source", "created_at"]),
            models.Index(fields=["bot", "status"]),
        ]
