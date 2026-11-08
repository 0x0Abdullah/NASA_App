import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "anf-theme";

function readInitial() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

/**
 * Light/dark theme for the whole site.
 * The class is mirrored onto <html>; an inline script in index.html
 * applies it before first paint so there is no flash.
 */
export default function useTheme() {
  const [theme, setTheme] = useState(readInitial);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("light", theme === "light");
    root.classList.toggle("dark", theme !== "light");
    root.style.colorScheme = theme;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* storage blocked — session-only theme */
    }
  }, [theme]);

  const toggle = useCallback(() => setTheme((t) => (t === "light" ? "dark" : "light")), []);

  return { theme, toggle, isLight: theme === "light" };
}
