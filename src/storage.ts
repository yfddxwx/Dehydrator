import { ApiConfig, DehydratedResult } from './types';

const STORAGE_KEYS = {
  API_CONFIG: 'thought_dehydrator_api_config_v1',
  HISTORY_CARDS: 'thought_dehydrator_history_v1',
  SOUND_MUTED: 'thought_dehydrator_sound_muted_v1',
};

export const defaultApiConfig: ApiConfig = {
  provider: 'local',
  apiKey: '',
  baseUrl: '',
  modelName: '',
};

export function loadApiConfig(): ApiConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.API_CONFIG);
    if (!raw) return defaultApiConfig;
    const parsed = JSON.parse(raw);
    return { ...defaultApiConfig, ...parsed };
  } catch (e) {
    console.error('Failed to load api config from storage:', e);
    return defaultApiConfig;
  }
}

export function saveApiConfig(config: ApiConfig): void {
  try {
    localStorage.setItem(STORAGE_KEYS.API_CONFIG, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save api config:', e);
  }
}

export function loadHistoryCards(): DehydratedResult[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HISTORY_CARDS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load history cards:', e);
    return [];
  }
}

export function saveHistoryCards(cards: DehydratedResult[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.HISTORY_CARDS, JSON.stringify(cards));
  } catch (e) {
    console.error('Failed to save history cards:', e);
  }
}

export function loadSoundMuted(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEYS.SOUND_MUTED) === 'true';
  } catch {
    return false;
  }
}

export function saveSoundMuted(muted: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SOUND_MUTED, String(muted));
  } catch (e) {
    console.error('Failed to save sound preference:', e);
  }
}
