"use client";

import { useState } from "react";

import type { ChangeAssessment } from "@dev-interview-challenge/shared";

import { AssessmentResult } from "../src/components/AssessmentResult";
import { analyseChange } from "../src/services/change-analysis";

const exampleChange = "Add the ability for administrators to reset another user's MFA configuration.";

export default function Home() {
  const [description, setDescription] = useState("");
  const [assessment, setAssessment] = useState<ChangeAssessment | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setAssessment(null);

    try {
      setAssessment(await analyseChange(description));
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "The API could not be reached.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="page-shell">
      <section className="intro" aria-labelledby="page-title">
        <p className="eyebrow">Engineering change intelligence</p>
        <h1 id="page-title">Change Risk Analyser<span>.</span></h1>
        <p className="lede">
          Turn a proposed change into a practical testing brief before it reaches production.
        </p>
      </section>

      <section className="workspace" aria-label="Change analysis workspace">
        <form className="change-form" onSubmit={handleSubmit}>
          <div className="section-kicker">01 / Describe the change</div>
          <label htmlFor="change-description">What are you planning to change?</label>
          <textarea
            id="change-description"
            name="description"
            aria-describedby="description-hint"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="For example: Add the ability for administrators to reset another user's MFA configuration."
            rows={9}
            required
          />
          <div className="form-footer">
            <p id="description-hint" className="field-hint">Include the users, systems, data, or integrations involved.</p>
            <button type="submit" disabled={isSubmitting || description.trim().length === 0}>
              {isSubmitting ? "Analysing..." : "Analyse change"}
            </button>
          </div>
          <button className="example-button" type="button" onClick={() => setDescription(exampleChange)}>
            Use example change
          </button>
        </form>

        <section className="results" aria-live="polite" aria-labelledby="results-title">
          <div className="results-heading">
            <div className="section-kicker">02 / Assessment</div>
            <h2 id="results-title">Testing risk</h2>
          </div>

          {error && <p className="error-message" role="alert">{error}</p>}
          {!assessment && !error && (
            <p className="empty-state">Your assessment will appear here once you analyse a proposed change.</p>
          )}
          {assessment && <AssessmentResult assessment={assessment} />}
        </section>
      </section>
    </main>
  );
}
