import logging
import time

from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.bots.models import Bot
from apps.common.encryption import decrypt_token
from apps.messaging.services import FlowEngine
from apps.messaging.telegram_sender import TelegramSender

from .models import WebhookEvent

logger = logging.getLogger(__name__)


class TelegramWebhookView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request, bot_uuid):
        start = time.time()
        try:
            bot = Bot.objects.get(id=bot_uuid, platform="telegram", is_active=True)
        except Bot.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        payload = request.data
        event = WebhookEvent.objects.create(
            source="telegram", bot=bot, event_type="message", payload=payload
        )

        try:
            message = payload.get("message", {})
            callback_query = payload.get("callback_query", {})

            if callback_query:
                from_user = callback_query.get("from", {})
                incoming_content = {
                    "type": "button_click",
                    "text": callback_query.get("data", ""),
                    "button_value": callback_query.get("data", ""),
                }
            elif message:
                from_user = message.get("from", {})
                incoming_content = {
                    "type": "text",
                    "text": message.get("text", ""),
                }
            else:
                event.status = "processed"
                event.save(update_fields=["status"])
                return Response({"ok": True})

            user_info = {
                "username": from_user.get("username", ""),
                "first_name": from_user.get("first_name", ""),
                "last_name": from_user.get("last_name", ""),
            }
            platform_user_id = str(from_user.get("id", ""))

            engine = FlowEngine(bot)
            responses = engine.process_message(platform_user_id, user_info, incoming_content)

            # Send responses back via Telegram API
            token = decrypt_token(bot.api_token_encrypted)
            sender = TelegramSender(token)
            sender.send_responses(platform_user_id, responses)

            elapsed = int((time.time() - start) * 1000)
            event.status = "processed"
            event.processing_time_ms = elapsed
            event.save(update_fields=["status", "processing_time_ms"])

        except Exception as e:
            logger.exception(f"Error processing Telegram webhook for bot {bot_uuid}")
            event.status = "failed"
            event.error_message = str(e)
            event.save(update_fields=["status", "error_message"])

        return Response({"ok": True})


class ViberWebhookView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def post(self, request, bot_uuid):
        try:
            bot = Bot.objects.get(id=bot_uuid, platform="viber", is_active=True)
        except Bot.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        payload = request.data
        WebhookEvent.objects.create(
            source="viber", bot=bot,
            event_type=payload.get("event", ""),
            payload=payload,
        )

        event_type = payload.get("event")
        if event_type == "message":
            sender = payload.get("sender", {})
            message = payload.get("message", {})
            user_info = {"username": sender.get("name", ""), "first_name": sender.get("name", "")}
            incoming_content = {"type": "text", "text": message.get("text", "")}

            engine = FlowEngine(bot)
            engine.process_message(str(sender.get("id", "")), user_info, incoming_content)

        return Response({"status": 0, "status_message": "ok"})


class WhatsAppWebhookView(APIView):
    permission_classes = [permissions.AllowAny]
    authentication_classes = []

    def get(self, request, bot_uuid):
        """WhatsApp webhook verification."""
        verify_token = request.query_params.get("hub.verify_token", "")
        challenge = request.query_params.get("hub.challenge", "")
        try:
            bot = Bot.objects.get(id=bot_uuid, platform="whatsapp")
            if verify_token == bot.webhook_secret:
                return Response(int(challenge))
        except Bot.DoesNotExist:
            pass
        return Response(status=status.HTTP_403_FORBIDDEN)

    def post(self, request, bot_uuid):
        try:
            bot = Bot.objects.get(id=bot_uuid, platform="whatsapp", is_active=True)
        except Bot.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)

        payload = request.data
        WebhookEvent.objects.create(
            source="whatsapp", bot=bot, event_type="message", payload=payload
        )

        entries = payload.get("entry", [])
        for entry in entries:
            changes = entry.get("changes", [])
            for change in changes:
                value = change.get("value", {})
                messages = value.get("messages", [])
                for msg in messages:
                    from_number = msg.get("from", "")
                    contact = value.get("contacts", [{}])[0] if value.get("contacts") else {}
                    user_info = {"first_name": contact.get("profile", {}).get("name", "")}
                    incoming_content = {"type": "text", "text": msg.get("text", {}).get("body", "")}

                    engine = FlowEngine(bot)
                    engine.process_message(from_number, user_info, incoming_content)

        return Response({"status": "ok"})
