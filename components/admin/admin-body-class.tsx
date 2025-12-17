'use client'

import { useEffect } from 'react'

export function AdminBodyClass() {
  useEffect(() => {
    document.body.classList.add('admin-mode')
    return () => {
      document.body.classList.remove('admin-mode')
    }
  }, [])

  return null
}
