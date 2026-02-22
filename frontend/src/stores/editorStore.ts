import { create } from "zustand";
import type { Node, Edge } from "@xyflow/react";

interface EditorState {
  nodes: Node[];
  edges: Edge[];
  selectedNodeId: string | null;
  isDirty: boolean;
  setNodes: (nodes: Node[]) => void;
  setEdges: (edges: Edge[]) => void;
  selectNode: (id: string | null) => void;
  setDirty: (dirty: boolean) => void;
  reset: () => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  nodes: [],
  edges: [],
  selectedNodeId: null,
  isDirty: false,
  setNodes: (nodes) => set({ nodes, isDirty: true }),
  setEdges: (edges) => set({ edges, isDirty: true }),
  selectNode: (id) => set({ selectedNodeId: id }),
  setDirty: (isDirty) => set({ isDirty }),
  reset: () =>
    set({ nodes: [], edges: [], selectedNodeId: null, isDirty: false }),
}));
