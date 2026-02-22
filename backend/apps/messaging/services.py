"""Flow execution engine — processes incoming messages against the bot's flow graph."""

import logging
import re
import time

from apps.common.encryption import decrypt_token
from apps.flows.models import Flow, FlowEdge, FlowNode

from .models import ChatUser, FormSubmission, Message

logger = logging.getLogger(__name__)


class FlowEngine:
    """Stateless per-request flow execution engine."""

    def __init__(self, bot):
        self.bot = bot
        self.flows = list(Flow.objects.filter(bot=bot, is_published=True).prefetch_related("nodes"))

    def _find_flow_for_message(self, incoming_content: dict):
        """Find the right flow based on incoming message.

        Priority:
        1. Exact command match (e.g. /help -> flow with start.command="/help")
        2. Default flow (start.command is empty)
        """
        text = (incoming_content.get("text") or "").strip()
        is_command = text.startswith("/")
        command_word = text.split()[0].lower() if is_command and text else ""

        default_flow = None
        default_start = None

        for flow in self.flows:
            start_node = None
            for node in flow.nodes.all():
                if node.node_type == "start":
                    start_node = node
                    break

            if not start_node:
                continue

            node_command = (start_node.data.get("command") or "").strip()

            if node_command:
                normalized = node_command if node_command.startswith("/") else f"/{node_command}"
                if is_command and command_word == normalized.lower():
                    return flow, start_node
            else:
                if default_flow is None:
                    default_flow = flow
                    default_start = start_node

        return default_flow, default_start

    def process_message(self, platform_user_id: str, user_info: dict, incoming_content: dict):
        """Process an incoming message and return a list of response actions."""
        if not self.flows:
            return [{"type": "text", "text": self.bot.fallback_message}]

        chat_user, created = ChatUser.objects.get_or_create(
            bot=self.bot,
            platform_user_id=platform_user_id,
            defaults={
                "username": user_info.get("username", ""),
                "first_name": user_info.get("first_name", ""),
                "last_name": user_info.get("last_name", ""),
            },
        )

        # Log inbound message
        Message.objects.create(
            bot=self.bot,
            chat_user=chat_user,
            direction="inbound",
            content_type=incoming_content.get("type", "text"),
            content=incoming_content,
        )

        text = (incoming_content.get("text") or "").strip()
        is_command = text.startswith("/")
        current_node = chat_user.current_node

        # Determine which flow to use
        if is_command or not current_node:
            flow, start_node = self._find_flow_for_message(incoming_content)
            if not flow or not start_node:
                return [{"type": "text", "text": self.bot.fallback_message}]
            current_node = start_node
            if is_command:
                chat_user.context_data = {}
        else:
            # Continue in current flow — verify it's still published
            flow = None
            for f in self.flows:
                if current_node.flow_id == f.id:
                    flow = f
                    break
            if not flow:
                flow, start_node = self._find_flow_for_message(incoming_content)
                if not flow or not start_node:
                    return [{"type": "text", "text": self.bot.fallback_message}]
                current_node = start_node

        responses = []
        visited = set()
        node = self._get_next_node(current_node)

        while node and node.id not in visited:
            visited.add(node.id)
            result = self._execute_node(node, chat_user, incoming_content)
            if result.get("responses"):
                responses.extend(result["responses"])
            if result.get("wait_for_input"):
                chat_user.current_node = node
                chat_user.save(update_fields=["current_node", "context_data", "updated_at"])
                break
            next_node = self._resolve_next(node, chat_user, incoming_content)
            if next_node:
                node = next_node
            else:
                chat_user.current_node = None
                chat_user.save(update_fields=["current_node", "updated_at"])
                break

        # Log outbound messages
        for resp in responses:
            Message.objects.create(
                bot=self.bot,
                chat_user=chat_user,
                direction="outbound",
                content_type=resp.get("type", "text"),
                content=resp,
                flow_node=node,
            )

        return responses if responses else [{"type": "text", "text": self.bot.fallback_message}]

    def _execute_node(self, node: FlowNode, chat_user: ChatUser, incoming: dict) -> dict:
        handler = getattr(self, f"_handle_{node.node_type}", None)
        if handler:
            return handler(node, chat_user, incoming)
        return {"responses": [], "wait_for_input": False}

    def _handle_start(self, node, chat_user, incoming):
        return {"responses": [], "wait_for_input": False}

    def _handle_message(self, node, chat_user, incoming):
        text = node.data.get("text", "")
        resp = {"type": "text", "text": text}
        if node.data.get("parse_mode"):
            resp["parse_mode"] = node.data["parse_mode"]
        if node.data.get("disable_notification"):
            resp["disable_notification"] = True
        if node.data.get("protect_content"):
            resp["protect_content"] = True
        if node.data.get("disable_web_page_preview"):
            resp["disable_web_page_preview"] = True
        return {"responses": [resp], "wait_for_input": False}

    def _handle_condition(self, node, chat_user, incoming):
        return {"responses": [], "wait_for_input": False}

    def _handle_button_menu(self, node, chat_user, incoming):
        text = node.data.get("text", "Choose an option:")
        buttons = node.data.get("buttons", [])
        style = node.data.get("style", "inline")
        return {
            "responses": [{"type": "buttons", "text": text, "buttons": buttons, "style": style}],
            "wait_for_input": True,
        }

    def _handle_media(self, node, chat_user, incoming):
        media_type = node.data.get("media_type", "image")
        url = node.data.get("url", "")
        caption = node.data.get("caption", "")
        return {
            "responses": [{"type": media_type, "url": url, "caption": caption}],
            "wait_for_input": False,
        }

    def _handle_form(self, node, chat_user, incoming):
        fields = node.data.get("fields", [])
        context = chat_user.context_data or {}
        form_key = f"form_{node.id}"
        form_state = context.get(form_key, {"current_field_index": 0, "data": {}})
        idx = form_state["current_field_index"]

        if idx > 0 and incoming.get("text"):
            prev_field = fields[idx - 1]
            form_state["data"][prev_field["name"]] = incoming["text"]

        if idx < len(fields):
            field = fields[idx]
            form_state["current_field_index"] = idx + 1
            context[form_key] = form_state
            chat_user.context_data = context
            chat_user.save(update_fields=["context_data", "updated_at"])
            prompt = field.get("prompt", f"Please enter your {field['name']}:")
            return {"responses": [{"type": "text", "text": prompt}], "wait_for_input": True}

        # Form complete
        FormSubmission.objects.create(
            bot=self.bot, chat_user=chat_user, flow_node=node, data=form_state["data"]
        )
        del context[form_key]
        chat_user.context_data = context
        chat_user.save(update_fields=["context_data", "updated_at"])
        return {"responses": [{"type": "text", "text": "Thank you!"}], "wait_for_input": False}

    def _handle_reply_keyboard(self, node, chat_user, incoming):
        text = node.data.get("text", "")
        buttons = node.data.get("buttons", [])
        return {
            "responses": [{
                "type": "reply_keyboard",
                "text": text,
                "buttons": buttons,
                "resize_keyboard": node.data.get("resize_keyboard", True),
                "one_time_keyboard": node.data.get("one_time_keyboard", False),
                "input_placeholder": node.data.get("input_placeholder", ""),
            }],
            "wait_for_input": True,
        }

    def _handle_location(self, node, chat_user, incoming):
        return {
            "responses": [{
                "type": "location",
                "latitude": node.data.get("latitude", 0),
                "longitude": node.data.get("longitude", 0),
                "live_period": node.data.get("live_period", 0),
            }],
            "wait_for_input": False,
        }

    def _handle_poll(self, node, chat_user, incoming):
        resp = {
            "type": "poll",
            "question": node.data.get("question", ""),
            "options": node.data.get("options", []),
            "is_anonymous": node.data.get("is_anonymous", True),
            "poll_type": node.data.get("type", "regular"),
            "allows_multiple_answers": node.data.get("allows_multiple_answers", False),
        }
        if node.data.get("type") == "quiz":
            resp["correct_option_id"] = node.data.get("correct_option_id", 0)
            resp["explanation"] = node.data.get("explanation", "")
        return {"responses": [resp], "wait_for_input": False}

    def _handle_sticker(self, node, chat_user, incoming):
        return {
            "responses": [{
                "type": "sticker",
                "sticker": node.data.get("sticker", ""),
            }],
            "wait_for_input": False,
        }

    def _handle_dice(self, node, chat_user, incoming):
        return {
            "responses": [{
                "type": "dice",
                "emoji": node.data.get("emoji", "\U0001f3b2"),
            }],
            "wait_for_input": False,
        }

    def _handle_contact(self, node, chat_user, incoming):
        return {
            "responses": [{
                "type": "contact",
                "phone_number": node.data.get("phone_number", ""),
                "first_name": node.data.get("first_name", ""),
                "last_name": node.data.get("last_name", ""),
            }],
            "wait_for_input": False,
        }

    def _handle_delay(self, node, chat_user, incoming):
        seconds = node.data.get("seconds", 3)
        responses = []
        if node.data.get("show_typing"):
            responses.append({"type": "chat_action", "action": "typing"})
        responses.append({"type": "delay", "seconds": seconds})
        return {"responses": responses, "wait_for_input": False}

    def _handle_chat_action(self, node, chat_user, incoming):
        action = node.data.get("action", "typing")
        return {
            "responses": [{"type": "chat_action", "action": action}],
            "wait_for_input": False,
        }

    def _handle_invoice(self, node, chat_user, incoming):
        return {
            "responses": [{
                "type": "invoice",
                "title": node.data.get("title", ""),
                "description": node.data.get("description", ""),
                "payload": node.data.get("payload", ""),
                "currency": node.data.get("currency", "USD"),
                "prices": node.data.get("prices", []),
                "photo_url": node.data.get("photo_url", ""),
            }],
            "wait_for_input": False,
        }

    def _handle_goto(self, node, chat_user, incoming):
        return {"responses": [], "wait_for_input": False}

    def _handle_sub_flow(self, node, chat_user, incoming):
        return {"responses": [], "wait_for_input": False}

    def _handle_end(self, node, chat_user, incoming):
        context = chat_user.context_data or {}
        if not context.get("call_stack"):
            chat_user.current_node = None
            chat_user.context_data = {}
            chat_user.save(update_fields=["current_node", "context_data", "updated_at"])
        return {"responses": [], "wait_for_input": False}

    def _get_next_node(self, node: FlowNode):
        edge = FlowEdge.objects.filter(source_node=node).order_by("priority").first()
        return edge.target_node if edge else None

    def _resolve_next(self, node: FlowNode, chat_user: ChatUser, incoming: dict):
        if node.node_type == "goto":
            target_id = node.data.get("target_node_id")
            if target_id:
                return FlowNode.objects.filter(id=target_id).first()
            return None

        if node.node_type == "sub_flow":
            flow_id = node.data.get("flow_id")
            if flow_id:
                context = chat_user.context_data or {}
                stack = context.get("call_stack", [])
                stack.append(str(node.id))
                context["call_stack"] = stack
                chat_user.context_data = context
                chat_user.save(update_fields=["context_data", "updated_at"])
                start = FlowNode.objects.filter(flow_id=flow_id, node_type="start").first()
                if start:
                    return start
            return None

        if node.node_type == "end":
            context = chat_user.context_data or {}
            stack = context.get("call_stack", [])
            if stack:
                return_node_id = stack.pop()
                context["call_stack"] = stack
                chat_user.context_data = context
                chat_user.save(update_fields=["context_data", "updated_at"])
                return_node = FlowNode.objects.filter(id=return_node_id).first()
                if return_node:
                    edge = FlowEdge.objects.filter(source_node=return_node).order_by("priority").first()
                    return edge.target_node if edge else None
            return None

        edges = FlowEdge.objects.filter(source_node=node).order_by("priority").select_related("target_node")

        if node.node_type == "condition":
            condition_type = node.data.get("type", "contains")
            pattern = node.data.get("pattern", "")
            text = incoming.get("text", "")

            match = False
            if condition_type == "contains":
                match = pattern.lower() in text.lower()
            elif condition_type == "regex":
                match = bool(re.search(pattern, text))
            elif condition_type == "exact":
                match = text.lower() == pattern.lower()
            elif condition_type == "command":
                match = text.strip().lower().startswith(f"/{pattern.lower().lstrip('/')}")
            elif condition_type == "media_type":
                match = incoming.get("type", "") == pattern
            elif condition_type == "callback_data":
                match = incoming.get("callback_data", "") == pattern
            elif condition_type == "has_contact":
                match = bool(incoming.get("contact"))
            elif condition_type == "has_location":
                match = bool(incoming.get("location"))

            for edge in edges:
                if match and edge.source_handle == "true":
                    return edge.target_node
                elif not match and edge.source_handle == "false":
                    return edge.target_node

        elif node.node_type == "button_menu":
            button_value = incoming.get("text", "") or incoming.get("button_value", "")
            for edge in edges:
                if edge.source_handle == button_value:
                    return edge.target_node

        # Default: follow first edge
        first = edges.first()
        return first.target_node if first else None
