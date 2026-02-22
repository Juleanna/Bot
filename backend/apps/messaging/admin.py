from django.contrib import admin

from .models import ChatUser, FormSubmission, Message


@admin.register(ChatUser)
class ChatUserAdmin(admin.ModelAdmin):
    list_display = ["platform_user_id", "bot", "first_name", "username", "created_at"]
    list_filter = ["bot__platform"]
    search_fields = ["platform_user_id", "username", "first_name"]


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ["bot", "chat_user", "direction", "content_type", "is_error", "created_at"]
    list_filter = ["direction", "content_type", "is_error"]


@admin.register(FormSubmission)
class FormSubmissionAdmin(admin.ModelAdmin):
    list_display = ["bot", "chat_user", "created_at"]
