import { useState } from 'react';
import { useResourcesQuery, useDiscoverResourcesMutation } from '@/api/resources';
import { ResourceCard } from './ResourceCard';
import { ResourceModalityTabs, type Tab } from './ResourceModalityTabs';
import type { Resource } from '@/types';

interface ResourcePanelProps {
  nodeId: string;
}

function DiscoverButton({ nodeId, onDiscover }: { nodeId: string; onDiscover: (n: number) => void }) {
  const mutation = useDiscoverResourcesMutation();

  const handle = async () => {
    const result = await mutation.mutateAsync(nodeId);
    onDiscover(result.discovered);
  };

  return (
    <button
      className="w-full py-2.5 rounded-[10px] border text-[13px] transition-colors flex items-center justify-center gap-2"
      style={{
        fontFamily: "'Crimson Pro', serif",
        borderColor: '#d6cfbf',
        background: '#f3efe7',
        color: mutation.isPending ? '#9a9088' : '#6e645a',
      }}
      onClick={handle}
      disabled={mutation.isPending}
    >
      {mutation.isPending ? (
        <>
          <span className="animate-spin text-[12px]">⟳</span>
          Searching for resources…
        </>
      ) : (
        '🔍 Find more resources'
      )}
    </button>
  );
}

export function ResourcePanel({ nodeId }: ResourcePanelProps) {
  const { data: resources, isLoading } = useResourcesQuery(nodeId);
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [discovered, setDiscovered] = useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2.5 py-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-[10px] animate-pulse" style={{ background: '#ebe6db' }} />
        ))}
      </div>
    );
  }

  const all = resources ?? [];
  const filtered: Resource[] = activeTab === 'all'
    ? all
    : all.filter((r) => r.modality === activeTab);

  return (
    <div className="flex flex-col gap-3">
      <ResourceModalityTabs active={activeTab} onChange={setActiveTab} />

      {filtered.length === 0 ? (
        <p className="text-[14px] text-center py-4" style={{ fontFamily: "'Crimson Pro', serif", color: '#9a9088', fontStyle: 'italic' }}>
          {all.length === 0 ? 'No resources yet.' : 'No resources in this category.'}
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((r) => (
            <ResourceCard key={r.id} resource={r} nodeId={nodeId} />
          ))}
        </div>
      )}

      {discovered !== null && (
        <div
          className="text-[12px] text-center py-1.5 rounded-full border"
          style={{ fontFamily: 'JetBrains Mono, monospace', color: 'oklch(0.60 0.13 150)', borderColor: 'oklch(0.85 0.08 150)' }}
        >
          {discovered > 0 ? `+${discovered} new resources found` : 'No new resources found'}
        </div>
      )}

      <DiscoverButton nodeId={nodeId} onDiscover={setDiscovered} />
    </div>
  );
}
