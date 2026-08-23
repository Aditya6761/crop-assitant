import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import CropForm from "@/components/CropForm";
import { EMPTY_FORM } from "@/lib/types";

function Wrapper({ onSubmit }: { onSubmit: (v: typeof EMPTY_FORM) => void }) {
  return (
    <CropForm
      value={EMPTY_FORM}
      onChange={() => {}}
      onSubmit={onSubmit}
      disabled={false}
    />
  );
}

describe("CropForm", () => {
  it("shows validation errors and does not submit when required fields are empty", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<Wrapper onSubmit={onSubmit} />);

    await user.click(
      screen.getByRole("button", { name: /get crop recommendations/i })
    );

    expect(
      await screen.findByText(/enter a city, district, or region/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/choose a season/i)).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("has an accessible label for every field", () => {
    render(<Wrapper onSubmit={vi.fn()} />);

    expect(screen.getByLabelText(/location/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/growing season/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/soil type/i)).toBeInTheDocument();
    expect(
      screen.getByRole("group", { name: /water availability/i })
    ).toBeInTheDocument();
  });

  it("submits when all required fields are filled", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    function Controlled() {
      const [value, setValue] = require("react").useState(EMPTY_FORM);
      return (
        <CropForm
          value={value}
          onChange={setValue}
          onSubmit={onSubmit}
          disabled={false}
        />
      );
    }

    render(<Controlled />);

    await user.type(screen.getByLabelText(/location/i), "Nashik");
    await user.selectOptions(screen.getByLabelText(/growing season/i), "rabi");
    await user.selectOptions(screen.getByLabelText(/soil type/i), "loamy");
    await user.click(screen.getByLabelText(/^medium$/i));
    await user.click(
      screen.getByRole("button", { name: /get crop recommendations/i })
    );

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        location: "Nashik",
        season: "rabi",
        soilType: "loamy",
        waterAvailability: "medium",
      })
    );
  });
});
