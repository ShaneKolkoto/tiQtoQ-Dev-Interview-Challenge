import type { IncomingMessage } from "node:http";

import { maxDescriptionLength } from "@dev-interview-challenge/shared";

const maxBodySize = 100_000;

export function getDescription(value: unknown): string {
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

  if (description.length > maxDescriptionLength) {
    throw new Error(`A change description must be ${maxDescriptionLength} characters or fewer.`);
  }

  return description;
}

export function readJson(request: IncomingMessage): Promise<unknown> {
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
