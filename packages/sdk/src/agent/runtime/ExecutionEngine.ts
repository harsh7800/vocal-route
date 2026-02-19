import { vocalRegistry } from "./Registry";
import { Agent } from "../core/Agent";
import { AgentState } from "../types/AgentState";

export class ExecutionEngine {
  private agent: Agent;

  constructor(agent: Agent) {
    this.agent = agent;
  }

  public async processIntent(resolution: {
    capability: string;
    params?: any;
  }): Promise<any> {
    const capability = vocalRegistry.getCapability(resolution.capability);

    if (!capability) {
      console.error(
        `[VocalRoute] Capability "${resolution.capability}" not found.`,
      );
      this.agent.transition("FAIL", {
        message: `Unknown capability: ${resolution.capability}`,
      });
      return;
    }

    this.agent.transition("START_EXECUTING");
    this.agent.addStep(`Preparing ${capability.id}...`, "pending");

    if (capability.params) {
      this.agent.setActiveForm({
        capabilityId: capability.id,
        fields: capability.params.map((p) => ({
          name: p.name,
          label: p.label || p.name,
          type: p.type,
          value: resolution.params?.[p.name] ?? "",
          required: p.required,
          options: p.options,
        })),
      });
    }

    try {
      // 1. Entity Resolution
      if (capability.entity && !resolution.params?.[capability.entity.param]) {
        const entityType = capability.entity.type;
        const paramName = capability.entity.param;
        const config = vocalRegistry.getEntityConfig(entityType);

        if (!config) {
          console.error(
            `[VocalRoute] Entity type "${entityType}" required by "${capability.id}" is not registered.`,
          );
          this.agent.transition("FAIL", {
            message: `System Error: Entity ${entityType} not found.`,
          });
          return;
        }

        // Try to resolve based on what the user said
        const userInput =
          resolution.params?.query || resolution.params?.name || "";
        const { matches } = await vocalRegistry.resolveEntity(
          entityType,
          userInput,
        );

        if (matches.length === 1) {
          // Auto-resolve
          const val = config.value(matches[0]);
          resolution.params = { ...resolution.params, [paramName]: val };
          this.agent.completeStep(
            true,
            `Selected ${entityType}: ${config.label(matches[0])}`,
          );
          // Continue execution (recursive call with resolved params)
          return this.processIntent(resolution);
        } else {
          // Ambiguous or missing
          this.agent.transition("START_CLARIFYING");
          this.agent.addMessage(
            "assistant",
            matches.length > 1
              ? `I found multiple ${entityType}s matching "${userInput}". Which one did you mean?`
              : `I need you to select a ${entityType} to proceed.`,
          );

          const candidates =
            matches.length > 0 ? matches : (await config.getAll()).slice(0, 5);

          const { createAction } = await import("../core/Action");
          const actions = candidates.map((m) =>
            createAction(
              config.label(m),
              "read",
              async () => {
                resolution.params = {
                  ...resolution.params,
                  [paramName]: config.value(m),
                };
                this.agent.addMessage("user", `Selected ${config.label(m)}`);
                return this.processIntent(resolution);
              },
              false,
            ),
          );

          this.agent.setAvailableActions(actions);
          this.agent.completeStep(true, `Awaiting ${entityType} selection...`);
          return;
        }
      }

      // 2. Dependency Resolution (Complex Form Logic)
      if (capability.params) {
        for (const param of capability.params) {
          const value = resolution.params?.[param.name];
          if (
            param.required &&
            (value === undefined || value === null || value === "")
          ) {
            // Missing a required param. Check for dependency or static options
            if (
              param.dependency &&
              capability.dependencies?.[param.dependency]
            ) {
              this.agent.transition("START_CLARIFYING");
              this.agent.addStep(
                `Fetching options for ${param.name}...`,
                "pending",
              );

              const fetchFn = capability.dependencies[param.dependency];
              const rawOptions = await fetchFn();

              // Normalize options to { label, value }
              const options = rawOptions.map((opt) => {
                if (typeof opt === "string") return { label: opt, value: opt };
                if ("label" in opt && "value" in opt) return opt;
                return { label: String(opt), value: opt };
              });

              // Update the form field to show these options directly
              this.agent.updateFormFieldConfig(param.name, {
                type: "select",
                options: options,
              });

              this.agent.addMessage(
                "assistant",
                `I found some options for ${param.label || param.name}. Please select one to continue.`,
              );

              // Also provide actions for backward compatibility / chat interaction
              const { createAction } = await import("../core/Action");
              const actions = options.map((opt) =>
                createAction(
                  opt.label,
                  "read",
                  async () => {
                    resolution.params = {
                      ...resolution.params,
                      [param.name]: opt.value,
                    };
                    // Update form value visually too
                    this.agent.updateFormField(param.name, opt.value);
                    this.agent.addMessage("user", `Selected ${opt.label}`);
                    return this.processIntent(resolution);
                  },
                  false,
                ),
              );

              this.agent.setAvailableActions(actions);
              this.agent.completeStep(
                true,
                `Please select ${param.label || param.name}`,
              );
              return;
            } else if (param.options && param.options.length > 0) {
              // Static options - ensure form field has them
              this.agent.updateFormFieldConfig(param.name, {
                type: "select",
                options: param.options,
              });

              this.agent.transition("START_CLARIFYING");
              this.agent.addMessage(
                "assistant",
                `Please choose one of the following for ${param.label || param.name}:`,
              );

              const { createAction } = await import("../core/Action");
              const actions = param.options.map((opt) => {
                const label = typeof opt === "string" ? opt : opt.label;
                const val = typeof opt === "string" ? opt : opt.value;
                return createAction(
                  label,
                  "read",
                  async () => {
                    resolution.params = {
                      ...resolution.params,
                      [param.name]: val,
                    };
                    this.agent.updateFormField(param.name, val);
                    this.agent.addMessage("user", `Selected ${label}`);
                    return this.processIntent(resolution);
                  },
                  false,
                );
              });

              this.agent.setAvailableActions(actions);
              return;
            } else {
              // Just ask for it
              this.agent.transition("START_CLARIFYING");
              this.agent.addMessage(
                "assistant",
                `I'm missing the ${param.label || param.name}. Could you please provide it?`,
              );
              return;
            }
          }
        }
      }

      // 3. Navigation Guard
      const currentPath = window.location.pathname;
      if (capability.scope && !currentPath.startsWith(capability.scope)) {
        this.agent.transition("REQUIRE_CONFIRMATION");
        this.agent.setWaitingReason(
          `This action needs to be performed on the ${capability.scope} page. Shall I take you there?`,
        );

        const { createAction } = await import("../core/Action");
        this.agent.setAvailableActions([
          createAction(
            "Yes, navigate",
            "read",
            async () => {
              this.agent.transition("START_NAVIGATING");
              this.agent.addStep("Navigating...", "pending");
              // The provider will handle the actual navigation if we set state
              // but here we can just do it
              window.location.href = capability.scope!;
            },
            false,
          ),
          createAction(
            "Cancel",
            "read",
            async () => {
              this.agent.transition("RESET");
            },
            false,
          ),
        ]);
        return;
      }

      // 4. Validation Guard
      if (capability.validate) {
        const error = await capability.validate(resolution.params || {});
        if (error) {
          this.agent.addMessage(
            "assistant",
            `Wait, there's an issue: ${error}`,
          );
          this.agent.transition("FAIL", { message: error });
          this.agent.completeStep(false, `Validation failed: ${error}`);
          return;
        }
      }

      // 5. Execution
      this.agent.addStep(`Executing ${capability.id}...`, "pending");
      const result = await capability.execute(resolution.params || {});
      this.agent.transition("COMPLETE");
      this.agent.completeStep(true, `Successfully completed ${capability.id}`);
      this.agent.clearActiveForm();
      return result;
    } catch (error: any) {
      console.error(`[VocalRoute] Execution failed:`, error);
      this.agent.transition("FAIL", { message: error.message });
      this.agent.completeStep(false, `Failed: ${error.message}`);
      this.agent.clearActiveForm();
    }
  }

  public resumeWithConfirmation(resolution: {
    capability: string;
    params?: any;
  }) {
    // This would be called after a user confirms navigation
    this.processIntent(resolution);
  }
}
