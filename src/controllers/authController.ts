import { Context } from 'koa'
import { signInOrRegisterService } from '../services/authService'
import { createError } from '../middlewares/errorHandler'
import { SignInOrRegisterBody } from '../interfaces/requests'

export async function signInOrRegister(ctx: Context) {
  try {
    const tokens = await signInOrRegisterService(
      ctx.request.body as SignInOrRegisterBody
    )
    ctx.body = tokens
  } catch (error) {
    console.error('Error signing in or registering user:', error)
    throw createError.internalError('Error signing in or registering user')
  }
}
