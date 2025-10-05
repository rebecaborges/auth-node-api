import { Context } from 'koa'
import { StatusCodes, ReasonPhrases } from 'http-status-codes'
import { ApiError } from '../interfaces/error'

export class AppError extends Error implements ApiError {
  public status: number

  constructor(
    message: string,
    status: number = StatusCodes.INTERNAL_SERVER_ERROR
  ) {
    super(message)
    this.status = status
  }
}

export const errorHandler = async (
  ctx: Context,
  next: () => Promise<Error>
) => {
  try {
    await next()
  } catch (err: any) {
    if (err instanceof AppError) {
      ctx.status = err.status
      ctx.body = {
        error: err.message,
      }
    } else {
      ctx.status = StatusCodes.INTERNAL_SERVER_ERROR
      ctx.body = {
        error: ReasonPhrases.INTERNAL_SERVER_ERROR,
      }
    }
  }
}

export const createError = {
  badRequest: (message: string = ReasonPhrases.BAD_REQUEST) =>
    new AppError(message, StatusCodes.BAD_REQUEST),
  notFound: (message: string = ReasonPhrases.NOT_FOUND) =>
    new AppError(message, StatusCodes.NOT_FOUND),
  unauthorized: (message: string = ReasonPhrases.UNAUTHORIZED) =>
    new AppError(message, StatusCodes.UNAUTHORIZED),
  forbidden: (message: string = ReasonPhrases.FORBIDDEN) =>
    new AppError(message, StatusCodes.FORBIDDEN),
  internalError: (message: string = ReasonPhrases.INTERNAL_SERVER_ERROR) =>
    new AppError(message, StatusCodes.INTERNAL_SERVER_ERROR),
}
