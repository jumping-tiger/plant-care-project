import { useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { HistoryRecord } from '../types';
import { STORAGE_KEYS } from '../constants';

export function useHistoryStore() {
  const [records, setRecords] = useState<HistoryRecord[]>([]);

  const loadRecords = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.HISTORY);
      if (raw) {
        const parsed: HistoryRecord[] = JSON.parse(raw);
        setRecords(parsed.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      } else {
        setRecords([]);
      }
    } catch {
      setRecords([]);
    }
  }, []);

  const saveRecord = useCallback(
    async (record: HistoryRecord) => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.HISTORY);
        const existing: HistoryRecord[] = raw ? JSON.parse(raw) : [];

        const duplicate = existing.findIndex((r) => r.id === record.id);
        if (duplicate !== -1) {
          existing[duplicate] = record;
        } else {
          existing.unshift(record);
        }

        await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(existing));
        setRecords(existing.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      } catch {
        // silently fail
      }
    },
    [],
  );

  const deleteRecord = useCallback(
    async (id: string) => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.HISTORY);
        const existing: HistoryRecord[] = raw ? JSON.parse(raw) : [];
        const filtered = existing.filter((r) => r.id !== id);

        await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(filtered));
        setRecords(filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
      } catch {
        // silently fail
      }
    },
    [],
  );

  const clearHistory = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.HISTORY);
      setRecords([]);
    } catch {
      // silently fail
    }
  }, []);

  return {
    records,
    loadRecords,
    saveRecord,
    deleteRecord,
    clearHistory,
  };
}
