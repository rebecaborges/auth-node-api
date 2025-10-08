// @ts-nocheck
import { jest } from '@jest/globals'
import { listUsers } from '../../../src/services/listUsersService'
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

describe('ListUsersService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockAppDataSource.getRepository.mockReturnValue(mockRepository)
  })

  describe('listUsers', () => {
    it('should successfully list users with pagination', async () => {
      const params = { page: 1, limit: 10 }
      const mockUsers = [mockUser, mockAdminUser]
      const mockFindAndCountResult = [mockUsers, 2]

      mockRepository.findAndCount.mockResolvedValue(mockFindAndCountResult)

      const result = await listUsers(params)

      expect(mockAppDataSource.getRepository).toHaveBeenCalled()
      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
      })
      expect(result).toEqual({
        users: mockUsers,
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      })
    })

    it('should handle second page pagination', async () => {
      const params = { page: 2, limit: 5 }
      const mockUsers = [mockAdminUser]
      const mockFindAndCountResult = [mockUsers, 8]

      mockRepository.findAndCount.mockResolvedValue(mockFindAndCountResult)

      const result = await listUsers(params)

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        skip: 5,
        take: 5,
      })
      expect(result).toEqual({
        users: mockUsers,
        total: 8,
        page: 2,
        limit: 5,
        totalPages: 2,
      })
    })

    it('should handle empty users list', async () => {
      const params = { page: 1, limit: 10 }
      const mockFindAndCountResult = [[], 0]

      mockRepository.findAndCount.mockResolvedValue(mockFindAndCountResult)

      const result = await listUsers(params)

      expect(result).toEqual({
        users: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      })
    })

    it('should calculate totalPages correctly for large datasets', async () => {
      const params = { page: 1, limit: 10 }
      const mockUsers = new Array(10).fill(mockUser)
      const mockFindAndCountResult = [mockUsers, 47]

      mockRepository.findAndCount.mockResolvedValue(mockFindAndCountResult)

      const result = await listUsers(params)

      expect(result).toEqual({
        users: mockUsers,
        total: 47,
        page: 1,
        limit: 10,
        totalPages: 5,
      })
    })

    it('should handle large page numbers', async () => {
      const params = { page: 10, limit: 5 }
      const mockUsers = [mockUser]
      const mockFindAndCountResult = [mockUsers, 50]

      mockRepository.findAndCount.mockResolvedValue(mockFindAndCountResult)

      const result = await listUsers(params)

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        skip: 45,
        take: 5,
      })
      expect(result).toEqual({
        users: mockUsers,
        total: 50,
        page: 10,
        limit: 5,
        totalPages: 10,
      })
    })

    it('should handle error and throw internal error', async () => {
      const params = { page: 1, limit: 10 }
      const error = new Error('Database connection failed')

      mockRepository.findAndCount.mockRejectedValue(error)
      mockCreateError.internalError.mockReturnValue(
        new Error('Error listing users!') as any
      )

      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      await expect(listUsers(params)).rejects.toThrow('Error listing users!')

      expect(consoleSpy).toHaveBeenCalledWith('Error listing users:', error)
      expect(mockCreateError.internalError).toHaveBeenCalledWith(
        'Error listing users!'
      )

      consoleSpy.mockRestore()
    })

    it('should handle different limit values', async () => {
      const params = { page: 1, limit: 25 }
      const mockUsers = new Array(25).fill(mockUser)
      const mockFindAndCountResult = [mockUsers, 25]

      mockRepository.findAndCount.mockResolvedValue(mockFindAndCountResult)

      const result = await listUsers(params)

      expect(mockRepository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 25,
      })
      expect(result).toEqual({
        users: mockUsers,
        total: 25,
        page: 1,
        limit: 25,
        totalPages: 1,
      })
    })

    it('should handle fractional totalPages correctly', async () => {
      const params = { page: 1, limit: 3 }
      const mockUsers = new Array(3).fill(mockUser)
      const mockFindAndCountResult = [mockUsers, 7]

      mockRepository.findAndCount.mockResolvedValue(mockFindAndCountResult)

      const result = await listUsers(params)

      expect(result).toEqual({
        users: mockUsers,
        total: 7,
        page: 1,
        limit: 3,
        totalPages: 3,
      })
    })
  })
})
