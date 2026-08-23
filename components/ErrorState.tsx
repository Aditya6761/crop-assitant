export default function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div
      role="alert"
      className="space-y-3 rounded-lg border border-alert/30 bg-alert/5 p-5"
      data-testid="error-state"
    >
      <p className="font-semibold text-alert">Couldn&apos;t get recommendations</p>
      <p className="text-sm text-soil-700">{message}</p>
      <p className="text-sm text-soil-600">
        In the meantime: crops suited to your season and water access are
        usually listed by your state&apos;s agriculture department or nearest
        Krishi Vigyan Kendra (KVK) — that&apos;s a solid fallback while the
        assistant is unavailable.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="rounded-md border border-alert px-4 py-2 text-sm font-semibold text-alert transition-colors hover:bg-alert hover:text-white"
      >
        Try again
      </button>
    </div>
  );
}
