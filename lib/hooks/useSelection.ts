import { useState, useCallback, useMemo } from 'react';

type Item = { id: string; completed?: boolean };

export default function useSelection() {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleSelection = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const toggleSelectList = useCallback((ids: string[]) => {
    if (ids.length === 0) return;
    setSelected((prev) => {
      const next = new Set(prev);
      const allSelected = ids.every((id) => next.has(id));

      if (allSelected) {
        ids.forEach((id) => next.delete(id));
      } else {
        ids.forEach((id) => next.add(id));
      }
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelected(new Set());
  }, []);

  const selectedIdsFor = useCallback((items: Item[]) =>
    items.filter((i) => selected.has(i.id)).map((i) => i.id),
    [selected]
  );

  const hasSelectedIn = useCallback((items: Item[]) =>
    items.some((i) => selected.has(i.id)),
    [selected]
  );

  const selectedHasUnbought = useCallback((items: Item[]) =>
    items.some((i) => selected.has(i.id) && !i.completed),
    [selected]
  );

  const selectedHasBought = useCallback((items: Item[]) =>
    items.some((i) => selected.has(i.id) && i.completed),
    [selected]
  );

  const selectedCount = useMemo(() => selected.size, [selected]);

  return {
    selected,
    selectedCount,
    toggleSelection,
    toggleSelectList,
    clearSelection,
    selectedIdsFor,
    hasSelectedIn,
    selectedHasUnbought,
    selectedHasBought,
  } as const;
}
