import { create } from 'zustand';

export interface BreadcrumbItem {
  label: string;
  to?: string;
}

interface BreadcrumbState {
  breadcrumbs: BreadcrumbItem[];
  setBreadcrumbs: (items: BreadcrumbItem[]) => void;
  clearBreadcrumbs: () => void;
}

export const useBreadcrumbStore = create<BreadcrumbState>((set) => ({
  breadcrumbs: [],
  setBreadcrumbs: (items) => set({ breadcrumbs: items }),
  clearBreadcrumbs: () => set({ breadcrumbs: [] }),
}));
