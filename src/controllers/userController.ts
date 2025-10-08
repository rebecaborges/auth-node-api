import { Context } from 'koa'
import { StatusCodes } from 'http-status-codes'
import { listUsers } from '../services/listUsersService'
import { updateUserAccount } from '../services/editAccountService'
import { ListUsers, UpdateUserData } from '../interfaces/requests'
import { findUserById } from '../services/userService'
import { createError } from '../middlewares/errorHandler'

export async function healthController(ctx: Context) {
  ctx.status = StatusCodes.OK
  ctx.body = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  }
}

export async function getMe(ctx: Context) {
  const userToken = ctx.state.user
  const user = await findUserById(userToken.username)

  if (!user) {
    throw createError.notFound('User not found')
  }

  ctx.status = StatusCodes.OK
  ctx.body = {
    message: 'User information retrieved successfully',
    user: {
      id: userToken.sub,
      username: userToken.username,
      email: user.email,
      name: user.name,
      isOnboarded: user.isOnboarded,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    },
  }
}

export async function editAccount(ctx: Context) {
  try {
    const body = ctx.request.body as UpdateUserData
    const cognitoUser = ctx.state.user
    const result = await updateUserAccount(body, cognitoUser)

    ctx.status = StatusCodes.OK
    ctx.body = result
  } catch (error: any) {
    throw createError.internalError(error.message || 'Error updating user information')
  }
}


export async function listUsersController(ctx: Context) {
  try {
    const { page, limit } = ctx.header as unknown as ListUsers
    const users = await listUsers({ page, limit })

    ctx.status = StatusCodes.OK
    ctx.body = {
      message: 'Users retrieved successfully',
      users: users,
    }
  } catch (error: any) {
    throw createError.internalError(error.message || 'Error listing users')
  }
}
