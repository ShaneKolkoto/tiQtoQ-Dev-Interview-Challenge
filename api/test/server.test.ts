import type { AddressInfo } from "node:net";

import { afterEach, describe, expect, it } from "vitest";

import { createApiServer } from "../src/server.js";

const openServers: ReturnType<typeof createApiServer>[] = [];

afterEach(async () => {
  await Promise.all(openServers.splice(0).map((server) => new Promise<void>((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  })));
});

async function requestServer(): Promise<string> {
  const server = createApiServer({ allowedOrigin: "https://app.example.com" });
  openServers.push(server);
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const address = server.address() as AddressInfo;
  return `http://127.0.0.1:${address.port}`;
}

describe("API server", () => {
  it("reports health and configured CORS", async () => {
    const baseUrl = await requestServer();
    const response = await fetch(`${baseUrl}/health`);

    expect(response.status).toBe(200);
    expect(response.headers.get("access-control-allow-origin")).toBe("https://app.example.com");
    expect(await response.json()).toEqual({ status: "ok" });
  });

  it("analyses a valid change description", async () => {
    const baseUrl = await requestServer();
    const response = await fetch(`${baseUrl}/api/analyse`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ description: "Change the password reset flow." })
    });

    expect(response.status).toBe(200);
    expect((await response.json()).assessment.riskLevel).toBe("Medium");
  });

  it("rejects invalid request bodies", async () => {
    const baseUrl = await requestServer();
    const response = await fetch(`${baseUrl}/api/analyse`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ description: "   " })
    });

    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "A change description is required." });
  });

  it("rejects oversized request bodies", async () => {
    const baseUrl = await requestServer();
    const response = await fetch(`${baseUrl}/api/analyse`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ description: "x".repeat(100_001) })
    });

    expect(response.status).toBe(413);
    expect(await response.json()).toEqual({ error: "Request body is too large." });
  });
});
