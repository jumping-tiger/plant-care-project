import type { PredictionResult } from '../types';

function cacheKey(plantName: string, healthScore: number, cityName?: string): string {
  return `${plantName}|${healthScore}|${cityName ?? ''}`;
}

const cache = new Map<string, PredictionResult>();

export function getCachedPrediction(
  plantName: string,
  healthScore: number,
  cityName?: string
): PredictionResult | null {
  return cache.get(cacheKey(plantName, healthScore, cityName)) ?? null;
}

export function setCachedPrediction(
  plantName: string,
  healthScore: number,
  cityName: string | undefined,
  data: PredictionResult
): void {
  cache.set(cacheKey(plantName, healthScore, cityName), data);
}
