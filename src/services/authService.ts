import 'dotenv/config'
import { cognito, COGNITO_CONFIG } from '../config/cognito'
import crypto from 'crypto'
import { createUser } from './userService'
import { createError } from '../middlewares/errorHandler'
import {
  SignInOrRegisterBody,
  SignInRequestParameters,
  SignUpRequestParameters,
} from '../interfaces/requests'

function calculateSecretHash(username: string): string {
  return crypto
    .createHmac('SHA256', COGNITO_CONFIG.CLIENT_SECRET!)
    .update(username + COGNITO_CONFIG.CLIENT_ID!)
    .digest('base64')
}

export async function signInOrRegisterService(body: SignInOrRegisterBody) {
  const { email, password, name, role } = body

  if (!email || !password) {
    throw createError.badRequest('Email and password are required')
  }

  try {
    const tokens = await signIn(email, password)
    if (tokens) {
      return tokens
    }
  } catch (err: any) {
    if (err.code === 'UserNotFoundException') {
      const signUpResponse = await signUp(email, password, role)
      const cognitoId = signUpResponse.userSub
      await createUser(cognitoId, email, role, name)
      return signUpResponse
    }
    throw new Error(err.message || 'Error signing in or registering user')
  }
}

export async function signIn(email: string, password: string) {
  const params: SignInRequestParameters = {
    AuthFlow: 'USER_PASSWORD_AUTH',
    ClientId: COGNITO_CONFIG.CLIENT_ID!,
    AuthParameters: {
      USERNAME: email,
      PASSWORD: password,
      SECRET_HASH: calculateSecretHash(email),
    },
  }

  try {
    const response = await cognito.initiateAuth(params).promise()

    return {
      accessToken: response.AuthenticationResult?.AccessToken,
      expiresIn: response.AuthenticationResult?.ExpiresIn,
      tokenType: response.AuthenticationResult?.TokenType,
    }
  } catch {
    throw new Error('Error signing in')
  }
}

export async function signUp(email: string, password: string, role: string) {
  const params: SignUpRequestParameters = {
    ClientId: COGNITO_CONFIG.CLIENT_ID!,
    Username: email,
    Password: password,
    SecretHash: calculateSecretHash(email),
    UserAttributes: [
      { Name: 'email', Value: email },
      { Name: 'custom:role', Value: role },
    ],
  }

  try {
    const response = await cognito.signUp(params).promise()

    return {
      userSub: response.UserSub,
      userConfirmed: response.UserConfirmed,
      message: 'User registered successfully!',
    }
  } catch {
    throw new Error('Error registering user')
  }
}
