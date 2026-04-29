"use client";

import {
  ThemeProvider as NextThemeProvider,
  type ThemeProviderProps,
} from "next-themes";

// Suppress the React 19 script tag warning in development
// This is a known false positive with next-themes and React 19
if (
  typeof window !== "undefined" &&
  process.env.NODE_ENV === "development"
) {
  const origError = console.error;
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === "string" &&
      args[0].includes("Encountered a script tag while rendering React component")
    ) {
      return;
    }
    origError.apply(console, args);
  };
}

export function ThemeProvider({
  children,
  ...props
}: Readonly<ThemeProviderProps>) {
  return <NextThemeProvider {...props}>{children}</NextThemeProvider>;
}
