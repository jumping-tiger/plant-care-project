import { create } from 'zustand';
import * as Location from 'expo-location';
import { api } from '../services/api';
import type { WeatherInfo } from '../types';

interface WeatherStore {
  weather: WeatherInfo | null;
  cityName: string;
  loaded: boolean;
  fetchWeather: () => Promise<void>;
}

export const useWeatherStore = create<WeatherStore>((set, get) => ({
  weather: null,
  cityName: '',
  loaded: false,

  fetchWeather: async () => {
    if (get().loaded) return;
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        set({ loaded: true });
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
      const [geo] = await Location.reverseGeocodeAsync(loc.coords);
      const cityName = geo?.city || geo?.region || '';
      const weather = await api.getWeather(loc.coords.latitude, loc.coords.longitude);
      set({ weather, cityName, loaded: true });
    } catch {
      set({ loaded: true });
    }
  },
}));
