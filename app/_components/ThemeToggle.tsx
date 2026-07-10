"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const storageKey = "teratrace-theme";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") {
    return "light";
  }

  const storedTheme = window.localStorage.getItem(storageKey);
  if (storedTheme === "dark" || storedTheme === "light") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    setTheme(getInitialTheme());
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    window.localStorage.setItem(storageKey, theme);
  }, [theme]);

  return (
    <div
      aria-label="Color mode"
      className="theme-toggle fixed right-4 top-4 z-50 inline-flex rounded-full border p-1 shadow-sm backdrop-blur"
      role="group"
    >
      <button
        aria-pressed={theme === "light"}
        className="rounded-full px-3 py-2 text-xs font-semibold transition"
        onClick={() => setTheme("light")}
        type="button"
      >
        Light
      </button>
      <button
        aria-pressed={theme === "dark"}
        className="rounded-full px-3 py-2 text-xs font-semibold transition"
        onClick={() => setTheme("dark")}
        type="button"
      >
        Dark
      </button>
    </div>
  );
}
