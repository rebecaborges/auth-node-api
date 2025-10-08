// @ts-nocheck
import { jest } from '@jest/globals'
import {
  signInOrRegister,
  confirmEmail,
} from '../../../src/controllers/authController'
import {
  signInOrRegisterService,
  confirmUser,
} from '../../../src/services/authService'
import { createError } from '../../../src/middlewares/errorHandler'
import { createMockContext, createMockNext } from '../../mocks/mockContext'
import { mockSignInResponse, mockConfirmResponse } from '../../mocks/mockData'

jest.mock('../../../src/services/authService')

describe('AuthController', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('signInOrRegister', () => {
    it('should handle successful sign in or register', async () => {
      const ctx = createMockContext({
        request: {
          body: {
            email: 'test@example.com',
            password: 'password123',
            name: 'Test User',
            role: 'user',
          },
        },
      })

      ;(signInOrRegisterService as jest.Mock).mockResolvedValue(
        mockSignInResponse.AuthenticationResult
      )

      await signInOrRegister(ctx)

      expect(signInOrRegisterService).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        role: 'user',
      })
      expect(ctx.body).toEqual(mockSignInResponse.AuthenticationResult)
    })

    it('should handle UserNotConfirmedException', async () => {
      const ctx = createMockContext({
        request: {
          body: {
            email: 'test@example.com',
            password: 'password123',
            name: 'Test User',
            role: 'user',
          },
        },
      })

      const error = new Error('User is not confirmed.')
      error.code = 'UserNotConfirmedException'
      ;(signInOrRegisterService as jest.Mock).mockRejectedValue(error)

      await expect(signInOrRegister(ctx)).rejects.toThrow(
        'User is not confirmed!'
      )
    })

    it('should handle NotAuthorizedException', async () => {
      const ctx = createMockContext({
        request: {
          body: {
            email: 'test@example.com',
            password: 'wrongpassword',
            name: 'Test User',
            role: 'user',
          },
        },
      })

      const error = new Error('Incorrect username or password.')
      error.code = 'NotAuthorizedException'
      ;(signInOrRegisterService as jest.Mock).mockRejectedValue(error)

      await expect(signInOrRegister(ctx)).rejects.toThrow(
        'Incorrect username or password!'
      )
    })

    it('should handle UserNotFoundException', async () => {
      const ctx = createMockContext({
        request: {
          body: {
            email: 'nonexistent@example.com',
            password: 'password123',
            name: 'Test User',
            role: 'user',
          },
        },
      })

      const error = new Error('User does not exist.')
      error.code = 'UserNotFoundException'
      ;(signInOrRegisterService as jest.Mock).mockRejectedValue(error)

      await expect(signInOrRegister(ctx)).rejects.toThrow(
        'User does not exist!'
      )
    })

    it('should handle InvalidPasswordException', async () => {
      const ctx = createMockContext({
        request: {
          body: {
            email: 'test@example.com',
            password: 'invalidpassword',
            name: 'Test User',
            role: 'user',
          },
        },
      })

      const error = new Error('Invalid password')
      error.code = 'InvalidPasswordException'
      ;(signInOrRegisterService as jest.Mock).mockRejectedValue(error)

      await expect(signInOrRegister(ctx)).rejects.toThrow('Invalid password!')
    })

    it('should handle UsernameExistsException', async () => {
      const ctx = createMockContext({
        request: {
          body: {
            email: 'existing@example.com',
            password: 'password123',
            name: 'Test User',
            role: 'user',
          },
        },
      })

      const error = new Error('User already exists')
      error.code = 'UsernameExistsException'
      ;(signInOrRegisterService as jest.Mock).mockRejectedValue(error)

      await expect(signInOrRegister(ctx)).rejects.toThrow(
        'User already exists!'
      )
    })

    it('should handle generic error with message', async () => {
      const ctx = createMockContext({
        request: {
          body: {
            email: 'test@example.com',
            password: 'password123',
            name: 'Test User',
            role: 'user',
          },
        },
      })

      const error = new Error('Custom error message')
      ;(signInOrRegisterService as jest.Mock).mockRejectedValue(error)

      await expect(signInOrRegister(ctx)).rejects.toThrow(
        'Custom error message'
      )
    })

    it('should handle error without message', async () => {
      const ctx = createMockContext({
        request: {
          body: {
            email: 'test@example.com',
            password: 'password123',
            name: 'Test User',
            role: 'user',
          },
        },
      })

      const error = new Error()
      ;(signInOrRegisterService as jest.Mock).mockRejectedValue(error)

      await expect(signInOrRegister(ctx)).rejects.toThrow(
        'Error signing in or registering user'
      )
    })
  })

  describe('confirmEmail', () => {
    it('should handle successful email confirmation', async () => {
      const ctx = createMockContext({
        request: {
          body: {
            email: 'test@example.com',
            code: '123456',
          },
        },
      })

      ;(confirmUser as jest.Mock).mockResolvedValue(mockConfirmResponse)

      await confirmEmail(ctx)

      expect(confirmUser).toHaveBeenCalledWith('test@example.com', '123456')
      expect(ctx.body).toEqual(mockConfirmResponse)
    })

    it('should handle confirmation error', async () => {
      const ctx = createMockContext({
        request: {
          body: {
            email: 'test@example.com',
            code: 'invalid',
          },
        },
      })

      const error = new Error('Invalid confirmation code')
      ;(confirmUser as jest.Mock).mockRejectedValue(error)

      await expect(confirmEmail(ctx)).rejects.toThrow(
        'Invalid confirmation code'
      )
    })

    it('should handle error without message', async () => {
      const ctx = createMockContext({
        request: {
          body: {
            email: 'test@example.com',
            code: '123456',
          },
        },
      })

      const error = new Error()
      ;(confirmUser as jest.Mock).mockRejectedValue(error)

      await expect(confirmEmail(ctx)).rejects.toThrow(
        'Error confirming user email'
      )
    })
  })
})
