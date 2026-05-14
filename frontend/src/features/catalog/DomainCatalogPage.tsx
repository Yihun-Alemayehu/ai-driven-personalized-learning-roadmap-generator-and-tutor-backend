import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { PageWrapper } from '@/components/layout/PageWrapper';
import { useDomainsQuery } from '@/api/domains';
import { useEnrollmentsQuery, type EnrollmentWithCounts } from '@/api/enrollments';
import { DomainCard, DomainCardSkeleton } from './components/DomainCard';
import { EmptyState } from '@/components/common/EmptyState';

export default function DomainCatalogPage() {
  const [search, setSearch] = useState('');
  const { data: domains, isLoading: domainsLoading } = useDomainsQuery();
  const { data: enrollments } = useEnrollmentsQuery();

  const enrollmentByDomainId = useMemo(() => {
    if (!enrollments) return {} as Record<string, EnrollmentWithCounts>;
    return Object.fromEntries(enrollments.map((e) => [e.domainId, e]));
  }, [enrollments]);

  const filtered = useMemo(() => {
    if (!domains) return [];
    const q = search.toLowerCase().trim();
    if (!q) return domains;
    return domains.filter(
      (d) =>
        d.name.toLowerCase().includes(q) ||
        (d.description ?? '').toLowerCase().includes(q),
    );
  }, [domains, search]);

  return (
    <PageWrapper>
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
        <div>
          <h1
            className="text-[32px] leading-tight"
            style={{ fontFamily: "'Cormorant Garamond', serif", color: '#3d342a' }}
          >
            Explore Learning Domains
          </h1>
          <p className="mt-1 text-[15px]" style={{ color: '#6e645a', fontFamily: "'Crimson Pro', serif" }}>
            Choose a domain to start your personalised roadmap
          </p>
        </div>

        {/* Search */}
        <div className="sm:ml-auto relative">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: '#9a9088' }}
          />
          <input
            type="text"
            placeholder="Search domains…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 rounded-lg border text-sm outline-none focus:border-[oklch(0.62_0.18_28)] w-full sm:w-56"
            style={{ borderColor: '#d6cfbf', background: '#faf7f1', color: '#3d342a', fontFamily: "'Crimson Pro', serif" }}
          />
        </div>
      </div>

      {domainsLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <DomainCardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={search ? 'No domains match your search' : 'No domains available'}
          description={search ? 'Try a different search term.' : 'Check back soon.'}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((domain) => (
            <DomainCard
              key={domain.id}
              domain={domain}
              enrollment={enrollmentByDomainId[domain.id]}
            />
          ))}
        </div>
      )}
    </PageWrapper>
  );
}
