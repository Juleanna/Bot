from datetime import timedelta

from django.db.models import Count, Q
from django.db.models.functions import TruncDate
from django.utils import timezone
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.bots.models import Bot
from apps.common.permissions import IsAdmin
from apps.messaging.models import ChatUser, Message


class OverviewView(APIView):
    def get(self, request):
        user = request.user
        bots = Bot.objects.filter(owner=user)
        total_bots = bots.count()
        active_bots = bots.filter(is_active=True).count()
        total_messages = Message.objects.filter(bot__owner=user).count()
        total_chat_users = ChatUser.objects.filter(bot__owner=user).count()

        return Response({
            "total_bots": total_bots,
            "active_bots": active_bots,
            "total_messages": total_messages,
            "total_chat_users": total_chat_users,
        })


class MessagesChartView(APIView):
    def get(self, request):
        days = int(request.query_params.get("days", 30))
        bot_id = request.query_params.get("bot_id")
        since = timezone.now() - timedelta(days=days)

        qs = Message.objects.filter(bot__owner=request.user, created_at__gte=since)
        if bot_id:
            qs = qs.filter(bot_id=bot_id)

        data = (
            qs.annotate(date=TruncDate("created_at"))
            .values("date")
            .annotate(
                inbound=Count("id", filter=Q(direction="inbound")),
                outbound=Count("id", filter=Q(direction="outbound")),
            )
            .order_by("date")
        )

        return Response(list(data))


class UsersChartView(APIView):
    def get(self, request):
        days = int(request.query_params.get("days", 30))
        bot_id = request.query_params.get("bot_id")
        since = timezone.now() - timedelta(days=days)

        qs = ChatUser.objects.filter(bot__owner=request.user, created_at__gte=since)
        if bot_id:
            qs = qs.filter(bot_id=bot_id)

        data = (
            qs.annotate(date=TruncDate("created_at"))
            .values("date")
            .annotate(count=Count("id"))
            .order_by("date")
        )

        return Response(list(data))


class BotStatsView(APIView):
    def get(self, request, bot_id):
        try:
            bot = Bot.objects.get(id=bot_id, owner=request.user)
        except Bot.DoesNotExist:
            return Response({"detail": "Not found."}, status=404)

        messages = Message.objects.filter(bot=bot)
        return Response({
            "total_messages": messages.count(),
            "inbound_messages": messages.filter(direction="inbound").count(),
            "outbound_messages": messages.filter(direction="outbound").count(),
            "total_chat_users": ChatUser.objects.filter(bot=bot).count(),
            "error_messages": messages.filter(is_error=True).count(),
        })


# Admin views
class AdminStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsAdmin]

    def get(self, request):
        from apps.accounts.models import User

        return Response({
            "total_users": User.objects.count(),
            "active_users": User.objects.filter(is_active=True).count(),
            "total_bots": Bot.objects.count(),
            "active_bots": Bot.objects.filter(is_active=True).count(),
            "total_messages": Message.objects.count(),
            "total_chat_users": ChatUser.objects.count(),
        })
