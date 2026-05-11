// ─── Mastery state → visual config ───────────────────────────────────────────
// All colours use the CSS custom properties defined in globals.css / tailwind.config.
// The `style` objects are safe to spread onto a React element's `style` prop.

import type { MasteryState } from './roadmap.types';

interface MasteryVisual {
  label: string;
  /** CSS border colour — applied as inline style */
  borderColor: string;
  /** CSS background colour — applied as inline style */
  backgroundColor: string;
  /** Mono label colour */
  textColor: string;
  /** Small dot / badge fill */
  dotColor: string;
  /** Box-shadow for the pulsing ring animation (review_needed only) */
  ringColor?: string;
}

export const MASTERY_CONFIG: Record<MasteryState, MasteryVisual> = {
  mastered: {
    label:           'mastered',
    borderColor:     'oklch(0.60 0.13 150)',
    backgroundColor: 'color-mix(in srgb, oklch(0.60 0.13 150) 14%, #faf7f1)',
    textColor:       'oklch(0.60 0.13 150)',
    dotColor:        'oklch(0.60 0.13 150)',
  },
  in_progress: {
    label:           'in progress',
    borderColor:     'oklch(0.55 0.13 250)',
    backgroundColor: 'color-mix(in srgb, oklch(0.55 0.13 250) 12%, #faf7f1)',
    textColor:       'oklch(0.55 0.13 250)',
    dotColor:        'oklch(0.55 0.13 250)',
  },
  review_needed: {
    label:           'review needed',
    borderColor:     'oklch(0.72 0.13 70)',
    backgroundColor: 'color-mix(in srgb, oklch(0.72 0.13 70) 14%, #faf7f1)',
    textColor:       'oklch(0.50 0.13 70)',
    dotColor:        'oklch(0.72 0.13 70)',
    ringColor:       'color-mix(in srgb, oklch(0.72 0.13 70) 30%, transparent)',
  },
  not_started: {
    label:           'not started',
    borderColor:     'oklch(0.72 0.02 80)',
    backgroundColor: '#f3efe7',
    textColor:       '#9a9088',
    dotColor:        'oklch(0.72 0.02 80)',
  },
  relearn: {
    label:           'relearn',
    borderColor:     'oklch(0.60 0.18 28)',
    backgroundColor: 'color-mix(in srgb, oklch(0.60 0.18 28) 14%, #faf7f1)',
    textColor:       'oklch(0.60 0.18 28)',
    dotColor:        'oklch(0.60 0.18 28)',
  },
  locked: {
    label:           'locked',
    borderColor:     '#c2b9a6',
    backgroundColor: '#ebe6db',
    textColor:       '#9a9088',
    dotColor:        '#9a9088',
  },
};

/** Derive inline styles for a node card from its mastery state */
export function masteryStyles(state: MasteryState): React.CSSProperties {
  const c = MASTERY_CONFIG[state];
  return {
    borderColor:     c.borderColor,
    backgroundColor: c.backgroundColor,
    borderStyle:     state === 'locked' ? 'dashed' : 'solid',
  };
}
