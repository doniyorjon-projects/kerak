import { useEffect, useState } from "react";

/**
 * Pastga scroll qilinganda true (yashirish kerak), yuqoriga scroll qilinganda
 * yoki sahifa boshiga yaqin bo'lganda false (ko'rsatish kerak) qaytaradi.
 */
export function useHideOnScroll(threshold = 80): boolean {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;

    const onScroll = () => {
      const y = window.scrollY;
      if (y < threshold) {
        setHidden(false);
      } else if (y > lastY) {
        setHidden(true);
      } else if (y < lastY) {
        setHidden(false);
      }
      lastY = y;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return hidden;
}
