'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/lib/auth-context'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import ExtractedEvents from '@/components/ExtractedEvents'
import { Sparkles, ChevronDown, ArrowLeft } from 'lucide-react'
import { InlineLoading } from '@/components/ui/loading'

// Recommended models configuration - easy to update for future models
const RECOMMENDED_MODEL_IDS = ['openai/gpt-oss-120b', 'nvidia/nemotron-3-super']
const HARDCODED_RECOMMENDED_MODELS: FreeModel[] = [
  { id: 'openai/gpt-oss-120b', name: 'OpenAI: gpt-oss-120b', context: '131k' },
  { id: 'nvidia/nemotron-3-super', name: 'NVIDIA: Nemotron 3 Super', context: '128k' },
]

interface FreeModel {
  id: string
  name: string
  context: string
  description?: string
}

interface ExtractedEvent {
  title: string
  startDate: string
  startTime?: string
  endDate?: string
  endTime?: string
  location?: string
  description?: string
}

export default function EventInputPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [text, setText] = useState('')
  const [models, setModels] = useState<FreeModel[]>([])
  const [selectedModel, setSelectedModel] = useState('')
  const [loading, setLoading] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [error, setError] = useState('')
  const [extractedEvents, setExtractedEvents] = useState<ExtractedEvent[]>([])
  const abortControllerRef = useRef<{ controller: AbortController; id: number } | null>(null)
  const requestIdRef = useRef(0)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isLoading) return
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    loadModels()
  }, [isAuthenticated, isLoading, router])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadModels = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/ai/models')
      if (!res.ok) throw new Error('Failed to load models')
      const data = await res.json()
      const apiModels = data.models || []
      const allModels = [...HARDCODED_RECOMMENDED_MODELS, ...apiModels]
      setModels(allModels)
      if (allModels.length > 0) {
        setSelectedModel(allModels[0].id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load models')
    } finally {
      setLoading(false)
    }
  }

  const handleExtract = async () => {
    if (extracting && abortControllerRef.current) {
      abortControllerRef.current.controller.abort()
      setExtracting(false)
      setError('Extraction cancelled')
      return
    }

    if (!text.trim()) {
      setError('Please paste some text to extract events from')
      return
    }
    if (!selectedModel) {
      setError('Please select an AI model')
      return
    }

    const thisRequestId = requestIdRef.current + 1
    requestIdRef.current = thisRequestId

    const controller = new AbortController()
    abortControllerRef.current = { controller, id: thisRequestId }

    setExtracting(true)
    setError('')
    setExtractedEvents([])

    try {
      const res = await fetch('/api/ai/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, model: selectedModel }),
        signal: controller.signal,
      })

      if (abortControllerRef.current?.id !== thisRequestId) return

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Extraction failed')
      }

      const data = await res.json()

      if (abortControllerRef.current?.id !== thisRequestId) return

      if (data.events?.length === 0) {
        setError('No events found in the text. Try adding more details.')
      } else {
        setExtractedEvents(data.events || [])
      }
    } catch (err) {
      if (abortControllerRef.current?.id !== thisRequestId) return

      if (err instanceof DOMException && err.name === 'AbortError') {
        setError('Extraction cancelled')
      } else {
        setError(err instanceof Error ? err.message : 'Failed to extract events')
      }
    } finally {
      if (abortControllerRef.current?.id === thisRequestId) {
        setExtracting(false)
        abortControllerRef.current = null
      }
    }
  }

  const handleClear = () => {
    setText('')
    setExtractedEvents([])
    setError('')
  }

  if (!isAuthenticated) return null

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 px-4 py-3 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => router.push('/calendar')}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Calendar
          </button>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Extract Events
          </h1>
        </div>

        {error && (
          <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">
                Paste Event Notices
              </label>
              <textarea
                className="w-full min-h-[300px] px-3 py-2 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-ring/50 font-mono text-sm"
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Paste your event notices here...&#10;&#10;Example:&#10;Team Meeting&#10;January 15, 2026 at 2:00 PM&#10;Conference Room B&#10;&#10;Birthday Party&#10;Feb 20, 2026&#10;123 Main Street"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
              <div className="flex-1">
                <label className="text-sm font-medium block mb-1.5">
                  AI Model
                </label>
                {loading ? (
                  <InlineLoading text="Loading models..." />
                ) : (
                  <div ref={dropdownRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm text-left flex items-center justify-between"
                    >
                      <span>
                        {models.find(m => m.id === selectedModel)?.name || 'Select a model'}
                      </span>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute z-50 w-full mt-1 bg-background border border-input rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50">
                          Recommended
                        </div>
                        {models
                          .filter(m => RECOMMENDED_MODEL_IDS.includes(m.id))
                          .map(model => (
                            <div
                              key={model.id}
                              onClick={() => { setSelectedModel(model.id); setIsDropdownOpen(false) }}
                              className={`px-3 py-2 text-sm cursor-pointer hover:bg-muted ${selectedModel === model.id ? 'bg-muted/50 font-medium' : ''}`}
                            >
                              {model.name} ({model.context} context)
                            </div>
                          ))
                        }

                        <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50 border-t border-input">
                          All AI Models
                        </div>
                        {models
                          .filter(m => !RECOMMENDED_MODEL_IDS.includes(m.id))
                          .map(model => (
                            <div
                              key={model.id}
                              onClick={() => { setSelectedModel(model.id); setIsDropdownOpen(false) }}
                              className={`px-3 py-2 text-sm cursor-pointer hover:bg-muted ${selectedModel === model.id ? 'bg-muted/50 font-medium' : ''}`}
                            >
                              {model.name} ({model.context} context)
                            </div>
                          ))
                        }
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleExtract}
                  disabled={loading || !selectedModel || (!extracting && !text.trim())}
                  variant={extracting ? 'destructive' : 'default'}
                  className="flex-1 sm:flex-none rounded-lg"
                >
                  {extracting ? 'Cancel' : 'Extract'}
                </Button>
                <Button variant="outline" onClick={handleClear} className="flex-1 sm:flex-none rounded-lg">
                  Clear
                </Button>
              </div>
            </div>
          </div>

          <div>
            {extractedEvents.length > 0 && (
              <ExtractedEvents
                events={extractedEvents}
                onClear={() => setExtractedEvents([])}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
