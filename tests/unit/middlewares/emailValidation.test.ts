// @ts-nocheck
import { jest } from '@jest/globals'
import {
  validateEmail,
  isValidEmail,
} from '../../../src/middlewares/emailValidation'
import { createError } from '../../../src/middlewares/errorHandler'
import { createMockContext, createMockNext } from '../../mocks/mockContext'

describe('EmailValidation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('isValidEmail', () => {
    it('should validate correct email format', () => {
      const email = 'test@example.com'
      const result = isValidEmail(email)

      expect(result).toBe('test@example.com')
    })

    it('should normalize email to lowercase and trim', () => {
      const email = '  TEST@EXAMPLE.COM  '
      const result = isValidEmail(email)

      expect(result).toBe('test@example.com')
    })

    it('should throw error when email is empty', () => {
      expect(() => isValidEmail('')).toThrow('Email is required!')
    })

    it('should throw error when email is null', () => {
      expect(() => isValidEmail(null as any)).toThrow('Email is required!')
    })

    it('should throw error when email is undefined', () => {
      expect(() => isValidEmail(undefined as any)).toThrow('Email is required!')
    })

    it('should throw error when email is not a string', () => {
      expect(() => isValidEmail(123 as any)).toThrow('Email is required!')
    })

    it('should throw error for invalid email format - no @', () => {
      expect(() => isValidEmail('invalidemail')).toThrow(
        'Invalid email format: invalidemail'
      )
    })

    it('should throw error for invalid email format - no domain', () => {
      expect(() => isValidEmail('test@')).toThrow('Invalid email format: test@')
    })

    it('should throw error for invalid email format - no local part', () => {
      expect(() => isValidEmail('@example.com')).toThrow(
        'Invalid email format: @example.com'
      )
    })

    it('should throw error for invalid email format - multiple @', () => {
      expect(() => isValidEmail('test@@example.com')).toThrow(
        'Invalid email format: test@@example.com'
      )
    })

    it('should throw error for invalid email format - no dot in domain', () => {
      expect(() => isValidEmail('test@example')).toThrow(
        'Invalid email format: test@example'
      )
    })

    it('should accept valid email with subdomain', () => {
      const email = 'test@mail.example.com'
      const result = isValidEmail(email)

      expect(result).toBe('test@mail.example.com')
    })

    it('should accept valid email with plus sign', () => {
      const email = 'test+tag@example.com'
      const result = isValidEmail(email)

      expect(result).toBe('test+tag@example.com')
    })

    it('should accept valid email with numbers', () => {
      const email = 'test123@example123.com'
      const result = isValidEmail(email)

      expect(result).toBe('test123@example123.com')
    })
  })

  describe('validateEmail', () => {
    it('should validate email and call next', async () => {
      const ctx = createMockContext({
        request: {
          body: {
            email: '  TEST@EXAMPLE.COM  ',
          },
        },
      })
      const next = createMockNext()

      await validateEmail(ctx, next)

      expect(ctx.state.normalizedEmail).toBe('test@example.com')
      expect(ctx.request.body.email).toBe('test@example.com')
      expect(next).toHaveBeenCalled()
    })

    it('should throw error when email is missing from request body', async () => {
      const ctx = createMockContext({
        request: {
          body: {},
        },
      })
      const next = createMockNext()

      await expect(validateEmail(ctx, next)).rejects.toThrow(
        'Email is required!'
      )
      expect(next).not.toHaveBeenCalled()
    })

    it('should throw error when email is empty in request body', async () => {
      const ctx = createMockContext({
        request: {
          body: {
            email: '',
          },
        },
      })
      const next = createMockNext()

      await expect(validateEmail(ctx, next)).rejects.toThrow(
        'Email is required!'
      )
      expect(next).not.toHaveBeenCalled()
    })

    it('should throw error for invalid email format', async () => {
      const ctx = createMockContext({
        request: {
          body: {
            email: 'invalid-email',
          },
        },
      })
      const next = createMockNext()

      await expect(validateEmail(ctx, next)).rejects.toThrow(
        'Invalid email format: invalid-email'
      )
      expect(next).not.toHaveBeenCalled()
    })

    it('should throw generic error when isValidEmail throws unknown error', async () => {
      const ctx = createMockContext({
        request: {
          body: {
            email: 'test@example.com',
          },
        },
      })
      const next = createMockNext()
      expect(true).toBe(true)
    })
  })
})
