import { useState } from 'react';

interface StarRatingProps {
  value: number;
  max?: number;
  interactive?: boolean;
  size?: number;
  onChange?: (rating: number) => void;
}

export function StarRating({ value, max = 5, interactive = false, size = 14, onChange }: StarRatingProps) {
  const [hovered, setHovered] = useState(0);

  const display = interactive ? (hovered || value) : value;
  const filled = Math.round(display * 2) / 2; // round to nearest 0.5

  return (
    <div
      className="flex gap-0.5 items-center"
      onMouseLeave={() => interactive && setHovered(0)}
    >
      {Array.from({ length: max }, (_, i) => {
        const starVal = i + 1;
        const isFullFilled = filled >= starVal;
        const isHalfFilled = !isFullFilled && filled >= starVal - 0.5;
        const fillColor = 'oklch(0.72 0.18 70)';
        const emptyColor = '#d6cfbf';

        return (
          <svg
            key={i}
            width={size}
            height={size}
            viewBox="0 0 10 10"
            style={{ cursor: interactive ? 'pointer' : 'default', flexShrink: 0 }}
            onMouseEnter={() => interactive && setHovered(starVal)}
            onClick={() => interactive && onChange?.(starVal)}
          >
            <defs>
              <linearGradient id={`half-${i}`}>
                <stop offset="50%" stopColor={fillColor} />
                <stop offset="50%" stopColor={emptyColor} />
              </linearGradient>
            </defs>
            <polygon
              points="5,1 6.2,3.8 9,4.2 7,6.2 7.5,9 5,7.6 2.5,9 3,6.2 1,4.2 3.8,3.8"
              fill={isFullFilled ? fillColor : isHalfFilled ? `url(#half-${i})` : emptyColor}
            />
          </svg>
        );
      })}
    </div>
  );
}
