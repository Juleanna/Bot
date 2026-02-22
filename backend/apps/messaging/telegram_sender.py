"""Telegram Bot API sender — converts FlowEngine responses to real Telegram API calls."""

import logging
import time

import requests

logger = logging.getLogger(__name__)

BASE_URL = "https://api.telegram.org/bot{token}/{method}"


class TelegramSender:
    def __init__(self, token: str):
        self.token = token
        self.session = requests.Session()

    def _call(self, method: str, data: dict) -> dict:
        url = BASE_URL.format(token=self.token, method=method)
        resp = self.session.post(url, json=data, timeout=15)
        result = resp.json()
        if not result.get("ok"):
            logger.warning("Telegram API error: %s %s -> %s", method, data, result)
        return result

    def send_responses(self, chat_id: str, responses: list[dict]):
        """Send a list of FlowEngine responses to a Telegram chat."""
        for resp in responses:
            resp_type = resp.get("type", "text")
            handler = getattr(self, f"_send_{resp_type}", None)
            if handler:
                handler(chat_id, resp)
            else:
                logger.warning("Unknown response type: %s", resp_type)

    def _send_text(self, chat_id: str, resp: dict):
        data = {"chat_id": chat_id, "text": resp.get("text", "")}
        if resp.get("parse_mode"):
            data["parse_mode"] = resp["parse_mode"]
        if resp.get("disable_notification"):
            data["disable_notification"] = True
        if resp.get("protect_content"):
            data["protect_content"] = True
        if resp.get("disable_web_page_preview"):
            data["link_preview_options"] = {"is_disabled": True}
        self._call("sendMessage", data)

    def _send_buttons(self, chat_id: str, resp: dict):
        style = resp.get("style", "inline")
        buttons = resp.get("buttons", [])
        data = {"chat_id": chat_id, "text": resp.get("text", "")}

        if style == "inline":
            keyboard = []
            for btn in buttons:
                btn_data = {"text": btn.get("label", btn.get("text", ""))}
                if btn.get("type") == "url":
                    btn_data["url"] = btn.get("url", "")
                elif btn.get("type") == "web_app":
                    btn_data["web_app"] = {"url": btn.get("url", "")}
                else:
                    btn_data["callback_data"] = btn.get("callback_data", btn.get("label", ""))
                keyboard.append([btn_data])
            data["reply_markup"] = {"inline_keyboard": keyboard}
        else:
            keyboard = [[{"text": btn.get("label", btn.get("text", ""))}] for btn in buttons]
            data["reply_markup"] = {
                "keyboard": keyboard,
                "resize_keyboard": True,
                "one_time_keyboard": True,
            }
        self._call("sendMessage", data)

    def _send_reply_keyboard(self, chat_id: str, resp: dict):
        buttons = resp.get("buttons", [])
        keyboard = [[{"text": btn.get("label", btn.get("text", ""))}] for btn in buttons]
        data = {
            "chat_id": chat_id,
            "text": resp.get("text", ""),
            "reply_markup": {
                "keyboard": keyboard,
                "resize_keyboard": resp.get("resize_keyboard", True),
                "one_time_keyboard": resp.get("one_time_keyboard", False),
                "input_field_placeholder": resp.get("input_placeholder", ""),
            },
        }
        self._call("sendMessage", data)

    def _send_image(self, chat_id: str, resp: dict):
        data = {"chat_id": chat_id, "photo": resp.get("url", ""), "caption": resp.get("caption", "")}
        if resp.get("has_spoiler"):
            data["has_spoiler"] = True
        self._call("sendPhoto", data)

    def _send_video(self, chat_id: str, resp: dict):
        data = {"chat_id": chat_id, "video": resp.get("url", ""), "caption": resp.get("caption", "")}
        self._call("sendVideo", data)

    def _send_document(self, chat_id: str, resp: dict):
        data = {"chat_id": chat_id, "document": resp.get("url", ""), "caption": resp.get("caption", "")}
        self._call("sendDocument", data)

    def _send_audio(self, chat_id: str, resp: dict):
        data = {"chat_id": chat_id, "audio": resp.get("url", ""), "caption": resp.get("caption", "")}
        self._call("sendAudio", data)

    def _send_animation(self, chat_id: str, resp: dict):
        data = {"chat_id": chat_id, "animation": resp.get("url", ""), "caption": resp.get("caption", "")}
        self._call("sendAnimation", data)

    def _send_voice(self, chat_id: str, resp: dict):
        data = {"chat_id": chat_id, "voice": resp.get("url", ""), "caption": resp.get("caption", "")}
        self._call("sendVoice", data)

    def _send_video_note(self, chat_id: str, resp: dict):
        data = {"chat_id": chat_id, "video_note": resp.get("url", "")}
        self._call("sendVideoNote", data)

    def _send_sticker(self, chat_id: str, resp: dict):
        data = {"chat_id": chat_id, "sticker": resp.get("sticker", "")}
        self._call("sendSticker", data)

    def _send_location(self, chat_id: str, resp: dict):
        data = {
            "chat_id": chat_id,
            "latitude": resp.get("latitude", 0),
            "longitude": resp.get("longitude", 0),
        }
        live = resp.get("live_period", 0)
        if live and 60 <= live <= 86400:
            data["live_period"] = live
        self._call("sendLocation", data)

    def _send_contact(self, chat_id: str, resp: dict):
        data = {
            "chat_id": chat_id,
            "phone_number": resp.get("phone_number", ""),
            "first_name": resp.get("first_name", ""),
        }
        if resp.get("last_name"):
            data["last_name"] = resp["last_name"]
        self._call("sendContact", data)

    def _send_poll(self, chat_id: str, resp: dict):
        data = {
            "chat_id": chat_id,
            "question": resp.get("question", ""),
            "options": [{"text": o} for o in resp.get("options", [])],
            "is_anonymous": resp.get("is_anonymous", True),
            "type": resp.get("poll_type", "regular"),
            "allows_multiple_answers": resp.get("allows_multiple_answers", False),
        }
        if resp.get("poll_type") == "quiz":
            data["correct_option_id"] = resp.get("correct_option_id", 0)
            if resp.get("explanation"):
                data["explanation"] = resp["explanation"]
        self._call("sendPoll", data)

    def _send_dice(self, chat_id: str, resp: dict):
        data = {"chat_id": chat_id, "emoji": resp.get("emoji", "\U0001f3b2")}
        self._call("sendDice", data)

    def _send_invoice(self, chat_id: str, resp: dict):
        data = {
            "chat_id": chat_id,
            "title": resp.get("title", ""),
            "description": resp.get("description", ""),
            "payload": resp.get("payload", ""),
            "currency": resp.get("currency", "USD"),
            "prices": resp.get("prices", []),
        }
        if resp.get("photo_url"):
            data["photo_url"] = resp["photo_url"]
        self._call("sendInvoice", data)

    def _send_chat_action(self, chat_id: str, resp: dict):
        data = {"chat_id": chat_id, "action": resp.get("action", "typing")}
        self._call("sendChatAction", data)

    def _send_delay(self, chat_id: str, resp: dict):
        seconds = resp.get("seconds", 1)
        time.sleep(min(seconds, 10))


def register_webhook(token: str, webhook_url: str) -> dict:
    """Register a webhook URL with Telegram."""
    url = BASE_URL.format(token=token, method="setWebhook")
    resp = requests.post(url, json={"url": webhook_url}, timeout=15)
    return resp.json()


def remove_webhook(token: str) -> dict:
    """Remove the webhook from Telegram."""
    url = BASE_URL.format(token=token, method="deleteWebhook")
    resp = requests.post(url, timeout=15)
    return resp.json()
