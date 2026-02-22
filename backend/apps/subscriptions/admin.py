from django.contrib import admin

from .models import Plan, UsageLog, UserSubscription


@admin.register(Plan)
class PlanAdmin(admin.ModelAdmin):
    list_display = ["name", "slug", "price_monthly", "max_bots", "max_messages_per_month", "is_active"]
    list_filter = ["is_active"]
    prepopulated_fields = {"slug": ("name",)}


@admin.register(UserSubscription)
class UserSubscriptionAdmin(admin.ModelAdmin):
    list_display = ["user", "plan", "status", "messages_used_this_period", "current_period_end"]
    list_filter = ["status", "plan"]


@admin.register(UsageLog)
class UsageLogAdmin(admin.ModelAdmin):
    list_display = ["user", "date", "messages_sent", "messages_received", "active_bots"]
    list_filter = ["date"]
