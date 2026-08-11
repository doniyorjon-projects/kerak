import { useEffect, useState } from "react";
import { wakeUpServer } from "../api/client";

const MIN_VISIBLE_MS = 1100;
const MAX_WAIT_MS = 8000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Ilova ochilganda ko'rinadigan qisqa boshlang'ich ekran - Kerak logotipi
 * paydo bo'ladi. Shu bilan birga Render'ning bepul serveri "uyg'onishini"
 * (health check) va minimal ko'rsatish vaqtini kutadi, shunda sekin
 * ulanishda ham bo'sh ekran ko'rinmaydi.
 */
export function SplashScreen({ onDone }: { onDone: () => void }) {
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const ready = Promise.all([sleep(MIN_VISIBLE_MS), Promise.race([wakeUpServer(), sleep(MAX_WAIT_MS)])]);

    ready.then(() => {
      if (cancelled) return;
      setFadingOut(true);
      setTimeout(() => {
        if (!cancelled) onDone();
      }, 300);
    });

    return () => {
      cancelled = true;
    };
  }, [onDone]);

  return (
    <div
      className={`fixed inset-0 z-[200] flex flex-col items-center justify-center gap-3 bg-app transition-opacity duration-300 ${
        fadingOut ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      <img
        src="/kerak-logo.png"
        alt="Kerak"
        className="h-16 w-auto dark:invert animate-[splash-logo_0.5s_ease-out_both]"
      />
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-brand/40 animate-[splash-dot_1s_ease-in-out_infinite]"
            style={{ animationDelay: `${i * 150}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
