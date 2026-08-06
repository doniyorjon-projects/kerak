import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { hideBackButton, showBackButton } from "../telegram";

/**
 * Tab-root bo'lmagan sahifalarda Telegram'ning o'z chrome orqaga tugmasini yoqadi.
 * fallbackTo berilsa va navigatsiya tarixi bo'sh bo'lsa o'sha yo'lga o'tadi
 * (masalan chuqur link orqali to'g'ridan-to'g'ri ochilgan bo'lsa).
 */
export function useBackButton(fallbackTo: string): void {
  const navigate = useNavigate();

  useEffect(() => {
    const handleClick = () => {
      if (window.history.length > 1) {
        navigate(-1);
      } else {
        navigate(fallbackTo);
      }
    };
    showBackButton(handleClick);
    return () => hideBackButton(handleClick);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fallbackTo]);
}
