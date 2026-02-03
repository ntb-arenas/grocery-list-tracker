import { useState, useEffect } from 'react';

export function usePersonalListsFacade() {
  const [personalListCodes, setPersonalListCodes] = useState<string[]>(() => {
    const stored = localStorage.getItem('personalListCodes');
    return stored ? JSON.parse(stored) : [];
  });
  const [activeListCode, setActiveListCode] = useState<string | null>(personalListCodes[0] || null);

  useEffect(() => {
    localStorage.setItem('personalListCodes', JSON.stringify(personalListCodes));
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
      localStorage.setItem('personalListCodes', JSON.stringify(updated));
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
