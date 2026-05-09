export interface SerperItem {
  title: string;
  link: string;
  snippet: string;
  position: number;
  date?: string;
}

export interface SerperResponse {
  organic?: SerperItem[];
  searchParameters?: { q: string; gl: string; hl: string };
}
