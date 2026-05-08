export interface PseItem {
  title: string;
  link: string;
  snippet: string;
  displayLink: string;
}

export interface PseResponse {
  items?: PseItem[];
  error?: { code: number; message: string };
}
