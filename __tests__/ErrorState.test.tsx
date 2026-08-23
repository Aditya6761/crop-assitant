import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import ErrorState from "@/components/ErrorState";

describe("ErrorState", () => {
  it("announces the error via role=alert", () => {
    render(<ErrorState message="Network down." onRetry={() => {}} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Network down.");
  });

  it("calls onRetry when the retry button is clicked", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();
    render(<ErrorState message="Network down." onRetry={onRetry} />);

    await user.click(screen.getByRole("button", { name: /try again/i }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("shows a non-AI fallback tip so the user is never left with nothing", () => {
    render(<ErrorState message="Network down." onRetry={() => {}} />);
    expect(screen.getByText(/krishi vigyan kendra/i)).toBeInTheDocument();
  });
});
