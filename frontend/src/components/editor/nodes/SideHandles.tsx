import { Handle, Position } from "@xyflow/react";

export function SideHandles() {
  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        className="!w-2 !h-2 !bg-muted-foreground/30 hover:!bg-primary/60 !border-0"
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        className="!w-2 !h-2 !bg-muted-foreground/30 hover:!bg-primary/60 !border-0"
      />
    </>
  );
}
