// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import Home from "../app/page";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("Change Risk Analyser", () => {
  it("shows loading and then renders an assessment", async () => {
    let resolveRequest!: (response: Response) => void;
    vi.stubGlobal("fetch", vi.fn(() => new Promise<Response>((resolve) => {
      resolveRequest = resolve;
    })));

    render(<Home />);
    const description = screen.getByLabelText("What are you planning to change?");
    fireEvent.change(description, { target: { value: "Update the login flow." } });
    fireEvent.click(screen.getByRole("button", { name: /^Analyse change$/ }));

    expect(screen.getByRole("button", { name: "Analysing..." })).toBeDisabled();

    resolveRequest(new Response(JSON.stringify({
      assessment: {
        riskLevel: "Medium",
        impactedAreas: ["Authentication"],
        recommendedTesting: ["Verify login."],
        rationale: ["Authentication signals were detected."]
      }
    }), { status: 200 }));

    expect(await screen.findByText("Medium risk")).toBeInTheDocument();
    expect(screen.getByText("Authentication")).toBeInTheDocument();
  });

  it("shows API errors to the user", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: "A change description is required." }), { status: 400 })
    ));

    render(<Home />);
    fireEvent.change(screen.getByLabelText("What are you planning to change?"), {
      target: { value: "A change" }
    });
    fireEvent.click(screen.getByRole("button", { name: /^Analyse change$/ }));

    expect(await screen.findByRole("alert")).toHaveTextContent("A change description is required.");
  });

  it("rejects malformed successful API responses", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ assessment: { riskLevel: "Unknown" } }), { status: 200 })
    ));

    render(<Home />);
    fireEvent.change(screen.getByLabelText("What are you planning to change?"), {
      target: { value: "A change" }
    });
    fireEvent.click(screen.getByRole("button", { name: /^Analyse change$/ }));

    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("invalid assessment"));
  });
});
