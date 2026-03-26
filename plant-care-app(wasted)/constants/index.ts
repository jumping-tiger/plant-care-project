export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
// 调试：若上传失败，可在任意页面用 console.log(API_URL) 确认实际请求地址

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  HISTORY: 'plant_history',
  THEME_MODE: 'theme_mode',
} as const;

export const IMAGE_CONFIG = {
  MAX_WIDTH: 1024,
  MAX_HEIGHT: 1024,
  QUALITY: 0.8,
} as const;

export const HEALTH_LABELS: Record<string, string> = {
  healthy: '健康',
  warning: '需关注',
  danger: '需治疗',
};

export const CARE_CATEGORY_LABELS: Record<string, string> = {
  water: '浇水',
  light: '光照',
  fertilizer: '施肥',
  temperature: '温度',
  pest: '病虫害',
  general: '综合',
};

export const CARE_CATEGORY_ICONS: Record<string, string> = {
  water: 'water',
  light: 'white-balance-sunny',
  fertilizer: 'flower',
  temperature: 'thermometer',
  pest: 'bug',
  general: 'leaf',
};
