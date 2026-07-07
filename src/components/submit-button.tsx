"use client";

import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  label: string;
  pendingLabel?: string;
  className?: string;
  name?: string;
  value?: string;
};

export function SubmitButton({
  label,
  pendingLabel = "Saving...",
  className = "button button-primary",
  name,
  value,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      className={className}
      type="submit"
      name={name}
      value={value}
      disabled={pending}
      aria-disabled={pending}
    >
      {pending && <span className="button-spinner" aria-hidden="true" />}
      {pending ? pendingLabel : label}
    </button>
  );
}
