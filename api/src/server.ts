import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";

import type {
  AnalyseChangeRequest,
  AnalyseChangeResponse,
  ApiErrorResponse
} from "@dev-interview-challenge/shared";

import { analyseChange } from "./analyser.js";

const maxBodySize = 100_000;

export type ApiServerOptions = {
  allowedOrigin?: string;
};

export function createApiServer(options: ApiServerOptions = {}): Server {
  const allowedOrigin = options.allowedOrigin ?? process.env.ALLOWED_ORIGIN ?? "http://localhost:3000";

  return createServer(async (request, response) => {
    addCorsHeaders(response, allowedOrigin);

    if (request.method === "OPTIONS") {
      response.writeHead(204);
      response.end();
      return;
    }

    if (request.method === "GET" && request.url === "/health") {
      writeJson(response, 200, { status: "ok" });
      return;
    }

    if (request.method !== "POST" || request.url !== "/api/analyse") {
      writeError(response, 404, "Route not found.");
      return;
    }

    try {
      const body = await readJson(request);
      const description = getDescription(body);
      const responseBody: AnalyseChangeResponse = {
        assessment: analyseChange(description)
      };

      writeJson(response, 200, responseBody);
    } catch (error) {
      const message = error instanceof Error ? error.message : "The request could not be processed.";
      writeError(response, message === "Request body is too large." ? 413 : 400, message);
    }
  });
}

export function startApiServer(port = Number(process.env.PORT ?? 4000)): Server {
  const server = createApiServer();
  server.listen(port, () => {
    console.log(`Change Risk Analyser API listening on http://localhost:${port}`);
  });
  return server;
}

function addCorsHeaders(response: ServerResponse, allowedOrigin: string): void {
  // Keep the local default convenient while allowing deployments to set their own UI origin.
  response.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function getDescription(value: unknown): string {
  if (
    typeof value !== "object" ||
    value === null ||
    !("description" in value) ||
    typeof value.description !== "string"
  ) {
    throw new Error("A change description is required.");
  }

  const description = value.description.trim();
  if (description.length === 0) {
    throw new Error("A change description is required.");
  }

  return description;
}

function readJson(request: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let body = "";
    let tooLarge = false;

    request.setEncoding("utf8");
    request.on("data", (chunk: string) => {
      if (tooLarge) {
        return;
      }

      body += chunk;
      if (Buffer.byteLength(body, "utf8") > maxBodySize) {
        tooLarge = true;
      }
    });
    request.on("end", () => {
      if (tooLarge) {
        reject(new Error("Request body is too large."));
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("Request body must be valid JSON."));
      }
    });
    request.on("error", () => reject(new Error("The request could not be read.")));
  });
}

function writeError(response: ServerResponse, statusCode: number, error: string): void {
  const body: ApiErrorResponse = { error };
  writeJson(response, statusCode, body);
}

function writeJson(response: ServerResponse, statusCode: number, body: unknown): void {
  response.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
}

if (process.argv[1]?.endsWith("server.js")) {
  const server = startApiServer();
  const shutdown = (signal: string) => {
    console.log(`${signal} received; closing the API server.`);
    server.close(() => process.exit(0));
  };

  process.once("SIGINT", () => shutdown("SIGINT"));
  process.once("SIGTERM", () => shutdown("SIGTERM"));
}
