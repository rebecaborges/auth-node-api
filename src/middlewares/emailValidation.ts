import { Context, Next } from 'koa'
import { isValidEmail } from '../utils/emailValidator'
import { createError } from './errorHandler'
import { AuthRequestBody } from '../types/requests'

export const validateEmail = async (ctx: Context, next: Next) => {
  const body = ctx.request.body as AuthRequestBody
  const { email } = body

  if (!email) {
    throw createError.badRequest('Email is required!')
  }

  try {
    const normalizedEmail = isValidEmail(email)
    ctx.state.normalizedEmail = normalizedEmail
    body.email = normalizedEmail
    await next()
  } catch (error) {
    console.error(error)
    throw createError.badRequest('Invalid email!')
  }
}

export const validateEmailQuery = async (ctx: Context, next: Next) => {
  const { email } = ctx.query

  if (!email || typeof email !== 'string') {
    throw createError.badRequest('Email is required!')
  }

  try {
    const normalizedEmail = isValidEmail(email)
    ctx.state.normalizedEmail = normalizedEmail
    ctx.query.email = normalizedEmail

    await next()
  } catch (error) {
    console.error(error)
    throw createError.badRequest('Invalid email!')
  }
}
