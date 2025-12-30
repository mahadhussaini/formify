import { getOpenAIClient, OpenAIConfigError } from '@/lib/openai-config'

export interface GenerationRequest {
  description: string
}

export interface GenerationResponse {
  title: string
  description: string
  fields: Array<{
    type: string
    label: string
    name: string
    required: boolean
    placeholder?: string
    validation?: Array<{
      type: string
      value?: any
      message: string
    }>
  }>
}

export class GenerationAPI {
  static async generateNaturalLanguageForm(description: string): Promise<GenerationResponse> {
    // Validate OpenAI configuration
    if (!require('@/lib/openai-config').isOpenAIEnabled()) {
      throw new OpenAIConfigError('OpenAI features are not configured', 'SERVICE_UNAVAILABLE')
    }

    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      throw new Error('Invalid description provided')
    }

    const client = getOpenAIClient()
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

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-nano",
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
  }

  private static parseFormGenerationResponse(response: string): GenerationResponse {
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
      return this.getFallbackForm()
    }
  }

  static getFallbackForm(): GenerationResponse {
    return {
      title: 'Generated Form',
      description: 'Auto-generated form from your description',
      fields: []
    }
  }
}
