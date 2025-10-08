import 'dotenv/config'
import { createError } from '../middlewares/errorHandler'
import { findUserByEmail, updateUser } from './userService'
import { UpdateUserData } from '../interfaces/requests'
import { cognito, COGNITO_CONFIG } from '../config/cognito'

export async function updateUserAccount(
  updateData: UpdateUserData,
  cognitoUser: any
) {
  const { email, name, role } = updateData
  let updates = {}
  let result = null

  const isAdmin = cognitoUser['cognito:groups']?.includes('admin')
  if (!email)
    throw createError.badRequest(
      'Email is required to identify the user to update'
    )

  if (isAdmin) {
    updates = {
      name,
      role,
      isOnboarded: true,
    }
    await updateCognitoGroup(email, role)
    result = await updateUser(email, updates)
  } else {
    updates = {
      name,
      isOnboarded: true,
    }
    result = await updateUser(email, updates)
  }
  return {
    message: 'User updated successfully',
    user: result,
  }
}

async function updateCognitoGroup(email: string, newRole: string | undefined) {
  const ADMIN_GROUP_NAME = Object.freeze({
    admin: 'admin',
  })
  try {
    const user = await findUserByEmail(email)
    if (!user) {
      throw createError.notFound('User not found')
    }

    if (newRole !== ADMIN_GROUP_NAME.admin) {
      await cognito
        .adminRemoveUserFromGroup({
          UserPoolId: COGNITO_CONFIG.USER_POOL_ID!,
          Username: user.id,
          GroupName: ADMIN_GROUP_NAME.admin,
        })
        .promise()
    }
    await cognito
      .adminAddUserToGroup({
        UserPoolId: COGNITO_CONFIG.USER_POOL_ID!,
        Username: user.id,
        GroupName: newRole!,
      })
      .promise()
  } catch (error: any) {
    console.error('Failed to update user group in Cognito:', error.message)
    throw new Error(`Failed to update user role in Cognito: ${error.message}`)
  }
}
