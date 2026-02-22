import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Smile } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function StickerNode({ data, selected }: NodeProps) {
  const { t } = useTranslation("editor");
  const d = data as Record<string, unknown>;
  const sticker = (d.sticker as string) || "";
  const emoji = (d.emoji as string) || "";
  return (
    <div
      className={`min-w-[180px] rounded-xl border border-pink-500/30 bg-[var(--node-bg)] p-3 backdrop-blur-xl shadow-lg transition-all duration-200 ${
        selected ? "ring-2 ring-primary glow-md" : "shadow-[0_0_15px_-5px_rgba(236,72,153,0.2)]"
      }`}
    >
      <Handle type="target" position={Position.Top} />
      <div className="flex items-center gap-2 text-sm font-medium text-pink-400">
        <Smile className="h-4 w-4" />
        {t("nodes.sticker")}
        {emoji && <span className="text-base">{emoji}</span>}
      </div>
      {sticker && <p className="mt-1 truncate text-xs text-muted-foreground">{sticker}</p>}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
