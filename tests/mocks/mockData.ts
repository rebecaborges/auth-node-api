import { User } from '../../src/entity/User'

export const mockUser: User = {
  id: 'test-user-id',
  email: 'test@example.com',
  name: 'Test User',
  role: 'user',
  isOnboarded: false,
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
}

export const mockAdminUser: User = {
  id: 'test-admin-id',
  email: 'admin@example.com',
  name: 'Admin User',
  role: 'admin',
  isOnboarded: true,
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
}

export const mockSignUpResponse = {
  UserSub: 'test-user-id',
  UserConfirmed: false,
}

export const mockSignInResponse = {
  AuthenticationResult: {
    AccessToken: 'mock-access-token',
    ExpiresIn: 3600,
    TokenType: 'Bearer',
  },
}

export const mockConfirmResponse = {
  success: true,
}

export const mockCognitoUser = {
  sub: 'test-user-id',
  username: 'test@example.com',
  'cognito:groups': ['user'],
  token_use: 'access',
}

export const mockAdminCognitoUser = {
  sub: 'test-admin-id',
  username: 'admin@example.com',
  'cognito:groups': ['admin'],
  token_use: 'access',
}

export const mockRepository = {
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
  findAndCount: jest.fn(),
}
