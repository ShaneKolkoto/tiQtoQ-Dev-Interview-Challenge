import type { ServerResponse } from "node:http";

import { writeJson } from "./response-controller.js";

export function handleHealthRequest(response: ServerResponse): void {
  writeJson(response, 200, { status: "ok" });
}
