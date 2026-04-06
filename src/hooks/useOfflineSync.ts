import { useState, useEffect, useCallback } from "react";
import type { OfflineEntry, Language, Specialty } from "@/types/clinical";

const STORAGE_KEY = "shadowmd_offline_queue";

const loadQueue = (): OfflineEntry[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
};

const saveQueue = (queue: OfflineEntry[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
};

export const useOfflineSync = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [queue, setQueue] = useState<OfflineEntry[]>(loadQueue);

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  const addToQueue = useCallback(
    (symptoms: string, notes: string, language: Language, specialty: Specialty) => {
      const entry: OfflineEntry = {
        id: crypto.randomUUID(),
        symptoms,
        notes,
        language,
        specialty,
        timestamp: Date.now(),
        synced: false,
      };
      setQueue((prev) => {
        const next = [...prev, entry];
        saveQueue(next);
        return next;
      });
      return entry;
    },
    []
  );

  const markSynced = useCallback((id: string) => {
    setQueue((prev) => {
      const next = prev.map((e) => (e.id === id ? { ...e, synced: true } : e));
      saveQueue(next);
      return next;
    });
  }, []);

  const removeEntry = useCallback((id: string) => {
    setQueue((prev) => {
      const next = prev.filter((e) => e.id !== id);
      saveQueue(next);
      return next;
    });
  }, []);

  const pendingCount = queue.filter((e) => !e.synced).length;

  return { isOnline, queue, pendingCount, addToQueue, markSynced, removeEntry };
};
