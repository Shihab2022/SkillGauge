"use client";

import { useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * Renders children into a body-level `.print-root` container.
 * Hidden on screen; shown by the `@media print` rules in globals.css when
 * `body.printing-resume` is set (see `printResume`).
 */
export function PrintPortal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(
    <div className="print-root" aria-hidden="true">
      {children}
    </div>,
    document.body,
  );
}

/**
 * Prints only the `.print-root` content (A4 via `@page { size: A4 }`),
 * producing a vector/selectable-text PDF through the browser's print dialog.
 */
export function printResume() {
  const body = document.body;
  const cleanup = () => {
    body.classList.remove("printing-resume");
    window.removeEventListener("afterprint", cleanup);
  };
  window.addEventListener("afterprint", cleanup);
  body.classList.add("printing-resume");
  try {
    window.print();
  } finally {
    // Fallback for engines that skip `afterprint` (older Safari).
    window.setTimeout(cleanup, 2000);
  }
}