import 'dotenv/config'
import { cognito, COGNITO_CONFIG } from '../config/cognito'
import crypto from 'crypto'
import { createUser, findUserByEmail } from './userService'
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
  const { email, password, name, role = 'user' } = body

  if (!email || !password) {
    throw createError.badRequest('Email and password are required')
  }

  try {
    const user = await findUserByEmail(email)
    if (user) return await signIn(email, password)

    const signUpResponse = await signUp(email, password, role, name)
    const cognitoId = signUpResponse.userSub
    await createUser(cognitoId, email, role, name)
    return signUpResponse
  } catch (error: any) {
    if (error.message) {
      throw error
    }
    throw new Error('Error signing in or registering user')
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
  const response = await cognito.initiateAuth(params).promise()

  return {
    accessToken: response.AuthenticationResult?.AccessToken,
    expiresIn: response.AuthenticationResult?.ExpiresIn,
    tokenType: response.AuthenticationResult?.TokenType,
  }
}

export async function addUserToGroup(
  username: string,
  groupName: string
): Promise<boolean> {
  const params = {
    UserPoolId: COGNITO_CONFIG.USER_POOL_ID!,
    Username: username,
    GroupName: groupName,
  }

  try {
    await cognito.adminAddUserToGroup(params).promise()
    return true
  } catch (error: any) {
    if (
      error.code === 'ResourceNotFoundException' ||
      error.message.includes('does not exist')
    ) {
      try {
        await cognito
          .createGroup({
            UserPoolId: COGNITO_CONFIG.USER_POOL_ID!,
            GroupName: groupName,
            Description: `Group for ${groupName} users`,
          })
          .promise()

        await cognito.adminAddUserToGroup(params).promise()
        return true
      } catch (createError: any) {
        console.error(
          `Failed to create group ${groupName}:`,
          createError.message
        )
        return false
      }
    }

    return false
  }
}

export async function signUp(
  email: string,
  password: string,
  role: string,
  name: string
) {
  if (!email || !password || !role || !name) {
    throw createError.badRequest('Email, password, role and name are required!')
  }
  const params: SignUpRequestParameters = {
    ClientId: COGNITO_CONFIG.CLIENT_ID!,
    Username: email,
    Password: password,
    SecretHash: calculateSecretHash(email),
    UserAttributes: [
      { Name: 'email', Value: email },
      { Name: 'name', Value: name },
    ],
  }

  try {
    const response = await cognito.signUp(params).promise()

    const groupAdded = await addUserToGroup(email, role)
    if (!groupAdded) {
      throw createError.internalError('Failed to add user to group')
    }
    await createUser(response.UserSub, email, role, name)

    return {
      userSub: response.UserSub,
      userConfirmed: response.UserConfirmed,
      message: 'User registered successfully!',
    }
  } catch (error: any) {
    console.error('Cognito signUp error:', error)
    throw new Error(error.message)
  }
}

export async function confirmUser(email: string, code: string) {
  if (!email || !code) {
    throw createError.badRequest('Email and confirmation code are required')
  }

  const params = {
    ClientId: COGNITO_CONFIG.CLIENT_ID!,
    Username: email,
    ConfirmationCode: code,
    SecretHash: calculateSecretHash(email),
  }

  try {
    await cognito.confirmSignUp(params).promise()
    return {
      message: 'User confirmed successfully!',
      success: true,
    }
  } catch (error: any) {
    console.error('Cognito confirmSignUp error:', error)
    throw new Error(error.message || 'Error confirming user')
  }
}
