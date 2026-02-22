import { Handle, Position, type NodeProps } from "@xyflow/react";
import { ClipboardList } from "lucide-react";
import { useTranslation } from "react-i18next";
import { SideHandles } from "./SideHandles";

interface FieldData {
  name: string;
  type: string;
}

export default function FormNode({ data, selected }: NodeProps) {
  const { t } = useTranslation("editor");
  const d = data as Record<string, unknown>;
  const fields = (d.fields as FieldData[]) || [];
  return (
    <div
      className={`min-w-[180px] rounded-xl border border-orange-500/30 bg-[var(--node-bg)] p-3 backdrop-blur-xl shadow-lg transition-all duration-200 ${
        selected ? "ring-2 ring-primary glow-md" : "shadow-[0_0_15px_-5px_rgba(249,115,22,0.2)]"
      }`}
    >
      <Handle type="target" position={Position.Top} />
      <div className="flex items-center gap-2 text-sm font-medium text-orange-400">
        <ClipboardList className="h-4 w-4" />
        {t("nodes.form")}
      </div>
      <div className="mt-1 space-y-0.5">
        {fields.map((f, i) => (
          <p key={i} className="text-xs text-muted-foreground">
            {f.name} ({f.type})
          </p>
        ))}
        {fields.length === 0 && (
          <p className="text-xs text-muted-foreground">{t("panel.no_fields")}</p>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} />
      <SideHandles />
    </div>
  );
}
