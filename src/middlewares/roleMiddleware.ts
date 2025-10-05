import { Context, Next } from 'koa'
import { createError } from './errorHandler'

export async function requireAdmin(ctx: Context, next: Next) {
  const user = ctx.state.user

  if (!user) {
    throw createError.unauthorized('User not authenticated')
  }

  const customRole = user['custom:role']
  const cognitoGroups = user['cognito:groups'] || []

  const isAdmin = customRole === 'admin' || cognitoGroups.includes('admin')

  if (!isAdmin) {
    throw createError.forbidden(
      'Access denied! Only admins can access this route.'
    )
  }

  await next()
}
