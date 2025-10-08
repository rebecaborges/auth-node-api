import { jest } from '@jest/globals'
import {
  createUser,
  findUserByEmail,
  findUserById,
  updateUser,
} from '../../../src/services/userService'
import { createError } from '../../../src/middlewares/errorHandler'
import { mockUser, mockAdminUser, mockRepository } from '../../mocks/mockData'

jest.mock('../../../src/middlewares/errorHandler')
jest.mock('../../../src/config/data-source', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}))

const mockCreateError = createError as jest.Mocked<typeof createError>
const mockAppDataSource =
  require('../../../src/config/data-source').AppDataSource

describe('UserService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockAppDataSource.getRepository.mockReturnValue(mockRepository)
  })

  describe('createUser', () => {
    it('should successfully create a user', async () => {
      const cognitoId = 'test-cognito-id'
      const email = 'test@example.com'
      const role = 'user'
      const name = 'Test User'

      mockRepository.create.mockReturnValue(mockUser)
      mockRepository.save.mockResolvedValue(mockUser)

      const result = await createUser(cognitoId, email, role, name)

      expect(mockAppDataSource.getRepository).toHaveBeenCalled()
      expect(mockRepository.create).toHaveBeenCalledWith({
        id: cognitoId,
        email,
        name,
        role,
        isOnboarded: false,
      })
      expect(mockRepository.save).toHaveBeenCalledWith(mockUser)
      expect(result).toEqual(mockUser)
    })

    it('should create user without name when name is not provided', async () => {
      const cognitoId = 'test-cognito-id'
      const email = 'test@example.com'
      const role = 'user'

      const userWithoutName = { ...mockUser, name: undefined }
      mockRepository.create.mockReturnValue(userWithoutName)
      mockRepository.save.mockResolvedValue(userWithoutName)

      const result = await createUser(cognitoId, email, role)

      expect(mockRepository.create).toHaveBeenCalledWith({
        id: cognitoId,
        email,
        name: undefined,
        role,
        isOnboarded: false,
      })
      expect(result).toEqual(userWithoutName)
    })

    it('should handle error and throw internal error', async () => {
      const cognitoId = 'test-cognito-id'
      const email = 'test@example.com'
      const role = 'user'
      const name = 'Test User'

      const error = new Error('Database error')
      mockRepository.save.mockRejectedValue(error)
      mockCreateError.internalError.mockReturnValue(
        new Error('Error creating user or logging in!') as any
      )

      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      await expect(createUser(cognitoId, email, role, name)).rejects.toThrow(
        'Error creating user or logging in!'
      )

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error creating user or logging in:',
        error
      )
      expect(mockCreateError.internalError).toHaveBeenCalledWith(
        'Error creating user or logging in!'
      )

      consoleSpy.mockRestore()
    })
  })

  describe('findUserByEmail', () => {
    it('should successfully find user by email', async () => {
      const email = 'test@example.com'

      mockRepository.findOne.mockResolvedValue(mockUser)

      const result = await findUserByEmail(email)

      expect(mockAppDataSource.getRepository).toHaveBeenCalled()
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email },
      })
      expect(result).toEqual(mockUser)
    })

    it('should return null when user is not found', async () => {
      const email = 'nonexistent@example.com'

      mockRepository.findOne.mockResolvedValue(null)

      const result = await findUserByEmail(email)

      expect(result).toBeNull()
    })

    it('should handle error and throw internal error', async () => {
      const email = 'test@example.com'

      const error = new Error('Database error')
      mockRepository.findOne.mockRejectedValue(error)
      mockCreateError.internalError.mockReturnValue(
        new Error('User not found!') as any
      )

      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      await expect(findUserByEmail(email)).rejects.toThrow('User not found!')

      expect(consoleSpy).toHaveBeenCalledWith('Error finding user:', error)
      expect(mockCreateError.internalError).toHaveBeenCalledWith(
        'User not found!'
      )

      consoleSpy.mockRestore()
    })
  })

  describe('findUserById', () => {
    it('should successfully find user by id', async () => {
      const id = 'test-user-id'

      mockRepository.findOne.mockResolvedValue(mockUser)

      const result = await findUserById(id)

      expect(mockAppDataSource.getRepository).toHaveBeenCalled()
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id },
      })
      expect(result).toEqual(mockUser)
    })

    it('should return null when user is not found', async () => {
      const id = 'nonexistent-id'

      mockRepository.findOne.mockResolvedValue(null)

      const result = await findUserById(id)

      expect(result).toBeNull()
    })

    it('should handle error and throw internal error', async () => {
      const id = 'test-user-id'

      const error = new Error('Database error')
      mockRepository.findOne.mockRejectedValue(error)
      mockCreateError.internalError.mockReturnValue(
        new Error('User not found!') as any
      )

      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      await expect(findUserById(id)).rejects.toThrow('User not found!')

      expect(consoleSpy).toHaveBeenCalledWith('Error finding user:', error)
      expect(mockCreateError.internalError).toHaveBeenCalledWith(
        'User not found!'
      )

      consoleSpy.mockRestore()
    })
  })

  describe('updateUser', () => {
    it('should successfully update user', async () => {
      const email = 'test@example.com'
      const updates = { name: 'Updated Name', isOnboarded: true }

      const updatedUser = { ...mockUser, ...updates }
      mockRepository.save.mockResolvedValue(updatedUser)
      mockRepository.findOne.mockResolvedValue(mockUser)

      const result = await updateUser(email, updates)

      expect(mockAppDataSource.getRepository).toHaveBeenCalled()
      expect(mockRepository.save).toHaveBeenCalledWith(updatedUser)
      expect(result).toEqual(updatedUser)
    })

    it('should throw not found error when user does not exist', async () => {
      const email = 'nonexistent@example.com'
      const updates = { name: 'Updated Name' }

      mockRepository.findOne.mockResolvedValue(null)
      mockCreateError.notFound.mockReturnValue(
        new Error('User not found') as any
      )

      await expect(updateUser(email, updates)).rejects.toThrow('User not found')
      expect(mockCreateError.notFound).toHaveBeenCalledWith('User not found')
    })

    it('should handle error and throw internal error', async () => {
      const email = 'test@example.com'
      const updates = { name: 'Updated Name' }

      mockRepository.findOne.mockResolvedValue(mockUser)
      const error = new Error('Database error')
      mockRepository.save.mockRejectedValue(error)
      mockCreateError.internalError.mockReturnValue(
        new Error('Error updating user!') as any
      )

      await expect(updateUser(email, updates)).rejects.toThrow(
        'Error updating user!'
      )

      expect(mockCreateError.internalError).toHaveBeenCalledWith(
        'Error updating user!'
      )
    })

    it('should handle error without specific error and throw internal error', async () => {
      const email = 'test@example.com'
      const updates = { name: 'Updated Name' }

      mockRepository.findOne.mockResolvedValue(mockUser)
      mockRepository.save.mockRejectedValue('Some error')
      mockCreateError.internalError.mockReturnValue(
        new Error('Error updating user!') as any
      )

      await expect(updateUser(email, updates)).rejects.toThrow(
        'Error updating user!'
      )

      expect(mockCreateError.internalError).toHaveBeenCalledWith(
        'Error updating user!'
      )
    })
  })
})
