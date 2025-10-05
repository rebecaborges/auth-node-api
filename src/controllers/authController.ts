import { Context } from 'koa'
import { signInOrRegisterService, confirmUser } from '../services/authService'
import { createError } from '../middlewares/errorHandler'
import { SignInOrRegisterBody } from '../interfaces/requests'

export async function signInOrRegister(ctx: Context) {
  try {
    const tokens = await signInOrRegisterService(
      ctx.request.body as SignInOrRegisterBody
    )
    ctx.body = tokens
  } catch (error: any) {
    console.error('Error signing in or registering user:', error)
    throw createError.internalError(error.message || 'Error signing in or registering user')
  }
}

export async function confirmEmail(ctx: Context) {
  try {
    const { email, code } = ctx.request.body as { email: string, code: string }
    
    const result = await confirmUser(email, code)
    ctx.body = result
  } catch (error: any) {
    console.error('Error confirming user email:', error)
    throw createError.badRequest(error.message || 'Error confirming user email')
  }
}
