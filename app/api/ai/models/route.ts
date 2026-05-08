import { NextResponse } from 'next/server'

interface OpenRouterRawModel {
  id: string
  name: string
  context_length: number
  description: string
  pricing: {
    prompt: string
    completion: string
  }
}

export interface OpenRouterModel {
  id: string
  name: string
  context: string
  description?: string
}

export async function GET() {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'OPENROUTER_API_KEY is not configured' }, { status: 500 })
    }

    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to fetch models' }, { status: response.status })
    }

    const data = await response.json()
    const allModels = data.data || []

    const freeModels = (allModels as OpenRouterRawModel[])
      .filter((model) => {
        const pricing = model.pricing
        if (!pricing) return false
        const promptCost = parseFloat(pricing.prompt) || 0
        const completionCost = parseFloat(pricing.completion) || 0
        return promptCost === 0 && completionCost === 0
      })
      .map((model) => ({
        id: model.id,
        name: model.name || model.id,
        context: model.context_length ? formatContextLength(model.context_length) : 'Unknown',
        description: model.description || '',
      }))
      .sort((a, b) => a.name.localeCompare(b.name))

    return NextResponse.json({ models: freeModels })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch models' },
      { status: 500 }
    )
  }
}

function formatContextLength(length: number): string {
  if (length >= 1000000) return `${length / 1000000}M`
  if (length >= 1000) return `${length / 1000}k`
  return String(length)
}
