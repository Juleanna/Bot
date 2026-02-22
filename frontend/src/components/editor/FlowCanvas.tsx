import { useCallback, useMemo, useRef, forwardRef, useImperativeHandle } from "react";
import {
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  type Connection,
  type Edge,
  type Node,
  type NodeTypes,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import StartNode from "./nodes/StartNode";
import MessageNode from "./nodes/MessageNode";
import ConditionNode from "./nodes/ConditionNode";
import ButtonMenuNode from "./nodes/ButtonMenuNode";
import MediaNode from "./nodes/MediaNode";
import FormNode from "./nodes/FormNode";
import WebhookNode from "./nodes/WebhookNode";
import EndNode from "./nodes/EndNode";
import ReplyKeyboardNode from "./nodes/ReplyKeyboardNode";
import LocationNode from "./nodes/LocationNode";
import PollNode from "./nodes/PollNode";
import StickerNode from "./nodes/StickerNode";
import DiceNode from "./nodes/DiceNode";
import ContactNode from "./nodes/ContactNode";
import DelayNode from "./nodes/DelayNode";
import ChatActionNode from "./nodes/ChatActionNode";
import InvoiceNode from "./nodes/InvoiceNode";
import GotoNode from "./nodes/GotoNode";
import SubFlowNode from "./nodes/SubFlowNode";
import NodePalette from "./NodePalette";
import PropertiesPanel from "./PropertiesPanel";
import type { FlowListItem } from "@/types/flow";

const nodeTypes: NodeTypes = {
  start: StartNode,
  message: MessageNode,
  condition: ConditionNode,
  button_menu: ButtonMenuNode,
  media: MediaNode,
  form: FormNode,
  webhook: WebhookNode,
  end: EndNode,
  reply_keyboard: ReplyKeyboardNode,
  location: LocationNode,
  poll: PollNode,
  sticker: StickerNode,
  dice: DiceNode,
  contact: ContactNode,
  delay: DelayNode,
  chat_action: ChatActionNode,
  invoice: InvoiceNode,
  goto: GotoNode,
  sub_flow: SubFlowNode,
};

const defaultEdgeOptions = {
  style: { stroke: "#818cf8", strokeWidth: 2 },
  type: "smoothstep" as const,
  animated: true,
};

const connectionLineStyle = {
  stroke: "#818cf8",
  strokeWidth: 2,
};

interface Props {
  initialNodes: Node[];
  initialEdges: Edge[];
  onSave: (nodes: Node[], edges: Edge[]) => void;
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  flows?: FlowListItem[];
}

export interface FlowCanvasHandle {
  save: () => void;
}

const FlowCanvas = forwardRef<FlowCanvasHandle, Props>(function FlowCanvas({
  initialNodes,
  initialEdges,
  onSave,
  selectedNodeId,
  onSelectNode,
  flows,
}, ref) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("application/reactflow");
      if (!type) return;

      const bounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!bounds) return;

      const position = {
        x: event.clientX - bounds.left - 80,
        y: event.clientY - bounds.top - 20,
      };

      const newNode: Node = {
        id: crypto.randomUUID(),
        type,
        position,
        data: getDefaultData(type),
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes]
  );

  const handleAddNode = useCallback(
    (type: string) => {
      const newNode: Node = {
        id: crypto.randomUUID(),
        type,
        position: { x: 250, y: nodes.length * 100 + 50 },
        data: getDefaultData(type),
      };
      setNodes((nds) => nds.concat(newNode));
    },
    [nodes.length, setNodes]
  );

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId]
  );

  const handleNodeDataUpdate = useCallback(
    (id: string, data: Record<string, unknown>) => {
      setNodes((nds) =>
        nds.map((n) => (n.id === id ? { ...n, data } : n))
      );
    },
    [setNodes]
  );

  useImperativeHandle(ref, () => ({
    save: () => onSave(nodes, edges),
  }), [nodes, edges, onSave]);

  return (
    <div className="flex h-full overflow-hidden">
      <NodePalette onAddNode={handleAddNode} />
      <div className="flex-1" ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onNodeClick={(_, node) => onSelectNode(node.id)}
          onPaneClick={() => onSelectNode(null)}
          nodeTypes={nodeTypes}
          defaultEdgeOptions={defaultEdgeOptions}
          connectionLineStyle={connectionLineStyle}
          fitView
          deleteKeyCode={["Backspace", "Delete"]}
        >
          <Controls />
          <Background color="var(--glass-border)" gap={20} />
          <MiniMap
            zoomable
            pannable
            style={{
              background: "var(--glass-bg)",
              border: "1px solid var(--glass-border)",
              borderRadius: "12px",
            }}
            nodeColor="rgba(129,140,248,0.5)"
            maskColor="var(--glass-bg-subtle)"
          />
        </ReactFlow>
      </div>
      <PropertiesPanel node={selectedNode} onUpdate={handleNodeDataUpdate} nodes={nodes} flows={flows} />
    </div>
  );
});

export default FlowCanvas;

function getDefaultData(type: string): Record<string, unknown> {
  switch (type) {
    case "start":
      return { command: "" };
    case "message":
      return { text: "Hello!" };
    case "condition":
      return { type: "contains", pattern: "", case_sensitive: false };
    case "button_menu":
      return { text: "Choose an option:", buttons: [], style: "inline" };
    case "media":
      return { media_type: "image", url: "", caption: "" };
    case "form":
      return { fields: [] };
    case "webhook":
      return { webhook_url: "", method: "POST", headers: {} };
    case "reply_keyboard":
      return { text: "", buttons: [], resize_keyboard: true, one_time_keyboard: false, input_placeholder: "" };
    case "location":
      return { latitude: 0, longitude: 0, live_period: 0 };
    case "poll":
      return { question: "", options: ["", ""], is_anonymous: true, type: "regular", allows_multiple_answers: false };
    case "sticker":
      return { sticker: "", emoji: "" };
    case "dice":
      return { emoji: "\uD83C\uDFB2" };
    case "contact":
      return { phone_number: "", first_name: "", last_name: "" };
    case "delay":
      return { seconds: 3, show_typing: true };
    case "chat_action":
      return { action: "typing" };
    case "invoice":
      return { title: "", description: "", payload: "", currency: "USD", prices: [], photo_url: "" };
    case "goto":
      return { target_node_id: "" };
    case "sub_flow":
      return { flow_id: "" };
    default:
      return {};
  }
}
