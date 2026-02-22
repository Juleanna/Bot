from django.urls import path

from . import views

urlpatterns = [
    path("plans/", views.PlanListView.as_view(), name="plan_list"),
    path("current/", views.CurrentSubscriptionView.as_view(), name="current_subscription"),
    path("checkout/", views.CheckoutView.as_view(), name="checkout"),
    path("portal/", views.CustomerPortalView.as_view(), name="customer_portal"),
    # Admin
    path("admin/plans/", views.AdminPlanListCreateView.as_view(), name="admin_plans"),
    path("admin/plans/<uuid:pk>/", views.AdminPlanDetailView.as_view(), name="admin_plan_detail"),
]
