import { Context } from 'koa'
import { StatusCodes } from 'http-status-codes'
import { DatabaseService } from '../services/databaseService'
import { AuthRequestBody } from '../types/requests'
import { createError } from '../middlewares/errorHandler'

export const signInOrRegister = async (ctx: Context) => {
  try {
    const { email, name } = ctx.request.body as AuthRequestBody
    const existingUser = await DatabaseService.findUserByEmail(email)

    if (!existingUser) {
      await DatabaseService.createUser(email, name)
      ctx.status = StatusCodes.CREATED
      ctx.body = {
        message: 'User created successfully',
      }
      return
    }

    ctx.status = StatusCodes.OK
    ctx.body = {
      message: 'User found, logged in successfully',
    }
  } catch (error) {
    console.error(error)
    throw createError.internalError('Error signing in or registering user!')
  }
}
