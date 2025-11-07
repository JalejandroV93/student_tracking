// Types for Quote of the Day API
export interface QuoteResponse {
  success: boolean;
  data?: {
    content: string;
    author: string;
    cached?: boolean;
    fallback?: boolean;
  };
  error?: string;
}

export interface Quote {
  content: string;
  author: string;
}
