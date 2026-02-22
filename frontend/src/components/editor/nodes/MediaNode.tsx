import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Image } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function MediaNode({ data, selected }: NodeProps) {
  const { t } = useTranslation("editor");
  const d = data as Record<string, unknown>;
  const mediaType = (d.media_type as string) || "image";
  const caption = (d.caption as string) || "";
  return (
    <div
      className={`min-w-[180px] rounded-xl border border-emerald-500/30 bg-[var(--node-bg)] p-3 backdrop-blur-xl shadow-lg transition-all duration-200 ${
        selected ? "ring-2 ring-primary glow-md" : "shadow-[0_0_15px_-5px_rgba(16,185,129,0.2)]"
      }`}
    >
      <Handle type="target" position={Position.Top} />
      <div className="flex items-center gap-2 text-sm font-medium text-emerald-400">
        <Image className="h-4 w-4" />
        {t("nodes.media")} ({t(`panel.media_${mediaType}`)})
      </div>
      {caption && <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{caption}</p>}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
