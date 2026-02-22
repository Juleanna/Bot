import { useTranslation } from "react-i18next";
import {
  Play,
  MessageSquare,
  GitBranch,
  LayoutGrid,
  Image,
  ClipboardList,
  Globe,
  Square,
  Keyboard,
  MapPin,
  BarChart,
  Smile,
  Dices,
  Phone,
  Timer,
  Activity,
  CreditCard,
} from "lucide-react";

interface NodeDef {
  type: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}

const groups: { key: string; nodes: NodeDef[] }[] = [
  {
    key: "group_flow",
    nodes: [
      { type: "start", icon: Play, color: "text-green-400", bg: "bg-green-500/15 border border-green-500/20 hover:bg-green-500/25" },
      { type: "end", icon: Square, color: "text-gray-400", bg: "bg-gray-500/15 border border-gray-500/20 hover:bg-gray-500/25" },
    ],
  },
  {
    key: "group_actions",
    nodes: [
      { type: "message", icon: MessageSquare, color: "text-blue-400", bg: "bg-blue-500/15 border border-blue-500/20 hover:bg-blue-500/25" },
      { type: "media", icon: Image, color: "text-emerald-400", bg: "bg-emerald-500/15 border border-emerald-500/20 hover:bg-emerald-500/25" },
      { type: "button_menu", icon: LayoutGrid, color: "text-purple-400", bg: "bg-purple-500/15 border border-purple-500/20 hover:bg-purple-500/25" },
      { type: "reply_keyboard", icon: Keyboard, color: "text-teal-400", bg: "bg-teal-500/15 border border-teal-500/20 hover:bg-teal-500/25" },
      { type: "location", icon: MapPin, color: "text-cyan-400", bg: "bg-cyan-500/15 border border-cyan-500/20 hover:bg-cyan-500/25" },
      { type: "poll", icon: BarChart, color: "text-violet-400", bg: "bg-violet-500/15 border border-violet-500/20 hover:bg-violet-500/25" },
      { type: "sticker", icon: Smile, color: "text-pink-400", bg: "bg-pink-500/15 border border-pink-500/20 hover:bg-pink-500/25" },
      { type: "dice", icon: Dices, color: "text-amber-400", bg: "bg-amber-500/15 border border-amber-500/20 hover:bg-amber-500/25" },
      { type: "contact", icon: Phone, color: "text-sky-400", bg: "bg-sky-500/15 border border-sky-500/20 hover:bg-sky-500/25" },
      { type: "invoice", icon: CreditCard, color: "text-lime-400", bg: "bg-lime-500/15 border border-lime-500/20 hover:bg-lime-500/25" },
    ],
  },
  {
    key: "group_logic",
    nodes: [
      { type: "condition", icon: GitBranch, color: "text-yellow-400", bg: "bg-yellow-500/15 border border-yellow-500/20 hover:bg-yellow-500/25" },
      { type: "delay", icon: Timer, color: "text-slate-400", bg: "bg-slate-500/15 border border-slate-500/20 hover:bg-slate-500/25" },
      { type: "chat_action", icon: Activity, color: "text-gray-400", bg: "bg-gray-500/15 border border-gray-500/20 hover:bg-gray-500/25" },
      { type: "form", icon: ClipboardList, color: "text-orange-400", bg: "bg-orange-500/15 border border-orange-500/20 hover:bg-orange-500/25" },
      { type: "webhook", icon: Globe, color: "text-red-400", bg: "bg-red-500/15 border border-red-500/20 hover:bg-red-500/25" },
    ],
  },
];

interface Props {
  onAddNode: (type: string) => void;
}

export default function NodePalette({ onAddNode }: Props) {
  const { t } = useTranslation("editor");

  return (
    <div className="w-56 space-y-3 border-r border-[var(--glass-border)] bg-[var(--glass-bg-subtle)] backdrop-blur-xl p-3 overflow-y-auto">
      <h3 className="text-sm font-semibold text-muted-foreground">{t("panel.node_palette")}</h3>
      {groups.map((group) => (
        <div key={group.key} className="space-y-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 px-1">
            {t(`panel.${group.key}`)}
          </p>
          {group.nodes.map(({ type, icon: Icon, color, bg }) => (
            <button
              key={type}
              className={`flex w-full items-center gap-2 rounded-lg p-2 text-sm font-medium transition-all duration-200 ${bg}`}
              onClick={() => onAddNode(type)}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("application/reactflow", type);
                e.dataTransfer.effectAllowed = "move";
              }}
            >
              <Icon className={`h-4 w-4 ${color}`} />
              <span className="text-foreground/80">{t(`nodes.${type}`)}</span>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
