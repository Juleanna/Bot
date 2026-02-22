import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ArrowLeft, Save, Upload, CheckCircle, Pencil } from "lucide-react";
import type { Node, Edge } from "@xyflow/react";
import { Button } from "@/components/ui/button";
import { useBot } from "@/api/hooks/useBots";
import { useFlows, useFlow, useCreateFlow, useSaveFlow, usePublishFlow } from "@/api/hooks/useFlows";
import FlowCanvas, { type FlowCanvasHandle } from "@/components/editor/FlowCanvas";

export default function BotEditor() {
  const { botId } = useParams<{ botId: string }>();
  const { t } = useTranslation("editor");
  const navigate = useNavigate();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [flowName, setFlowName] = useState("");
  const canvasRef = useRef<FlowCanvasHandle>(null);

  const { data: bot } = useBot(botId!);
  const { data: flows } = useFlows(botId!);
  const createFlow = useCreateFlow(botId!);

  const latestFlow = flows?.[0];
  const { data: flow, isLoading: flowLoading } = useFlow(botId!, latestFlow?.id ?? "");

  const saveMutation = useSaveFlow(botId!, flow?.id ?? "");
  const publishMutation = usePublishFlow(botId!, flow?.id ?? "");

  useEffect(() => {
    if (flow?.name) setFlowName(flow.name);
  }, [flow?.name]);

  const initialNodes: Node[] = useMemo(
    () =>
      (flow?.nodes ?? []).map((n) => ({
        id: n.id,
        type: n.node_type,
        position: { x: n.position_x, y: n.position_y },
        data: n.data,
      })),
    [flow]
  );

  const initialEdges: Edge[] = useMemo(
    () =>
      (flow?.edges ?? []).map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.source_handle || undefined,
        label: e.condition_label || undefined,
      })),
    [flow]
  );

  const handleSave = useCallback(
    (nodes: Node[], edges: Edge[]) => {
      if (!flow) return;
      saveMutation.mutate({
        name: flowName || flow.name,
        nodes: nodes.map((n) => ({
          id: n.id,
          node_type: n.type,
          position_x: n.position.x,
          position_y: n.position.y,
          data: n.data,
        })),
        edges: edges.map((e) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          source_handle: e.sourceHandle ?? "",
          condition_label: typeof e.label === "string" ? e.label : "",
          priority: 0,
        })),
      });
    },
    [flow, saveMutation]
  );

  const handleCreateFlow = () => {
    createFlow.mutate({ name: t("default_flow_name") });
  };

  if (!flow && !flowLoading && flows && flows.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">{t("no_flow")}</p>
        <Button onClick={handleCreateFlow} disabled={createFlow.isPending}>
          {t("create_flow")}
        </Button>
      </div>
    );
  }

  if (flowLoading || !flow) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col -m-6">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] backdrop-blur-xl px-4 py-2">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/bots")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <span className="font-semibold text-foreground">{bot?.name}</span>
          <span className="text-muted-foreground">/</span>
          {editingName ? (
            <input
              autoFocus
              className="bg-transparent text-sm font-medium text-foreground border-b border-primary outline-none px-1 py-0.5 w-40"
              value={flowName}
              placeholder={t("flow_name_placeholder")}
              onChange={(e) => setFlowName(e.target.value)}
              onBlur={() => setEditingName(false)}
              onKeyDown={(e) => {
                if (e.key === "Enter") setEditingName(false);
                if (e.key === "Escape") {
                  setFlowName(flow.name);
                  setEditingName(false);
                }
              }}
            />
          ) : (
            <button
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setEditingName(true)}
            >
              {flowName || flow.name} <Pencil className="h-3 w-3" />
            </button>
          )}
          <span className="text-xs text-muted-foreground">v{flow.version}</span>
          {flow.is_published && (
            <span className="flex items-center gap-1 text-xs text-green-400">
              <CheckCircle className="h-3 w-3" /> {t("published")}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => canvasRef.current?.save()} disabled={saveMutation.isPending}>
            <Save className="mr-1 h-3 w-3" />
            {t("save")}
          </Button>
          <Button size="sm" onClick={() => publishMutation.mutate()} disabled={publishMutation.isPending}>
            <Upload className="mr-1 h-3 w-3" />
            {t("publish")}
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <FlowCanvas
          ref={canvasRef}
          initialNodes={initialNodes}
          initialEdges={initialEdges}
          onSave={handleSave}
          selectedNodeId={selectedNodeId}
          onSelectNode={setSelectedNodeId}
        />
      </div>
    </div>
  );
}
