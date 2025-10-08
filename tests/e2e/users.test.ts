// @ts-nocheck
import { jest } from '@jest/globals'
import request from 'supertest'
import testApp from '../testApp'
import { findUserById } from '../../src/services/userService'
import { listUsers } from '../../src/services/listUsersService'
import jwt from 'jsonwebtoken'
import { mockUser, mockAdminUser } from '../mocks/mockData'
import type { MockCallback } from '../types'

jest.mock('../../src/services/userService')
jest.mock('../../src/services/listUsersService')
jest.mock('jsonwebtoken')
jest.mock('jwks-rsa')

describe('Users E2E Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('GET /users', () => {
        it('should return users list for admin user', async () => {
            const mockToken = 'valid-jwt-token'
            const mockDecodedToken = {
                sub: 'admin-user-id',
                username: 'admin@example.com',
                'cognito:groups': ['admin'],
                token_use: 'access',
            }

                ; (jwt.verify as jest.Mock).mockImplementation(
                    (token, getKey, options, callback: MockCallback) => {
                        callback(null, mockDecodedToken)
                    }
                )
                ; (findUserById as jest.Mock).mockResolvedValue(mockAdminUser)

            const mockListResult = {
                users: [mockUser, mockAdminUser],
                total: 2,
                page: 1,
                limit: 10,
                totalPages: 1,
            }
                ; (listUsers as jest.Mock).mockResolvedValue(mockListResult)

            const response = await request(testApp)
                .get('/users')
                .set('Authorization', `Bearer ${mockToken}`)
                .set('page', '1')
                .set('limit', '10')

            expect(response.status).toBe(200)
            expect(response.body).toEqual({
                message: 'Users retrieved successfully',
                users: {
                    users: [
                        {
                            ...mockUser,
                            createdAt: '2023-01-01T00:00:00.000Z',
                            updatedAt: '2023-01-01T00:00:00.000Z',
                        },
                        {
                            ...mockAdminUser,
                            createdAt: '2023-01-01T00:00:00.000Z',
                            updatedAt: '2023-01-01T00:00:00.000Z',
                        },
                    ],
                    total: 2,
                    page: 1,
                    limit: 10,
                    totalPages: 1,
                },
            })
            expect(findUserById).toHaveBeenCalledWith('admin@example.com')
            expect(listUsers).toHaveBeenCalledWith({ page: '1', limit: '10' })
        })

        it('should return 500 when no authorization header', async () => {
            const response = await request(testApp).get('/users')

            expect(response.status).toBe(500)
            expect(response.body.error).toBe('Internal Server Error')
        })

        it('should return 401 when token is invalid', async () => {
            const mockToken = 'invalid-jwt-token'

                ; (jwt.verify as jest.Mock).mockImplementation(
                    (token, getKey, options, callback) => {
                        callback(new Error('Invalid token'), null)
                    }
                )

            const response = await request(testApp)
                .get('/users')
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
                sub: 'admin-user-id',
                username: 'admin@example.com',
                token_use: 'id',
            }

                ; (jwt.verify as jest.Mock).mockImplementation(
                    (token, getKey, options, callback: MockCallback) => {
                        callback(null, mockDecodedToken)
                    }
                )

            const response = await request(testApp)
                .get('/users')
                .set('Authorization', `Bearer ${mockToken}`)

            expect(response.status).toBe(401)
            expect(response.body).toEqual({
                message: 'Invalid token',
                error: 'Token is not an access token',
            })
        })

        it('should return 401 when user is not authenticated', async () => {
            const mockToken = 'valid-jwt-token'
            const mockDecodedToken = {
                sub: 'user-id',
                username: 'user@example.com',
                'cognito:groups': ['user'],
                token_use: 'access',
            }

                ; (jwt.verify as jest.Mock).mockImplementation(
                    (token, getKey, options, callback: MockCallback) => {
                        callback(null, mockDecodedToken)
                    }
                )
                ; (findUserById as jest.Mock).mockResolvedValue(null)

            const response = await request(testApp)
                .get('/users')
                .set('Authorization', `Bearer ${mockToken}`)

            expect(response.status).toBe(401)
            expect(response.body.error).toBe('User not found in database')
        })

        it('should return 401 when user is not admin', async () => {
            const mockToken = 'valid-jwt-token'
            const mockDecodedToken = {
                sub: 'user-id',
                username: 'user@example.com',
                'cognito:groups': ['user'],
                token_use: 'access',
            }

                ; (jwt.verify as jest.Mock).mockImplementation(
                    (token, getKey, options, callback: MockCallback) => {
                        callback(null, mockDecodedToken)
                    }
                )
                ; (findUserById as jest.Mock).mockResolvedValue(mockUser)

            const response = await request(testApp)
                .get('/users')
                .set('Authorization', `Bearer ${mockToken}`)

            expect(response.status).toBe(401)
            expect(response.body.error).toBe(
                'Access denied! Only admins can access this route.'
            )
        })

        it('should return 401 when database error occurs during user verification', async () => {
            const mockToken = 'valid-jwt-token'
            const mockDecodedToken = {
                sub: 'admin-user-id',
                username: 'admin@example.com',
                'cognito:groups': ['admin'],
                token_use: 'access',
            }

                ; (jwt.verify as jest.Mock).mockImplementation(
                    (token, getKey, options, callback: MockCallback) => {
                        callback(null, mockDecodedToken)
                    }
                )
                ; (findUserById as jest.Mock).mockRejectedValue(
                    new Error('Database error')
                )

            const response = await request(testApp)
                .get('/users')
                .set('Authorization', `Bearer ${mockToken}`)

            expect(response.status).toBe(401)
            expect(response.body.error).toBe('Error verifying user permissions')
        })

        it('should return 401 when list users service fails', async () => {
            const mockToken = 'valid-jwt-token'
            const mockDecodedToken = {
                sub: 'admin-user-id',
                username: 'admin@example.com',
                'cognito:groups': ['admin'],
                token_use: 'access',
            }

                ; (jwt.verify as jest.Mock).mockImplementation(
                    (token, getKey, options, callback: MockCallback) => {
                        callback(null, mockDecodedToken)
                    }
                )
                ; (findUserById as jest.Mock).mockResolvedValue(mockAdminUser)
                ; (listUsers as jest.Mock).mockRejectedValue(new Error('Database error'))

            const response = await request(testApp)
                .get('/users')
                .set('Authorization', `Bearer ${mockToken}`)
                .set('page', '1')
                .set('limit', '10')

            expect(response.status).toBe(401)
            expect(response.body.error).toBe('Database error')
        })

        it('should handle missing pagination headers', async () => {
            const mockToken = 'valid-jwt-token'
            const mockDecodedToken = {
                sub: 'admin-user-id',
                username: 'admin@example.com',
                'cognito:groups': ['admin'],
                token_use: 'access',
            }

                ; (jwt.verify as jest.Mock).mockImplementation(
                    (token, getKey, options, callback: MockCallback) => {
                        callback(null, mockDecodedToken)
                    }
                )
                ; (findUserById as jest.Mock).mockResolvedValue(mockAdminUser)

            const mockListResult = {
                users: [mockUser],
                total: 1,
                page: undefined,
                limit: undefined,
                totalPages: 1,
            }
                ; (listUsers as jest.Mock).mockResolvedValue(mockListResult)

            const response = await request(testApp)
                .get('/users')
                .set('Authorization', `Bearer ${mockToken}`)

            expect(response.status).toBe(200)
            expect(listUsers).toHaveBeenCalledWith({
                page: undefined,
                limit: undefined,
            })
        })

        it('should handle list users error without message', async () => {
            const mockToken = 'valid-jwt-token'
            const mockDecodedToken = {
                sub: 'admin-user-id',
                username: 'admin@example.com',
                'cognito:groups': ['admin'],
                token_use: 'access',
            }

                ; (jwt.verify as jest.Mock).mockImplementation(
                    (token, getKey, options, callback: MockCallback) => {
                        callback(null, mockDecodedToken)
                    }
                )
                ; (findUserById as jest.Mock).mockResolvedValue(mockAdminUser)
                ; (listUsers as jest.Mock).mockRejectedValue(new Error())

            const response = await request(testApp)
                .get('/users')
                .set('Authorization', `Bearer ${mockToken}`)

            expect(response.status).toBe(401)
            expect(response.body.error).toBe('Error listing users')
        })
    })
})
