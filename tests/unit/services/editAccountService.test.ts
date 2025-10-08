// @ts-nocheck
import { jest } from '@jest/globals'
import { updateUserAccount } from '../../../src/services/editAccountService'
import * as userService from '../../../src/services/userService'
import { createError } from '../../../src/middlewares/errorHandler'
import {
  mockUser,
  mockCognitoUser,
  mockAdminCognitoUser,
} from '../../mocks/mockData'

jest.mock('../../../src/services/userService')
jest.mock('../../../src/middlewares/errorHandler')
jest.mock('../../../src/config/cognito', () => ({
  cognito: {
    adminRemoveUserFromGroup: jest.fn().mockReturnThis(),
    adminAddUserToGroup: jest.fn().mockReturnThis(),
    promise: jest.fn(),
  },
  COGNITO_CONFIG: {
    USER_POOL_ID: 'test-pool-id',
  },
}))

const mockUserService = userService as jest.Mocked<typeof userService>
const mockCreateError = createError as jest.Mocked<typeof createError>

describe('EditAccountService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('updateUserAccount', () => {
    it('should throw error when email is missing', async () => {
      const updateData = { email: '', name: 'Updated Name' }
      const cognitoUser = mockCognitoUser

      mockCreateError.badRequest.mockReturnValue(
        new Error('Email is required to identify the user to update') as any
      )

      await expect(updateUserAccount(updateData, cognitoUser)).rejects.toThrow(
        'Email is required to identify the user to update'
      )

      expect(mockCreateError.badRequest).toHaveBeenCalledWith(
        'Email is required to identify the user to update'
      )
    })

    it('should update user as admin with role changes', async () => {
      const updateData = {
        email: 'test@example.com',
        name: 'Updated Name',
        role: 'admin',
      }
      const cognitoUser = mockAdminCognitoUser
      const updatedUser = {
        ...mockUser,
        name: 'Updated Name',
        role: 'admin',
        isOnboarded: true,
      }

      mockUserService.findUserByEmail.mockResolvedValue(mockUser)
      mockUserService.updateUser.mockResolvedValue(updatedUser)

      const { cognito } = require('../../../src/config/cognito')
      cognito.adminAddUserToGroup.mockReturnValue({
        promise: jest.fn().mockResolvedValue({}),
      })

      const result = await updateUserAccount(updateData, cognitoUser)

      expect(mockUserService.findUserByEmail).toHaveBeenCalledWith(
        'test@example.com'
      )
      expect(cognito.adminRemoveUserFromGroup).not.toHaveBeenCalled()
      expect(cognito.adminAddUserToGroup).toHaveBeenCalledWith({
        UserPoolId: 'test-pool-id',
        Username: mockUser.id,
        GroupName: 'admin',
      })
      expect(mockUserService.updateUser).toHaveBeenCalledWith(
        'test@example.com',
        {
          name: 'Updated Name',
          role: 'admin',
          isOnboarded: true,
        }
      )
      expect(result).toEqual({
        message: 'User updated successfully',
        user: updatedUser,
      })
    })

    it('should update user as admin without role changes', async () => {
      const updateData = {
        email: 'test@example.com',
        name: 'Updated Name',
        role: 'user',
      }
      const cognitoUser = mockAdminCognitoUser
      const updatedUser = {
        ...mockUser,
        name: 'Updated Name',
        isOnboarded: true,
      }

      mockUserService.findUserByEmail.mockResolvedValue(mockUser)
      mockUserService.updateUser.mockResolvedValue(updatedUser)

      const { cognito } = require('../../../src/config/cognito')
      cognito.adminRemoveUserFromGroup.mockReturnValue({
        promise: jest.fn().mockResolvedValue({}),
      })
      cognito.adminAddUserToGroup.mockReturnValue({
        promise: jest.fn().mockResolvedValue({}),
      })

      const result = await updateUserAccount(updateData, cognitoUser)

      expect(mockUserService.findUserByEmail).toHaveBeenCalledWith(
        'test@example.com'
      )
      expect(cognito.adminRemoveUserFromGroup).toHaveBeenCalledWith({
        UserPoolId: 'test-pool-id',
        Username: mockUser.id,
        GroupName: 'admin',
      })
      expect(cognito.adminAddUserToGroup).toHaveBeenCalledWith({
        UserPoolId: 'test-pool-id',
        Username: mockUser.id,
        GroupName: 'user',
      })
      expect(mockUserService.updateUser).toHaveBeenCalledWith(
        'test@example.com',
        {
          name: 'Updated Name',
          role: 'user',
          isOnboarded: true,
        }
      )
      expect(result).toEqual({
        message: 'User updated successfully',
        user: updatedUser,
      })
    })

    it('should update user as non-admin without role changes', async () => {
      const updateData = {
        email: 'test@example.com',
        name: 'Updated Name',
      }
      const cognitoUser = mockCognitoUser
      const updatedUser = {
        ...mockUser,
        name: 'Updated Name',
        isOnboarded: true,
      }

      mockUserService.updateUser.mockResolvedValue(updatedUser)

      const { cognito } = require('../../../src/config/cognito')

      const result = await updateUserAccount(updateData, cognitoUser)

      expect(mockUserService.updateUser).toHaveBeenCalledWith(
        'test@example.com',
        {
          name: 'Updated Name',
          isOnboarded: true,
        }
      )
      expect(cognito.adminRemoveUserFromGroup).not.toHaveBeenCalled()
      expect(cognito.adminAddUserToGroup).not.toHaveBeenCalled()
      expect(result).toEqual({
        message: 'User updated successfully',
        user: updatedUser,
      })
    })

    it('should handle updateCognitoGroup error when user not found', async () => {
      const updateData = {
        email: 'nonexistent@example.com',
        name: 'Updated Name',
        role: 'admin',
      }
      const cognitoUser = mockAdminCognitoUser

      mockUserService.findUserByEmail.mockResolvedValue(null)
      mockCreateError.notFound.mockReturnValue(
        new Error('User not found') as any
      )

      await expect(updateUserAccount(updateData, cognitoUser)).rejects.toThrow(
        'User not found'
      )

      expect(mockCreateError.notFound).toHaveBeenCalledWith('User not found')
    })

    it('should handle updateCognitoGroup error with message', async () => {
      const updateData = {
        email: 'test@example.com',
        name: 'Updated Name',
        role: 'user',
      }
      const cognitoUser = mockAdminCognitoUser

      mockUserService.findUserByEmail.mockResolvedValue(mockUser)

      const { cognito } = require('../../../src/config/cognito')
      const cognitoError = new Error('Failed to update group')
      cognito.adminRemoveUserFromGroup.mockReturnValue({
        promise: jest.fn().mockRejectedValue(cognitoError),
      })

      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      await expect(updateUserAccount(updateData, cognitoUser)).rejects.toThrow(
        'Failed to update user role in Cognito: Failed to update group'
      )

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to update user group in Cognito:',
        'Failed to update group'
      )

      consoleSpy.mockRestore()
    })

    it('should handle updateCognitoGroup error with toString', async () => {
      const updateData = {
        email: 'test@example.com',
        name: 'Updated Name',
        role: 'user',
      }
      const cognitoUser = mockAdminCognitoUser

      mockUserService.findUserByEmail.mockResolvedValue(mockUser)

      const { cognito } = require('../../../src/config/cognito')
      const cognitoError = { toString: () => 'String error' }
      cognito.adminRemoveUserFromGroup.mockReturnValue({
        promise: jest.fn().mockRejectedValue(cognitoError),
      })

      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      await expect(updateUserAccount(updateData, cognitoUser)).rejects.toThrow(
        'Failed to update user role in Cognito: String error'
      )

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to update user group in Cognito:',
        'String error'
      )

      consoleSpy.mockRestore()
    })

    it('should handle updateCognitoGroup error without message or toString', async () => {
      const updateData = {
        email: 'test@example.com',
        name: 'Updated Name',
        role: 'user',
      }
      const cognitoUser = mockAdminCognitoUser

      mockUserService.findUserByEmail.mockResolvedValue(mockUser)

      const { cognito } = require('../../../src/config/cognito')
      const cognitoError = {}
      cognito.adminRemoveUserFromGroup.mockReturnValue({
        promise: jest.fn().mockRejectedValue(cognitoError),
      })

      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      await expect(updateUserAccount(updateData, cognitoUser)).rejects.toThrow(
        'Failed to update user role in Cognito: [object Object]'
      )

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to update user group in Cognito:',
        '[object Object]'
      )

      consoleSpy.mockRestore()
    })

    it('should handle admin user with no role specified', async () => {
      const updateData = {
        email: 'test@example.com',
        name: 'Updated Name',
      }
      const cognitoUser = mockAdminCognitoUser
      const updatedUser = {
        ...mockUser,
        name: 'Updated Name',
        isOnboarded: true,
      }

      mockUserService.findUserByEmail.mockResolvedValue(mockUser)
      mockUserService.updateUser.mockResolvedValue(updatedUser)

      const { cognito } = require('../../../src/config/cognito')
      cognito.adminRemoveUserFromGroup.mockReturnValue({
        promise: jest.fn().mockResolvedValue({}),
      })
      cognito.adminAddUserToGroup.mockReturnValue({
        promise: jest.fn().mockResolvedValue({}),
      })

      const result = await updateUserAccount(updateData, cognitoUser)

      expect(mockUserService.updateUser).toHaveBeenCalledWith(
        'test@example.com',
        {
          name: 'Updated Name',
          role: undefined,
          isOnboarded: true,
        }
      )
      expect(result).toEqual({
        message: 'User updated successfully',
        user: updatedUser,
      })
    })
  })
})
