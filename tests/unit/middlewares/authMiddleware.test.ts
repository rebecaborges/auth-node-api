// @ts-nocheck
import { jest } from '@jest/globals'
import jwt from 'jsonwebtoken'
import { verifyAccessToken } from '../../../src/middlewares/authMiddleware'
import { createMockContext, createMockNext } from '../../mocks/mockContext'
import { mockCognitoUser } from '../../mocks/mockData'

jest.mock('jsonwebtoken')
jest.mock('jwks-rsa')

describe('AuthMiddleware', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('verifyAccessToken', () => {
    it('should verify valid access token successfully', async () => {
      const ctx = createMockContext({
        headers: {
          authorization: 'Bearer valid-token',
        },
      })
      const next = createMockNext()

      ;(jwt.verify as jest.Mock).mockImplementation(
        (token, getKey, options, callback) => {
          callback(null, mockCognitoUser)
        }
      )

      await verifyAccessToken(ctx, next)

      expect(jwt.verify).toHaveBeenCalledWith(
        'valid-token',
        expect.any(Function),
        {
          algorithms: ['RS256'],
          issuer: 'https://cognito-idp.us-east-1.amazonaws.com/test-pool-id',
        },
        expect.any(Function)
      )
      expect(ctx.state.user).toEqual(mockCognitoUser)
      expect(next).toHaveBeenCalled()
    })

    it('should return 401 when no authorization header', async () => {
      const ctx = createMockContext({
        headers: {},
      })
      const next = createMockNext()

      await expect(verifyAccessToken(ctx, next)).rejects.toThrow(
        'Token not provided'
      )

      expect(ctx.status).toBe(401)
      expect(ctx.body).toEqual({ message: 'Token not provided' })
      expect(next).not.toHaveBeenCalled()
    })

    it('should return 401 when authorization header is malformed', async () => {
      const ctx = createMockContext({
        headers: {
          authorization: 'InvalidFormat',
        },
      })
      const next = createMockNext()

      jest
        .mocked(jwt.verify)
        .mockImplementation((token, getKey, options, callback) => {
          if (callback) {
            callback(new Error('jwt malformed'), null)
          }
          return undefined as any
        })

      await verifyAccessToken(ctx, next)

      expect(ctx.status).toBe(401)
      expect(ctx.body).toEqual({
        message: 'Invalid token',
        error: 'jwt malformed',
      })
      expect(next).not.toHaveBeenCalled()
    })

    it('should return 401 when token is invalid', async () => {
      const ctx = createMockContext({
        headers: {
          authorization: 'Bearer invalid-token',
        },
      })
      const next = createMockNext()

      const error = new Error('Invalid token')
      ;(jwt.verify as jest.Mock).mockImplementation(
        (token, getKey, options, callback) => {
          callback(error, null)
        }
      )

      await verifyAccessToken(ctx, next)

      expect(ctx.status).toBe(401)
      expect(ctx.body).toEqual({
        message: 'Invalid token',
        error: 'Invalid token',
      })
      expect(next).not.toHaveBeenCalled()
    })

    it('should return 401 when token is not an access token', async () => {
      const ctx = createMockContext({
        headers: {
          authorization: 'Bearer id-token',
        },
      })
      const next = createMockNext()

      ;(jwt.verify as jest.Mock).mockImplementation(
        (token, getKey, options, callback) => {
          callback(null, { ...mockCognitoUser, token_use: 'id' })
        }
      )

      await verifyAccessToken(ctx, next)

      expect(ctx.status).toBe(401)
      expect(ctx.body).toEqual({
        message: 'Invalid token',
        error: 'Token is not an access token',
      })
      expect(next).not.toHaveBeenCalled()
    })

    it('should handle JWT verification promise rejection', async () => {
      const ctx = createMockContext({
        headers: {
          authorization: 'Bearer valid-token',
        },
      })
      const next = createMockNext()

      ;(jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('JWT verification failed')
      })

      await verifyAccessToken(ctx, next)

      expect(ctx.status).toBe(401)
      expect(ctx.body).toEqual({
        message: 'Invalid token',
        error: 'JWT verification failed',
      })
      expect(next).not.toHaveBeenCalled()
    })

    it('should handle token without token_use field', async () => {
      const ctx = createMockContext({
        headers: {
          authorization: 'Bearer valid-token',
        },
      })
      const next = createMockNext()

      ;(jwt.verify as jest.Mock).mockImplementation(
        (token, getKey, options, callback) => {
          callback(null, { sub: 'test-id', username: 'test@example.com' })
        }
      )

      await verifyAccessToken(ctx, next)

      expect(ctx.status).toBe(401)
      expect(ctx.body).toEqual({
        message: 'Invalid token',
        error: 'Token is not an access token',
      })
      expect(next).not.toHaveBeenCalled()
    })
  })
})
