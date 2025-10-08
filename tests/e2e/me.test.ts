// @ts-nocheck
import { jest } from '@jest/globals'
import request from 'supertest'
import testApp from '../testApp'
import { findUserById } from '../../src/services/userService'
import jwt from 'jsonwebtoken'
import { mockUser } from '../mocks/mockData'
import type { MockCallback } from '../types'

jest.mock('../../src/services/userService')
jest.mock('jsonwebtoken')
jest.mock('jwks-rsa')

describe('Me E2E Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('GET /me', () => {
    it('should return user information with valid token', async () => {
      const mockToken = 'valid-jwt-token'
      const mockDecodedToken = {
        sub: 'test-user-id',
        username: 'test@example.com',
        'cognito:groups': ['user'],
        token_use: 'access',
      }

      ;(jwt.verify as jest.Mock).mockImplementation(
        (token, getKey, options, callback: MockCallback) => {
          callback(null, mockDecodedToken)
        }
      )
      ;(findUserById as jest.Mock).mockResolvedValue(mockUser)

      const response = await request(testApp)
        .get('/me')
        .set('Authorization', `Bearer ${mockToken}`)

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        message: 'User information retrieved successfully',
        user: {
          id: mockDecodedToken.sub,
          username: mockDecodedToken.username,
          email: mockUser.email,
          name: mockUser.name,
          isOnboarded: mockUser.isOnboarded,
          role: mockUser.role,
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z',
        },
      })
    })

    it('should return 500 when no authorization header', async () => {
      const response = await request(testApp).get('/me')

      expect(response.status).toBe(500)
      expect(response.body.error).toBe('Internal Server Error')
    })

    it('should return 200 when authorization header is malformed', async () => {
      const response = await request(testApp)
        .get('/me')
        .set('Authorization', 'InvalidFormat')

      expect(response.status).toBe(200)
      expect(response.body.message).toBe(
        'User information retrieved successfully'
      )
      expect(response.body.user).toBeDefined()
    })

    it('should return 401 when token is invalid', async () => {
      const mockToken = 'invalid-jwt-token'

      ;(jwt.verify as jest.Mock).mockImplementation(
        (token, getKey, options, callback) => {
          callback(new Error('Invalid token'), null)
        }
      )

      const response = await request(testApp)
        .get('/me')
        .set('Authorization', `Bearer ${mockToken}`)

      expect(response.status).toBe(401)
      expect(response.body).toEqual({
        message: 'Invalid token',
        error: 'Invalid token',
      })
    })

    it('should return 401 when token is not an access token', async () => {
      const mockToken = 'id-jwt-token'
      const mockDecodedToken = {
        sub: 'test-user-id',
        username: 'test@example.com',
        token_use: 'id',
      }

      ;(jwt.verify as jest.Mock).mockImplementation(
        (token, getKey, options, callback: MockCallback) => {
          callback(null, mockDecodedToken)
        }
      )

      const response = await request(testApp)
        .get('/me')
        .set('Authorization', `Bearer ${mockToken}`)

      expect(response.status).toBe(401)
      expect(response.body).toEqual({
        message: 'Invalid token',
        error: 'Token is not an access token',
      })
    })

    it('should return 401 when user not found in database', async () => {
      const mockToken = 'valid-jwt-token'
      const mockDecodedToken = {
        sub: 'test-user-id',
        username: 'test@example.com',
        'cognito:groups': ['user'],
        token_use: 'access',
      }

      const mockClient = require('jwks-rsa')
      const mockGetSigningKey = jest.fn((kid, callback) => {
        callback(null, {
          getPublicKey: () => 'mock-public-key',
        })
      })
      mockClient.mockReturnValue({
        getSigningKey: mockGetSigningKey,
      })
      ;(jwt.verify as jest.Mock).mockImplementation(
        (token, getKey, options, callback: MockCallback) => {
          console.log('jwt.verify called with token:', token)
          callback(null, mockDecodedToken)
        }
      )

      // Mock findUserById
      ;(findUserById as jest.Mock).mockResolvedValue(null)

      const response = await request(testApp)
        .get('/me')
        .set('Authorization', `Bearer ${mockToken}`)

      console.log('Response status:', response.status)
      console.log('Response body:', response.body)

      expect(response.status).toBe(401)
      expect(response.body.error).toBe('User not found')
    })

    it('should return 401 when database error occurs', async () => {
      const mockToken = 'valid-jwt-token'
      const mockDecodedToken = {
        sub: 'test-user-id',
        username: 'test@example.com',
        'cognito:groups': ['user'],
        token_use: 'access',
      }

      ;(jwt.verify as jest.Mock).mockImplementation(
        (token, getKey, options, callback: MockCallback) => {
          callback(null, mockDecodedToken)
        }
      )
      ;(findUserById as jest.Mock).mockRejectedValue(
        new Error('Database error')
      )

      const response = await request(testApp)
        .get('/me')
        .set('Authorization', `Bearer ${mockToken}`)

      expect(response.status).toBe(401)
      expect(response.body.error).toBe('Database error')
    })

    it('should handle JWT verification errors', async () => {
      const mockToken = 'invalid-jwt-token'

      ;(jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('JWT verification failed')
      })

      const response = await request(testApp)
        .get('/me')
        .set('Authorization', `Bearer ${mockToken}`)

      expect(response.status).toBe(401)
      expect(response.body).toEqual({
        message: 'Invalid token',
        error: 'JWT verification failed',
      })
    })

    it('should handle token without token_use field', async () => {
      const mockToken = 'valid-jwt-token'
      const mockDecodedToken = {
        sub: 'test-user-id',
        username: 'test@example.com',
      }

      ;(jwt.verify as jest.Mock).mockImplementation(
        (token, getKey, options, callback: MockCallback) => {
          callback(null, mockDecodedToken)
        }
      )

      const response = await request(testApp)
        .get('/me')
        .set('Authorization', `Bearer ${mockToken}`)

      expect(response.status).toBe(401)
      expect(response.body).toEqual({
        message: 'Invalid token',
        error: 'Token is not an access token',
      })
    })
  })
})
