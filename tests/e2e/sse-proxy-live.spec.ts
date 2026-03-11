import { expect, test } from "@playwright/test";

test("@live AC-INF-004a /api/v1/events preserves backend 4xx status", async ({ request, baseURL }) => {
  const response = await request.post(`${baseURL}/api/v1/events`, {
    data: {
      agentId: "echo_agent",
      input: "invalid schema probe",
    },
    headers: { "content-type": "application/json" },
  });

  expect(response.status()).toBe(400);
  expect(response.headers()["x-accel-buffering"]).toBe("no");
  expect(response.headers()["cache-control"]).toContain("no-cache");
  expect(response.headers()["x-agent-console-proxy"]).toBe("events-sse");
  await expect(response.text()).resolves.toContain("ViolationReport");
});

test("@live AC-INF-004b resume events proxy preserves backend 4xx status", async ({ request, baseURL }) => {
  const response = await request.post(`${baseURL}/api/v1/agent/session/nonexistent-session/resume/events`, {
    data: {
      input: "invalid resume probe",
    },
    headers: { "content-type": "application/json" },
  });

  expect(response.status()).toBe(400);
  expect(response.headers()["x-accel-buffering"]).toBe("no");
  expect(response.headers()["cache-control"]).toContain("no-cache");
  expect(response.headers()["x-agent-console-proxy"]).toBe("resume-sse");
  await expect(response.text()).resolves.toContain("ViolationReport");
});
