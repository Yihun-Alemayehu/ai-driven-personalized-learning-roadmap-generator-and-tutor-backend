import { useNavigate } from 'react-router-dom';
import { useOntologyVersionsQuery, useCreateOntologyMutation } from '@/api/admin';
import { OntologyStatusBadge } from './OntologyStatusBadge';

interface Props {
  domainId: string;
}

export function OntologyVersionList({ domainId }: Props) {
  const navigate = useNavigate();
  const { data: versions, isLoading } = useOntologyVersionsQuery(domainId);
  const create = useCreateOntologyMutation();

  function handleCreate() {
    create.mutate(domainId, {
      onSuccess: (version) => navigate(`/admin/ontology/${version.id}`),
    });
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 animate-pulse">
        {[1, 2].map((i) => (
          <div key={i} className="h-10 rounded-[8px]" style={{ background: '#ebe6db' }} />
        ))}
      </div>
    );
  }

  const hasPublished = versions?.some((v) => v.status === 'published');
  const hasDraft = versions?.some((v) => v.status === 'draft');

  return (
    <div className="flex flex-col gap-2">
      {versions && versions.length > 0 ? (
        versions.map((v) => (
          <div
            key={v.id}
            className="flex items-center gap-3 px-3 py-2 rounded-[8px] border"
            style={{ borderColor: '#d6cfbf', background: '#f3efe7' }}
          >
            <span
              className="text-[12px]"
              style={{ fontFamily: 'JetBrains Mono, monospace', color: '#6e645a' }}
            >
              v{v.version}
            </span>
            <OntologyStatusBadge status={v.status} />
            <span
              className="flex-1 text-[11px]"
              style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}
            >
              {new Date(v.createdAt).toLocaleDateString()}
            </span>
            {v.status !== 'archived' && (
              <button
                onClick={() => navigate(`/admin/ontology/${v.id}`)}
                className="px-2.5 py-1 rounded-[6px] text-[11px] hover:bg-[#ebe6db] transition-colors"
                style={{ fontFamily: 'JetBrains Mono, monospace', color: '#1a1614', border: '1px solid #d6cfbf' }}
              >
                Open
              </button>
            )}
          </div>
        ))
      ) : (
        <p className="text-[13px] italic" style={{ fontFamily: "'Crimson Pro', serif", color: '#9a9088' }}>
          No ontology versions yet.
        </p>
      )}

      <div className="flex items-center gap-2 mt-1">
        <button
          onClick={handleCreate}
          disabled={create.isPending || hasDraft}
          className="self-start px-3 py-1.5 rounded-[8px] text-[12px] transition-colors hover:bg-[#ebe6db] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ fontFamily: 'JetBrains Mono, monospace', color: '#6e645a', border: '1px solid #d6cfbf' }}
          title={hasDraft ? 'A draft version already exists — open it to edit' : undefined}
        >
          {create.isPending
            ? '…'
            : hasPublished
            ? '+ New version (copy from published)'
            : '+ New version'}
        </button>
        {hasDraft && (
          <span className="text-[11px]" style={{ fontFamily: 'JetBrains Mono, monospace', color: '#9a9088' }}>
            Draft already exists
          </span>
        )}
      </div>
    </div>
  );
}
