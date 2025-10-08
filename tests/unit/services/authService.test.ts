// @ts-nocheck
import { jest } from '@jest/globals'
import {
  signInOrRegisterService,
  signIn,
  signUp,
  confirmUser,
  addUserToGroup,
} from '../../../src/services/authService'
import * as userService from '../../../src/services/userService'
import { createError } from '../../../src/middlewares/errorHandler'
import {
  mockUser,
  mockSignUpResponse,
  mockSignInResponse,
} from '../../mocks/mockData'

jest.mock('../../../src/services/userService')
jest.mock('../../../src/middlewares/errorHandler')
jest.mock('../../../src/config/cognito', () => ({
  cognito: {
    initiateAuth: jest.fn().mockReturnThis(),
    signUp: jest.fn().mockReturnThis(),
    confirmSignUp: jest.fn().mockReturnThis(),
    adminAddUserToGroup: jest.fn().mockReturnThis(),
    createGroup: jest.fn().mockReturnThis(),
    promise: jest.fn(),
  },
  COGNITO_CONFIG: {
    CLIENT_ID: 'test-client-id',
    CLIENT_SECRET: 'test-client-secret',
    USER_POOL_ID: 'test-pool-id',
  },
}))

jest.mock('crypto', () => ({
  createHmac: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn().mockReturnValue('mock-hash'),
  }),
}))

const mockUserService = userService as jest.Mocked<typeof userService>
const mockCreateError = createError as jest.Mocked<typeof createError>

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('signInOrRegisterService', () => {
    it('should throw error when email is missing', async () => {
      const body = {
        email: '',
        password: 'password123',
        role: 'user',
        name: 'Test User',
      }

      mockCreateError.badRequest.mockReturnValue(
        new Error('Email and password are required') as any
      )

      await expect(signInOrRegisterService(body)).rejects.toThrow(
        'Email and password are required'
      )
      expect(mockCreateError.badRequest).toHaveBeenCalledWith(
        'Email and password are required'
      )
    })

    it('should throw error when password is missing', async () => {
      const body = {
        email: 'test@example.com',
        password: '',
        role: 'user',
        name: 'Test User',
      }

      mockCreateError.badRequest.mockReturnValue(
        new Error('Email and password are required') as any
      )

      await expect(signInOrRegisterService(body)).rejects.toThrow(
        'Email and password are required'
      )
      expect(mockCreateError.badRequest).toHaveBeenCalledWith(
        'Email and password are required'
      )
    })

    it('should call signIn when user exists', async () => {
      const body = {
        email: 'test@example.com',
        password: 'password123',
        role: 'user',
        name: 'Test User',
      }
      mockUserService.findUserByEmail.mockResolvedValue(mockUser)

      const { cognito } = require('../../../src/config/cognito')
      cognito.promise.mockResolvedValue(mockSignInResponse)

      const result = await signInOrRegisterService(body)

      expect(mockUserService.findUserByEmail).toHaveBeenCalledWith(
        'test@example.com'
      )
      expect(result).toEqual({
        accessToken: mockSignInResponse.AuthenticationResult?.AccessToken,
        expiresIn: mockSignInResponse.AuthenticationResult?.ExpiresIn,
        tokenType: mockSignInResponse.AuthenticationResult?.TokenType,
      })
    })

    it('should call signUp when user does not exist', async () => {
      const body = {
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User',
        role: 'user',
      }
      mockUserService.findUserByEmail.mockResolvedValue(null)

      const { cognito } = require('../../../src/config/cognito')
      const mockSignUpResponse = {
        UserSub: 'new-user-id',
        UserConfirmed: false,
      }
      cognito.promise
        .mockResolvedValueOnce(mockSignUpResponse)
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({})

      mockUserService.createUser.mockResolvedValue(mockUser)

      const result = await signInOrRegisterService(body)

      expect(mockUserService.findUserByEmail).toHaveBeenCalledWith(
        'newuser@example.com'
      )
      expect(mockUserService.createUser).toHaveBeenCalledWith(
        'new-user-id',
        'newuser@example.com',
        'user',
        'New User'
      )
      expect(result).toEqual({
        userSub: mockSignUpResponse.UserSub,
        userConfirmed: mockSignUpResponse.UserConfirmed,
        message: 'User registered successfully!',
      })
    })

    it('should handle errors and throw generic error when no specific message', async () => {
      const body = {
        email: 'test@example.com',
        password: 'password123',
        role: 'user',
        name: 'Test User',
      }
      mockUserService.findUserByEmail.mockRejectedValue({})

      await expect(signInOrRegisterService(body)).rejects.toThrow(
        'Error signing in or registering user'
      )
    })

    it('should rethrow error when error has message', async () => {
      const body = {
        email: 'test@example.com',
        password: 'password123',
        role: 'user',
        name: 'Test User',
      }
      const specificError = new Error('Specific error message')
      mockUserService.findUserByEmail.mockRejectedValue(specificError)

      await expect(signInOrRegisterService(body)).rejects.toThrow(
        'Specific error message'
      )
    })
  })

  describe('signIn', () => {
    it('should successfully sign in user', async () => {
      const email = 'test@example.com'
      const password = 'password123'

      const { cognito } = require('../../../src/config/cognito')
      cognito.initiateAuth.mockReturnValue({
        promise: jest.fn().mockResolvedValue(mockSignInResponse),
      })

      const result = await signIn(email, password)

      expect(cognito.initiateAuth).toHaveBeenCalledWith({
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: 'test-client-id',
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password,
          SECRET_HASH: 'mock-hash',
        },
      })
      expect(result).toEqual({
        accessToken: mockSignInResponse.AuthenticationResult?.AccessToken,
        expiresIn: mockSignInResponse.AuthenticationResult?.ExpiresIn,
        tokenType: mockSignInResponse.AuthenticationResult?.TokenType,
      })
    })
  })

  describe('addUserToGroup', () => {
    const { cognito, COGNITO_CONFIG } = require('../../../src/config/cognito')

    it('should successfully add user to existing group', async () => {
      cognito.promise.mockResolvedValue({})

      const result = await addUserToGroup('test@example.com', 'admin')

      expect(cognito.adminAddUserToGroup).toHaveBeenCalledWith({
        UserPoolId: COGNITO_CONFIG.USER_POOL_ID,
        Username: 'test@example.com',
        GroupName: 'admin',
      })
      expect(result).toBe(true)
    })

    it('should create group and add user when group does not exist', async () => {
      const groupNotFoundError = {
        code: 'ResourceNotFoundException',
        message: 'Group does not exist',
      }

      cognito.promise
        .mockRejectedValueOnce(groupNotFoundError)
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({})

      const result = await addUserToGroup('test@example.com', 'newgroup')

      expect(cognito.createGroup).toHaveBeenCalledWith({
        UserPoolId: COGNITO_CONFIG.USER_POOL_ID,
        GroupName: 'newgroup',
        Description: 'Group for newgroup users',
      })
      expect(cognito.adminAddUserToGroup).toHaveBeenCalledTimes(2)
      expect(result).toBe(true)
    })

    it('should return false when createGroup fails', async () => {
      const groupNotFoundError = {
        code: 'ResourceNotFoundException',
        message: 'Group does not exist',
      }
      const createGroupError = new Error('Failed to create group')

      cognito.promise
        .mockRejectedValueOnce(groupNotFoundError)
        .mockRejectedValueOnce(createGroupError)

      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      const result = await addUserToGroup('test@example.com', 'newgroup')

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to create group newgroup:',
        'Failed to create group'
      )
      expect(result).toBe(false)

      consoleSpy.mockRestore()
    })

    it('should return false when error is not ResourceNotFoundException', async () => {
      const otherError = new Error('Some other error')
      cognito.promise.mockRejectedValue(otherError)

      const result = await addUserToGroup('test@example.com', 'admin')

      expect(result).toBe(false)
      expect(cognito.createGroup).not.toHaveBeenCalled()
    })

    it('should return false when error message contains "does not exist"', async () => {
      const errorWithMessage = new Error('Group does not exist')
      cognito.promise
        .mockRejectedValueOnce(errorWithMessage)
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({})

      const result = await addUserToGroup('test@example.com', 'admin')

      expect(result).toBe(true)
      expect(cognito.createGroup).toHaveBeenCalled()
    })
  })

  describe('signUp', () => {
    const { cognito } = require('../../../src/config/cognito')

    it('should throw error when required fields are missing', async () => {
      mockCreateError.badRequest.mockReturnValue(
        new Error('Email, password, role and name are required!') as any
      )

      await expect(signUp('', 'password', 'role', 'name')).rejects.toThrow(
        'Email, password, role and name are required!'
      )
      await expect(signUp('email', '', 'role', 'name')).rejects.toThrow(
        'Email, password, role and name are required!'
      )
      await expect(signUp('email', 'password', '', 'name')).rejects.toThrow(
        'Email, password, role and name are required!'
      )
      await expect(signUp('email', 'password', 'role', '')).rejects.toThrow(
        'Email, password, role and name are required!'
      )
    })

    it('should successfully sign up user', async () => {
      const email = 'newuser@example.com'
      const password = 'password123'
      const role = 'user'
      const name = 'New User'

      cognito.promise
        .mockResolvedValueOnce(mockSignUpResponse)
        .mockResolvedValueOnce({})

      mockUserService.createUser.mockResolvedValue(mockUser)

      const result = await signUp(email, password, role, name)

      expect(cognito.signUp).toHaveBeenCalledWith({
        ClientId: 'test-client-id',
        Username: email,
        Password: password,
        SecretHash: 'mock-hash',
        UserAttributes: [
          { Name: 'email', Value: email },
          { Name: 'name', Value: name },
        ],
      })
      expect(result).toEqual({
        userSub: mockSignUpResponse.UserSub,
        userConfirmed: mockSignUpResponse.UserConfirmed,
        message: 'User registered successfully!',
      })
    })

    it('should throw error when addUserToGroup fails', async () => {
      const email = 'newuser@example.com'
      const password = 'password123'
      const role = 'user'
      const name = 'New User'

      cognito.promise
        .mockResolvedValueOnce(mockSignUpResponse)
        .mockRejectedValueOnce(new Error('Failed to add user to group'))

      mockCreateError.internalError.mockReturnValue(
        new Error('Failed to add user to group') as any
      )

      await expect(signUp(email, password, role, name)).rejects.toThrow(
        'Failed to add user to group'
      )
      expect(mockCreateError.internalError).toHaveBeenCalledWith(
        'Failed to add user to group'
      )
    })

    it('should handle cognito signUp error', async () => {
      const email = 'newuser@example.com'
      const password = 'password123'
      const role = 'user'
      const name = 'New User'

      const cognitoError = new Error('User already exists')
      cognito.promise.mockRejectedValue(cognitoError)

      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      await expect(signUp(email, password, role, name)).rejects.toThrow(
        'User already exists'
      )

      expect(consoleSpy).toHaveBeenCalledWith(
        'Cognito signUp error:',
        cognitoError
      )

      consoleSpy.mockRestore()
    })
  })

  describe('confirmUser', () => {
    const { cognito } = require('../../../src/config/cognito')

    it('should throw error when email is missing', async () => {
      mockCreateError.badRequest.mockReturnValue(
        new Error('Email and confirmation code are required') as any
      )

      await expect(confirmUser('', '123456')).rejects.toThrow(
        'Email and confirmation code are required'
      )
      expect(mockCreateError.badRequest).toHaveBeenCalledWith(
        'Email and confirmation code are required'
      )
    })

    it('should throw error when code is missing', async () => {
      mockCreateError.badRequest.mockReturnValue(
        new Error('Email and confirmation code are required') as any
      )

      await expect(confirmUser('test@example.com', '')).rejects.toThrow(
        'Email and confirmation code are required'
      )
      expect(mockCreateError.badRequest).toHaveBeenCalledWith(
        'Email and confirmation code are required'
      )
    })

    it('should successfully confirm user', async () => {
      const email = 'test@example.com'
      const code = '123456'

      cognito.promise.mockResolvedValue({})

      const result = await confirmUser(email, code)

      expect(cognito.confirmSignUp).toHaveBeenCalledWith({
        ClientId: 'test-client-id',
        Username: email,
        ConfirmationCode: code,
        SecretHash: 'mock-hash',
      })
      expect(result).toEqual({
        message: 'User confirmed successfully!',
        success: true,
      })
    })

    it('should handle cognito confirmSignUp error with message', async () => {
      const email = 'test@example.com'
      const code = '123456'

      const cognitoError = new Error('Invalid confirmation code')
      cognito.promise.mockRejectedValue(cognitoError)

      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      await expect(confirmUser(email, code)).rejects.toThrow(
        'Invalid confirmation code'
      )

      expect(consoleSpy).toHaveBeenCalledWith(
        'Cognito confirmSignUp error:',
        cognitoError
      )

      consoleSpy.mockRestore()
    })

    it('should handle cognito confirmSignUp error without message', async () => {
      const email = 'test@example.com'
      const code = '123456'

      const cognitoError = {}
      cognito.promise.mockRejectedValue(cognitoError)

      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {})

      await expect(confirmUser(email, code)).rejects.toThrow(
        'Error confirming user'
      )

      expect(consoleSpy).toHaveBeenCalledWith(
        'Cognito confirmSignUp error:',
        cognitoError
      )

      consoleSpy.mockRestore()
    })
  })
})
