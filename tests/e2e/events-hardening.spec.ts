import { expect, test } from "@playwright/test";
import { reconstructEvents } from "@/lib/events";
import { AgentEvent } from "@/models/Events";

test("AC-EVT-001 reconstructEvents preserves tool args even when ToolArgsUpdate arrives before ToolCallStarted", async () => {
  const events: AgentEvent[] = [
    {
      type: "ToolArgsUpdate",
      toolCallId: "tc-1",
      argumentsDelta: "{\"cmd\":\"",
      timestamp: 1,
      runId: "r-1",
    },
    {
      type: "ToolCallStarted",
      toolName: "run_cmd",
      toolCallId: "tc-1",
      arguments: "",
      timestamp: 2,
      runId: "r-1",
    },
    {
      type: "ToolArgsUpdate",
      toolCallId: "tc-1",
      argumentsDelta: "pwd\"}",
      timestamp: 3,
      runId: "r-1",
    },
  ];

  const rebuilt = reconstructEvents(events);
  const started = rebuilt.find((event) => event.type === "ToolCallStarted");
  expect(started && started.type === "ToolCallStarted" ? started.arguments : undefined).toBe(
    "{\"cmd\":\"pwd\"}",
  );
});
