import logging

import requests
from django.db.models import Count
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.common.encryption import decrypt_token
from apps.common.permissions import IsAdmin

from .models import Bot
from .serializers import BotListSerializer, BotSerializer

logger = logging.getLogger(__name__)


class BotViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "list":
            return BotListSerializer
        return BotSerializer

    def get_queryset(self):
        return (
            Bot.objects.filter(owner=self.request.user)
            .annotate(
                messages_count=Count("messages", distinct=True),
                chat_users_count=Count("chat_users", distinct=True),
            )
            .order_by("-created_at")
        )

    @action(detail=True, methods=["post"])
    def activate(self, request, pk=None):
        bot = self.get_object()
        if not bot.api_token_encrypted:
            return Response(
                {"detail": "API token is required to activate the bot."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        bot.is_active = True
        bot.status = "active"
        bot.save(update_fields=["is_active", "status", "updated_at"])
        logger.info("Bot activated: %s (id=%s) by user=%s", bot.name, bot.id, request.user.email)
        # TODO: Register webhook with platform via Celery task
        return Response({"detail": "Bot activated."})

    @action(detail=True, methods=["post"])
    def deactivate(self, request, pk=None):
        bot = self.get_object()
        bot.is_active = False
        bot.status = "paused"
        bot.save(update_fields=["is_active", "status", "updated_at"])
        logger.info("Bot deactivated: %s (id=%s) by user=%s", bot.name, bot.id, request.user.email)
        # TODO: Remove webhook from platform via Celery task
        return Response({"detail": "Bot deactivated."})

    @action(detail=True, methods=["post"], url_path="test-connection")
    def test_connection(self, request, pk=None):
        bot = self.get_object()
        if not bot.api_token_encrypted:
            return Response(
                {"detail": "No API token configured."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            token = decrypt_token(bot.api_token_encrypted)
        except Exception as e:
            logger.warning("Bot connection test failed (decrypt): %s (id=%s): %s", bot.name, bot.id, e)
            return Response(
                {"detail": f"Connection failed: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            if bot.platform == "telegram":
                resp = requests.get(
                    f"https://api.telegram.org/bot{token}/getMe",
                    timeout=10,
                )
                if resp.status_code == 200 and resp.json().get("ok"):
                    bot_info = resp.json()["result"]
                    return Response({
                        "detail": "Connection successful.",
                        "platform": bot.platform,
                        "bot_username": bot_info.get("username", ""),
                    })
                else:
                    error_desc = resp.json().get("description", "Invalid token")
                    return Response(
                        {"detail": f"Connection failed: {error_desc}"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            elif bot.platform == "viber":
                resp = requests.post(
                    "https://chatapi.viber.com/pa/get_account_info",
                    json={"auth_token": token},
                    timeout=10,
                )
                data = resp.json()
                if data.get("status") == 0:
                    return Response({
                        "detail": "Connection successful.",
                        "platform": bot.platform,
                        "bot_username": data.get("name", ""),
                    })
                else:
                    return Response(
                        {"detail": f"Connection failed: {data.get('status_message', 'Invalid token')}"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            elif bot.platform == "whatsapp":
                resp = requests.get(
                    "https://graph.facebook.com/v21.0/me",
                    headers={"Authorization": f"Bearer {token}"},
                    timeout=10,
                )
                if resp.status_code == 200:
                    return Response({
                        "detail": "Connection successful.",
                        "platform": bot.platform,
                    })
                else:
                    error_msg = resp.json().get("error", {}).get("message", "Invalid token")
                    return Response(
                        {"detail": f"Connection failed: {error_msg}"},
                        status=status.HTTP_400_BAD_REQUEST,
                    )

            else:
                return Response(
                    {"detail": f"Unsupported platform: {bot.platform}"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        except requests.Timeout:
            return Response(
                {"detail": "Connection failed: request timed out"},
                status=status.HTTP_408_REQUEST_TIMEOUT,
            )
        except Exception as e:
            logger.warning("Bot connection test failed: %s (id=%s): %s", bot.name, bot.id, e)
            return Response(
                {"detail": f"Connection failed: {str(e)}"},
                status=status.HTTP_400_BAD_REQUEST,
            )


class AdminBotViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = BotListSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    filterset_fields = ["platform", "status", "is_active"]
    search_fields = ["name", "owner__email"]

    def get_queryset(self):
        return Bot.objects.annotate(
            messages_count=Count("messages", distinct=True),
            chat_users_count=Count("chat_users", distinct=True),
        ).select_related("owner")
