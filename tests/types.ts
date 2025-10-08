export interface MockError extends Error {
  code?: string
  status?: number
}

export interface MockCallback {
  (error: Error | null, decoded?: any): void
}

declare global {
  interface Error {
    code?: string
    status?: number
  }
}

export interface MockAuthResponse {
  accessToken?: string
  expiresIn?: number
  tokenType?: string
  userSub?: string
  userConfirmed?: boolean
  message?: string
}

export interface MockUserResponse {
  message: string
  user: {
    name: string
    role: string
    id: string
    email: string
    isOnboarded: boolean
    createdAt?: Date
    updatedAt?: Date
  }
}

export interface MockConfirmResponse {
  message: string
  success: boolean
}

export type TestApp = any
