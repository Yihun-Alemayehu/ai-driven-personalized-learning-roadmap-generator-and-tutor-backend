import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface MyLearningEntry {
  enrollmentId: string;
  domainName: string;
  domainSlug: string;
  lastNodeId: string;
  lastAccessedAt: string;
}

interface MyLearningState {
  entries: MyLearningEntry[];
  add: (entry: Omit<MyLearningEntry, 'lastAccessedAt'>) => void;
  updateLastNode: (enrollmentId: string, nodeId: string) => void;
  remove: (enrollmentId: string) => void;
  clear: () => void;
}

export const useMyLearningStore = create<MyLearningState>()(
  persist(
    (set) => ({
      entries: [],

      add: (entry) =>
        set((state) => {
          const exists = state.entries.find((e) => e.enrollmentId === entry.enrollmentId);
          if (exists) {
            return {
              entries: state.entries.map((e) =>
                e.enrollmentId === entry.enrollmentId
                  ? { ...e, lastNodeId: entry.lastNodeId, lastAccessedAt: new Date().toISOString() }
                  : e,
              ),
            };
          }
          return {
            entries: [
              { ...entry, lastAccessedAt: new Date().toISOString() },
              ...state.entries,
            ],
          };
        }),

      updateLastNode: (enrollmentId, nodeId) =>
        set((state) => ({
          entries: state.entries.map((e) =>
            e.enrollmentId === enrollmentId
              ? { ...e, lastNodeId: nodeId, lastAccessedAt: new Date().toISOString() }
              : e,
          ),
        })),

      remove: (enrollmentId) =>
        set((state) => ({
          entries: state.entries.filter((e) => e.enrollmentId !== enrollmentId),
        })),

      clear: () => set({ entries: [] }),
    }),
    { name: 'atlas-my-learning' },
  ),
);
