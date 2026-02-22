"""Telegram long-polling command — fetches updates and processes them through FlowEngine.

Usage:
    python manage.py run_polling              # all active telegram bots
    python manage.py run_polling --bot-id <uuid>  # specific bot
"""

import logging
import signal
import sys
import time

import requests
from django.core.management.base import BaseCommand

from apps.bots.models import Bot
from apps.common.encryption import decrypt_token
from apps.messaging.services import FlowEngine
from apps.messaging.telegram_sender import TelegramSender, remove_webhook

logger = logging.getLogger(__name__)

BASE_URL = "https://api.telegram.org/bot{token}/{method}"


class Command(BaseCommand):
    help = "Run Telegram long-polling for active bots"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.running = True

    def add_arguments(self, parser):
        parser.add_argument("--bot-id", type=str, help="Specific bot UUID to poll")
        parser.add_argument("--interval", type=float, default=1.0, help="Poll interval in seconds")

    def handle(self, *args, **options):
        signal.signal(signal.SIGINT, self._stop)
        signal.signal(signal.SIGTERM, self._stop)

        bot_id = options.get("bot_id")
        interval = options["interval"]

        if bot_id:
            bots = Bot.objects.filter(id=bot_id, platform="telegram")
        else:
            bots = Bot.objects.filter(platform="telegram", is_active=True)

        if not bots.exists():
            self.stderr.write(self.style.ERROR("No active Telegram bots found."))
            return

        pollers = []
        for bot in bots:
            try:
                token = decrypt_token(bot.api_token_encrypted)
                # Remove any existing webhook so getUpdates works
                remove_webhook(token)
                pollers.append({"bot": bot, "token": token, "offset": 0})
                self.stdout.write(self.style.SUCCESS(f"Polling started for: {bot.name} ({bot.id})"))
            except Exception as e:
                self.stderr.write(self.style.ERROR(f"Failed to init bot {bot.name}: {e}"))

        if not pollers:
            self.stderr.write(self.style.ERROR("No bots could be initialized."))
            return

        self.stdout.write(self.style.SUCCESS(f"Polling {len(pollers)} bot(s). Press Ctrl+C to stop.\n"))

        while self.running:
            for poller in pollers:
                try:
                    self._poll_once(poller)
                except Exception as e:
                    logger.exception("Polling error for bot %s", poller["bot"].name)
                    self.stderr.write(self.style.WARNING(f"Error: {e}"))
            time.sleep(interval)

        self.stdout.write(self.style.SUCCESS("\nPolling stopped."))

    def _poll_once(self, poller: dict):
        token = poller["token"]
        bot = poller["bot"]
        url = BASE_URL.format(token=token, method="getUpdates")
        params = {"offset": poller["offset"], "timeout": 30, "allowed_updates": ["message", "callback_query"]}

        try:
            resp = requests.get(url, params=params, timeout=35)
        except requests.Timeout:
            return

        data = resp.json()
        if not data.get("ok"):
            logger.warning("getUpdates failed for %s: %s", bot.name, data)
            return

        updates = data.get("result", [])
        if not updates:
            return

        engine = FlowEngine(bot)
        sender = TelegramSender(token)

        for update in updates:
            poller["offset"] = update["update_id"] + 1
            self._process_update(bot, engine, sender, update)

    def _process_update(self, bot, engine, sender, update: dict):
        message = update.get("message", {})
        callback_query = update.get("callback_query", {})

        if callback_query:
            from_user = callback_query.get("from", {})
            incoming_content = {
                "type": "button_click",
                "text": callback_query.get("data", ""),
                "button_value": callback_query.get("data", ""),
            }
            chat_id = str(callback_query.get("message", {}).get("chat", {}).get("id", ""))
        elif message:
            from_user = message.get("from", {})
            incoming_content = {
                "type": "text",
                "text": message.get("text", ""),
            }
            chat_id = str(message.get("chat", {}).get("id", ""))
        else:
            return

        if not chat_id:
            return

        platform_user_id = str(from_user.get("id", ""))
        user_info = {
            "username": from_user.get("username", ""),
            "first_name": from_user.get("first_name", ""),
            "last_name": from_user.get("last_name", ""),
        }

        try:
            responses = engine.process_message(platform_user_id, user_info, incoming_content)
            sender.send_responses(chat_id, responses)
            self.stdout.write(
                f"  [{bot.name}] {from_user.get('first_name', '?')}: "
                f"{incoming_content.get('text', '')[:50]} -> {len(responses)} response(s)"
            )
        except Exception as e:
            logger.exception("Error processing update for bot %s", bot.name)
            self.stderr.write(self.style.ERROR(f"  Error: {e}"))

    def _stop(self, signum, frame):
        self.running = False
