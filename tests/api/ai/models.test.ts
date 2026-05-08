import { GET } from '@/app/api/ai/models/route'
import { jest, describe, it, expect, beforeEach } from '@jest/globals'

const originalEnv = process.env.OPENROUTER_API_KEY
const originalFetch = global.fetch

describe('GET /api/ai/models', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.OPENROUTER_API_KEY = 'sk-or-v1-test-key'
  })

  afterAll(() => {
    process.env.OPENROUTER_API_KEY = originalEnv
    global.fetch = originalFetch
  })

  it('should return 500 if OPENROUTER_API_KEY is not configured', async () => {
    delete process.env.OPENROUTER_API_KEY

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('OPENROUTER_API_KEY is not configured')
  })

  it('should return 500 on fetch failure', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'))

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.error).toBe('Network error')
  })

  it('should return sorted free models on success', async () => {
    const mockResponse = {
      ok: true,
      json: () => Promise.resolve({
        data: [
          { id: 'model-b', name: 'Model B', pricing: { prompt: '0', completion: '0' }, context_length: 8000 },
          { id: 'model-a', name: 'Model A', pricing: { prompt: '0', completion: '0' }, context_length: 128000 },
          { id: 'paid-model', name: 'Paid Model', pricing: { prompt: '0.01', completion: '0.02' }, context_length: 16000 },
        ],
      }),
    }
    global.fetch = jest.fn().mockResolvedValue(mockResponse)

    const response = await GET()
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.models).toHaveLength(2)
    expect(data.models[0].name).toBe('Model A')
    expect(data.models[1].name).toBe('Model B')
    expect(data.models[0].context).toBe('128k')
    expect(data.models[1].context).toBe('8k')
  })
})
