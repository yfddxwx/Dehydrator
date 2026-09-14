export interface DehydratedResult {
  id: string;
  timestamp: number;
  coreEntitiesAndAction: string; // <= 20 chars
  keyConflict: string;           // <= 20 chars
  nextAction: string;            // <= 15 chars
  originalText: string;
  originalLength: number;
  dehydratedLength: number;
  compressionRate: number;      // percentage (e.g. 88.5%)
  hashValue: number;
  source: 'local' | 'gemini' | 'openai' | 'deepseek' | 'kimi';
  apiError?: string;
  fallbackNote?: string;
}

export type ProviderType = 'local' | 'gemini' | 'openai' | 'deepseek' | 'kimi';

export interface ApiConfig {
  provider: ProviderType;
  apiKey: string;
  baseUrl?: string;
  modelName?: string;
}
