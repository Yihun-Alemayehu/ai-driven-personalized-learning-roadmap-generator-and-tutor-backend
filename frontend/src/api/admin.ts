import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './client';
import type {
  AdminUser, UserRole, SystemStats, DomainStat,
  Domain, OntologyVersion, OntologyDetail, OntologyStatus,
  OntologyNode, OntologyEdge, BranchPath, ValidationResult,
} from '@/types';

// ── Response-shape helpers ────────────────────────────────────────────────────

function toOntologyVersion(v: Record<string, unknown>): OntologyVersion {
  return { ...(v as OntologyVersion), version: v.versionNumber as number };
}

function toOntologyDetail(raw: Record<string, unknown>): OntologyDetail {
  const nodes = (raw.nodes as Array<Record<string, unknown>>).map((n) => ({
    ...n,
    ontologyId: raw.id as string,
    learningOutcomes: Array.isArray(n.learningOutcomes) ? n.learningOutcomes as string[] : [],
    prerequisites: undefined,
  })) as OntologyNode[];

  const edges: OntologyEdge[] = (raw.nodes as Array<Record<string, unknown>>).flatMap((n) =>
    ((n.prerequisites ?? []) as Array<Record<string, unknown>>).map((p) => ({
      id: p.id as string,
      nodeId: p.nodeId as string,
      prerequisiteNodeId: p.prerequisiteNodeId as string,
    })),
  );

  return {
    id: raw.id as string,
    domainId: raw.domainId as string,
    version: raw.versionNumber as number,
    status: raw.status as OntologyStatus,
    nodes,
    edges,
  };
}

// ── Query keys ────────────────────────────────────────────────────────────────

export const adminKeys = {
  users:              (params?: object)     => ['admin', 'users', params ?? {}] as const,
  stats:              ()                    => ['admin', 'stats'] as const,
  domainStats:        ()                    => ['admin', 'stats', 'domains'] as const,
  ontologyVersions:   (domainId: string)    => ['admin', 'ontologies', domainId] as const,
  ontologyDetail:     (ontologyId: string)  => ['admin', 'ontology', ontologyId] as const,
  ontologyValidation: (ontologyId: string)  => ['admin', 'ontology', ontologyId, 'validation'] as const,
};

// ── User management ───────────────────────────────────────────────────────────

export function useAdminUsersQuery(params?: { role?: UserRole; limit?: number; page?: number }) {
  return useQuery({
    queryKey: adminKeys.users(params),
    queryFn: () =>
      apiClient
        .get<{ users: AdminUser[]; total: number }>('/admin/users', { params })
        .then((r) => r.data),
    staleTime: 30_000,
  });
}

export function useChangeRoleMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) =>
      apiClient.patch(`/admin/users/${userId}/role`, { role }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
}

export function useDeleteUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      apiClient.delete(`/admin/users/${userId}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin', 'users'] }),
  });
}

// ── System stats ──────────────────────────────────────────────────────────────

export function useSystemStatsQuery() {
  return useQuery({
    queryKey: adminKeys.stats(),
    queryFn: () =>
      apiClient.get<{ stats: Omit<SystemStats, 'avgMasteryRate'> }>('/admin/stats').then((r) => {
        const stats = r.data.stats;
        const totalMastery = Object.values(stats.masteryBreakdown).reduce((sum, count) => sum + (count ?? 0), 0);
        const masteredOrReviewNeeded =
          (stats.masteryBreakdown.mastered ?? 0) + (stats.masteryBreakdown.review_needed ?? 0);

        return {
          ...stats,
          avgMasteryRate: totalMastery > 0 ? (masteredOrReviewNeeded / totalMastery) * 100 : 0,
        } satisfies SystemStats;
      }),
    staleTime: 60_000,
  });
}

export function useDomainStatsQuery() {
  return useQuery({
    queryKey: adminKeys.domainStats(),
    queryFn: () =>
      apiClient
        .get<{ stats: DomainStat[] }>('/admin/stats/domains')
        .then((r) => r.data.stats),
    staleTime: 60_000,
  });
}

// ── Domain management ─────────────────────────────────────────────────────────

export function useCreateDomainMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description?: string; iconUrl?: string }) =>
      apiClient.post<Domain>('/domains', data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['domains'] }),
  });
}

export function useUpdateDomainMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; name?: string; description?: string; iconUrl?: string }) =>
      apiClient.patch<Domain>(`/domains/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['domains'] }),
  });
}

// ── Ontology management ───────────────────────────────────────────────────────

export function useOntologyVersionsQuery(domainId: string) {
  return useQuery({
    queryKey: adminKeys.ontologyVersions(domainId),
    queryFn: () =>
      apiClient
        .get<{ versions: Array<Record<string, unknown>> }>(`/domains/${domainId}/ontologies`)
        .then((r) => r.data.versions.map(toOntologyVersion)),
    enabled: Boolean(domainId),
  });
}

export function useOntologyDetailQuery(ontologyId: string) {
  return useQuery({
    queryKey: adminKeys.ontologyDetail(ontologyId),
    queryFn: () =>
      apiClient
        .get<{ version: Record<string, unknown> }>(`/ontologies/${ontologyId}`)
        .then((r) => toOntologyDetail(r.data.version)),
    enabled: Boolean(ontologyId),
  });
}

export function useCreateOntologyMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (domainId: string) =>
      apiClient
        .post<{ version: Record<string, unknown> }>(`/domains/${domainId}/ontologies`, {})
        .then((r) => toOntologyVersion(r.data.version)),
    onSuccess: (_data, domainId) =>
      qc.invalidateQueries({ queryKey: adminKeys.ontologyVersions(domainId) }),
  });
}

export function useUpdateOntologyStatusMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ ontologyId, status }: { ontologyId: string; status: OntologyStatus }) =>
      apiClient
        .patch<{ version: Record<string, unknown> }>(`/ontologies/${ontologyId}/status`, { status })
        .then((r) => toOntologyVersion(r.data.version)),
    onSuccess: (_data, { ontologyId }) => {
      qc.invalidateQueries({ queryKey: adminKeys.ontologyDetail(ontologyId) });
      qc.invalidateQueries({ queryKey: ['admin', 'ontologies'] });
    },
  });
}

export function useValidateOntologyQuery(ontologyId: string, enabled: boolean) {
  return useQuery({
    queryKey: adminKeys.ontologyValidation(ontologyId),
    queryFn: () =>
      apiClient
        .get<{ valid: boolean; issues: string[] }>(`/ontologies/${ontologyId}/validate`)
        .then((r) => ({
          valid: r.data.valid,
          errors: r.data.issues,
          warnings: [],
        } as ValidationResult)),
    enabled: enabled && Boolean(ontologyId),
    staleTime: 0,
  });
}

// ── Node management ───────────────────────────────────────────────────────────

export function useAddNodeMutation(ontologyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      title: string;
      slug: string;
      learningOutcomes: string[];
      description?: string;
      branchPath?: BranchPath;
      positionX?: number;
      positionY?: number;
    }) =>
      apiClient
        .post<{ node: OntologyNode }>(`/ontologies/${ontologyId}/nodes`, data)
        .then((r) => r.data.node),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.ontologyDetail(ontologyId) }),
  });
}

export function useUpdateNodeMutation(ontologyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ nodeId, ...data }: Partial<OntologyNode> & { nodeId: string }) =>
      apiClient.patch<{ node: OntologyNode }>(`/nodes/${nodeId}`, data).then((r) => r.data.node),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.ontologyDetail(ontologyId) }),
  });
}

export function useDeleteNodeMutation(ontologyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (nodeId: string) =>
      apiClient.delete(`/nodes/${nodeId}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.ontologyDetail(ontologyId) }),
  });
}

export function useAddPrerequisiteMutation(ontologyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ nodeId, prerequisiteNodeId }: { nodeId: string; prerequisiteNodeId: string }) =>
      apiClient
        .post(`/nodes/${nodeId}/prerequisites`, { prerequisiteNodeId })
        .then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.ontologyDetail(ontologyId) }),
  });
}

export interface ImportNodePayload {
  title: string;
  description?: string;
  learningOutcomes: string[];
  estimatedHours?: number;
  difficultyLevel?: number;
  isBranchingPoint?: boolean;
  isConvergencePoint?: boolean;
  branchPath?: BranchPath | null;
}

export interface ImportOntologyPayload {
  nodes: ImportNodePayload[];
  prerequisites: Array<{ node: string; requires: string }>;
}

export interface ImportOntologyResult {
  nodes: OntologyNode[];
  edgesCreated: number;
  warnings: string[];
}

export function useImportNodesMutation(ontologyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ImportOntologyPayload) =>
      apiClient
        .post<ImportOntologyResult>(`/ontologies/${ontologyId}/nodes/import`, payload)
        .then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.ontologyDetail(ontologyId) }),
  });
}

export function useDeletePrerequisiteMutation(ontologyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (prerequisiteId: string) =>
      apiClient.delete(`/prerequisites/${prerequisiteId}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminKeys.ontologyDetail(ontologyId) }),
  });
}
