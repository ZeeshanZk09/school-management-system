"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";

export function CurrentTime({ pattern }: { pattern: string }) {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    setTime(format(new Date(), pattern));

    // Optional: Update every minute if it's a clock
    if (pattern === "HH:mm") {
      const timer = setInterval(() => {
        setTime(format(new Date(), pattern));
      }, 60000);
      return () => clearInterval(timer);
    }
  }, [pattern]);

  // Return an empty span or a placeholder that matches server-side (empty string)
  // to avoid hydration mismatch, then let useEffect fill it.
  if (!time) return <span className="opacity-0">--:--</span>;

  return <>{time}</>;
}
