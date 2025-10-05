import { Context } from 'koa'
import { StatusCodes } from 'http-status-codes'
import { listUsers } from '../services/listUsersService'
import { updateUserAccount } from '../services/editAccountService'
import { ListUsers, UpdateUserData } from '../interfaces/requests'
import { findUserByEmail } from '../services/userService'

export async function getMe(ctx: Context) {
  const userToken = ctx.state.user

  const user = await findUserByEmail(userToken.email)
  ctx.status = StatusCodes.OK
  ctx.body = {
    message: 'User information retrieved successfully',
    user: {
      ...user,
      id: userToken.sub,
      username: userToken.username,
    },
  }
}

export async function editAccount(ctx: Context) {
  const body = ctx.request.body as UpdateUserData

  const result = await updateUserAccount(body)
  ctx.status = StatusCodes.OK
  ctx.body = result
}

export async function listUsersController(ctx: Context) {
  const { page, limit } = ctx.header as unknown as ListUsers
  const users = await listUsers({ page, limit })

  ctx.status = StatusCodes.OK
  ctx.body = {
    message: 'Users retrieved successfully',
    users: users,
  }
}
