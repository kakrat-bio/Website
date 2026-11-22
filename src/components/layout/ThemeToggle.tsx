"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem("kakrat-theme", theme);
  } catch {
    // localStorage unavailable (private mode, etc.) — theme just won't persist.
  }
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    // One-time read of DOM state set by the pre-hydration theme-init script
    // (see layout.tsx) — can't be done during render since `document` isn't
    // available on the server, and can't be the useState initializer for
    // the same reason.
    const stored = document.documentElement.getAttribute("data-theme") as Theme | null;
    // No explicit user choice yet: same default as theme-init.js and
    // globals.css — dark on phones (< 768px), light on larger screens.
    const isPhone = window.matchMedia?.("(max-width: 767px)").matches;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(stored ?? (isPhone ? "dark" : "light"));
  }, []);

  if (!theme) return <span className="w-9" aria-hidden />;

  return (
    <button
      type="button"
      onClick={() => {
        const next = theme === "dark" ? "light" : "dark";
        setTheme(next);
        applyTheme(next);
      }}
      aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
      className="text-sm text-ink-muted hover:text-ink"
    >
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}
