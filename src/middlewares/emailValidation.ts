import { Context, Next } from 'koa'
import { createError } from './errorHandler'
import { SignInOrRegisterBody } from '../interfaces/requests'

export function isValidEmail(email: string): string {
  if (!email || typeof email !== 'string') throw new Error('Email is required!')

  const trimmedEmail = email.trim().toLowerCase()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailRegex.test(trimmedEmail)) {
    throw new Error(`Invalid email format: ${email}`)
  }
  return trimmedEmail
}

export const validateEmail = async (ctx: Context, next: Next) => {
  const body = ctx.request.body as SignInOrRegisterBody
  const { email } = body

  if (!email) {
    throw createError.badRequest('Email is required!')
  }

  try {
    const normalizedEmail = isValidEmail(email)
    ctx.state.normalizedEmail = normalizedEmail
    body.email = normalizedEmail
    await next()
  } catch (error: any) {
    if (error.status) {
      throw error
    }
    throw createError.badRequest(error.message || 'Invalid email!')
  }
}
