// @ts-nocheck
import { jest } from '@jest/globals'
import request from 'supertest'
import testApp from '../testApp'
import { findUserById } from '../../src/services/userService'
import { updateUserAccount } from '../../src/services/editAccountService'
import jwt from 'jsonwebtoken'
import { mockUser, mockAdminUser } from '../mocks/mockData'
import type { MockUserResponse, MockError, MockCallback } from '../types'

jest.mock('../../src/services/userService')
jest.mock('../../src/services/editAccountService')
jest.mock('jsonwebtoken')
jest.mock('jwks-rsa')

describe('EditAccount E2E Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('PUT /edit-account', () => {
    it('should update user account as admin successfully', async () => {
      const mockToken = 'valid-jwt-token'
      const mockDecodedToken = {
        sub: 'admin-user-id',
        username: 'admin@example.com',
        'cognito:groups': ['admin'],
        token_use: 'access',
      }

      ;(jwt.verify as jest.Mock).mockImplementation(
        (token, getKey, options, callback: MockCallback) => {
          callback(null, mockDecodedToken)
        }
      )

      const updateResult: MockUserResponse = {
        message: 'User updated successfully',
        user: {
          ...mockUser,
          name: 'Updated Name',
          role: 'admin',
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z',
        },
      }
      ;(updateUserAccount as jest.Mock).mockResolvedValue(updateResult)

      const response = await request(testApp)
        .put('/edit-account')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          email: 'test@example.com',
          name: 'Updated Name',
          role: 'admin',
        })

      expect(response.status).toBe(200)
      expect(response.body).toEqual(updateResult)
      expect(updateUserAccount).toHaveBeenCalledWith(
        {
          email: 'test@example.com',
          name: 'Updated Name',
          role: 'admin',
        },
        mockDecodedToken
      )
    })

    it('should update user account as regular user successfully', async () => {
      const mockToken = 'valid-jwt-token'
      const mockDecodedToken = {
        sub: 'user-id',
        username: 'user@example.com',
        'cognito:groups': ['user'],
        token_use: 'access',
      }

      ;(jwt.verify as jest.Mock).mockImplementation(
        (token, getKey, options, callback: MockCallback) => {
          callback(null, mockDecodedToken)
        }
      )

      const updateResult: MockUserResponse = {
        message: 'User updated successfully',
        user: {
          ...mockUser,
          name: 'Updated Name',
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z',
        },
      }
      ;(updateUserAccount as jest.Mock).mockResolvedValue(updateResult)

      const response = await request(testApp)
        .put('/edit-account')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          email: 'test@example.com',
          name: 'Updated Name',
        })

      expect(response.status).toBe(200)
      expect(response.body).toEqual(updateResult)
      expect(updateUserAccount).toHaveBeenCalledWith(
        {
          email: 'test@example.com',
          name: 'Updated Name',
        },
        mockDecodedToken
      )
    })

    it('should return 500 when no authorization header', async () => {
      const response = await request(testApp).put('/edit-account').send({
        email: 'test@example.com',
        name: 'Updated Name',
      })

      expect(response.status).toBe(500)
      expect(response.body.error).toBe('Internal Server Error')
    })

    it('should return 401 when token is invalid', async () => {
      const mockToken = 'invalid-jwt-token'

      ;(jwt.verify as jest.Mock).mockImplementation(
        (token, getKey, options, callback: MockCallback) => {
          callback(new Error('Invalid token'), null)
        }
      )

      const response = await request(testApp)
        .put('/edit-account')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          email: 'test@example.com',
          name: 'Updated Name',
        })

      expect(response.status).toBe(401)
      expect(response.body).toEqual({
        message: 'Invalid token',
        error: 'Invalid token',
      })
    })

    it('should return 401 when token is not an access token', async () => {
      const mockToken = 'id-jwt-token'
      const mockDecodedToken = {
        sub: 'user-id',
        username: 'user@example.com',
        token_use: 'id',
      }

      ;(jwt.verify as jest.Mock).mockImplementation(
        (token, getKey, options, callback: MockCallback) => {
          callback(null, mockDecodedToken)
        }
      )

      const response = await request(testApp)
        .put('/edit-account')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          email: 'test@example.com',
          name: 'Updated Name',
        })

      expect(response.status).toBe(401)
      expect(response.body).toEqual({
        message: 'Invalid token',
        error: 'Token is not an access token',
      })
    })

    it('should return 200 when email is missing', async () => {
      const mockToken = 'valid-jwt-token'
      const mockDecodedToken = {
        sub: 'admin-user-id',
        username: 'admin@example.com',
        'cognito:groups': ['admin'],
        token_use: 'access',
      }

      ;(jwt.verify as jest.Mock).mockImplementation(
        (token, getKey, options, callback: MockCallback) => {
          callback(null, mockDecodedToken)
        }
      )

      const response = await request(testApp)
        .put('/edit-account')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          name: 'Updated Name',
        })

      expect(response.status).toBe(200)
      expect(response.body).toBeDefined()
    })

    it('should return 401 when update service fails', async () => {
      const mockToken = 'valid-jwt-token'
      const mockDecodedToken = {
        sub: 'admin-user-id',
        username: 'admin@example.com',
        'cognito:groups': ['admin'],
        token_use: 'access',
      }

      ;(jwt.verify as jest.Mock).mockImplementation(
        (token, getKey, options, callback: MockCallback) => {
          callback(null, mockDecodedToken)
        }
      )
      ;(updateUserAccount as jest.Mock).mockRejectedValue(
        new Error('Update failed')
      )

      const response = await request(testApp)
        .put('/edit-account')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          email: 'test@example.com',
          name: 'Updated Name',
          role: 'admin',
        })

      expect(response.status).toBe(401)
      expect(response.body.error).toBe('Update failed')
    })

    it('should return 401 when update service fails without message', async () => {
      const mockToken = 'valid-jwt-token'
      const mockDecodedToken = {
        sub: 'admin-user-id',
        username: 'admin@example.com',
        'cognito:groups': ['admin'],
        token_use: 'access',
      }

      ;(jwt.verify as jest.Mock).mockImplementation(
        (token, getKey, options, callback: MockCallback) => {
          callback(null, mockDecodedToken)
        }
      )
      ;(updateUserAccount as jest.Mock).mockRejectedValue(new Error())

      const response = await request(testApp)
        .put('/edit-account')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          email: 'test@example.com',
          name: 'Updated Name',
          role: 'admin',
        })

      expect(response.status).toBe(401)
      expect(response.body.error).toBe('Error updating user information')
    })

    it('should handle empty request body', async () => {
      const mockToken = 'valid-jwt-token'
      const mockDecodedToken = {
        sub: 'admin-user-id',
        username: 'admin@example.com',
        'cognito:groups': ['admin'],
        token_use: 'access',
      }

      ;(jwt.verify as jest.Mock).mockImplementation(
        (token, getKey, options, callback: MockCallback) => {
          callback(null, mockDecodedToken)
        }
      )

      const response = await request(testApp)
        .put('/edit-account')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({})

      expect(response.status).toBe(401)
      expect(response.body.error).toBe('Error updating user information')
    })

    it('should handle Cognito group update errors', async () => {
      const mockToken = 'valid-jwt-token'
      const mockDecodedToken = {
        sub: 'admin-user-id',
        username: 'admin@example.com',
        'cognito:groups': ['admin'],
        token_use: 'access',
      }

      ;(jwt.verify as jest.Mock).mockImplementation(
        (token, getKey, options, callback: MockCallback) => {
          callback(null, mockDecodedToken)
        }
      )
      ;(updateUserAccount as jest.Mock).mockRejectedValue(
        new Error('Failed to update user role in Cognito: Cognito error')
      )

      const response = await request(testApp)
        .put('/edit-account')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          email: 'test@example.com',
          name: 'Updated Name',
          role: 'admin',
        })

      expect(response.status).toBe(401)
      expect(response.body.error).toBe(
        'Failed to update user role in Cognito: Cognito error'
      )
    })

    it('should handle JWT verification errors', async () => {
      const mockToken = 'invalid-jwt-token'

      ;(jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('JWT verification failed')
      })

      const response = await request(testApp)
        .put('/edit-account')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({
          email: 'test@example.com',
          name: 'Updated Name',
        })

      expect(response.status).toBe(401)
      expect(response.body).toEqual({
        message: 'Invalid token',
        error: 'JWT verification failed',
      })
    })
  })
})
