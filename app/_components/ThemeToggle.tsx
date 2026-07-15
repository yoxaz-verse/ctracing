"use client";

import { useEffect, useSyncExternalStore } from "react";

type Theme = "light" | "dark";

const storageKey = "teratrace-theme";
const themeChangeEvent = "teratrace-theme-change";

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

function subscribeTheme(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(themeChangeEvent, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(themeChangeEvent, callback);
  };
}

function getServerTheme(): Theme {
  return "light";
}

function saveTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  window.localStorage.setItem(storageKey, theme);
  window.dispatchEvent(new Event(themeChangeEvent));
}

export function ThemeToggle({
  className = "",
  variant = "segmented",
}: {
  className?: string;
  variant?: "segmented" | "icon";
}) {
  const theme = useSyncExternalStore(
    subscribeTheme,
    getInitialTheme,
    getServerTheme,
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  if (variant === "icon") {
    const nextTheme = theme === "light" ? "dark" : "light";

    return (
      <button
        aria-label={`Switch to ${nextTheme} mode`}
        className={`theme-toggle grid size-9 shrink-0 place-items-center rounded-full border shadow-sm backdrop-blur transition hover:text-[var(--brand)] ${className}`}
        onClick={() => saveTheme(nextTheme)}
        title={`Switch to ${nextTheme} mode`}
        type="button"
      >
        <svg
          aria-hidden="true"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          {theme === "light" ? (
            <path d="M20.99 12.34a8.5 8.5 0 1 1-9.33-9.33 6.5 6.5 0 0 0 9.33 9.33Z" />
          ) : (
            <>
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2" />
              <path d="M12 20v2" />
              <path d="m4.93 4.93 1.41 1.41" />
              <path d="m17.66 17.66 1.41 1.41" />
              <path d="M2 12h2" />
              <path d="M20 12h2" />
              <path d="m6.34 17.66-1.41 1.41" />
              <path d="m19.07 4.93-1.41 1.41" />
            </>
          )}
        </svg>
      </button>
    );
  }

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
        onClick={() => saveTheme("light")}
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
        onClick={() => saveTheme("dark")}
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
