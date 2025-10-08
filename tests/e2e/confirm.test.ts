// @ts-nocheck
import { jest } from '@jest/globals'
import request from 'supertest'
import testApp from '../testApp'
import { confirmUser } from '../../src/services/authService'
import type { MockConfirmResponse, MockError } from '../types'

jest.mock('../../src/services/authService')

describe('Confirm E2E Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /confirm', () => {
    it('should confirm user email successfully', async () => {
      const mockResponse: MockConfirmResponse = {
        message: 'User confirmed successfully!',
        success: true,
      }

      ;(confirmUser as jest.Mock).mockResolvedValue(mockResponse)

      const response = await request(testApp).post('/confirm').send({
        email: 'test@example.com',
        code: '123456',
      })

      expect(response.status).toBe(200)
      expect(response.body).toEqual(mockResponse)
      expect(confirmUser).toHaveBeenCalledWith('test@example.com', '123456')
    })

    it('should return 200 for missing email', async () => {
      const response = await request(testApp).post('/confirm').send({
        code: '123456',
      })

      expect(response.status).toBe(200)
      expect(response.body).toBeDefined()
    })

    it('should return 200 for missing code', async () => {
      const response = await request(testApp).post('/confirm').send({
        email: 'test@example.com',
      })

      expect(response.status).toBe(200)
      expect(response.body).toBeDefined()
    })

    it('should return 400 for invalid confirmation code', async () => {
      const error: MockError = new Error('Invalid confirmation code')
      ;(confirmUser as jest.Mock).mockRejectedValue(error)

      const response = await request(testApp).post('/confirm').send({
        email: 'test@example.com',
        code: 'invalid',
      })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Invalid confirmation code')
    })

    it('should return 400 for expired confirmation code', async () => {
      const error: MockError = new Error('Confirmation code has expired')
      ;(confirmUser as jest.Mock).mockRejectedValue(error)

      const response = await request(testApp).post('/confirm').send({
        email: 'test@example.com',
        code: '123456',
      })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Confirmation code has expired')
    })

    it('should return 400 for already confirmed user', async () => {
      const error: MockError = new Error('User is already confirmed')
      ;(confirmUser as jest.Mock).mockRejectedValue(error)

      const response = await request(testApp).post('/confirm').send({
        email: 'test@example.com',
        code: '123456',
      })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('User is already confirmed')
    })

    it('should return 400 for error without message', async () => {
      const error: MockError = new Error()
      ;(confirmUser as jest.Mock).mockRejectedValue(error)

      const response = await request(testApp).post('/confirm').send({
        email: 'test@example.com',
        code: '123456',
      })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Error confirming user email')
    })

    it('should handle empty request body', async () => {
      const response = await request(testApp).post('/confirm').send({})

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Error confirming user email')
    })

    it('should handle empty email and code', async () => {
      const response = await request(testApp).post('/confirm').send({
        email: '',
        code: '',
      })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Error confirming user email')
    })

    it('should handle Cognito service errors', async () => {
      const error: MockError = new Error('Cognito service unavailable')
      ;(confirmUser as jest.Mock).mockRejectedValue(error)

      const response = await request(testApp).post('/confirm').send({
        email: 'test@example.com',
        code: '123456',
      })

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Cognito service unavailable')
    })
  })
})
