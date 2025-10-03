import { Context } from 'koa'
import { StatusCodes } from 'http-status-codes'
import { DatabaseService } from '../services/databaseService'
import { ListUsers } from '../types/requests'

export const getMe = async (ctx: Context) => {
  ctx.body = { message: 'Hello World' }
}

export const editAccount = async (ctx: Context) => {
  ctx.body = { message: 'Hello World' }
}

export const listUsers = async (ctx: Context) => {
  const { page, limit } = ctx.header as unknown as ListUsers
  const users = await DatabaseService.listUsers({ page, limit })

  ctx.status = StatusCodes.OK
  ctx.body = {
    message: 'Users retrieved successfully',
    users: users,
  }
}
