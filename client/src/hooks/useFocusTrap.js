import { useEffect, useRef } from "react";

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Traps Tab/Shift+Tab focus inside `ref` while `active`.
 * On open: focuses the first focusable element (or the container itself).
 * On close: returns focus to the element that was focused before opening.
 * Escape handling stays with the caller (each dialog has its own keys).
 */
export default function useFocusTrap(ref, active) {
  const previous = useRef(null);

  useEffect(() => {
    if (!active) return;
    const container = ref.current;
    if (!container) return;

    previous.current = document.activeElement;

    const focusables = () =>
      Array.from(container.querySelectorAll(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );

    const first = focusables()[0];
    (first ?? container).focus({ preventScroll: true });

    const onKeyDown = (e) => {
      if (e.key !== "Tab") return;
      const items = focusables();
      if (!items.length) {
        e.preventDefault();
        container.focus({ preventScroll: true });
        return;
      }
      const firstEl = items[0];
      const lastEl = items[items.length - 1];
      const current = document.activeElement;

      if (e.shiftKey && (current === firstEl || !container.contains(current))) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && (current === lastEl || !container.contains(current))) {
        e.preventDefault();
        firstEl.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      const prev = previous.current;
      if (prev && typeof prev.focus === "function" && document.contains(prev)) {
        prev.focus({ preventScroll: true });
      }
    };
  }, [ref, active]);
}
