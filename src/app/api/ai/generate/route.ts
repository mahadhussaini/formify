import { NextRequest, NextResponse } from 'next/server'
import { GenerationAPI } from '@/api/ai'
import { OpenAIConfigError } from '@/lib/openai-config'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { description } = body

    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      return NextResponse.json(
        { error: 'Invalid description provided' },
        { status: 400 }
      )
    }

    const result = await GenerationAPI.generateNaturalLanguageForm(description)
    return NextResponse.json(result)

  } catch (error) {
    console.error('Form generation failed:', error)

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

    // Return fallback form for any other errors
    const fallbackResult = GenerationAPI.getFallbackForm()
    return NextResponse.json(fallbackResult)
  }
}
