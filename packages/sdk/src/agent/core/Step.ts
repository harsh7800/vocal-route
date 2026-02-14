export type StepStatus = "pending" | "completed" | "waiting";

export interface Step {
  id: string;
  label: string; // Exact copy shown to user
  status: StepStatus;
  timestamp: number;
  completedAt?: Date;
}

export const createStep = (
  label: string,
  status: StepStatus = "pending",
): Step => {
  return {
    id: `step_${Math.random().toString(36).substr(2, 9)}`,
    label,
    status,
    timestamp: Date.now(),
  };
};
