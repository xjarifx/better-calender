import { prisma } from './db'
import type { events, users } from '@prisma/client'
import bcrypt from 'bcrypt'

export async function createUser(username: string, password: string): Promise<users> {
  const hashedPassword = await bcrypt.hash(password, 10)
  return prisma.users.create({
    data: {
      username,
      password: hashedPassword,
    },
  })
}

export async function getUserByUsername(username: string): Promise<users | null> {
  return prisma.users.findUnique({
    where: { username },
  })
}

export async function getUserById(id: number): Promise<users | null> {
  return prisma.users.findUnique({
    where: { id },
  })
}

export async function createEvent(data: {
  userId: number
  title: string
  startDate: Date
  startTime?: Date | null
  endDate?: Date | null
  endTime?: Date | null
  location?: string
  description?: string
}): Promise<events> {
  return prisma.events.create({
    data: {
      user_id: data.userId,
      title: data.title,
      start_date: data.startDate,
      start_time: data.startTime,
      end_date: data.endDate,
      end_time: data.endTime,
      location: data.location,
      description: data.description,
    },
  })
}

export async function getEventsByUserId(userId: number): Promise<events[]> {
  return prisma.events.findMany({
    where: { user_id: userId },
    orderBy: { start_date: 'asc' },
  })
}

export async function getEventById(id: number, userId: number): Promise<events | null> {
  return prisma.events.findFirst({
    where: { id, user_id: userId },
  })
}

export async function updateEvent(
  id: number,
  userId: number,
  data: Partial<{
    title: string
    startDate: Date
    startTime: Date | null
    endDate: Date | null
    endTime: Date | null
    location: string
    description: string
  }>
): Promise<events> {
  const updateData: any = {}
  if (data.title !== undefined) updateData.title = data.title
  if (data.startDate !== undefined) updateData.start_date = data.startDate
  if (data.startTime !== undefined) updateData.start_time = data.startTime
  if (data.endDate !== undefined) updateData.end_date = data.endDate
  if (data.endTime !== undefined) updateData.end_time = data.endTime
  if (data.location !== undefined) updateData.location = data.location
  if (data.description !== undefined) updateData.description = data.description

  return prisma.events.update({
    where: { id, user_id: userId },
    data: updateData,
  })
}

export async function deleteEvent(id: number, userId: number): Promise<events> {
  return prisma.events.delete({
    where: { id, user_id: userId },
  })
}
