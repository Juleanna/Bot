from django.utils import timezone
from rest_framework import serializers

from .models import Flow, FlowEdge, FlowNode


class FlowNodeSerializer(serializers.ModelSerializer):
    id = serializers.UUIDField(required=False)

    class Meta:
        model = FlowNode
        fields = ["id", "node_type", "position_x", "position_y", "data"]


class FlowEdgeSerializer(serializers.ModelSerializer):
    source = serializers.UUIDField(source="source_node_id")
    target = serializers.UUIDField(source="target_node_id")

    class Meta:
        model = FlowEdge
        fields = ["id", "source", "target", "source_handle", "condition_label", "priority"]
        read_only_fields = ["id"]


class FlowSerializer(serializers.ModelSerializer):
    nodes = FlowNodeSerializer(many=True, required=False)
    edges = FlowEdgeSerializer(many=True, required=False)

    class Meta:
        model = Flow
        fields = [
            "id", "name", "version", "is_published",
            "published_at", "nodes", "edges",
            "created_at", "updated_at",
        ]
        read_only_fields = ["id", "version", "is_published", "published_at", "created_at", "updated_at"]

    def create(self, validated_data):
        nodes_data = validated_data.pop("nodes", [])
        edges_data = validated_data.pop("edges", [])
        flow = Flow.objects.create(**validated_data)
        self._create_nodes_and_edges(flow, nodes_data, edges_data)
        return flow

    def update(self, instance, validated_data):
        nodes_data = validated_data.pop("nodes", None)
        edges_data = validated_data.pop("edges", None)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if nodes_data is not None and edges_data is not None:
            instance.nodes.all().delete()
            instance.edges.all().delete()
            self._create_nodes_and_edges(instance, nodes_data, edges_data)

        return instance

    def _create_nodes_and_edges(self, flow, nodes_data, edges_data):
        node_id_map = {}
        for node_data in nodes_data:
            old_id = node_data.pop("id", None)
            node = FlowNode.objects.create(flow=flow, **node_data)
            if old_id:
                node_id_map[str(old_id)] = node

        for edge_data in edges_data:
            source_id = str(edge_data.pop("source_node_id"))
            target_id = str(edge_data.pop("target_node_id"))
            source_node = node_id_map.get(source_id)
            target_node = node_id_map.get(target_id)
            if source_node and target_node:
                FlowEdge.objects.create(
                    flow=flow,
                    source_node=source_node,
                    target_node=target_node,
                    **edge_data,
                )


class FlowListSerializer(serializers.ModelSerializer):
    nodes_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Flow
        fields = ["id", "name", "version", "is_published", "published_at", "nodes_count", "created_at"]
