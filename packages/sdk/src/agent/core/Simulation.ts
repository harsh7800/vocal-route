import { Agent } from "./Agent";

/**
 * Simulates the "Download invoices from Jan 1 to Feb 10" flow using the new architecture
 */
export async function simulateDownloadFlow() {
  const agent = new Agent();
  console.log("Starting Simulation: Download Invoices");

  // 1. Receive Input
  await agent.receiveInput("Download invoices from Jan 1 to Feb 10");

  // 2. Processing
  agent.transition("START_PROCESSING");
  agent.addStep("Analyzing request", "pending");

  // 3. Executing
  agent.transition("START_EXECUTING");
  agent.addStep("Finding invoices", "pending");

  // Simulate progress
  await new Promise((r) => setTimeout(r, 500));
  agent.addStep("Found 42 records", "completed");

  // 4. Confirmation
  agent.transition("REQUIRE_CONFIRMATION");
  agent.setWaitingReason("Ready to download 42 invoices. Proceed?");

  // 5. Complete
  agent.transition("COMPLETE");
  agent.addStep("Done · Invoices downloaded", "completed");

  return agent.getUIState();
}
