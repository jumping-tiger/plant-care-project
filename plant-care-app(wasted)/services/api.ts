import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { getSecureItem } from './secureStorage';
import { API_URL, STORAGE_KEYS } from '../constants';
import type {
  ApiResponse,
  AnalysisResult,
  PredictionResult,
  EncyclopediaEntry,
  LoginRequest,
  RegisterRequest,
  User,
} from '../types';

async function getAuthHeaders(): Promise<Record<string, string>> {
  const token = await getSecureItem(STORAGE_KEYS.AUTH_TOKEN);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

const DEFAULT_TIMEOUT = 30_000;
const UPLOAD_TIMEOUT = 120_000;

function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  if (Platform.OS === 'web') {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    return fetch(url, { ...options, signal: controller.signal }).finally(() => clearTimeout(timer));
  }
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(Object.assign(new Error('请求超时'), { name: 'AbortError' })), timeoutMs);
    fetch(url, options).then(resolve, reject).finally(() => clearTimeout(timer));
  });
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  try {
    const headers = await getAuthHeaders();

    if (options.body && typeof options.body === 'string') {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetchWithTimeout(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...(options.headers as Record<string, string>),
      },
    }, DEFAULT_TIMEOUT);

    const json = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: json.detail || json.message || json.error || `请求失败 (${response.status})`,
      };
    }

    return json as ApiResponse<T>;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      return { success: false, error: '请求超时，请稍后重试' };
    }
    return { success: false, error: error.message || '网络连接失败' };
  }
}

async function nativeUpload<T>(
  url: string,
  fileUri: string,
  token: string | null,
  extraFields?: Record<string, string>,
): Promise<ApiResponse<T>> {
  try {
    let localUri = fileUri;

    if (fileUri.includes('%40') || fileUri.includes('%2F')) {
      localUri = decodeURIComponent(fileUri);
      console.log('[upload] decoded URI:', localUri.substring(0, 120));
    }

    const fileInfo = await FileSystem.getInfoAsync(localUri);
    console.log('[upload] file exists:', fileInfo.exists, 'size:', (fileInfo as any).size);

    if (!fileInfo.exists) {
      const rawInfo = await FileSystem.getInfoAsync(fileUri);
      console.log('[upload] raw URI exists:', rawInfo.exists);
      if (rawInfo.exists) {
        localUri = fileUri;
      } else {
        return { success: false, error: '图片文件不存在，请重新选择' };
      }
    }

    const headers: Record<string, string> = { Accept: 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const parameters: Record<string, string> = { ...extraFields };

    console.log('[upload] FileSystem.uploadAsync to', url);

    const uploadResult = await FileSystem.uploadAsync(url, localUri, {
      httpMethod: 'POST',
      uploadType: FileSystem.FileSystemUploadType.MULTIPART,
      fieldName: 'image',
      mimeType: 'image/jpeg',
      parameters,
      headers,
    });

    console.log('[upload] response status:', uploadResult.status, 'body length:', uploadResult.body?.length);

    const json = JSON.parse(uploadResult.body);
    if (uploadResult.status >= 200 && uploadResult.status < 300) {
      return json as ApiResponse<T>;
    }
    return { success: false, error: json.detail || json.message || `上传失败 (${uploadResult.status})` };
  } catch (error: any) {
    console.log('[upload] native error:', error?.message);
    return { success: false, error: error.message || '上传失败' };
  }
}

async function uploadImage<T>(
  endpoint: string,
  imageUri: string,
  extraFields?: Record<string, string>,
): Promise<ApiResponse<T>> {
  try {
    const token = await getSecureItem(STORAGE_KEYS.AUTH_TOKEN);
    const url = `${API_URL}${endpoint}`;

    console.log('[upload] imageUri:', imageUri?.substring(0, 120));
    console.log('[upload] target:', url);
    console.log('[upload] platform:', Platform.OS);

    if (Platform.OS !== 'web') {
      return nativeUpload<T>(url, imageUri, token, extraFields);
    }

    const formData = new FormData();
    const resp = await fetch(imageUri);
    const blob = await resp.blob();
    formData.append('image', blob, 'plant.jpg');

    if (extraFields) {
      for (const [key, value] of Object.entries(extraFields)) {
        formData.append(key, value);
      }
    }

    const headers: Record<string, string> = { Accept: 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetchWithTimeout(url, {
      method: 'POST',
      body: formData,
      headers,
    }, UPLOAD_TIMEOUT);

    const json = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: json.detail || json.message || json.error || `上传失败 (${response.status})`,
      };
    }

    return json as ApiResponse<T>;
  } catch (error: any) {
    console.log('[upload] catch error:', error?.message, error?.name);
    if (error.name === 'AbortError') {
      return { success: false, error: '分析超时，请稍后重试' };
    }
    return { success: false, error: error.message || '网络连接失败' };
  }
}

export const api = {
  login(req: LoginRequest): Promise<ApiResponse<{ user: User; token: string }>> {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(req),
    });
  },

  register(req: RegisterRequest): Promise<ApiResponse<{ user: User }>> {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(req),
    });
  },

  analyzePlant(
    imageUri: string,
    location?: { latitude?: string; longitude?: string; cityName?: string },
  ): Promise<ApiResponse<AnalysisResult>> {
    const extra: Record<string, string> = {};
    if (location?.latitude) extra.latitude = location.latitude;
    if (location?.longitude) extra.longitude = location.longitude;
    if (location?.cityName) extra.city_name = location.cityName;
    return uploadImage('/plant/analyze', imageUri, Object.keys(extra).length ? extra : undefined);
  },

  getPrediction(
    plantName: string,
    currentScore: number,
    cityName?: string,
  ): Promise<ApiResponse<PredictionResult>> {
    return request('/plant/prediction', {
      method: 'POST',
      body: JSON.stringify({ plantName, currentScore, city_name: cityName || undefined }),
    });
  },

  getEncyclopedia(plantName: string): Promise<ApiResponse<EncyclopediaEntry>> {
    return request(`/encyclopedia?name=${encodeURIComponent(plantName)}`);
  },

  getUserProfile(): Promise<ApiResponse<User>> {
    return request('/user/profile');
  },

  updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    return request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async updateAvatar(imageUri: string): Promise<ApiResponse<User>> {
    try {
      const headers = await getAuthHeaders();
      delete headers['Content-Type'];

      const formData = new FormData();

      if (Platform.OS === 'web') {
        const resp = await fetch(imageUri);
        const blob = await resp.blob();
        formData.append('avatar', blob, 'avatar.jpg');
      } else {
        formData.append('avatar', {
          uri: imageUri,
          type: 'image/jpeg',
          name: 'avatar.jpg',
        } as any);
      }

      const response = await fetch(`${API_URL}/user/profile`, {
        method: 'PUT',
        headers,
        body: formData,
      });

      const json = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: json.detail || json.message || json.error || `上传失败 (${response.status})`,
        };
      }

      return json as ApiResponse<User>;
    } catch (error: any) {
      return { success: false, error: error.message || '网络连接失败' };
    }
  },
};
