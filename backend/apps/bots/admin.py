from django.contrib import admin

from .models import Bot


@admin.register(Bot)
class BotAdmin(admin.ModelAdmin):
    list_display = ["name", "owner", "platform", "status", "is_active", "created_at"]
    list_filter = ["platform", "status", "is_active"]
    search_fields = ["name", "owner__email"]
    readonly_fields = ["id", "created_at", "updated_at"]
