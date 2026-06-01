import type { ReadAloudState } from '@/hooks/useReadAloud';

interface ReadAloudButtonProps {
  text: string;
  state: ReadAloudState;
  onToggle: (text: string) => void;
  size?: 'sm' | 'md';
}

export function ReadAloudButton({ text, state, onToggle, size = 'sm' }: ReadAloudButtonProps) {
  const isSpeaking = state === 'speaking';
  const dim = size === 'sm' ? 28 : 32;
  const iconSize = size === 'sm' ? 13 : 15;

  return (
    <button
      onClick={() => onToggle(text)}
      title={isSpeaking ? 'Stop reading' : 'Read aloud'}
      className="rounded-full border flex items-center justify-center transition-all hover:opacity-80 cursor-pointer shrink-0"
      style={{
        width: dim,
        height: dim,
        background: isSpeaking ? 'oklch(0.62 0.18 28)' : '#f3efe7',
        borderColor: isSpeaking ? 'oklch(0.62 0.18 28)' : '#d6cfbf',
        color: isSpeaking ? '#fff' : '#9a9088',
      }}
    >
      {isSpeaking ? (
        /* Stop icon — two vertical bars */
        <svg width={iconSize} height={iconSize} viewBox="0 0 14 14" fill="currentColor">
          <rect x="3" y="2" width="3" height="10" rx="1" />
          <rect x="8" y="2" width="3" height="10" rx="1" />
        </svg>
      ) : (
        /* Speaker icon */
        <svg width={iconSize} height={iconSize} viewBox="0 0 14 14" fill="currentColor">
          <path d="M2 5h2.5L8 2v10L4.5 9H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />
          <path d="M10 4.5a3.5 3.5 0 0 1 0 5" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <path d="M11.5 2.5a6 6 0 0 1 0 9" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        </svg>
      )}
    </button>
  );
}
