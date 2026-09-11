export const riskLevels = ["Low", "Medium", "High"] as const;
export const maxDescriptionLength = 2000;

export type RiskLevel = (typeof riskLevels)[number];

export interface AnalyseChangeRequest {
  description: string;
}

export interface ChangeAssessment {
  riskLevel: RiskLevel;
  impactedAreas: string[];
  recommendedTesting: string[];
  rationale: string[];
}

export interface AnalyseChangeResponse {
  assessment: ChangeAssessment;
}

export interface ApiErrorResponse {
  error: string;
}

export function isChangeAssessment(value: unknown): value is ChangeAssessment {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const assessment = value as Record<string, unknown>;
  return (
    (assessment.riskLevel === "Low" || assessment.riskLevel === "Medium" || assessment.riskLevel === "High") &&
    isStringArray(assessment.impactedAreas) &&
    isStringArray(assessment.recommendedTesting) &&
    isStringArray(assessment.rationale)
  );
}

export function parseAnalyseChangeResponse(value: unknown): AnalyseChangeResponse {
  if (
    typeof value !== "object" ||
    value === null ||
    !isChangeAssessment((value as Record<string, unknown>).assessment)
  ) {
    throw new Error("The API returned an invalid assessment.");
  }

  return value as AnalyseChangeResponse;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}
