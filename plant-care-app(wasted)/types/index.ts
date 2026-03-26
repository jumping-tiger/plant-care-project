export interface Plant {
  id: string;
  name: string;
  scientificName?: string;
  family?: string;
  description?: string;
  imageUri?: string;
  careLevel?: 'easy' | 'medium' | 'hard';
}

export type HealthStatus = 'healthy' | 'warning' | 'danger';

export interface WeatherCurrent {
  temp: string;
  text: string;
  humidity: string;
  windDir: string;
  windScale: string;
  feelsLike: string;
}

export interface WeatherForecastDay {
  date: string;
  tempMax: string;
  tempMin: string;
  textDay: string;
  textNight: string;
  humidity: string;
}

export interface WeatherInfo {
  city?: string;
  current: WeatherCurrent;
  forecast: WeatherForecastDay[];
}

export interface AnalysisResult {
  id: string;
  plantName: string;
  scientificName?: string;
  healthStatus: HealthStatus;
  healthScore: number;
  issues: string[];
  advice: CareAdvice[];
  imageUri: string;
  analyzedAt: string;
  climateAdvice?: string;
  weatherInfo?: WeatherInfo;
}

export interface CareAdvice {
  category: 'water' | 'light' | 'fertilizer' | 'temperature' | 'pest' | 'general';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export interface PredictionDay {
  day: number;
  date: string;
  healthScore: number;
  healthStatus: HealthStatus;
  description: string;
  actions: string[];
}

export interface PredictionResult {
  plantName: string;
  currentHealthScore: number;
  predictions: PredictionDay[];
  summary: string;
  weatherInfo?: WeatherInfo;
}

export interface HistoryRecord {
  id: string;
  result: AnalysisResult;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  nickname?: string;
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isLoggedIn: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  nickname?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface EncyclopediaEntry {
  name: string;
  scientificName: string;
  family: string;
  origin: string;
  description: string;
  careGuide: {
    water: string;
    light: string;
    temperature: string;
    soil: string;
    fertilizer: string;
  };
  commonIssues: string[];
}
