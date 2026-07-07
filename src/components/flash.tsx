"use client";

import { useEffect, useMemo, useState } from "react";

type FlashProps = {
  sent?: string;
  success?: string;
  error?: string;
};

function decodeMessage(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export function Flash({ sent, success, error }: FlashProps) {
  const message = useMemo(() => {
    if (error) return decodeMessage(error);
    if (success) return success;
    if (sent) return "Your request was received. StepOne will contact you shortly.";
    return "";
  }, [error, sent, success]);
  const [visible, setVisible] = useState(Boolean(message));

  useEffect(() => {
    setVisible(Boolean(message));
    if (!message) return;

    const url = new URL(window.location.href);
    ["error", "saved", "sent", "success", "updated"].forEach((key) => url.searchParams.delete(key));
    window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);

    const timer = window.setTimeout(() => setVisible(false), 5500);
    return () => window.clearTimeout(timer);
  }, [message]);

  if (!message || !visible) return null;

  const isError = Boolean(error);
  return (
    <div className="toast-region" aria-live={isError ? "assertive" : "polite"}>
      <div className={`toast ${isError ? "toast-error" : "toast-success"}`} role={isError ? "alert" : "status"}>
        <span className="toast-icon" aria-hidden="true">{isError ? "!" : "✓"}</span>
        <div className="toast-copy">
          <strong>{isError ? "Action needed" : "Success"}</strong>
          <p>{message}</p>
        </div>
        <button className="toast-close" type="button" onClick={() => setVisible(false)} aria-label="Dismiss notification">×</button>
      </div>
    </div>
  );
}
