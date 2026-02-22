import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Play } from "lucide-react";

export default function StartNode({ data, selected }: NodeProps) {
  const command = (data as Record<string, unknown>).command as string | undefined;
  const hasCommand = !!command?.trim();

  if (hasCommand) {
    return (
      <div
        className={`flex items-center gap-2 rounded-full bg-green-500 px-4 py-3 text-white shadow-lg ${
          selected
            ? "ring-2 ring-primary ring-offset-2 ring-offset-background glow-lg"
            : "shadow-[0_0_20px_-5px_rgba(34,197,94,0.4)]"
        }`}
      >
        <Play className="h-5 w-5 shrink-0" />
        <span className="text-sm font-semibold whitespace-nowrap">{command}</span>
        <Handle type="source" position={Position.Bottom} className="!bg-green-400" />
      </div>
    );
  }

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
