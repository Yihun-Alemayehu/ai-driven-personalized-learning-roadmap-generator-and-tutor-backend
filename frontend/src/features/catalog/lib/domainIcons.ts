// Maps domain slugs to emoji icons and accent colors since iconUrl is null in seeds
export const DOMAIN_META: Record<string, { icon: string; color: string; accent: string }> = {
  'frontend-development': {
    icon: '⬡',
    color: '#e8f4f8',
    accent: '#0ea5e9',
  },
  'backend-development': {
    icon: '⚙',
    color: '#f0fdf4',
    accent: '#16a34a',
  },
  'data-science': {
    icon: '◈',
    color: '#fef9ee',
    accent: '#d97706',
  },
  devops: {
    icon: '∞',
    color: '#fdf4ff',
    accent: '#9333ea',
  },
};

export function getDomainMeta(slug: string) {
  return DOMAIN_META[slug] ?? { icon: '◆', color: '#f3efe7', accent: 'oklch(0.62 0.18 28)' };
}
