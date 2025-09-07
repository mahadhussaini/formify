import OpenAI from 'openai'
import { FormField, ValidationRule, FieldType, AIValidationSuggestion } from '@/types/form'
import { generateId } from './utils'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true // Note: In production, this should be handled server-side
})

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
      const prompt = this.buildValidationPrompt(field)

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
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

      return this.parseValidationResponse(response, field)
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
      const formContext = fields.map(field => ({
        id: field.id,
        type: field.type,
        label: field.label,
        name: field.name,
        required: field.required,
        options: field.options?.length || 0
      }))

      const prompt = `Analyze this form for common mistakes and improvements:

Form Fields: ${JSON.stringify(formContext, null, 2)}

Please identify:
1. Validation gaps (missing required validations)
2. Inconsistent naming patterns
3. Poor user experience issues
4. Accessibility concerns
5. Common form anti-patterns

Provide specific, actionable suggestions.`

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a form design expert. Analyze forms for UX issues, validation gaps, accessibility problems, and best practices violations."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.6,
        max_tokens: 600
      })

      const response = completion.choices[0]?.message?.content
      if (!response) {
        throw new Error('No response from AI service')
      }

      return this.parseFormAnalysisResponse(response, fields)
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
      const prompt = `Create a form based on this description: "${description}"

Please provide:
1. A clear, concise form title
2. A brief description of the form's purpose
3. A list of form fields with appropriate types, labels, and validation rules

Consider common form patterns and best practices. Make the form user-friendly and comprehensive.

Return the result as a JSON object with this structure:
{
  "title": "Form Title",
  "description": "Form description",
  "fields": [
    {
      "type": "email",
      "label": "Email Address",
      "name": "email",
      "required": true,
      "placeholder": "Enter your email",
      "validation": [
        {
          "type": "pattern",
          "value": "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$",
          "message": "Please enter a valid email address"
        }
      ]
    }
  ]
}`

      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a form generation expert. Create well-structured, user-friendly forms based on natural language descriptions. Focus on appropriate field types, validation rules, and user experience."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })

      const response = completion.choices[0]?.message?.content
      if (!response) {
        throw new Error('No response from AI service')
      }

      return this.parseFormGenerationResponse(response)
    } catch (error) {
      console.error('Form generation failed:', error)
      return {
        title: 'Generated Form',
        description: 'Auto-generated form from your description',
        fields: []
      }
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

  private static parseValidationResponse(response: string, field: FormField): AIValidationSuggestion {
    try {
      // Try to extract structured data from the response
      const suggestions: ValidationRule[] = []

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
        fieldId: field.id,
        suggestions: {
          validationRules: suggestions,
          reasoning: 'AI-generated validation rules based on field type and best practices'
        }
      }
    } catch (error) {
      console.error('Failed to parse AI validation response:', error)
      return this.getFallbackSuggestions(field)
    }
  }

  private static parseFormAnalysisResponse(response: string, fields: FormField[]) {
    // Simple parsing for form analysis - in a real implementation, you'd use more sophisticated parsing
    const mistakes = []
    const suggestions = []

    // Check for common issues
    const emailFields = fields.filter(f => f.type === 'email')
    if (emailFields.length === 0) {
      mistakes.push({
        fieldId: 'general',
        type: 'warning' as const,
        message: 'No email field detected',
        suggestion: 'Consider adding an email field for user communication'
      })
    }

    const requiredFields = fields.filter(f => f.required)
    if (requiredFields.length === 0) {
      suggestions.push({
        type: 'improvement' as const,
        message: 'No required fields detected',
        action: 'Mark essential fields as required for better data quality'
      })
    }

    return { mistakes, suggestions }
  }

  private static parseFormGenerationResponse(response: string) {
    try {
      // Extract JSON from the response
      const jsonMatch = response.match(/```json\s*(\{[\s\S]*?\})\s*```/) ||
                       response.match(/(\{[\s\S]*\})/)

      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[1])
        return {
          title: parsed.title || 'Generated Form',
          description: parsed.description || '',
          fields: parsed.fields || []
        }
      }

      throw new Error('Could not parse JSON from response')
    } catch (error) {
      console.error('Failed to parse form generation response:', error)
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
