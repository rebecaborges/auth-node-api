import { Context } from 'koa'

export const getMe = async (ctx: Context) => {
  ctx.body = { message: 'Hello World' }
}

export const editAccount = async (ctx: Context) => {
  ctx.body = { message: 'Hello World' }
}

export const listUsers = async (ctx: Context) => {
  ctx.body = { message: 'Hello World' }
}
