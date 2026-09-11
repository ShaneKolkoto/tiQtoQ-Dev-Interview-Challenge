import {
  parseAnalyseChangeResponse,
  type ChangeAssessment
} from "@dev-interview-challenge/shared";

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function analyseChange(description: string): Promise<ChangeAssessment> {
  const response = await fetch(`${apiUrl}/api/analyse`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ description })
  });

  const body: unknown = await response.json();
  if (!response.ok) {
    const errorBody = body as { error?: unknown };
    throw new Error(typeof errorBody.error === "string" ? errorBody.error : "The change could not be analysed.");
  }

  return parseAnalyseChangeResponse(body).assessment;
}
