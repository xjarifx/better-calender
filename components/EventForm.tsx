'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface EventFormProps {
  mode: 'create' | 'edit'
  eventId?: string
  initialData?: {
    title: string
    startDate: string
    startTime?: string
    endDate?: string
    endTime?: string
    location?: string
    description?: string
  }
}

export default function EventForm({ mode, eventId, initialData }: EventFormProps) {
  const router = useRouter()
  const [title, setTitle] = useState(initialData?.title || '')
  const [startDate, setStartDate] = useState(initialData?.startDate || '')
  const [startTime, setStartTime] = useState(initialData?.startTime || '')
  const [endDate, setEndDate] = useState(initialData?.endDate || '')
  const [endTime, setEndTime] = useState(initialData?.endTime || '')
  const [location, setLocation] = useState(initialData?.location || '')
  const [description, setDescription] = useState(initialData?.description || '')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!title || !startDate) {
      setError('Title and start date are required')
      return
    }

    setLoading(true)

    const eventData: Record<string, unknown> = {
      title,
      startDate: new Date(startDate).toISOString(),
    }

    if (startTime) {
      eventData.startTime = new Date(startTime).toISOString()
    }
    if (endDate) {
      eventData.endDate = new Date(endDate).toISOString()
    }
    if (endTime) {
      eventData.endTime = new Date(endTime).toISOString()
    }
    if (location) eventData.location = location
    if (description) eventData.description = description

    try {
      if (mode === 'edit' && eventId) {
        await api.updateEvent(eventId, eventData)
      } else {
        await api.createEvent(eventData)
      }
      router.push('/calendar')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save event')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      {error && (
        <div className="bg-destructive/10 text-destructive p-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="text-sm font-medium block mb-1.5">Title *</label>
        <Input
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          className="rounded-lg"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium block mb-1.5">Start Date *</label>
          <Input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            required
            className="rounded-lg"
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1.5">Start Time</label>
          <Input
            type="time"
            value={startTime}
            onChange={e => setStartTime(e.target.value)}
            className="rounded-lg"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium block mb-1.5">End Date</label>
          <Input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="rounded-lg"
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1.5">End Time</label>
          <Input
            type="time"
            value={endTime}
            onChange={e => setEndTime(e.target.value)}
            className="rounded-lg"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium block mb-1.5">Location</label>
        <Input
          value={location}
          onChange={e => setLocation(e.target.value)}
          className="rounded-lg"
          placeholder="Add location"
        />
      </div>

      <div>
        <label className="text-sm font-medium block mb-1.5">Description</label>
        <textarea
          className="w-full min-h-[100px] px-3 py-2 rounded-lg bg-background border border-border focus:outline-none focus:ring-2 focus:ring-ring/50"
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Add description"
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={loading} className="flex-1 rounded-lg">
          {loading ? 'Saving...' : mode === 'edit' ? 'Update' : 'Create'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/calendar')}
          className="flex-1 rounded-lg"
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
