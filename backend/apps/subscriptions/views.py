from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.common.permissions import IsAdmin

from .models import Plan, UserSubscription
from .serializers import PlanSerializer, UserSubscriptionSerializer


class PlanListView(generics.ListAPIView):
    serializer_class = PlanSerializer
    permission_classes = [permissions.AllowAny]
    authentication_classes = []
    queryset = Plan.objects.filter(is_active=True)


class CurrentSubscriptionView(generics.RetrieveAPIView):
    serializer_class = UserSubscriptionSerializer

    def get_object(self):
        sub, created = UserSubscription.objects.get_or_create(
            user=self.request.user,
            defaults={"plan": Plan.objects.filter(is_active=True).order_by("sort_order").first()},
        )
        return sub


class CheckoutView(APIView):
    def post(self, request):
        # TODO: Implement Stripe Checkout Session creation
        plan_id = request.data.get("plan_id")
        if not plan_id:
            return Response({"detail": "plan_id is required."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            plan = Plan.objects.get(id=plan_id, is_active=True)
        except Plan.DoesNotExist:
            return Response({"detail": "Plan not found."}, status=status.HTTP_404_NOT_FOUND)
        # Placeholder: return a mock checkout URL
        return Response({
            "checkout_url": f"/subscription/checkout?plan={plan.slug}",
            "plan": PlanSerializer(plan).data,
        })


class CustomerPortalView(APIView):
    def post(self, request):
        # TODO: Implement Stripe Customer Portal session
        return Response({"portal_url": "/subscription/portal"})


# Admin views
class AdminPlanListCreateView(generics.ListCreateAPIView):
    serializer_class = PlanSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    queryset = Plan.objects.all()


class AdminPlanDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = PlanSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdmin]
    queryset = Plan.objects.all()
