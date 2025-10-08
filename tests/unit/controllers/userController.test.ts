// @ts-nocheck
import { jest } from '@jest/globals'
import { StatusCodes } from 'http-status-codes'
import {
  healthController,
  getMe,
  editAccount,
  listUsersController,
} from '../../../src/controllers/userController'
import { listUsers } from '../../../src/services/listUsersService'
import { updateUserAccount } from '../../../src/services/editAccountService'
import { findUserById } from '../../../src/services/userService'
import { createError } from '../../../src/middlewares/errorHandler'
import { createMockContext, createMockNext } from '../../mocks/mockContext'
import {
  mockUser,
  mockAdminUser,
  mockCognitoUser,
  mockAdminCognitoUser,
} from '../../mocks/mockData'

jest.mock('../../../src/services/listUsersService')
jest.mock('../../../src/services/editAccountService')
jest.mock('../../../src/services/userService')

describe('UserController', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('healthController', () => {
    it('should return health status', async () => {
      const ctx = createMockContext()
      const originalUptime = process.uptime

      await healthController(ctx)

      expect(ctx.status).toBe(StatusCodes.OK)
      expect(ctx.body).toEqual({
        status: 'ok',
        timestamp: expect.any(String),
        uptime: expect.any(Number),
      })
      expect(new Date(ctx.body.timestamp)).toBeInstanceOf(Date)
      expect(ctx.body.uptime).toBeGreaterThanOrEqual(0)
    })
  })

  describe('getMe', () => {
    it('should return user information successfully', async () => {
      const ctx = createMockContext({
        state: {
          user: mockCognitoUser,
        },
      })

        ; (findUserById as jest.Mock).mockResolvedValue(mockUser)

      await getMe(ctx)

      expect(findUserById).toHaveBeenCalledWith(mockCognitoUser.username)
      expect(ctx.status).toBe(StatusCodes.OK)
      expect(ctx.body).toEqual({
        message: 'User information retrieved successfully',
        user: {
          id: mockCognitoUser.sub,
          username: mockCognitoUser.username,
          email: mockUser.email,
          name: mockUser.name,
          isOnboarded: mockUser.isOnboarded,
          role: mockUser.role,
          createdAt: mockUser.createdAt,
          updatedAt: mockUser.updatedAt,
        },
      })
    })

    it('should throw error when user not found', async () => {
      const ctx = createMockContext({
        state: {
          user: mockCognitoUser,
        },
      })

        ; (findUserById as jest.Mock).mockResolvedValue(null)

      await expect(getMe(ctx)).rejects.toThrow('User not found')
    })

    it('should handle database error', async () => {
      const ctx = createMockContext({
        state: {
          user: mockCognitoUser,
        },
      })

      const error = new Error('Database error')
        ; (findUserById as jest.Mock).mockRejectedValue(error)

      await expect(getMe(ctx)).rejects.toThrow('Database error')
    })
  })

  describe('editAccount', () => {
    it('should update user account successfully', async () => {
      const ctx = createMockContext({
        request: {
          body: {
            email: 'test@example.com',
            name: 'Updated Name',
            role: 'user',
          },
        },
        state: {
          user: mockCognitoUser,
        },
      })

      const updateResult = {
        message: 'User updated successfully',
        user: { ...mockUser, name: 'Updated Name' },
      }

        ; (updateUserAccount as jest.Mock).mockResolvedValue(updateResult)

      await editAccount(ctx)

      expect(updateUserAccount).toHaveBeenCalledWith(
        {
          email: 'test@example.com',
          name: 'Updated Name',
          role: 'user',
        },
        mockCognitoUser
      )
      expect(ctx.status).toBe(StatusCodes.OK)
      expect(ctx.body).toEqual(updateResult)
    })

    it('should handle update error', async () => {
      const ctx = createMockContext({
        request: {
          body: {
            email: 'test@example.com',
            name: 'Updated Name',
            role: 'user',
          },
        },
        state: {
          user: mockCognitoUser,
        },
      })

      const error = new Error('Update failed')
        ; (updateUserAccount as jest.Mock).mockRejectedValue(error)

      await expect(editAccount(ctx)).rejects.toThrow('Update failed')
    })

    it('should handle error without message', async () => {
      const ctx = createMockContext({
        request: {
          body: {
            email: 'test@example.com',
            name: 'Updated Name',
            role: 'user',
          },
        },
        state: {
          user: mockCognitoUser,
        },
      })

      const error = new Error()
        ; (updateUserAccount as jest.Mock).mockRejectedValue(error)

      await expect(editAccount(ctx)).rejects.toThrow(
        'Error updating user information'
      )
    })
  })

  describe('listUsersController', () => {
    it('should list users successfully', async () => {
      const ctx = createMockContext({
        header: {
          page: 1,
          limit: 10,
        },
      })

      const listResult = {
        users: [mockUser, mockAdminUser],
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      }

        ; (listUsers as jest.Mock).mockResolvedValue(listResult)

      await listUsersController(ctx)

      expect(listUsers).toHaveBeenCalledWith({ page: 1, limit: 10 })
      expect(ctx.status).toBe(StatusCodes.OK)
      expect(ctx.body).toEqual({
        message: 'Users retrieved successfully',
        users: listResult,
      })
    })

    it('should handle list users error', async () => {
      const ctx = createMockContext({
        header: {
          page: 1,
          limit: 10,
        },
      })

      const error = new Error('Database error')
        ; (listUsers as jest.Mock).mockRejectedValue(error)

      await expect(listUsersController(ctx)).rejects.toThrow('Database error')
    })

    it('should handle error without message', async () => {
      const ctx = createMockContext({
        header: {
          page: 1,
          limit: 10,
        },
      })

      const error = new Error()
        ; (listUsers as jest.Mock).mockRejectedValue(error)

      await expect(listUsersController(ctx)).rejects.toThrow(
        'Error listing users'
      )
    })

    it('should handle missing pagination parameters', async () => {
      const ctx = createMockContext({
        header: {},
      })

      const listResult = {
        users: [mockUser],
        total: 1,
        page: undefined,
        limit: undefined,
        totalPages: 1,
      }

        ; (listUsers as jest.Mock).mockResolvedValue(listResult)

      await listUsersController(ctx)

      expect(listUsers).toHaveBeenCalledWith({
        page: undefined,
        limit: undefined,
      })
    })
  })
})
