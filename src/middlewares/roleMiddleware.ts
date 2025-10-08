import { Context, Next } from 'koa'
import { createError } from './errorHandler'
import { findUserById } from '../services/userService'

export async function requireAdmin(ctx: Context, next: Next) {
  const user = ctx.state.user

  if (!user) {
    throw createError.unauthorized('User not authenticated')
  }

  try {
    const dbUser = await findUserById(user.username)

    if (!dbUser) {
      throw createError.forbidden('User not found in database')
    }

    if (dbUser.role !== 'admin') {
      throw createError.forbidden(
        'Access denied! Only admins can access this route.'
      )
    }

    ctx.state.dbUser = dbUser
    await next()
  } catch (error: any) {
    if (error.status) {
      throw error
    }
    throw createError.internalError('Error verifying user permissions')
  }
}
