export type NodeType =
  | "start"
  | "message"
  | "condition"
  | "button_menu"
  | "media"
  | "form"
  | "webhook"
  | "google_sheets"
  | "end";

export interface FlowNodeData {
  text?: string;
  buttons?: { label: string; value: string }[];
  style?: "inline" | "quick_reply";
  type?: string;
  pattern?: string;
  case_sensitive?: boolean;
  media_type?: "image" | "video" | "document" | "audio";
  url?: string;
  caption?: string;
  fields?: { name: string; type: string; prompt: string; required: boolean }[];
  webhook_url?: string;
  method?: string;
  headers?: Record<string, string>;
  [key: string]: unknown;
}

export interface FlowNode {
  id: string;
  node_type: NodeType;
  position_x: number;
  position_y: number;
  data: FlowNodeData;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  source_handle: string;
  condition_label: string;
  priority: number;
}

export interface Flow {
  id: string;
  name: string;
  version: number;
  is_published: boolean;
  published_at: string | null;
  nodes: FlowNode[];
  edges: FlowEdge[];
  created_at: string;
  updated_at: string;
}

export interface FlowListItem {
  id: string;
  name: string;
  version: number;
  is_published: boolean;
  published_at: string | null;
  nodes_count: number;
  created_at: string;
}
