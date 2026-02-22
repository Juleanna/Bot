import uuid

from django.db import models

from apps.common.models import TimeStampedModel


class NodeType(models.TextChoices):
    START = "start", "Start"
    MESSAGE = "message", "Send Message"
    CONDITION = "condition", "Condition"
    BUTTON_MENU = "button_menu", "Button Menu"
    MEDIA = "media", "Media Message"
    FORM = "form", "Data Collection Form"
    WEBHOOK = "webhook", "External Webhook"
    GOOGLE_SHEETS = "google_sheets", "Google Sheets"
    REPLY_KEYBOARD = "reply_keyboard", "Reply Keyboard"
    LOCATION = "location", "Send Location"
    POLL = "poll", "Send Poll"
    STICKER = "sticker", "Send Sticker"
    DICE = "dice", "Send Dice"
    CONTACT = "contact", "Send Contact"
    DELAY = "delay", "Delay / Timer"
    CHAT_ACTION = "chat_action", "Chat Action"
    INVOICE = "invoice", "Invoice / Payment"
    END = "end", "End"


class Flow(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    bot = models.ForeignKey("bots.Bot", on_delete=models.CASCADE, related_name="flows")
    name = models.CharField(max_length=255, default="Main Flow")
    version = models.PositiveIntegerField(default=1)
    is_published = models.BooleanField(default=False)
    published_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-version"]
        constraints = [
            models.UniqueConstraint(
                fields=["bot", "version"], name="unique_flow_version_per_bot"
            )
        ]

    def __str__(self):
        return f"{self.name} v{self.version} ({self.bot.name})"


class FlowNode(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    flow = models.ForeignKey(Flow, on_delete=models.CASCADE, related_name="nodes")
    node_type = models.CharField(max_length=30, choices=NodeType.choices)
    position_x = models.FloatField(default=0)
    position_y = models.FloatField(default=0)
    data = models.JSONField(default=dict)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.node_type} ({self.id})"


class FlowEdge(TimeStampedModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    flow = models.ForeignKey(Flow, on_delete=models.CASCADE, related_name="edges")
    source_node = models.ForeignKey(
        FlowNode, on_delete=models.CASCADE, related_name="outgoing_edges"
    )
    target_node = models.ForeignKey(
        FlowNode, on_delete=models.CASCADE, related_name="incoming_edges"
    )
    source_handle = models.CharField(max_length=50, blank=True)
    condition_label = models.CharField(max_length=255, blank=True)
    priority = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["priority"]
