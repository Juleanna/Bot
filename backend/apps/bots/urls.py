from django.urls import include, path
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"", views.BotViewSet, basename="bot")

urlpatterns = [
    path("", include(router.urls)),
    path("<uuid:bot_id>/flows/", include("apps.flows.urls")),
]
