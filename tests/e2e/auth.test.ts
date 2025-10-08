// @ts-nocheck
import { jest } from '@jest/globals'
import request from 'supertest'
import testApp from '../testApp'
import {
  signInOrRegisterService,
  confirmUser,
} from '../../src/services/authService'
import type { MockAuthResponse, MockError } from '../types'

jest.mock('../../src/services/authService')

describe('Auth E2E Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /auth', () => {
    it('should sign in existing user successfully', async () => {
      const mockResponse: MockAuthResponse = {
        accessToken: 'mock-access-token',
        expiresIn: 3600,
        tokenType: 'Bearer',
      }

      ;(signInOrRegisterService as jest.Mock).mockResolvedValue(mockResponse)

      const response = await request(testApp).post('/auth').send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'user',
      })

      expect(response.status).toBe(200)
      expect(response.body).toEqual(mockResponse)
      expect(signInOrRegisterService).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'user',
      })
    })

    it('should register new user successfully', async () => {
      const mockResponse: MockAuthResponse = {
        userSub: 'test-user-id',
        userConfirmed: false,
        message: 'User registered successfully!',
      }

      ;(signInOrRegisterService as jest.Mock).mockResolvedValue(mockResponse)

      const response = await request(testApp).post('/auth').send({
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
        role: 'user',
      })

      expect(response.status).toBe(200)
      expect(response.body).toEqual(mockResponse)
      expect(signInOrRegisterService).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'password123',
        name: 'New User',
        role: 'user',
      })
    })

    it('should return 400 for missing email', async () => {
      const response = await request(testApp).post('/auth').send({
        password: 'password123',
        name: 'Test User',
        role: 'user',
      })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Email is required!')
    })

    it('should return 400 for invalid email format', async () => {
      const response = await request(testApp).post('/auth').send({
        email: 'invalid-email',
        password: 'password123',
        name: 'Test User',
        role: 'user',
      })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Invalid email format: invalid-email')
    })

    it('should return 400 for UserNotConfirmedException', async () => {
      const error: MockError = new Error('User is not confirmed.')
      error.code = 'UserNotConfirmedException'
      ;(signInOrRegisterService as jest.Mock).mockRejectedValue(error)

      const response = await request(testApp).post('/auth').send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'user',
      })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('User is not confirmed!')
    })

    it('should return 401 for NotAuthorizedException', async () => {
      const error: MockError = new Error('Incorrect username or password.')
      error.code = 'NotAuthorizedException'
      ;(signInOrRegisterService as jest.Mock).mockRejectedValue(error)

      const response = await request(testApp).post('/auth').send({
        email: 'test@example.com',
        password: 'wrongpassword',
        name: 'Test User',
        role: 'user',
      })

      expect(response.status).toBe(401)
      expect(response.body.error).toBe('Incorrect username or password!')
    })

    it('should return 404 for UserNotFoundException', async () => {
      const error: MockError = new Error('User does not exist.')
      error.code = 'UserNotFoundException'
      ;(signInOrRegisterService as jest.Mock).mockRejectedValue(error)

      const response = await request(testApp).post('/auth').send({
        email: 'nonexistent@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'user',
      })

      expect(response.status).toBe(404)
      expect(response.body.error).toBe('User does not exist!')
    })

    it('should return 400 for InvalidPasswordException', async () => {
      const error: MockError = new Error('Invalid password')
      error.code = 'InvalidPasswordException'
      ;(signInOrRegisterService as jest.Mock).mockRejectedValue(error)

      const response = await request(testApp).post('/auth').send({
        email: 'test@example.com',
        password: 'invalidpassword',
        name: 'Test User',
        role: 'user',
      })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Invalid password!')
    })

    it('should return 400 for UsernameExistsException', async () => {
      const error: MockError = new Error('User already exists')
      error.code = 'UsernameExistsException'
      ;(signInOrRegisterService as jest.Mock).mockRejectedValue(error)

      const response = await request(testApp).post('/auth').send({
        email: 'existing@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'user',
      })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('User already exists!')
    })

    it('should return 500 for internal server error', async () => {
      const error: MockError = new Error('Internal server error')
      ;(signInOrRegisterService as jest.Mock).mockRejectedValue(error)

      const response = await request(testApp).post('/auth').send({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'user',
      })

      expect(response.status).toBe(500)
      expect(response.body.error).toBe('Internal server error')
    })

    it('should handle empty request body', async () => {
      const response = await request(testApp).post('/auth').send({})

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Email is required!')
    })

    it('should normalize email to lowercase', async () => {
      const mockResponse: MockAuthResponse = {
        accessToken: 'mock-access-token',
        expiresIn: 3600,
        tokenType: 'Bearer',
      }

      ;(signInOrRegisterService as jest.Mock).mockResolvedValue(mockResponse)

      const response = await request(testApp).post('/auth').send({
        email: '  TEST@EXAMPLE.COM  ',
        password: 'password123',
        name: 'Test User',
        role: 'user',
      })

      expect(response.status).toBe(200)
      expect(signInOrRegisterService).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'user',
      })
    })
  })
})
