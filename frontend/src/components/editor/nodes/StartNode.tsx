import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Play } from "lucide-react";

export default function StartNode({ selected }: NodeProps) {
  return (
    <div
      className={`flex h-16 w-16 items-center justify-center rounded-full bg-green-500 text-white shadow-lg ${
        selected ? "ring-2 ring-primary ring-offset-2 ring-offset-background glow-lg" : "shadow-[0_0_20px_-5px_rgba(34,197,94,0.4)]"
      }`}
    >
      <Play className="h-6 w-6" />
      <Handle type="source" position={Position.Bottom} className="!bg-green-400" />
    </div>
  );
}
