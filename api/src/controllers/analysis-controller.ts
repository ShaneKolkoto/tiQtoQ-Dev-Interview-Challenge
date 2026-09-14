import type { IncomingMessage, ServerResponse } from "node:http";

import type { AnalyseChangeResponse } from "@dev-interview-challenge/shared";

import { writeError, writeJson } from "./response-controller.js";
import { readJson, getDescription } from "../middleware/request-body.js";
import { analyseChange } from "../services/change-risk-analyser.js";

export async function handleAnalysisRequest(
  request: IncomingMessage,
  response: ServerResponse
): Promise<void> {
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
}
