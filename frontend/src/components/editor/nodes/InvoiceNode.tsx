import { Handle, Position, type NodeProps } from "@xyflow/react";
import { CreditCard } from "lucide-react";
import { useTranslation } from "react-i18next";

interface PriceItem {
  label: string;
  amount: number;
}

export default function InvoiceNode({ data, selected }: NodeProps) {
  const { t } = useTranslation("editor");
  const d = data as Record<string, unknown>;
  const title = (d.title as string) || "";
  const currency = (d.currency as string) || "USD";
  const prices = (d.prices as PriceItem[]) || [];
  const total = prices.reduce((sum, p) => sum + (p.amount || 0), 0);
  return (
    <div
      className={`min-w-[180px] rounded-xl border border-lime-500/30 bg-[var(--node-bg)] p-3 backdrop-blur-xl shadow-lg transition-all duration-200 ${
        selected ? "ring-2 ring-primary glow-md" : "shadow-[0_0_15px_-5px_rgba(132,204,22,0.2)]"
      }`}
    >
      <Handle type="target" position={Position.Top} />
      <div className="flex items-center gap-2 text-sm font-medium text-lime-400">
        <CreditCard className="h-4 w-4" />
        {t("nodes.invoice")}
      </div>
      {title && <p className="mt-1 text-xs text-muted-foreground line-clamp-1">{title}</p>}
      {total > 0 && (
        <p className="text-xs font-medium text-lime-400">{(total / 100).toFixed(2)} {currency}</p>
      )}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
