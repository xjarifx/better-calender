import { prisma } from './db'
import type { events, users, Prisma } from '@prisma/client'
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
  const updateData: Prisma.eventsUpdateInput = {}
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

export async function updateUserApiKey(userId: number, apiKey: string | null): Promise<users> {
  return prisma.users.update({
    where: { id: userId },
    data: { apiKey },
  })
}

export async function getUserApiKey(userId: number): Promise<string | null> {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { apiKey: true },
  })
  return user?.apiKey || null
}

export async function updateUserPreferences(
  userId: number,
  data: { timeFormat?: string; firstDayOfWeek?: number }
): Promise<void> {
  const updateData: Prisma.usersUpdateInput = {}
  if (data.timeFormat !== undefined) updateData.timeFormat = data.timeFormat
  if (data.firstDayOfWeek !== undefined) updateData.firstDayOfWeek = data.firstDayOfWeek
  await prisma.users.update({
    where: { id: userId },
    data: updateData,
  })
}

export async function updateUsername(
  userId: number,
  newUsername: string,
  currentPassword: string
): Promise<void> {
  const user = await prisma.users.findUnique({ where: { id: userId } })
  if (!user) throw new Error('User not found')

  const valid = await bcrypt.compare(currentPassword, user.password)
  if (!valid) throw new Error('Invalid password')

  const existing = await prisma.users.findUnique({ where: { username: newUsername } })
  if (existing && existing.id !== userId) throw new Error('Username already exists')

  await prisma.users.update({
    where: { id: userId },
    data: { username: newUsername },
  })
}

export async function updatePassword(
  userId: number,
  currentPassword: string,
  newPassword: string
): Promise<number> {
  const user = await prisma.users.findUnique({ where: { id: userId } })
  if (!user) throw new Error('User not found')

  const valid = await bcrypt.compare(currentPassword, user.password)
  if (!valid) throw new Error('Invalid password')

  const hashedPassword = await bcrypt.hash(newPassword, 10)
  const newTokenVersion = user.tokenVersion + 1

  await prisma.users.update({
    where: { id: userId },
    data: { password: hashedPassword, tokenVersion: newTokenVersion },
  })

  return newTokenVersion
}

export async function getUserPreferences(userId: number) {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { username: true, timeFormat: true, firstDayOfWeek: true, tokenVersion: true },
  })
  return user
}
