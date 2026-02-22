import logging

from django.db.models import Count
from django.utils import timezone
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Flow
from .serializers import FlowListSerializer, FlowSerializer

logger = logging.getLogger(__name__)


class FlowViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == "list":
            return FlowListSerializer
        return FlowSerializer

    def get_queryset(self):
        bot_id = self.kwargs["bot_id"]
        qs = Flow.objects.filter(bot_id=bot_id, bot__owner=self.request.user)
        if self.action == "list":
            qs = qs.annotate(nodes_count=Count("nodes"))
        return qs.order_by("-created_at")

    def perform_create(self, serializer):
        bot_id = self.kwargs["bot_id"]
        last_version = (
            Flow.objects.filter(bot_id=bot_id).order_by("-version").values_list("version", flat=True).first()
        ) or 0
        serializer.save(bot_id=bot_id, version=last_version + 1)

    @action(detail=True, methods=["post"])
    def publish(self, request, bot_id=None, pk=None):
        flow = self.get_object()
        Flow.objects.filter(bot_id=bot_id, is_published=True).update(is_published=False)
        flow.is_published = True
        flow.published_at = timezone.now()
        flow.save(update_fields=["is_published", "published_at", "updated_at"])
        logger.info("Flow published: %s (id=%s) for bot=%s", flow.name, flow.id, bot_id)
        return Response({"detail": "Flow published."})

    @action(detail=True, methods=["post"])
    def duplicate(self, request, bot_id=None, pk=None):
        flow = self.get_object()
        last_version = (
            Flow.objects.filter(bot_id=bot_id).order_by("-version").values_list("version", flat=True).first()
        ) or 0
        new_flow = Flow.objects.create(
            bot_id=bot_id,
            name=f"{flow.name} (copy)",
            version=last_version + 1,
        )
        node_id_map = {}
        for node in flow.nodes.all():
            old_id = node.id
            from apps.flows.models import FlowNode
            new_node = FlowNode.objects.create(
                flow=new_flow,
                node_type=node.node_type,
                position_x=node.position_x,
                position_y=node.position_y,
                data=node.data,
            )
            node_id_map[old_id] = new_node

        for edge in flow.edges.all():
            from apps.flows.models import FlowEdge
            if edge.source_node_id in node_id_map and edge.target_node_id in node_id_map:
                FlowEdge.objects.create(
                    flow=new_flow,
                    source_node=node_id_map[edge.source_node_id],
                    target_node=node_id_map[edge.target_node_id],
                    source_handle=edge.source_handle,
                    condition_label=edge.condition_label,
                    priority=edge.priority,
                )

        return Response(
            FlowSerializer(new_flow).data,
            status=status.HTTP_201_CREATED,
        )

    def perform_destroy(self, instance):
        if instance.is_published:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({"detail": "Cannot delete a published flow. Unpublish it first."})
        instance.delete()

    @action(detail=True, methods=["post"])
    def validate(self, request, bot_id=None, pk=None):
        flow = self.get_object()
        errors = []
        nodes = flow.nodes.all()
        start_nodes = [n for n in nodes if n.node_type == "start"]
        if len(start_nodes) == 0:
            errors.append("Flow must have a Start node.")
        elif len(start_nodes) > 1:
            errors.append("Flow can only have one Start node.")

        if not errors:
            return Response({"valid": True, "errors": []})
        return Response({"valid": False, "errors": errors}, status=status.HTTP_400_BAD_REQUEST)
