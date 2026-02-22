import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Square } from "lucide-react";

export default function EndNode({ selected }: NodeProps) {
  return (
    <div
      className={`flex h-16 w-16 items-center justify-center rounded-full bg-red-500 text-white shadow-lg ${
        selected ? "ring-2 ring-primary ring-offset-2 ring-offset-background glow-lg" : "shadow-[0_0_20px_-5px_rgba(248,113,113,0.4)]"
      }`}
    >
      <Square className="h-5 w-5" />
      <Handle type="target" position={Position.Top} className="!bg-red-400" />
    </div>
  );
}
