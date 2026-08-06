import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface BackButtonProps {
  fallbackTo: string;
  className?: string;
}

export function BackButton({ fallbackTo, className = "" }: BackButtonProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate(fallbackTo);
  };

  return (
    <button
      onClick={handleClick}
      aria-label="Orqaga"
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface shadow-soft transition active:scale-90 ${className}`}
    >
      <ChevronLeft className="h-5 w-5 text-ink" />
    </button>
  );
}
