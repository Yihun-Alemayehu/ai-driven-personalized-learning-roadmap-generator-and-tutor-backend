import type { ValidationResult } from '@/types';

interface Props {
  result: ValidationResult;
  onDismiss: () => void;
}

export function ValidationResultBanner({ result, onDismiss }: Props) {
  return (
    <div
      className="flex flex-col gap-2 px-4 py-3 rounded-[10px] border"
      style={{
        borderColor: result.valid ? 'oklch(0.75 0.12 145)' : 'oklch(0.75 0.15 28)',
        background: result.valid ? 'oklch(0.96 0.04 145)' : 'oklch(0.97 0.04 28)',
      }}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span>{result.valid ? '✓' : '✗'}</span>
          <span
            className="text-[13px] font-medium"
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              color: result.valid ? 'oklch(0.40 0.14 145)' : 'oklch(0.45 0.18 28)',
            }}
          >
            {result.valid ? 'DAG is valid' : `${result.errors.length} validation error${result.errors.length !== 1 ? 's' : ''}`}
          </span>
        </div>
        <button
          onClick={onDismiss}
          className="text-[16px] leading-none opacity-50 hover:opacity-100 transition-opacity"
        >
          ×
        </button>
      </div>

      {result.errors.length > 0 && (
        <ul className="flex flex-col gap-0.5 ml-5">
          {result.errors.map((e, i) => (
            <li
              key={i}
              className="text-[12px] list-disc"
              style={{ fontFamily: "'Crimson Pro', serif", color: 'oklch(0.40 0.15 28)' }}
            >
              {e}
            </li>
          ))}
        </ul>
      )}

      {result.warnings.length > 0 && (
        <ul className="flex flex-col gap-0.5 ml-5">
          {result.warnings.map((w, i) => (
            <li
              key={i}
              className="text-[12px] list-disc"
              style={{ fontFamily: "'Crimson Pro', serif", color: 'oklch(0.45 0.12 60)' }}
            >
              {w}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
