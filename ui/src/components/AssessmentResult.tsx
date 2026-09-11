import type { ChangeAssessment } from "@dev-interview-challenge/shared";

export function AssessmentResult({ assessment }: { assessment: ChangeAssessment }) {
  return (
    <div className="assessment-result">
      <div className={`risk-badge risk-${assessment.riskLevel.toLowerCase()}`}>
        <span className="risk-dot" aria-hidden="true" />
        {assessment.riskLevel} risk
      </div>

      <ul className="rationale" aria-label="Risk rationale">
        {assessment.rationale.map((reason) => <li key={reason}>{reason}</li>)}
      </ul>

      <div className="result-card">
        <h3>Potentially impacted</h3>
        <ul>
          {assessment.impactedAreas.map((area) => <li key={area}>{area}</li>)}
        </ul>
      </div>

      <div className="result-card">
        <h3>Recommended testing</h3>
        <ul>
          {assessment.recommendedTesting.map((test) => <li key={test}>{test}</li>)}
        </ul>
      </div>
    </div>
  );
}
