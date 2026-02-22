from django.urls import path

from . import views

urlpatterns = [
    path("overview/", views.OverviewView.as_view(), name="dashboard_overview"),
    path("messages/", views.MessagesChartView.as_view(), name="dashboard_messages"),
    path("users/", views.UsersChartView.as_view(), name="dashboard_users"),
    path("bots/<uuid:bot_id>/stats/", views.BotStatsView.as_view(), name="bot_stats"),
    # Admin
    path("admin/stats/", views.AdminStatsView.as_view(), name="admin_stats"),
]
