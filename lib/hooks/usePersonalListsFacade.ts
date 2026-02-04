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

  // Listen for storage changes (from real-time updates or other tabs)
  useEffect(() => {
    const handleStorageChange = () => {
      const stored = getLocalStorageItem('personalListCodes');
      const codes = stored ? JSON.parse(stored) : [];

      // Only update if codes actually changed
      setPersonalListCodes((prev) => {
        const changed = JSON.stringify(prev) !== JSON.stringify(codes);
        if (!changed) return prev;
        return codes;
      });

      // Update active list code if it was deleted
      setActiveListCode((prev) => {
        if (prev && !codes.includes(prev)) {
          return codes[0] || null;
        }
        return prev;
      });
    };

    // Listen to storage changes
    window.addEventListener('storage', handleStorageChange);

    // Also create a custom event for same-tab updates
    window.addEventListener('personalListsUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('personalListsUpdated', handleStorageChange);
    };
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
    setPersonalListCodes((prev) => {
      const updated = prev.filter((c) => c !== code);

      // If clearing the active list, switch to another one
      if (activeListCode === code) {
        setActiveListCode(updated[0] || null);
      }

      return updated;
    });
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
