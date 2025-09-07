'use client'

import { useState, useCallback } from 'react'
import { useForm, UseFormReturn, FieldValues, Path } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FormField, ValidationRule } from '@/types/form'
import { AIValidationService } from '@/lib/ai-service'

export function useAIValidation<T extends FieldValues>(fields: FormField[]) {
  const [aiSuggestions, setAiSuggestions] = useState<Record<string, any>>({})
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [formMistakes, setFormMistakes] = useState<any[]>([])
  const [improvementSuggestions, setImprovementSuggestions] = useState<any[]>([])

  // Generate Zod schema from form fields
  const generateZodSchema = useCallback((formFields: FormField[]) => {
    const schema: Record<string, z.ZodTypeAny> = {}

    formFields.forEach(field => {
      let fieldSchema: z.ZodTypeAny

      // Base field type
      switch (field.type) {
        case 'email':
          fieldSchema = z.string().email('Please enter a valid email address')
          break
        case 'number':
          fieldSchema = z.number({
            required_error: 'This field is required',
            invalid_type_error: 'Please enter a valid number'
          })
          if (field.properties.min !== undefined) {
            fieldSchema = (fieldSchema as z.ZodNumber).min(field.properties.min, `Must be at least ${field.properties.min}`)
          }
          if (field.properties.max !== undefined) {
            fieldSchema = (fieldSchema as z.ZodNumber).max(field.properties.max, `Must be at most ${field.properties.max}`)
          }
          break
        case 'url':
          fieldSchema = z.string().url('Please enter a valid URL')
          break
        case 'phone':
          fieldSchema = z.string().regex(/^[+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number')
          break
        case 'date':
        case 'datetime-local':
          fieldSchema = z.string().min(1, 'Please select a date')
          break
        case 'file':
          fieldSchema = z.any()
          break
        default:
          fieldSchema = z.string()
      }

      // Apply validation rules
      if (field.validation) {
        field.validation.forEach(rule => {
          if (fieldSchema instanceof z.ZodString) {
            switch (rule.type) {
              case 'minLength':
                fieldSchema = fieldSchema.min(rule.value as number, rule.message)
                break
              case 'maxLength':
                fieldSchema = fieldSchema.max(rule.value as number, rule.message)
                break
              case 'pattern':
                fieldSchema = fieldSchema.regex(new RegExp(rule.value as string), rule.message)
                break
            }
          }
        })
      }

      // Required validation
      if (field.required) {
        if (fieldSchema instanceof z.ZodString) {
          fieldSchema = fieldSchema.min(1, 'This field is required')
        } else if (fieldSchema instanceof z.ZodNumber) {
          // Number fields are already required by default
        }
      } else {
        fieldSchema = fieldSchema.optional()
      }

      schema[field.name] = fieldSchema
    })

    return z.object(schema)
  }, [])

  const form = useForm<T>({
    resolver: zodResolver(generateZodSchema(fields)),
    mode: 'onChange'
  })

  // Request AI validation suggestions for a specific field
  const requestFieldValidation = useCallback(async (field: FormField) => {
    try {
      const suggestions = await AIValidationService.suggestValidationForField(field)
      setAiSuggestions(prev => ({
        ...prev,
        [field.id]: suggestions
      }))
      return suggestions
    } catch (error) {
      console.error('Failed to get AI validation suggestions:', error)
      return null
    }
  }, [])

  // Analyze entire form for mistakes
  const analyzeFormMistakes = useCallback(async () => {
    setIsAnalyzing(true)
    try {
      const analysis = await AIValidationService.analyzeFormMistakes(fields)
      setFormMistakes(analysis.mistakes)
      setImprovementSuggestions(analysis.suggestions)
      return analysis
    } catch (error) {
      console.error('Failed to analyze form:', error)
      return { mistakes: [], suggestions: [] }
    } finally {
      setIsAnalyzing(false)
    }
  }, [fields])

  // Apply AI validation suggestions to a field
  const applyValidationSuggestions = useCallback((fieldId: string, suggestions: any) => {
    // This would typically update the form field configuration
    console.log('Applying AI validation suggestions:', fieldId, suggestions)
    // In a real implementation, this would update the field's validation rules
  }, [])

  // Generate smart error messages
  const getSmartErrorMessage = useCallback((fieldName: string, error: any) => {
    const field = fields.find(f => f.name === fieldName)
    if (!field) return error?.message || 'Invalid input'

    // Custom error messages based on field type and validation rules
    if (field.type === 'email' && error?.message?.includes('email')) {
      return 'Please enter a valid email address (e.g., user@example.com)'
    }

    if (field.type === 'phone' && error?.message?.includes('regex')) {
      return 'Please enter a valid phone number with country code'
    }

    if (field.type === 'url' && error?.message?.includes('url')) {
      return 'Please enter a complete URL (e.g., https://example.com)'
    }

    if (error?.message?.includes('required')) {
      return `${field.label} is required`
    }

    if (error?.message?.includes('min')) {
      return `${field.label} must be at least ${error?.message?.match(/\d+/)?.[0] || ''} characters`
    }

    if (error?.message?.includes('max')) {
      return `${field.label} must be no more than ${error?.message?.match(/\d+/)?.[0] || ''} characters`
    }

    return error?.message || 'Please check your input'
  }, [fields])

  // Validate form with AI-powered error messages
  const validateForm = useCallback(async () => {
    const isValid = await form.trigger()
    if (!isValid) {
      // Enhance error messages with AI context
      const errors = form.formState.errors
      Object.keys(errors).forEach(fieldName => {
        const error = errors[fieldName]
        if (error?.message) {
          // You could store enhanced error messages here
          console.log(`Enhanced error for ${fieldName}:`, getSmartErrorMessage(fieldName, error))
        }
      })
    }
    return isValid
  }, [form, getSmartErrorMessage])

  return {
    form,
    aiSuggestions,
    isAnalyzing,
    formMistakes,
    improvementSuggestions,
    requestFieldValidation,
    analyzeFormMistakes,
    applyValidationSuggestions,
    getSmartErrorMessage,
    validateForm
  }
}
