from django.contrib import admin

from .models import Flow, FlowEdge, FlowNode


class FlowNodeInline(admin.TabularInline):
    model = FlowNode
    extra = 0
    fields = ["node_type", "position_x", "position_y", "data"]


@admin.register(Flow)
class FlowAdmin(admin.ModelAdmin):
    list_display = ["name", "bot", "version", "is_published", "created_at"]
    list_filter = ["is_published"]
    inlines = [FlowNodeInline]


@admin.register(FlowNode)
class FlowNodeAdmin(admin.ModelAdmin):
    list_display = ["node_type", "flow", "created_at"]
    list_filter = ["node_type"]


@admin.register(FlowEdge)
class FlowEdgeAdmin(admin.ModelAdmin):
    list_display = ["flow", "source_node", "target_node", "condition_label"]
