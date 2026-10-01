import { useSyncExternalStore } from 'react';

type StorageStatus = 'idle' | 'saving' | 'error';
let status: StorageStatus = 'idle';
const listeners = new Set<() => void>();

export function setStorageStatus(next: StorageStatus) {
  if (status === next) return;
  status = next;
  listeners.forEach((listener) => listener());
}

export function useStorageStatus() {
  return useSyncExternalStore(
    (listener) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    () => status,
    () => 'idle' as StorageStatus,
  );
}
