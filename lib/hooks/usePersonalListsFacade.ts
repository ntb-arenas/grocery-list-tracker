import { useState, useEffect } from 'react';
import { getLocalStorageItem, setLocalStorageItem } from '../utils/storage';

export function usePersonalListsFacade() {
  const [personalListCodes, setPersonalListCodes] = useState<string[]>(() => {
    const stored = getLocalStorageItem('personalListCodes');
    return stored ? JSON.parse(stored) : [];
  });
  const [activeListCode, setActiveListCode] = useState<string | null>(personalListCodes[0] || null);

  useEffect(() => {
      setLocalStorageItem('personalListCodes', JSON.stringify(personalListCodes));
  }, [personalListCodes]);

  const claimList = (code: string) => {
    if (!personalListCodes.includes(code)) {
      setPersonalListCodes((prev) => [...prev, code]);
    }
    setActiveListCode(code);
  };

  const clearList = (code: string) => {
    setPersonalListCodes((prev) => {
      const updated = prev.filter((c) => c !== code);
        setLocalStorageItem('personalListCodes', JSON.stringify(updated));
      return updated;
    });
    if (activeListCode === code) {
      setActiveListCode(personalListCodes.length > 1 ? personalListCodes.find((c) => c !== code) || null : null);
    }
  };

  return {
    personalListCodes,
    activeListCode,
    setActiveListCode,
    claimList,
    clearList,
    setPersonalListCodes,
  };
}
