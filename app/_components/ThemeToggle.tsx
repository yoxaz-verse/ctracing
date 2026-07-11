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

export function ThemeToggle({ className = "" }: { className?: string }) {
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
      className={`theme-toggle inline-flex rounded-full border p-1 shadow-sm backdrop-blur ${className}`}
      role="group"
    >
      <button
        aria-label="Use light mode"
        aria-pressed={theme === "light"}
        className="grid size-10 place-items-center rounded-full transition cursor-pointer"
        onClick={() => setTheme("light")}
        title="Light mode"
        type="button"
      >
        <svg
          aria-hidden="true"
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" />
          <path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" />
          <path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" />
          <path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" />
          <path d="m19.07 4.93-1.41 1.41" />
        </svg>
      </button>
      <button
        aria-label="Use dark mode"
        aria-pressed={theme === "dark"}
        className="grid size-10 place-items-center rounded-full transition cursor-pointer"
        onClick={() => setTheme("dark")}
        title="Dark mode"
        type="button"
      >
        <svg
          aria-hidden="true"
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M20.99 12.34a8.5 8.5 0 1 1-9.33-9.33 6.5 6.5 0 0 0 9.33 9.33Z" />
        </svg>
      </button>
    </div>
  );
}
