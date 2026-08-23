"use client";

import { useState } from "react";
import type { FormState } from "@/lib/types";

type Props = {
  value: FormState;
  onChange: (next: FormState) => void;
  onSubmit: (value: FormState) => void;
  disabled: boolean;
};

type Errors = Partial<Record<keyof FormState, string>>;

function validate(form: FormState): Errors {
  const errors: Errors = {};
  if (form.location.trim().length < 2) {
    errors.location = "Enter a city, district, or region.";
  }
  if (!form.season) {
    errors.season = "Choose a season.";
  }
  if (!form.soilType) {
    errors.soilType = "Choose a soil type.";
  }
  if (!form.waterAvailability) {
    errors.waterAvailability = "Choose water availability.";
  }
  return errors;
}

export default function CropForm({ value, onChange, onSubmit, disabled }: Props) {
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched(true);
    const nextErrors = validate(value);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      onSubmit(value);
    }
  }

  function set<K extends keyof FormState>(key: K, val: FormState[K]) {
    onChange({ ...value, [key]: val });
  }

  const errorId = (field: string) => `${field}-error`;

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-describedby="form-instructions"
      className="space-y-6"
    >
      <p id="form-instructions" className="text-sm text-soil-600">
        Fields marked with an asterisk (*) are required.
      </p>

      <div>
        <label htmlFor="location" className="field-label">
          Location (city or district) *
        </label>
        <input
          id="location"
          type="text"
          value={value.location}
          onChange={(e) => set("location", e.target.value)}
          placeholder="e.g. Nashik, Maharashtra"
          className="field-input"
          aria-invalid={touched && !!errors.location}
          aria-describedby={
            touched && errors.location ? errorId("location") : undefined
          }
        />
        {touched && errors.location && (
          <p id={errorId("location")} role="alert" className="field-error">
            {errors.location}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="season" className="field-label">
          Growing season *
        </label>
        <select
          id="season"
          value={value.season}
          onChange={(e) => set("season", e.target.value as FormState["season"])}
          className="field-input"
          aria-invalid={touched && !!errors.season}
          aria-describedby={
            touched && errors.season ? errorId("season") : undefined
          }
        >
          <option value="">Select a season</option>
          <option value="kharif">Kharif (monsoon, Jun–Oct)</option>
          <option value="rabi">Rabi (winter, Oct–Mar)</option>
          <option value="zaid">Zaid (summer, Mar–Jun)</option>
          <option value="not-sure">Not sure</option>
        </select>
        {touched && errors.season && (
          <p id={errorId("season")} role="alert" className="field-error">
            {errors.season}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="soilType" className="field-label">
          Soil type *
        </label>
        <select
          id="soilType"
          value={value.soilType}
          onChange={(e) =>
            set("soilType", e.target.value as FormState["soilType"])
          }
          className="field-input"
          aria-invalid={touched && !!errors.soilType}
          aria-describedby={
            touched && errors.soilType ? errorId("soilType") : undefined
          }
        >
          <option value="">Select a soil type</option>
          <option value="loamy">Loamy</option>
          <option value="clay">Clay</option>
          <option value="sandy">Sandy</option>
          <option value="black-cotton">Black cotton (regur)</option>
          <option value="red">Red soil</option>
          <option value="alluvial">Alluvial</option>
          <option value="not-sure">Not sure</option>
        </select>
        {touched && errors.soilType && (
          <p id={errorId("soilType")} role="alert" className="field-error">
            {errors.soilType}
          </p>
        )}
      </div>

      <fieldset>
        <legend className="field-label">Water availability *</legend>
        <div className="flex flex-wrap gap-4 mt-1">
          {(["low", "medium", "high"] as const).map((level) => (
            <label
              key={level}
              className="flex items-center gap-2 text-sm capitalize"
            >
              <input
                type="radio"
                name="waterAvailability"
                value={level}
                checked={value.waterAvailability === level}
                onChange={() => set("waterAvailability", level)}
                className="h-4 w-4"
              />
              {level}
            </label>
          ))}
        </div>
        {touched && errors.waterAvailability && (
          <p role="alert" className="field-error">
            {errors.waterAvailability}
          </p>
        )}
      </fieldset>

      <div>
        <label htmlFor="notes" className="field-label">
          Anything else worth knowing? (optional)
        </label>
        <textarea
          id="notes"
          value={value.notes}
          onChange={(e) => set("notes", e.target.value)}
          maxLength={300}
          rows={3}
          placeholder="e.g. small plot, organic only, recent flooding"
          className="field-input resize-none"
        />
      </div>

      <button type="submit" disabled={disabled} className="submit-button">
        {disabled ? "Getting recommendations…" : "Get crop recommendations"}
      </button>
    </form>
  );
}
