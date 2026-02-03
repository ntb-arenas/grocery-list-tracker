import { useState, useEffect } from 'react';
import { getLocalStorageItem, setLocalStorageItem } from '../utils/storage';

export function usePersonalListsFacade() {
  // Initialize with empty array to avoid hydration mismatch
  const [personalListCodes, setPersonalListCodes] = useState<string[]>([]);
  const [activeListCode, setActiveListCode] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from localStorage only on client after mount
  useEffect(() => {
    const stored = getLocalStorageItem('personalListCodes');
    const codes = stored ? JSON.parse(stored) : [];
    setPersonalListCodes(codes);
    setActiveListCode(codes[0] || null);
    setIsInitialized(true);
  }, []);

  // Sync to localStorage whenever codes change (but only after initialization)
  useEffect(() => {
    if (isInitialized) {
      setLocalStorageItem('personalListCodes', JSON.stringify(personalListCodes));
    }
  }, [personalListCodes, isInitialized]);

  const claimList = (code: string) => {
    if (!personalListCodes.includes(code)) {
      setPersonalListCodes((prev) => [...prev, code]);
    }
    setActiveListCode(code);
  };

  const clearList = (code: string) => {
    setPersonalListCodes((prev) => prev.filter((c) => c !== code));

    // If clearing the active list, switch to another one
    if (activeListCode === code) {
      setPersonalListCodes((prev) => {
        const remaining = prev.filter((c) => c !== code);
        setActiveListCode(remaining[0] || null);
        return remaining;
      });
    }
  };

  return {
    personalListCodes,
    activeListCode,
    isInitialized,
    setActiveListCode,
    claimList,
    clearList,
    setPersonalListCodes,
  };
}
