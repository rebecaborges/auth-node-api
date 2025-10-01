import { Context } from 'koa'

export const signInOrRegister = async (ctx: Context) => {
  ctx.body = { message: 'Hello World' }
}
