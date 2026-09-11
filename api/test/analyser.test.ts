import { describe, expect, it } from "vitest";

import { analyseChange } from "../src/services/change-risk-analyser.js";

describe("analyseChange", () => {
  it("returns low risk for a change without specialised signals", () => {
    const assessment = analyseChange("Improve the wording of an internal document.");

    expect(assessment.riskLevel).toBe("Low");
    expect(assessment.impactedAreas).toEqual(["Application behaviour"]);
  });

  it("returns medium risk for one affected area", () => {
    const assessment = analyseChange("Update authentication copy.");

    expect(assessment.riskLevel).toBe("Medium");
    expect(assessment.impactedAreas).toContain("Authentication");
  });

  it("returns high risk when several boundaries are affected", () => {
    const assessment = analyseChange(
      "Allow administrators to reset another user's MFA configuration and record the security event in the database."
    );

    expect(assessment.riskLevel).toBe("High");
    expect(assessment.impactedAreas).toEqual(
      expect.arrayContaining(["Authentication", "Authorisation", "Data integrity", "Security"])
    );
    expect(assessment.recommendedTesting).toEqual(expect.arrayContaining([
      "Verify unauthorised users cannot perform the change through the UI or API."
    ]));
  });
});
