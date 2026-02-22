import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { ChevronDown, CheckCircle, Copy, Trash2, Plus, FileText } from "lucide-react";
import type { FlowListItem } from "@/types/flow";

interface FlowSelectorProps {
  flows: FlowListItem[];
  currentFlowId: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function FlowSelector({
  flows,
  currentFlowId,
  onSelect,
  onCreate,
  onDuplicate,
  onDelete,
}: FlowSelectorProps) {
  const { t } = useTranslation("editor");
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ top: 0, left: 0 });

  const current = flows.find((f) => f.id === currentFlowId);

  // Position dropdown under trigger
  useEffect(() => {
    if (open && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 6, left: rect.left });
    }
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handle = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        triggerRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      )
        return;
      setOpen(false);
    };
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [open]);

  return (
    <>
      {/* Trigger */}
      <button
        ref={triggerRef}
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] px-3 py-1.5 text-sm font-medium text-foreground backdrop-blur-sm transition-all hover:bg-[var(--glass-bg-hover)] hover:border-[var(--glass-border-hover)] hover:shadow-sm"
      >
        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
        {current ? (
          <>
            <span className="max-w-[160px] truncate">{current.name}</span>
            <span className="text-[10px] text-muted-foreground/70 font-normal">v{current.version}</span>
            {current.is_published && <CheckCircle className="h-3 w-3 text-green-400" />}
          </>
        ) : (
          <span className="text-muted-foreground">{t("flow_selector")}</span>
        )}
        <ChevronDown
          className={`h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown via portal */}
      {open &&
        createPortal(
          <div
            ref={dropdownRef}
            className="fixed z-[9999] w-[340px] overflow-hidden rounded-xl border border-[var(--glass-border-strong)] shadow-2xl animate-fade-in"
            style={{
              top: pos.top,
              left: pos.left,
              background: "var(--glass-bg-strong, var(--glass-bg))",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
            }}
          >
            {/* Header */}
            <div className="px-3 py-2 border-b border-[var(--glass-border)]">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
                {t("flow_selector")}
              </span>
            </div>

            {/* Flow list */}
            <div className="max-h-[280px] overflow-y-auto p-1.5">
              {flows.map((flow) => {
                const isActive = flow.id === currentFlowId;
                return (
                  <div
                    key={flow.id}
                    className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 cursor-pointer transition-all duration-150 ${
                      isActive
                        ? "bg-primary/12 ring-1 ring-primary/20"
                        : "hover:bg-[var(--glass-bg-hover)]"
                    }`}
                    onClick={() => {
                      onSelect(flow.id);
                      setOpen(false);
                    }}
                  >
                    {/* Flow icon */}
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        flow.is_published
                          ? "bg-green-500/15 text-green-400"
                          : "bg-[var(--glass-bg)] text-muted-foreground"
                      }`}
                    >
                      {flow.is_published ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <FileText className="h-4 w-4" />
                      )}
                    </div>

                    {/* Flow info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="truncate text-sm font-medium text-foreground">
                          {flow.name}
                        </span>
                        <span className="shrink-0 text-[10px] text-muted-foreground/60">
                          v{flow.version}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground/70 mt-0.5">
                        {flow.is_published ? (
                          <span className="text-green-400">{t("published")}</span>
                        ) : (
                          <span>{flow.nodes_count} {t("nodes_count")}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                      <button
                        className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-[var(--glass-bg-hover)] transition-colors"
                        title={t("duplicate")}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDuplicate(flow.id);
                          setOpen(false);
                        }}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      {!flow.is_published && (
                        <button
                          className="rounded-md p-1.5 text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title={t("delete_flow")}
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(flow.id);
                            setOpen(false);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Create button */}
            <div className="border-t border-[var(--glass-border)] p-1.5">
              <button
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
                onClick={() => {
                  onCreate();
                  setOpen(false);
                }}
              >
                <Plus className="h-4 w-4" />
                {t("new_flow")}
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
