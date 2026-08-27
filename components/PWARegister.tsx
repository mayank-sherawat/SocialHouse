"use client";

import { useEffect } from "react";

/** Registers the offline service worker if supported by the browser. */
export default function PWARegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").catch(() => {
          // Fail silently in development/unsupported environments
        });
      });
    }
  }, []);

  return null;
}
