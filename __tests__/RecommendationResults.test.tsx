import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import RecommendationResults from "@/components/RecommendationResults";
import type { RecommendationResponse } from "@/lib/schema";

const sample: RecommendationResponse = {
  location: "Nashik",
  season: "rabi",
  crops: [
    {
      name: "Chickpea",
      reasons: ["Thrives in loamy soil with moderate water in the rabi season."],
      precautions: ["Watch for pod borer in warm spells."],
      confidence: "high",
    },
    {
      name: "Wheat",
      reasons: ["Classic rabi crop suited to loamy soil."],
      precautions: [],
      confidence: "medium",
    },
  ],
  generalNotes: ["Rotate with a legume next season to restore nitrogen."],
  uncertaintyNote: undefined,
};

describe("RecommendationResults", () => {
  it("renders a heading naming the location and season", () => {
    render(<RecommendationResults data={sample} />);
    expect(
      screen.getByRole("heading", { name: /nashik, rabi season/i })
    ).toBeInTheDocument();
  });

  it("renders every crop with its confidence badge", () => {
    render(<RecommendationResults data={sample} />);
    expect(screen.getByText("1. Chickpea")).toBeInTheDocument();
    expect(screen.getByText("2. Wheat")).toBeInTheDocument();
    expect(screen.getByText(/high confidence/i)).toBeInTheDocument();
    expect(screen.getByText(/medium confidence/i)).toBeInTheDocument();
  });

  it("only renders a precautions block when precautions exist", () => {
    render(<RecommendationResults data={sample} />);
    expect(screen.getAllByText(/precautions/i)).toHaveLength(1);
  });

  it("renders the uncertainty note when present", () => {
    render(
      <RecommendationResults
        data={{ ...sample, uncertaintyNote: "Soil type was unclear." }}
      />
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Soil type was unclear."
    );
  });
});
