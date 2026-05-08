export interface Domain {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  iconUrl: string | null;
  createdAt: Date;
}

export interface CreateDomainInput {
  name: string;
  slug: string;
  description?: string;
  iconUrl?: string;
}

export interface UpdateDomainInput {
  name?: string;
  slug?: string;
  description?: string | null;
  iconUrl?: string | null;
}
