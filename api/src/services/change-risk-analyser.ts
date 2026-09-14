import type { ChangeAssessment, RiskLevel } from "@dev-interview-challenge/shared";

type AnalysisRule = {
  area: string;
  patterns: RegExp[];
  tests: string[];
  weight: number;
};

// Keeping the rules as data makes the first version deterministic and easy to replace with a richer analyser later.
const analysisRules: AnalysisRule[] = [
  {
    area: "Authentication",
    patterns: [/\bauth(?:entication)?\b/i, /\blogin\b/i, /\bpassword\b/i, /\bmfa\b/i, /\bsingle[- ]sign[- ]on\b/i, /\bsso\b/i, /\bsession\b/i],
    tests: [
      "Verify valid users can complete the authentication flow.",
      "Verify invalid and expired credentials are rejected safely."
    ],
    weight: 3
  },
  {
    area: "Authorisation",
    patterns: [/\badministrators?\b/i, /\bpermissions?\b/i, /\broles?\b/i, /\baccess control\b/i, /\bprivileges?\b/i, /\bauthori[sz]ation\b/i],
    tests: [
      "Verify permitted roles can perform the change.",
      "Verify unauthorised users cannot perform the change through the UI or API."
    ],
    weight: 3
  },
  {
    area: "Data integrity",
    patterns: [/\bdatabase\b/i, /\bdata(?:base)?\b/i, /\brecords?\b/i, /\bmigrations?\b/i, /\bdelet(?:e|ion)\b/i, /\bstor(?:e|age)\b/i],
    tests: [
      "Verify existing records remain valid after the change.",
      "Verify invalid input is rejected without partial writes."
    ],
    weight: 2
  },
  {
    area: "Payments",
    patterns: [/\bpayments?\b/i, /\bbilling\b/i, /\binvoices?\b/i, /\bcharges?\b/i, /\brefunds?\b/i, /\bsubscriptions?\b/i],
    tests: [
      "Verify successful and failed payment paths produce the expected state.",
      "Verify retries do not create duplicate charges or records."
    ],
    weight: 3
  },
  {
    area: "External integrations",
    patterns: [/\bwebhooks?\b/i, /\bintegrations?\b/i, /\bthird[- ]party\b/i, /\bexternal api\b/i, /\bproviders?\b/i, /\bemails?\b/i],
    tests: [
      "Verify the integration handles successful, failed, and delayed responses.",
      "Verify timeouts and retries do not leave the application in an inconsistent state."
    ],
    weight: 2
  },
  {
    area: "Security",
    patterns: [/\bsecurity\b/i, /\btokens?\b/i, /\bsecrets?\b/i, /\bencrypt(?:ion|ed)?\b/i, /\bpii\b/i, /\bpersonal data\b/i, /\bmfa\b/i],
    tests: [
      "Verify sensitive data is protected in transit, at rest, and in logs.",
      "Verify the change does not introduce an unintended privilege or data disclosure path."
    ],
    weight: 3
  },
  {
    area: "User interface",
    patterns: [/\bscreens?\b/i, /\bpages?\b/i, /\bforms?\b/i, /\bbuttons?\b/i, /\bdisplay\b/i, /\bdashboards?\b/i, /\bui\b/i, /\buser experience\b/i],
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
    rule.patterns.some((pattern) => pattern.test(normalisedDescription))
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
    rationale: buildRationale(riskLevel, matchedRules)
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

function buildRationale(riskLevel: RiskLevel, matchedRules: AnalysisRule[]): string[] {
  if (matchedRules.length === 0) {
    return ["No specialised risk signals were found, so the change starts with a low baseline risk."];
  }

  return [
    `${riskLevel} risk based on ${matchedRules.length} potentially impacted area${matchedRules.length === 1 ? "" : "s"}.`,
    ...matchedRules.map((rule) => `${rule.area} signals were detected in the change description.`),
    "Review the affected boundaries before release."
  ];
}

function unique(items: string[]): string[] {
  return [...new Set(items)];
}
