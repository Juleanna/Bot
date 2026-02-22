from django.contrib import admin

from .models import WebhookEvent


@admin.register(WebhookEvent)
class WebhookEventAdmin(admin.ModelAdmin):
    list_display = ["source", "bot", "event_type", "status", "processing_time_ms", "created_at"]
    list_filter = ["source", "status"]
    readonly_fields = ["payload"]
