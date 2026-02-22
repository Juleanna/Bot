import uuid

from django.conf import settings
from django.db import models

from apps.common.models import TimeStampedModel


class Plan(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    price_monthly = models.DecimalField(max_digits=10, decimal_places=2)
    price_yearly = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    stripe_price_id_monthly = models.CharField(max_length=255, blank=True)
    stripe_price_id_yearly = models.CharField(max_length=255, blank=True)
    max_bots = models.PositiveIntegerField(default=1)
    max_messages_per_month = models.PositiveIntegerField(default=1000)
    max_chat_users = models.PositiveIntegerField(default=100)
    features = models.JSONField(default=dict, blank=True)
    is_active = models.BooleanField(default=True)
    trial_days = models.PositiveIntegerField(default=0)
    sort_order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["sort_order"]

    def __str__(self):
        return self.name


class SubscriptionStatus(models.TextChoices):
    TRIALING = "trialing", "Trialing"
    ACTIVE = "active", "Active"
    PAST_DUE = "past_due", "Past Due"
    CANCELED = "canceled", "Canceled"
    UNPAID = "unpaid", "Unpaid"


class UserSubscription(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="subscription"
    )
    plan = models.ForeignKey(Plan, on_delete=models.PROTECT, related_name="subscriptions")
    stripe_subscription_id = models.CharField(max_length=255, blank=True)
    stripe_customer_id = models.CharField(max_length=255, blank=True)
    status = models.CharField(
        max_length=20, choices=SubscriptionStatus.choices, default=SubscriptionStatus.TRIALING
    )
    trial_end = models.DateTimeField(null=True, blank=True)
    current_period_start = models.DateTimeField(null=True, blank=True)
    current_period_end = models.DateTimeField(null=True, blank=True)
    messages_used_this_period = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.user.email} - {self.plan.name} ({self.status})"

    @property
    def is_valid(self):
        return self.status in (SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIALING)

    def can_create_bot(self):
        current_bots = self.user.bots.count()
        return current_bots < self.plan.max_bots

    def can_send_message(self):
        return self.messages_used_this_period < self.plan.max_messages_per_month


class UsageLog(TimeStampedModel):
    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="usage_logs"
    )
    date = models.DateField()
    messages_sent = models.PositiveIntegerField(default=0)
    messages_received = models.PositiveIntegerField(default=0)
    active_bots = models.PositiveIntegerField(default=0)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=["user", "date"], name="unique_usage_per_day")
        ]
