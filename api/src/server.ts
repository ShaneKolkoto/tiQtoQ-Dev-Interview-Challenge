import { createServer, type Server } from "node:http";

import { handleAnalysisRequest } from "./controllers/analysis-controller.js";
import { handleHealthRequest } from "./controllers/health-controller.js";
import { writeError } from "./controllers/response-controller.js";
import { addCorsHeaders } from "./middleware/cors.js";
import type { ApiServerOptions } from "./types/server.js";

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
      handleHealthRequest(response);
      return;
    }

    if (request.method === "POST" && request.url === "/api/analyse") {
      await handleAnalysisRequest(request, response);
      return;
    }

    writeError(response, 404, "Route not found.");
  });
}

export function startApiServer(port = Number(process.env.PORT ?? 4000)): Server {
  const server = createApiServer();
  server.listen(port, () => {
    console.log(`Change Risk Analyser API listening on http://localhost:${port}`);
  });
  return server;
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
