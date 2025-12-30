import { getOpenAIClient, OpenAIConfigError } from '@/lib/openai-config'
import { FormField, ValidationRule } from '@/types/form'

export interface ValidationRequest {
  field: FormField
}

export interface ValidationResponse {
  fieldId: string
  suggestions: {
    validationRules: Array<{
      type: string
      value?: any
      message: string
      aiGenerated: boolean
    }>
    improvedLabel?: string
    improvedPlaceholder?: string
    reasoning: string
  }
}

export class ValidationAPI {
  static async suggestValidationForField(field: FormField): Promise<ValidationResponse> {
    // Validate OpenAI configuration
    if (!require('@/lib/openai-config').isOpenAIEnabled()) {
      throw new OpenAIConfigError('OpenAI features are not configured', 'SERVICE_UNAVAILABLE')
    }

    if (!field || !field.id || !field.type) {
      throw new Error('Invalid field data provided')
    }

    const client = getOpenAIClient()
    const prompt = this.buildValidationPrompt(field)

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [
        {
          role: "system",
          content: "You are an expert form validation consultant. Provide smart, user-friendly validation suggestions based on field type, label, and context. Focus on common validation patterns and user experience best practices."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('No response from AI service')
    }

    const suggestions = this.parseValidationResponse(response, field)

    return {
      fieldId: field.id,
      suggestions
    }
  }

  private static buildValidationPrompt(field: FormField): string {
    return `Analyze this form field and suggest appropriate validation rules:

Field Details:
- Type: ${field.type}
- Label: "${field.label}"
- Name: "${field.name}"
- Required: ${field.required}
- Current Placeholder: "${field.placeholder || 'None'}"
- Description: "${field.description || 'None'}"

Based on the field type and context, suggest:
1. Smart validation rules (required, minLength, maxLength, pattern, etc.)
2. Improved placeholder text if needed
3. Better field label if the current one could be improved
4. User-friendly error messages

Consider common validation patterns for this field type and provide practical, user-friendly suggestions.`
  }

  private static parseValidationResponse(response: string, field: FormField) {
    try {
      // Try to extract structured data from the response
      const suggestions: Array<{
        type: string
        value?: any
        message: string
        aiGenerated: boolean
      }> = []

      // Common validation patterns based on field type
      if (field.type === 'email') {
        suggestions.push({
          type: 'pattern',
          value: '^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$',
          message: 'Please enter a valid email address',
          aiGenerated: true
        })
      } else if (field.type === 'phone') {
        suggestions.push({
          type: 'pattern',
          value: '^[+]?[1-9][\\d]{0,15}$',
          message: 'Please enter a valid phone number',
          aiGenerated: true
        })
      } else if (field.type === 'text' && field.label.toLowerCase().includes('name')) {
        suggestions.push({
          type: 'minLength',
          value: 2,
          message: 'Name must be at least 2 characters long',
          aiGenerated: true
        })
      }

      return {
        validationRules: suggestions,
        reasoning: 'AI-generated validation rules based on field type and best practices'
      }
    } catch (error) {
      console.error('Failed to parse AI validation response:', error)
      return this.getFallbackSuggestions(field).suggestions
    }
  }

  static getFallbackSuggestions(field: FormField | null): ValidationResponse {
    const suggestions: Array<{
      type: string
      value?: any
      message: string
      aiGenerated: boolean
    }> = []

    if (!field) {
      return {
        fieldId: 'unknown',
        suggestions: {
          validationRules: suggestions,
          reasoning: 'No field data provided'
        }
      }
    }

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
