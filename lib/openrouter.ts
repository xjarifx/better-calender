export interface ExtractedEvent {
  title: string
  startDate: string
  startTime?: string
  endDate?: string
  endTime?: string
  location?: string
  description?: string
}

export interface OpenRouterModel {
  id: string
  name: string
  context: string
  description?: string
}

const SYSTEM_PROMPT = `You are an event extraction assistant. Extract events from the provided text and return a JSON array.

For each event, return an object with these fields:
- title: string (required) - the event name
- startDate: string (required) - date in ISO 8601 format (YYYY-MM-DD)
- startTime: string (optional) - full datetime in ISO 8601 format if time is specified
- endDate: string (optional) - date in ISO 8601 format
- endTime: string (optional) - full datetime in ISO 8601 format if time is specified
- location: string (optional) - where the event takes place
- description: string (optional) - additional details about the event

Rules:
1. Return ONLY a valid JSON array, no other text
2. If no events found, return an empty array []
3. Infer the current year (2026) if year is not specified
4. Handle multiple events in the same text
5. If time is provided, include both startDate with date only AND startTime with full datetime
6. All dates should be in ISO 8601 format`

export async function extractEvents(text: string, model: string, userApiKey?: string | null): Promise<ExtractedEvent[]> {
  // Use user's key if provided, otherwise fall back to env variable (default key)
  const apiKey = userApiKey || process.env.OPENROUTER_API_KEY

  if (!apiKey) {
    throw new Error('No API key configured. Please add your OpenRouter API key in Settings.')
  }

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'X-Title': 'Better Calendar',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: text },
      ],
      temperature: 0.3,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => null)
    throw new Error(error?.error?.message || `AI extraction failed: ${response.statusText}`)
  }

  const data = await response.json()
  const content = data.choices?.[0]?.message?.content

  if (!content) {
    throw new Error('No response from AI')
  }

  try {
    const events: ExtractedEvent[] = JSON.parse(content)
    if (!Array.isArray(events)) {
      throw new Error('AI response is not an array')
    }
    return events
  } catch {
    throw new Error('Failed to parse AI response as JSON')
  }
}
