import { Handle, Position, type NodeProps } from "@xyflow/react";
import { LayoutGrid } from "lucide-react";
import { useTranslation } from "react-i18next";

interface ButtonData {
  label: string;
  value: string;
}

export default function ButtonMenuNode({ data, selected }: NodeProps) {
  const { t } = useTranslation("editor");
  const d = data as Record<string, unknown>;
  const text = (d.text as string) || "Choose:";
  const buttons = (d.buttons as ButtonData[]) || [];
  return (
    <div
      className={`min-w-[200px] rounded-xl border border-purple-500/30 bg-[var(--node-bg)] p-3 backdrop-blur-xl shadow-lg transition-all duration-200 ${
        selected ? "ring-2 ring-primary glow-md" : "shadow-[0_0_15px_-5px_rgba(168,85,247,0.2)]"
      }`}
    >
      <Handle type="target" position={Position.Top} />
      <div className="flex items-center gap-2 text-sm font-medium text-purple-400">
        <LayoutGrid className="h-4 w-4" />
        {t("nodes.button_menu")}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">{text}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        {buttons.map((btn, i) => (
          <span
            key={i}
            className="rounded bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary"
          >
            {btn.label}
          </span>
        ))}
      </div>
      {buttons.map((btn, i) => (
        <Handle
          key={btn.value}
          type="source"
          position={Position.Bottom}
          id={btn.value}
          style={{ left: `${((i + 1) / (buttons.length + 1)) * 100}%` }}
        />
      ))}
      {buttons.length === 0 && <Handle type="source" position={Position.Bottom} />}
    </div>
  );
}
