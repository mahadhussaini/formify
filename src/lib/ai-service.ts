import { FormField, ValidationRule, FieldType, AIValidationSuggestion } from '@/types/form'
import { generateId } from './utils'

export interface ValidationSuggestion {
  fieldType: FieldType
  suggestions: {
    validationRules: ValidationRule[]
    improvedLabel?: string
    improvedPlaceholder?: string
    reasoning: string
  }
}

export class AIValidationService {
  static async suggestValidationForField(field: FormField): Promise<AIValidationSuggestion> {
    try {
      const response = await fetch('/api/ai/validation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ field }),
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      // Transform API response to match expected format
      return {
        fieldId: data.fieldId,
        suggestions: {
          validationRules: data.suggestions.validationRules.map((rule: any) => ({
            type: rule.type as ValidationRule['type'],
            value: rule.value,
            message: rule.message,
            aiGenerated: rule.aiGenerated
          })),
          improvedLabel: data.suggestions.improvedLabel,
          improvedPlaceholder: data.suggestions.improvedPlaceholder,
          reasoning: data.suggestions.reasoning
        }
      }
    } catch (error) {
      console.error('AI validation suggestion failed:', error)
      return this.getFallbackSuggestions(field)
    }
  }

  static async analyzeFormMistakes(fields: FormField[]): Promise<{
    mistakes: Array<{
      fieldId: string
      type: 'error' | 'warning'
      message: string
      suggestion: string
    }>
    suggestions: Array<{
      type: 'improvement'
      message: string
      action: string
    }>
  }> {
    try {
      const response = await fetch('/api/ai/analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fields }),
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Form analysis failed:', error)
      return { mistakes: [], suggestions: [] }
    }
  }

  static async generateNaturalLanguageForm(description: string): Promise<{
    title: string
    description: string
    fields: Omit<FormField, 'id'>[]
  }> {
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description }),
      })

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      // Transform API response to match expected format with generated IDs
      return {
        title: data.title,
        description: data.description,
        fields: data.fields.map((field: any) => ({
          ...field,
          id: generateId(),
          validation: field.validation || [],
          properties: field.properties || {}
        }))
      }
    } catch (error) {
      console.error('Form generation failed:', error)
      return {
        title: 'Generated Form',
        description: 'Auto-generated form from your description',
        fields: []
      }
    }
  }


  private static getFallbackSuggestions(field: FormField): AIValidationSuggestion {
    const suggestions: ValidationRule[] = []

    // Fallback validation rules based on field type
    switch (field.type) {
      case 'email':
        suggestions.push({
          type: 'pattern',
          value: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
          message: 'Please enter a valid email address',
          aiGenerated: true
        })
        break
      case 'phone':
        suggestions.push({
          type: 'pattern',
          value: '^[+]?[1-9][\\d]{0,15}$',
          message: 'Please enter a valid phone number',
          aiGenerated: true
        })
        break
      case 'text':
        if (field.label.toLowerCase().includes('name')) {
          suggestions.push({
            type: 'minLength',
            value: 2,
            message: 'This field must be at least 2 characters long',
            aiGenerated: true
          })
        }
        break
    }

    return {
      fieldId: field.id,
      suggestions: {
        validationRules: suggestions,
        reasoning: 'Fallback validation rules based on field type'
      }
    }
  }
}
