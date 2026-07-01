export function Flash({ sent, error }: { sent?: string; error?: string }) {
  if (!sent && !error) return null;
  return <div className={`flash ${error ? "flash-error" : "flash-success"}`}>{error ? decodeURIComponent(error) : "Your request was received. StepOne will contact you shortly."}</div>;
}
