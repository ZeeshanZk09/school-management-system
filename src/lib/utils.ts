import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges class names using clsx and tailwind-merge.
 * Useful for conditionally applying Tailwind classes and resolving conflicts.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Finds the first invalid or error-displaying element on the page and scrolls it into view.
 * Useful for improving UX in long forms.
 */
export function scrollToError(): void {
  setTimeout(() => {
    const errorElement = document.querySelector(
      '[aria-invalid="true"], .text-rose-500, [data-error="true"]',
    );
    if (errorElement) {
      errorElement.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, 100);
}
