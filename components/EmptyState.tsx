export default function EmptyState() {
  return (
    <div
      className="rounded-lg border border-dashed border-soil-200 p-8 text-center"
      data-testid="empty-state"
    >
      <p className="font-display text-lg text-soil-700">
        Your recommendations will appear here
      </p>
      <p className="mt-1 text-sm text-soil-500">
        Fill in the form and submit to see suitable crops for your
        conditions.
      </p>
    </div>
  );
}
