'use client'

import { useEffect } from 'react'
import { useFormHistory } from '@/contexts/FormHistoryContext'

interface KeyboardShortcutsOptions {
  enabled?: boolean
  preventDefault?: boolean
}

export function useKeyboardShortcuts(options: KeyboardShortcutsOptions = {}) {
  const { enabled = true, preventDefault = true } = options
  const { canUndo, canRedo, undo, redo } = useFormHistory()

  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (event: KeyboardEvent) => {
      const { ctrlKey, metaKey, key } = event
      const isModifierPressed = ctrlKey || metaKey

      if (isModifierPressed) {
        switch (key.toLowerCase()) {
          case 'z':
            if (!event.shiftKey && canUndo) {
              if (preventDefault) event.preventDefault()
              undo()
            }
            break
          case 'y':
            if (canRedo) {
              if (preventDefault) event.preventDefault()
              redo()
            }
            break
          case 'z':
            if (event.shiftKey && canRedo) {
              if (preventDefault) event.preventDefault()
              redo()
            }
            break
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [enabled, canUndo, canRedo, undo, redo, preventDefault])

  return {
    canUndo,
    canRedo,
    undo,
    redo
  }
}
