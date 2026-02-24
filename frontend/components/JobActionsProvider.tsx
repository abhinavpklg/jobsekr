"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useJobActions } from "@/lib/use-job-actions";

type JobActionsContextType = ReturnType<typeof useJobActions>;

const JobActionsContext = createContext<JobActionsContextType | null>(null);

export function JobActionsProvider({ children }: { children: ReactNode }) {
  const actions = useJobActions();
  return (
    <JobActionsContext.Provider value={actions}>
      {children}
    </JobActionsContext.Provider>
  );
}

export function useJobActionsContext(): JobActionsContextType {
  const ctx = useContext(JobActionsContext);
  if (!ctx) {
    throw new Error("useJobActionsContext must be used within JobActionsProvider");
  }
  return ctx;
}