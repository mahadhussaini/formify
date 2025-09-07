'use client'

import React, { createContext, useContext, useState, useCallback, useRef } from 'react'
import { Form, FormField } from '@/types/form'
import { deepClone } from '@/lib/utils'

interface FormHistoryState {
  past: Form[]
  present: Form
  future: Form[]
}

interface FormHistoryContextType {
  form: Form
  canUndo: boolean
  canRedo: boolean
  undo: () => void
  redo: () => void
  updateForm: (updates: Partial<Form>) => void
  addField: (field: FormField) => void
  updateField: (fieldId: string, updates: Partial<FormField>) => void
  deleteField: (fieldId: string) => void
  duplicateField: (field: FormField) => void
  clearHistory: () => void
}

const FormHistoryContext = createContext<FormHistoryContextType | undefined>(undefined)

export function FormHistoryProvider({
  initialForm,
  children,
  maxHistorySize = 50
}: {
  initialForm: Form
  children: React.ReactNode
  maxHistorySize?: number
}) {
  const [history, setHistory] = useState<FormHistoryState>({
    past: [],
    present: deepClone(initialForm),
    future: []
  })

  const timeoutRef = useRef<NodeJS.Timeout>()

  // Debounced save to history to avoid too many entries
  const saveToHistory = useCallback((newForm: Form) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      setHistory(prev => {
        const newPast = [...prev.past, deepClone(prev.present)]
        // Limit history size
        if (newPast.length > maxHistorySize) {
          newPast.shift()
        }

        return {
          past: newPast,
          present: deepClone(newForm),
          future: []
        }
      })
    }, 500)
  }, [maxHistorySize])

  const updateForm = useCallback((updates: Partial<Form>) => {
    setHistory(prev => {
      const newForm = { ...prev.present, ...updates, updatedAt: new Date() }
      saveToHistory(newForm)
      return {
        ...prev,
        present: newForm
      }
    })
  }, [saveToHistory])

  const addField = useCallback((field: FormField) => {
    setHistory(prev => {
      const newForm = {
        ...prev.present,
        fields: [...prev.present.fields, field],
        updatedAt: new Date()
      }
      saveToHistory(newForm)
      return {
        ...prev,
        present: newForm
      }
    })
  }, [saveToHistory])

  const updateField = useCallback((fieldId: string, updates: Partial<FormField>) => {
    setHistory(prev => {
      const newForm = {
        ...prev.present,
        fields: prev.present.fields.map(field =>
          field.id === fieldId ? { ...field, ...updates } : field
        ),
        updatedAt: new Date()
      }
      saveToHistory(newForm)
      return {
        ...prev,
        present: newForm
      }
    })
  }, [saveToHistory])

  const deleteField = useCallback((fieldId: string) => {
    setHistory(prev => {
      const newForm = {
        ...prev.present,
        fields: prev.present.fields.filter(field => field.id !== fieldId),
        updatedAt: new Date()
      }
      saveToHistory(newForm)
      return {
        ...prev,
        present: newForm
      }
    })
  }, [saveToHistory])

  const duplicateField = useCallback((field: FormField) => {
    setHistory(prev => {
      const duplicatedField = {
        ...field,
        id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: `${field.name}_copy`,
        label: `${field.label} (Copy)`
      }

      const newForm = {
        ...prev.present,
        fields: [...prev.present.fields, duplicatedField],
        updatedAt: new Date()
      }
      saveToHistory(newForm)
      return {
        ...prev,
        present: newForm
      }
    })
  }, [saveToHistory])

  const undo = useCallback(() => {
    setHistory(prev => {
      if (prev.past.length === 0) return prev

      const previous = prev.past[prev.past.length - 1]
      const newPast = prev.past.slice(0, -1)

      return {
        past: newPast,
        present: deepClone(previous),
        future: [deepClone(prev.present), ...prev.future]
      }
    })
  }, [])

  const redo = useCallback(() => {
    setHistory(prev => {
      if (prev.future.length === 0) return prev

      const next = prev.future[0]
      const newFuture = prev.future.slice(1)

      return {
        past: [...prev.past, deepClone(prev.present)],
        present: deepClone(next),
        future: newFuture
      }
    })
  }, [])

  const clearHistory = useCallback(() => {
    setHistory(prev => ({
      past: [],
      present: deepClone(prev.present),
      future: []
    }))
  }, [])

  const value: FormHistoryContextType = {
    form: history.present,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    undo,
    redo,
    updateForm,
    addField,
    updateField,
    deleteField,
    duplicateField,
    clearHistory
  }

  return (
    <FormHistoryContext.Provider value={value}>
      {children}
    </FormHistoryContext.Provider>
  )
}

export function useFormHistory() {
  const context = useContext(FormHistoryContext)
  if (context === undefined) {
    throw new Error('useFormHistory must be used within a FormHistoryProvider')
  }
  return context
}
