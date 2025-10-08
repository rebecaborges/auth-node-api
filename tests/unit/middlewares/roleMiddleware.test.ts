// @ts-nocheck
import { jest } from '@jest/globals'
import { requireAdmin } from '../../../src/middlewares/roleMiddleware'
import { findUserById } from '../../../src/services/userService'
import { createError } from '../../../src/middlewares/errorHandler'
import { createMockContext, createMockNext } from '../../mocks/mockContext'
import { mockUser, mockAdminUser } from '../../mocks/mockData'
import type { MockError } from '../../types'

jest.mock('../../../src/services/userService')

describe('RoleMiddleware', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('requireAdmin', () => {
    it('should allow admin user to proceed', async () => {
      const ctx = createMockContext({
        state: {
          user: {
            username: 'admin@example.com',
          },
        },
      })
      const next = createMockNext()

      ;(findUserById as jest.Mock).mockResolvedValue(mockAdminUser)

      await requireAdmin(ctx, next)

      expect(findUserById).toHaveBeenCalledWith('admin@example.com')
      expect(ctx.state.dbUser).toEqual(mockAdminUser)
      expect(next).toHaveBeenCalled()
    })

    it('should reject when user is not authenticated', async () => {
      const ctx = createMockContext({
        state: {},
      })
      const next = createMockNext()

      await expect(requireAdmin(ctx, next)).rejects.toThrow(
        'User not authenticated'
      )
      expect(next).not.toHaveBeenCalled()
    })

    it('should reject when user is null', async () => {
      const ctx = createMockContext({
        state: {
          user: null,
        },
      })
      const next = createMockNext()

      await expect(requireAdmin(ctx, next)).rejects.toThrow(
        'User not authenticated'
      )
      expect(next).not.toHaveBeenCalled()
    })

    it('should reject when user is not found in database', async () => {
      const ctx = createMockContext({
        state: {
          user: {
            username: 'nonexistent@example.com',
          },
        },
      })
      const next = createMockNext()

      ;(findUserById as jest.Mock).mockResolvedValue(null)

      await expect(requireAdmin(ctx, next)).rejects.toThrow(
        'User not found in database'
      )
      expect(next).not.toHaveBeenCalled()
    })

    it('should reject when user is not admin', async () => {
      const ctx = createMockContext({
        state: {
          user: {
            username: 'user@example.com',
          },
        },
      })
      const next = createMockNext()

      ;(findUserById as jest.Mock).mockResolvedValue(mockUser)

      await expect(requireAdmin(ctx, next)).rejects.toThrow(
        'Access denied! Only admins can access this route.'
      )
      expect(next).not.toHaveBeenCalled()
    })

    it('should handle database error and re-throw if it has status', async () => {
      const ctx = createMockContext({
        state: {
          user: {
            username: 'admin@example.com',
          },
        },
      })
      const next = createMockNext()

      const error: MockError = new Error('Database error')
      error.status = 500
      ;(findUserById as jest.Mock).mockRejectedValue(error)

      await expect(requireAdmin(ctx, next)).rejects.toThrow('Database error')
      expect(next).not.toHaveBeenCalled()
    })

    it('should handle database error without status', async () => {
      const ctx = createMockContext({
        state: {
          user: {
            username: 'admin@example.com',
          },
        },
      })
      const next = createMockNext()

      const error: MockError = new Error('Database error')
      ;(findUserById as jest.Mock).mockRejectedValue(error)

      await expect(requireAdmin(ctx, next)).rejects.toThrow(
        'Error verifying user permissions'
      )
      expect(next).not.toHaveBeenCalled()
    })

    it('should handle error without message', async () => {
      const ctx = createMockContext({
        state: {
          user: {
            username: 'admin@example.com',
          },
        },
      })
      const next = createMockNext()

      const error: MockError = new Error()
      ;(findUserById as jest.Mock).mockRejectedValue(error)

      await expect(requireAdmin(ctx, next)).rejects.toThrow(
        'Error verifying user permissions'
      )
      expect(next).not.toHaveBeenCalled()
    })

    it('should handle non-Error objects', async () => {
      const ctx = createMockContext({
        state: {
          user: {
            username: 'admin@example.com',
          },
        },
      })
      const next = createMockNext()

      ;(findUserById as jest.Mock).mockRejectedValue('String error')

      await expect(requireAdmin(ctx, next)).rejects.toThrow(
        'Error verifying user permissions'
      )
      expect(next).not.toHaveBeenCalled()
    })
  })
})
