'use client'

import { useState, useEffect } from 'react'

export type ScrollDirection = 'up' | 'down' | null

export function useScrollDirection(threshold = 50) {
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>(null)

  useEffect(() => {
    let lastScrollY = window.pageYOffset

    const updateScrollDirection = () => {
      const scrollY = window.pageYOffset
      const direction = scrollY > lastScrollY ? 'down' : 'up'
      
      if (
        direction !== scrollDirection &&
        (scrollY - lastScrollY > threshold || lastScrollY - scrollY > threshold)
      ) {
        setScrollDirection(direction)
      }
      lastScrollY = scrollY > 0 ? scrollY : 0
    }

    window.addEventListener('scroll', updateScrollDirection)
    return () => {
      window.removeEventListener('scroll', updateScrollDirection)
    }
  }, [scrollDirection, threshold])

  return scrollDirection
}
