import { getOpenAIClient, OpenAIConfigError } from '@/lib/openai-config'
import { FormField } from '@/types/form'

export interface AnalysisRequest {
  fields: FormField[]
}

export interface AnalysisResponse {
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
}

export class AnalysisAPI {
  static async analyzeFormMistakes(fields: FormField[]): Promise<AnalysisResponse> {
    // Validate OpenAI configuration
    if (!require('@/lib/openai-config').isOpenAIEnabled()) {
      throw new OpenAIConfigError('OpenAI features are not configured', 'SERVICE_UNAVAILABLE')
    }

    if (!Array.isArray(fields)) {
      throw new Error('Invalid fields data provided')
    }

    const client = getOpenAIClient()
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

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-nano",
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
  }

  private static parseFormAnalysisResponse(response: string, fields: FormField[]): AnalysisResponse {
    // Simple parsing for form analysis - in a real implementation, you'd use more sophisticated parsing
    const mistakes: AnalysisResponse['mistakes'] = []
    const suggestions: AnalysisResponse['suggestions'] = []

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

  static getFallbackAnalysis(fields: FormField[]): AnalysisResponse {
    const mistakes: AnalysisResponse['mistakes'] = []
    const suggestions: AnalysisResponse['suggestions'] = []

    // Basic fallback checks
    if (fields.length === 0) {
      suggestions.push({
        type: 'improvement',
        message: 'No form fields detected',
        action: 'Add form fields to get started'
      })
    }

    return { mistakes, suggestions }
  }
}
