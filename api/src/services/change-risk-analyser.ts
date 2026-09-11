import type { ChangeAssessment, RiskLevel } from "@dev-interview-challenge/shared";

type AnalysisRule = {
  area: string;
  keywords: string[];
  tests: string[];
  weight: number;
};

// Keeping the rules as data makes the first version deterministic and easy to replace with a richer analyser later.
const analysisRules: AnalysisRule[] = [
  {
    area: "Authentication",
    keywords: ["auth", "login", "password", "mfa", "single sign-on", "sso", "session"],
    tests: [
      "Verify valid users can complete the authentication flow.",
      "Verify invalid and expired credentials are rejected safely."
    ],
    weight: 3
  },
  {
    area: "Authorisation",
    keywords: ["admin", "permission", "role", "access", "privilege", "authori"],
    tests: [
      "Verify permitted roles can perform the change.",
      "Verify unauthorised users cannot perform the change through the UI or API."
    ],
    weight: 3
  },
  {
    area: "Data integrity",
    keywords: ["database", "data", "record", "migration", "delete", "update", "store"],
    tests: [
      "Verify existing records remain valid after the change.",
      "Verify invalid input is rejected without partial writes."
    ],
    weight: 2
  },
  {
    area: "Payments",
    keywords: ["payment", "billing", "invoice", "charge", "refund", "subscription"],
    tests: [
      "Verify successful and failed payment paths produce the expected state.",
      "Verify retries do not create duplicate charges or records."
    ],
    weight: 3
  },
  {
    area: "External integrations",
    keywords: ["webhook", "integration", "third-party", "external api", "provider", "email"],
    tests: [
      "Verify the integration handles successful, failed, and delayed responses.",
      "Verify timeouts and retries do not leave the application in an inconsistent state."
    ],
    weight: 2
  },
  {
    area: "Security",
    keywords: ["security", "token", "secret", "encrypt", "pii", "personal", "mfa"],
    tests: [
      "Verify sensitive data is protected in transit, at rest, and in logs.",
      "Verify the change does not introduce an unintended privilege or data disclosure path."
    ],
    weight: 3
  },
  {
    area: "User interface",
    keywords: ["screen", "page", "form", "button", "display", "dashboard", "ui", "user experience"],
    tests: [
      "Verify the primary user journey works on supported screen sizes.",
      "Verify validation and error states are clear and accessible."
    ],
    weight: 1
  }
];

const baselineTests = [
  "Run focused unit and integration tests for the changed behavior.",
  "Run the existing regression suite and verify relevant monitoring signals."
];

export function analyseChange(description: string): ChangeAssessment {
  const normalisedDescription = description.toLowerCase();
  const matchedRules = analysisRules.filter((rule) =>
    rule.keywords.some((keyword) => normalisedDescription.includes(keyword))
  );
  const score = matchedRules.reduce((total, rule) => total + rule.weight, 0);
  const riskLevel = getRiskLevel(score, matchedRules.length);
  const impactedAreas = matchedRules.map((rule) => rule.area);
  const recommendedTesting = unique([
    ...matchedRules.flatMap((rule) => rule.tests),
    ...baselineTests
  ]);

  return {
    riskLevel,
    impactedAreas: impactedAreas.length > 0 ? impactedAreas : ["Application behaviour"],
    recommendedTesting,
    rationale: buildRationale(riskLevel, matchedRules.length)
  };
}

function getRiskLevel(score: number, matchedRuleCount: number): RiskLevel {
  if (score >= 6 || matchedRuleCount >= 3) {
    return "High";
  }

  if (score >= 3 || matchedRuleCount >= 1) {
    return "Medium";
  }

  return "Low";
}

function buildRationale(riskLevel: RiskLevel, matchedRuleCount: number): string {
  if (matchedRuleCount === 0) {
    return "No specialised risk signals were found, so the change starts with a low baseline risk.";
  }

  return `${riskLevel} risk based on ${matchedRuleCount} potentially impacted area${matchedRuleCount === 1 ? "" : "s"}. Review the affected boundaries before release.`;
}

function unique(items: string[]): string[] {
  return [...new Set(items)];
}
