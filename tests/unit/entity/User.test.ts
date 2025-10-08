import { jest } from '@jest/globals'
import { User } from '../../../src/entity/User'

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
}))

describe('User Entity', () => {
  it('should create User instance with all properties', () => {
    const user = new User()

    expect(user).toHaveProperty('id')
    expect(user).toHaveProperty('email')
    expect(user).toHaveProperty('name')
    expect(user).toHaveProperty('isOnboarded')
    expect(user).toHaveProperty('role')
    expect(user).toHaveProperty('createdAt')
    expect(user).toHaveProperty('updatedAt')
  })

  it('should allow setting and getting id', () => {
    const user = new User()
    user.id = 'test-user-id'

    expect(user.id).toBe('test-user-id')
  })

  it('should allow setting and getting email', () => {
    const user = new User()
    user.email = 'test@example.com'

    expect(user.email).toBe('test@example.com')
  })

  it('should allow setting and getting name', () => {
    const user = new User()
    user.name = 'Test User'

    expect(user.name).toBe('Test User')
  })

  it('should allow setting and getting isOnboarded', () => {
    const user = new User()
    user.isOnboarded = true

    expect(user.isOnboarded).toBe(true)
  })

  it('should allow setting and getting role', () => {
    const user = new User()
    user.role = 'admin'

    expect(user.role).toBe('admin')
  })

  it('should allow setting and getting createdAt', () => {
    const user = new User()
    const date = new Date('2023-01-01')
    user.createdAt = date

    expect(user.createdAt).toEqual(date)
  })

  it('should allow setting and getting updatedAt', () => {
    const user = new User()
    const date = new Date('2023-01-01')
    user.updatedAt = date

    expect(user.updatedAt).toEqual(date)
  })

  it('should allow setting all properties at once', () => {
    const user = new User()
    const createdAt = new Date('2023-01-01')
    const updatedAt = new Date('2023-01-02')

    user.id = 'test-user-id'
    user.email = 'test@example.com'
    user.name = 'Test User'
    user.isOnboarded = true
    user.role = 'user'
    user.createdAt = createdAt
    user.updatedAt = updatedAt

    expect(user.id).toBe('test-user-id')
    expect(user.email).toBe('test@example.com')
    expect(user.name).toBe('Test User')
    expect(user.isOnboarded).toBe(true)
    expect(user.role).toBe('user')
    expect(user.createdAt).toEqual(createdAt)
    expect(user.updatedAt).toEqual(updatedAt)
  })

  it('should handle undefined values', () => {
    const user = new User()

    expect(user.id).toBeUndefined()
    expect(user.email).toBeUndefined()
    expect(user.name).toBeUndefined()
    expect(user.isOnboarded).toBeUndefined()
    expect(user.role).toBeUndefined()
    expect(user.createdAt).toBeUndefined()
    expect(user.updatedAt).toBeUndefined()
  })

  it('should handle null values', () => {
    const user = new User()

    user.id = null as any
    user.email = null as any
    user.name = null as any
    user.isOnboarded = null as any
    user.role = null as any
    user.createdAt = null as any
    user.updatedAt = null as any

    expect(user.id).toBeNull()
    expect(user.email).toBeNull()
    expect(user.name).toBeNull()
    expect(user.isOnboarded).toBeNull()
    expect(user.role).toBeNull()
    expect(user.createdAt).toBeNull()
    expect(user.updatedAt).toBeNull()
  })

  it('should handle different role values', () => {
    const user = new User()

    user.role = 'admin'
    expect(user.role).toBe('admin')

    user.role = 'user'
    expect(user.role).toBe('user')

    user.role = 'moderator'
    expect(user.role).toBe('moderator')
  })

  it('should handle different email formats', () => {
    const user = new User()

    user.email = 'user@example.com'
    expect(user.email).toBe('user@example.com')

    user.email = 'user+tag@example.co.uk'
    expect(user.email).toBe('user+tag@example.co.uk')

    user.email = 'user123@subdomain.example.com'
    expect(user.email).toBe('user123@subdomain.example.com')
  })

  it('should handle boolean values for isOnboarded', () => {
    const user = new User()

    user.isOnboarded = true
    expect(user.isOnboarded).toBe(true)

    user.isOnboarded = false
    expect(user.isOnboarded).toBe(false)
  })
})
