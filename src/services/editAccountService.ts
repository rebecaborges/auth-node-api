import { createError } from '../middlewares/errorHandler'
import { updateUser, findUserByEmail } from './userService'
import { UpdateUserData } from '../interfaces/requests'
import { cognito, COGNITO_CONFIG } from '../config/cognito'


async function updateCognitoGroup(email: string, oldRole: string | undefined, newRole: string | undefined) {
  if (oldRole === newRole) {
    return
  }

  try {
    if (oldRole) {
      await cognito.adminRemoveUserFromGroup({
        UserPoolId: COGNITO_CONFIG.USER_POOL_ID!,
        Username: email,
        GroupName: oldRole
      }).promise()
    }

    if (newRole) {
      await cognito.adminAddUserToGroup({
        UserPoolId: COGNITO_CONFIG.USER_POOL_ID!,
        Username: email,
        GroupName: newRole
      }).promise()
    }
  } catch (error: any) {
    if (error.code === 'ResourceNotFoundException') {
      try {
        await cognito.createGroup({
          UserPoolId: COGNITO_CONFIG.USER_POOL_ID!,
          GroupName: newRole!,
          Description: `Group for ${newRole} users`
        }).promise()

        await cognito.adminAddUserToGroup({
          UserPoolId: COGNITO_CONFIG.USER_POOL_ID!,
          Username: email,
          GroupName: newRole!
        }).promise()
      } catch (createError: any) {
        console.error(`Failed to create group ${newRole}:`, createError.message)
        throw new Error(`Failed to update user role in Cognito: ${createError.message}`)
      }
    } else {
      console.error('Failed to update user group in Cognito:', error.message)
      throw new Error(`Failed to update user role in Cognito: ${error.message}`)
    }
  }
}

export async function updateUserAccount(updateData: UpdateUserData, cognitoUser: any) {
  const { email, name, role } = updateData
  let updates = {}
  let result = null

  const isAdmin = cognitoUser['cognito:groups']?.includes('admin')
  if (!email) throw createError.badRequest('Email is required to identify the user to update')

  if (isAdmin) {
    updates = {
      name,
      role,
      isOnboarded: true,
    }
    await updateCognitoGroup(email, 'user', role)
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
