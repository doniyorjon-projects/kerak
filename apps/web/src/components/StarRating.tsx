import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  onChange?: (value: number) => void;
  size?: number;
}

export function StarRating({ value, onChange, size = 18 }: StarRatingProps) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="flex items-center gap-0.5">
      {stars.map((star) => (
        <button
          key={star}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(star)}
          className={onChange ? "cursor-pointer transition active:scale-90" : "cursor-default"}
          aria-label={`${star} yulduz`}
        >
          <Star
            width={size}
            height={size}
            className={star <= Math.round(value) ? "fill-amber-400 text-amber-400" : "text-hint"}
          />
        </button>
      ))}
    </div>
  );
}
