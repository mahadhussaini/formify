import { NextRequest, NextResponse } from 'next/server'
import { ValidationAPI } from '@/api/ai'
import { OpenAIConfigError } from '@/lib/openai-config'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { field } = body

    if (!field || !field.id || !field.type) {
      return NextResponse.json(
        { error: 'Invalid field data provided' },
        { status: 400 }
      )
    }

    const result = await ValidationAPI.suggestValidationForField(field)
    return NextResponse.json(result)

  } catch (error) {
    console.error('AI validation suggestion failed:', error)

    // Handle specific OpenAI configuration errors
    if (error instanceof OpenAIConfigError) {
      if (error.code === 'SERVICE_UNAVAILABLE') {
        return NextResponse.json(
          { error: error.message },
          { status: 503 }
        )
      }
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    // Return fallback suggestions for any other errors
    const body = await request.json().catch(() => ({ field: null }))
    const ValidationAPIClass = ValidationAPI as any
    const fallbackResult = ValidationAPIClass.getFallbackSuggestions(body.field)

    return NextResponse.json(fallbackResult)
  }
}
