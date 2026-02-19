import { useState, useCallback } from 'react'

export function useProductSelection() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const toggleSelect = useCallback((id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (checked) {
        next.add(id)
      } else {
        next.delete(id)
      }
      return next
    })
  }, [])

  const toggleSelectAll = useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids))
  }, [])

  return {
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    setSelectedIds,
  }
}
