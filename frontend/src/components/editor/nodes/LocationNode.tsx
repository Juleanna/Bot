import { Handle, Position, type NodeProps } from "@xyflow/react";
import { MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SideHandles } from "./SideHandles";

export default function LocationNode({ data, selected }: NodeProps) {
  const { t } = useTranslation("editor");
  const d = data as Record<string, unknown>;
  const lat = d.latitude as number | undefined;
  const lng = d.longitude as number | undefined;
  const live = (d.live_period as number) || 0;
  return (
    <div
      className={`min-w-[180px] rounded-xl border border-cyan-500/30 bg-[var(--node-bg)] p-3 backdrop-blur-xl shadow-lg transition-all duration-200 ${
        selected ? "ring-2 ring-primary glow-md" : "shadow-[0_0_15px_-5px_rgba(6,182,212,0.2)]"
      }`}
    >
      <Handle type="target" position={Position.Top} />
      <div className="flex items-center gap-2 text-sm font-medium text-cyan-400">
        <MapPin className="h-4 w-4" />
        {t("nodes.location")}
        {live > 0 && (
          <span className="rounded bg-cyan-500/15 border border-cyan-500/20 px-1 text-xs text-cyan-400">LIVE</span>
        )}
      </div>
      {lat != null && lng != null && (
        <p className="mt-1 text-xs text-muted-foreground">{lat.toFixed(4)}, {lng.toFixed(4)}</p>
      )}
      <Handle type="source" position={Position.Bottom} />
      <SideHandles />
    </div>
  );
}
