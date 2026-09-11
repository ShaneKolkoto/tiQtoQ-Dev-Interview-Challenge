import type { ServerResponse } from "node:http";

import type { ApiErrorResponse } from "@dev-interview-challenge/shared";

export function writeError(response: ServerResponse, statusCode: number, error: string): void {
  const body: ApiErrorResponse = { error };
  writeJson(response, statusCode, body);
}

export function writeJson(response: ServerResponse, statusCode: number, body: unknown): void {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
}
