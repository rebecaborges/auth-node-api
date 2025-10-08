import 'reflect-metadata'
import { jest } from '@jest/globals'
import './types'

process.env.NODE_ENV = 'test'
process.env.AWS_REGION = 'us-east-1'
process.env.COGNITO_USER_POOL_ID = 'test-pool-id'
process.env.COGNITO_CLIENT_ID = 'test-client-id'
process.env.COGNITO_CLIENT_SECRET = 'test-client-secret'
process.env.COGNITO_ISSUER =
  'https://cognito-idp.us-east-1.amazonaws.com/test-pool-id'
process.env.COGNITO_JWKS_URI =
  'https://cognito-idp.us-east-1.amazonaws.com/test-pool-id/.well-known/jwks.json'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db'

jest.mock('aws-sdk', () => {
  const mockCognito = {
    signUp: jest.fn().mockReturnThis(),
    initiateAuth: jest.fn().mockReturnThis(),
    confirmSignUp: jest.fn().mockReturnThis(),
    adminAddUserToGroup: jest.fn().mockReturnThis(),
    adminRemoveUserFromGroup: jest.fn().mockReturnThis(),
    createGroup: jest.fn().mockReturnThis(),
    promise: jest.fn(),
  }

  return {
    config: {
      update: jest.fn(),
    },
    CognitoIdentityServiceProvider: jest.fn(() => mockCognito),
  }
})

jest.mock('typeorm', () => ({
  Entity: jest.fn(() => (target: any) => target),
  PrimaryColumn: jest.fn(() => (target: any, propertyKey: string) => {
    Object.defineProperty(target, propertyKey, {
      value: undefined,
      writable: true,
      enumerable: true,
      configurable: true,
    })
  }),
  Column: jest.fn(() => (target: any, propertyKey: string) => {
    Object.defineProperty(target, propertyKey, {
      value: undefined,
      writable: true,
      enumerable: true,
      configurable: true,
    })
  }),
  CreateDateColumn: jest.fn(() => (target: any, propertyKey: string) => {
    Object.defineProperty(target, propertyKey, {
      value: undefined,
      writable: true,
      enumerable: true,
      configurable: true,
    })
  }),
  UpdateDateColumn: jest.fn(() => (target: any, propertyKey: string) => {
    Object.defineProperty(target, propertyKey, {
      value: undefined,
      writable: true,
      enumerable: true,
      configurable: true,
    })
  }),
  DataSource: jest.fn().mockImplementation(() => ({
    initialize: jest.fn().mockResolvedValue(null as never),
    getRepository: jest.fn().mockReturnValue({
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      findAndCount: jest.fn(),
    }),
  })),
}))

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}))

jest.mock('jwks-rsa', () => {
  return jest.fn(() => ({
    getSigningKey: jest.fn(),
  }))
})

jest.mock('crypto', () => ({
  createHmac: jest.fn().mockReturnValue({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn().mockReturnValue('mock-hash'),
  }),
}))

jest.setTimeout(10000)
