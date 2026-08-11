import { useEffect, useState } from "react";
import { wakeUpServer } from "../api/client";

const WORD = "Kerak";
const LETTER_DELAY_MS = 110;
const MIN_VISIBLE_MS = 1100;
const MAX_WAIT_MS = 8000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Ilova ochilganda ko'rinadigan qisqa boshlang'ich ekran - "Kerak" so'zi
 * harfma-harf yozilib chiqadi. Shu bilan birga Render'ning bepul serveri
 * "uyg'onishini" (health check) va minimal ko'rsatish vaqtini kutadi, shunda
 * sekin ulanishda ham bo'sh ekran ko'rinmaydi.
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
      <div className="flex items-baseline text-4xl font-extrabold tracking-tight text-brand">
        {WORD.split("").map((letter, i) => (
          <span
            key={i}
            className="inline-block animate-[splash-letter_0.45s_ease-out_both]"
            style={{ animationDelay: `${i * LETTER_DELAY_MS}ms` }}
          >
            {letter}
          </span>
        ))}
      </div>
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
