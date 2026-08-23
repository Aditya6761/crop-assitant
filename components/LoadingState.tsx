export default function LoadingState() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-3 rounded-lg border border-soil-200 bg-white p-5"
      data-testid="loading-state"
    >
      <span
        className="h-5 w-5 animate-spin rounded-full border-2 border-leaf-600 border-t-transparent"
        aria-hidden="true"
      />
      <span className="text-sm text-soil-700">
        Asking the assistant for crop recommendations…
      </span>
    </div>
  );
}
