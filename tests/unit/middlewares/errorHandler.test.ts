import { jest } from '@jest/globals'
import { StatusCodes, ReasonPhrases } from 'http-status-codes'
import {
  errorHandler,
  createError,
  AppError,
} from '../../../src/middlewares/errorHandler'
import { createMockContext, createMockNext } from '../../mocks/mockContext'

describe('ErrorHandler', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('AppError', () => {
    it('should create AppError with default status', () => {
      const error = new AppError('Test error')

      expect(error.message).toBe('Test error')
      expect(error.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR)
      expect(error instanceof Error).toBe(true)
    })

    it('should create AppError with custom status', () => {
      const error = new AppError('Test error', StatusCodes.BAD_REQUEST)

      expect(error.message).toBe('Test error')
      expect(error.status).toBe(StatusCodes.BAD_REQUEST)
    })
  })

  describe('errorHandler', () => {
    it('should pass through when no error occurs', async () => {
      const ctx = createMockContext()
      const next = createMockNext()

      await errorHandler(ctx, next)

      expect(next).toHaveBeenCalled()
      expect(ctx.status).toBe(200)
    })

    it('should handle AppError', async () => {
      const ctx = createMockContext()
      const next = jest
        .fn()
        .mockRejectedValue(
          new AppError('Custom error', StatusCodes.BAD_REQUEST)
        )

      await errorHandler(ctx, next)

      expect(ctx.status).toBe(StatusCodes.BAD_REQUEST)
      expect(ctx.body).toEqual({
        error: 'Custom error',
      })
    })

    it('should handle generic error', async () => {
      const ctx = createMockContext()
      const next = jest.fn().mockRejectedValue(new Error('Generic error'))

      await errorHandler(ctx, next)

      expect(ctx.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR)
      expect(ctx.body).toEqual({
        error: ReasonPhrases.INTERNAL_SERVER_ERROR,
      })
    })

    it('should handle error without message', async () => {
      const ctx = createMockContext()
      const next = jest.fn().mockRejectedValue(new Error())

      await errorHandler(ctx, next)

      expect(ctx.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR)
      expect(ctx.body).toEqual({
        error: ReasonPhrases.INTERNAL_SERVER_ERROR,
      })
    })

    it('should handle non-Error objects', async () => {
      const ctx = createMockContext()
      const next = jest.fn().mockRejectedValue('String error')

      await errorHandler(ctx, next)

      expect(ctx.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR)
      expect(ctx.body).toEqual({
        error: ReasonPhrases.INTERNAL_SERVER_ERROR,
      })
    })
  })

  describe('createError', () => {
    it('should create badRequest error with default message', () => {
      const error = createError.badRequest()

      expect(error.message).toBe(ReasonPhrases.BAD_REQUEST)
      expect(error.status).toBe(StatusCodes.BAD_REQUEST)
    })

    it('should create badRequest error with custom message', () => {
      const error = createError.badRequest('Custom bad request')

      expect(error.message).toBe('Custom bad request')
      expect(error.status).toBe(StatusCodes.BAD_REQUEST)
    })

    it('should create notFound error with default message', () => {
      const error = createError.notFound()

      expect(error.message).toBe(ReasonPhrases.NOT_FOUND)
      expect(error.status).toBe(StatusCodes.NOT_FOUND)
    })

    it('should create notFound error with custom message', () => {
      const error = createError.notFound('Custom not found')

      expect(error.message).toBe('Custom not found')
      expect(error.status).toBe(StatusCodes.NOT_FOUND)
    })

    it('should create unauthorized error with default message', () => {
      const error = createError.unauthorized()

      expect(error.message).toBe(ReasonPhrases.UNAUTHORIZED)
      expect(error.status).toBe(StatusCodes.UNAUTHORIZED)
    })

    it('should create unauthorized error with custom message', () => {
      const error = createError.unauthorized('Custom unauthorized')

      expect(error.message).toBe('Custom unauthorized')
      expect(error.status).toBe(StatusCodes.UNAUTHORIZED)
    })

    it('should create forbidden error with default message', () => {
      const error = createError.forbidden()

      expect(error.message).toBe(ReasonPhrases.FORBIDDEN)
      expect(error.status).toBe(StatusCodes.FORBIDDEN)
    })

    it('should create forbidden error with custom message', () => {
      const error = createError.forbidden('Custom forbidden')

      expect(error.message).toBe('Custom forbidden')
      expect(error.status).toBe(StatusCodes.FORBIDDEN)
    })

    it('should create internalError error with default message', () => {
      const error = createError.internalError()

      expect(error.message).toBe(ReasonPhrases.INTERNAL_SERVER_ERROR)
      expect(error.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR)
    })

    it('should create internalError error with custom message', () => {
      const error = createError.internalError('Custom internal error')

      expect(error.message).toBe('Custom internal error')
      expect(error.status).toBe(StatusCodes.INTERNAL_SERVER_ERROR)
    })
  })
})
