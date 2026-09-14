import type { ServerResponse } from "node:http";

export function addCorsHeaders(response: ServerResponse, allowedOrigin: string): void {
  // Keep the local default convenient while allowing deployments to set their own UI origin.
  response.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
}
