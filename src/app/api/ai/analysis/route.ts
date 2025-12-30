import { NextRequest, NextResponse } from 'next/server'
import { AnalysisAPI } from '@/api/ai'
import { OpenAIConfigError } from '@/lib/openai-config'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fields } = body

    if (!Array.isArray(fields)) {
      return NextResponse.json(
        { error: 'Invalid fields data provided' },
        { status: 400 }
      )
    }

    const result = await AnalysisAPI.analyzeFormMistakes(fields)
    return NextResponse.json(result)

  } catch (error) {
    console.error('Form analysis failed:', error)

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

    // Return fallback analysis for any other errors
    const body = await request.json().catch(() => ({ fields: [] }))
    const fallbackResult = AnalysisAPI.getFallbackAnalysis(body.fields)

    return NextResponse.json(fallbackResult)
  }
}
