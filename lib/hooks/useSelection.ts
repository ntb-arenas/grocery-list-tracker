import { useState } from 'react';

// Small selection hook for managing a Set of selected ids
export default function useSelection() {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleSelection = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSelectList = (ids: string[]) => {
    if (ids.length === 0) return;
    setSelected((prev) => {
      const next = new Set(prev);
      const allSelected = ids.every((id) => next.has(id));
      if (allSelected) ids.forEach((id) => next.delete(id));
      else ids.forEach((id) => next.add(id));
      return next;
    });
  };

  const selectedIdsFor = (items: Array<{ id: string }>) => items.filter((i) => selected.has(i.id)).map((i) => i.id);
  const hasSelectedIn = (items: Array<{ id: string }>) => items.some((i) => selected.has(i.id));
  const selectedHasUnbought = (items: Array<{ id: string; completed?: boolean }>) =>
    items.some((i) => selected.has(i.id) && !i.completed);
  const selectedHasBought = (items: Array<{ id: string; completed?: boolean }>) => items.some((i) => selected.has(i.id) && !!i.completed);

  return {
    selected,
    toggleSelection,
    toggleSelectList,
    selectedIdsFor,
    hasSelectedIn,
    selectedHasUnbought,
    selectedHasBought,
  };
}
