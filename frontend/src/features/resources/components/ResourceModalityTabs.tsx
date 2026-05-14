import type { ResourceModality } from '@/types';

type Tab = 'all' | ResourceModality;

interface ResourceModalityTabsProps {
  active: Tab;
  onChange: (tab: Tab) => void;
}

const TABS: { value: Tab; label: string }[] = [
  { value: 'all',           label: 'All'          },
  { value: 'video',         label: 'Video'        },
  { value: 'tutorial',      label: 'Tutorial'     },
  { value: 'documentation', label: 'Docs'         },
  { value: 'interactive',   label: 'Interactive'  },
  { value: 'reference',     label: 'Reference'    },
];

export function ResourceModalityTabs({ active, onChange }: ResourceModalityTabsProps) {
  return (
    <div className="flex gap-1 flex-wrap">
      {TABS.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onChange(value)}
          className="px-2.5 py-1 rounded-full text-[11px] tracking-[0.04em] border transition-all"
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            background: active === value ? '#1a1614' : '#f3efe7',
            color: active === value ? '#f3efe7' : '#6e645a',
            borderColor: active === value ? '#1a1614' : '#d6cfbf',
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export type { Tab };
