import { useContext } from "react";

import { WorkbenchContext } from "@/features/workbench/workbench-store";

export function useWorkbench() {
  const context = useContext(WorkbenchContext);
  if (!context) {
    throw new Error("useWorkbench must be used inside WorkbenchProvider");
  }
  return context;
}
