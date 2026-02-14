export type ObjectiveStatus = "active" | "refining" | "paused" | "completed" | "aborted";

export interface Objective {
  id: string;
  title: string;              // Human readable
  parameters?: Record<string, any>;
  status: ObjectiveStatus;
  createdAt: number;
  updatedAt: number;
}

export const createObjective = (title: string, parameters?: Record<string, any>): Objective => {
  const now = Date.now();
  return {
    id: `obj_${Math.random().toString(36).substr(2, 9)}`,
    title,
    parameters,
    status: "active",
    createdAt: now,
    updatedAt: now,
  };
};
