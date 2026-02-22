from django.urls import path

from . import views

urlpatterns = [
    path("telegram/<uuid:bot_uuid>/", views.TelegramWebhookView.as_view(), name="telegram_webhook"),
    path("viber/<uuid:bot_uuid>/", views.ViberWebhookView.as_view(), name="viber_webhook"),
    path("whatsapp/<uuid:bot_uuid>/", views.WhatsAppWebhookView.as_view(), name="whatsapp_webhook"),
]
