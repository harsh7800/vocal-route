export type ActionKind = "read" | "write";

export interface Action {
  id: string;
  label: string;
  kind: ActionKind;
  requiresConfirmation: boolean;
  execute: () => Promise<void>;
}

export const createAction = (
  label: string, 
  kind: ActionKind, 
  execute: () => Promise<void>,
  requiresConfirmation: boolean = kind === "write"
): Action => {
  return {
    id: `action_${Math.random().toString(36).substr(2, 9)}`,
    label,
    kind,
    requiresConfirmation,
    execute,
  };
};
