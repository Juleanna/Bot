"""
Seed initial subscription plans.
Run with: python manage.py shell < ../scripts/seed-plans.py
Or: docker compose exec backend python manage.py shell < scripts/seed-plans.py
"""
from apps.subscriptions.models import Plan

plans = [
    {
        "name": "Free",
        "slug": "free",
        "description": "Get started with basic features",
        "price_monthly": 0,
        "price_yearly": 0,
        "max_bots": 1,
        "max_messages_per_month": 500,
        "max_chat_users": 50,
        "features": {"google_sheets": False, "webhooks": False, "whatsapp": False},
        "trial_days": 0,
        "sort_order": 0,
    },
    {
        "name": "Pro",
        "slug": "pro",
        "description": "For growing businesses",
        "price_monthly": 19.99,
        "price_yearly": 199.99,
        "max_bots": 5,
        "max_messages_per_month": 10000,
        "max_chat_users": 1000,
        "features": {"google_sheets": True, "webhooks": True, "whatsapp": False},
        "trial_days": 14,
        "sort_order": 1,
    },
    {
        "name": "Business",
        "slug": "business",
        "description": "For enterprises with advanced needs",
        "price_monthly": 49.99,
        "price_yearly": 499.99,
        "max_bots": 20,
        "max_messages_per_month": 50000,
        "max_chat_users": 10000,
        "features": {"google_sheets": True, "webhooks": True, "whatsapp": True},
        "trial_days": 14,
        "sort_order": 2,
    },
]

for plan_data in plans:
    plan, created = Plan.objects.update_or_create(
        slug=plan_data["slug"],
        defaults=plan_data,
    )
    status = "Created" if created else "Updated"
    print(f"{status}: {plan.name}")

print("Done seeding plans!")
