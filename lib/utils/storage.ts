import { isBrowser } from './isBrowser';

export function getLocalStorageItem(key: string): string | null {
  if (!isBrowser()) return null;
  return window.localStorage.getItem(key);
}

export function setLocalStorageItem(key: string, value: string): void {
  if (isBrowser()) {
    window.localStorage.setItem(key, value);
  }
}

export function removeLocalStorageItem(key: string): void {
  if (isBrowser()) {
    window.localStorage.removeItem(key);
  }
}
