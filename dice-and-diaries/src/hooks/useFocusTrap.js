import { useEffect } from "react";

const FOCUSABLE =
  'a[href], area[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [contenteditable="true"], [tabindex]:not([tabindex="-1"])';

/**
 * Traps Tab/Shift-Tab focus inside `containerRef` while mounted.
 * Automatically focuses the first focusable child and restores the
 * previously-focused element on unmount.
 */
export function useFocusTrap(containerRef) {
  useEffect(() => {
    const previously = document.activeElement;
    const container = containerRef.current;
    if (!container) return;

    const getFocusable = () => Array.from(container.querySelectorAll(FOCUSABLE));

    // Move focus into the dialog
    const first = getFocusable()[0];
    if (first) first.focus();

    const handleKeyDown = (e) => {
      if (e.key !== "Tab") return;
      const els = getFocusable();
      if (els.length === 0) return;
      const firstEl = els[0];
      const lastEl = els[els.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        }
      } else {
        if (document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      previously?.focus();
    };
  }, [containerRef]);
}
