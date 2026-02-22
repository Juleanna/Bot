import { Handle, Position, type NodeProps } from "@xyflow/react";
import { Phone } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function ContactNode({ data, selected }: NodeProps) {
  const { t } = useTranslation("editor");
  const d = data as Record<string, unknown>;
  const phone = (d.phone_number as string) || "";
  const firstName = (d.first_name as string) || "";
  const lastName = (d.last_name as string) || "";
  const name = [firstName, lastName].filter(Boolean).join(" ");
  return (
    <div
      className={`min-w-[180px] rounded-xl border border-sky-500/30 bg-[var(--node-bg)] p-3 backdrop-blur-xl shadow-lg transition-all duration-200 ${
        selected ? "ring-2 ring-primary glow-md" : "shadow-[0_0_15px_-5px_rgba(14,165,233,0.2)]"
      }`}
    >
      <Handle type="target" position={Position.Top} />
      <div className="flex items-center gap-2 text-sm font-medium text-sky-400">
        <Phone className="h-4 w-4" />
        {t("nodes.contact")}
      </div>
      {name && <p className="mt-1 text-xs text-muted-foreground">{name}</p>}
      {phone && <p className="text-xs text-muted-foreground">{phone}</p>}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
