import type { RecommendationResponse } from "./schema";

export type RequestStatus = "idle" | "loading" | "success" | "error";

export type ApiErrorBody = {
  error: string;
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export type FormState = {
  location: string;
  season: "kharif" | "rabi" | "zaid" | "not-sure" | "";
  soilType:
    | "loamy"
    | "clay"
    | "sandy"
    | "black-cotton"
    | "red"
    | "alluvial"
    | "not-sure"
    | "";
  waterAvailability: "low" | "medium" | "high" | "";
  notes: string;
};

export const EMPTY_FORM: FormState = {
  location: "",
  season: "",
  soilType: "",
  waterAvailability: "",
  notes: "",
};

export type { RecommendationResponse };
