import {
  TargetIcon, FlameIcon, ZapIcon, StarIcon, RocketIcon,
  TrophyIcon, CalendarCheckIcon, RotateCcwIcon, LockIcon,
} from 'lucide-react';
import type { BadgeMeta, BadgeKey } from '@/api/gamification';

// Map badge keys to Lucide icons
const BADGE_ICONS: Record<BadgeKey, React.ReactNode> = {
  first_mastery: <TargetIcon size={18} />,
  streak_5:      <FlameIcon size={18} />,
  streak_14:     <ZapIcon size={18} />,
  quiz_ace:      <StarIcon size={18} />,
  speed_learner: <RocketIcon size={18} />,
  completionist: <TrophyIcon size={18} />,
  consistent:    <CalendarCheckIcon size={18} />,
  comeback:      <RotateCcwIcon size={18} />,
};

interface BadgeGridProps {
  badges: BadgeMeta[];
  /** If true, only show earned badges */
  earnedOnly?: boolean;
}

export function BadgeGrid({ badges, earnedOnly = false }: BadgeGridProps) {
  const visible = earnedOnly ? badges.filter((b) => b.earnedAt !== null) : badges;

  if (visible.length === 0) {
    return (
      <div
        className="text-center py-8 text-[13px]"
        style={{ fontFamily: "'Crimson Pro', serif", color: '#9a9088' }}
      >
        No badges earned yet — complete your first node to start!
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {visible.map((badge) => {
        const earned = badge.earnedAt !== null;
        return (
          <div
            key={badge.key}
            title={badge.description}
            className="flex flex-col items-center gap-2 rounded-[14px] p-4 border transition-all"
            style={{
              borderColor: earned ? 'oklch(0.62 0.18 28)' : '#d6cfbf',
              background: earned
                ? 'color-mix(in srgb, oklch(0.62 0.18 28) 8%, #faf7f1)'
                : '#f3efe7',
              opacity: earned ? 1 : 0.5,
            }}
          >
            {/* Icon badge */}
            <span
              className="w-11 h-11 rounded-full flex items-center justify-center"
              style={{
                background: earned ? 'oklch(0.62 0.18 28)' : '#e8e2d9',
                color: earned ? '#fff' : '#9a9088',
              }}
            >
              {earned ? BADGE_ICONS[badge.key] : <LockIcon size={16} />}
            </span>

            {/* Label */}
            <div className="text-center">
              <div
                className="text-[13px] font-semibold leading-tight"
                style={{
                  fontFamily: "'Crimson Pro', serif",
                  color: earned ? '#1a1614' : '#9a9088',
                }}
              >
                {badge.label}
              </div>
              <div
                className="text-[10px] mt-0.5 leading-tight"
                style={{ fontFamily: 'JetBrains Mono, monospace', color: '#b0a898' }}
              >
                {badge.description}
              </div>
            </div>

            {/* Earned date */}
            {earned && badge.earnedAt && (
              <div
                className="text-[9px] tracking-[0.08em]"
                style={{ fontFamily: 'JetBrains Mono, monospace', color: 'oklch(0.62 0.18 28)' }}
              >
                {new Date(badge.earnedAt).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric',
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
