import { createError } from '../middlewares/errorHandler'
import { updateUser } from './userService'
import { UpdateUserData } from '../interfaces/requests'

export async function updateUserAccount(updateData: UpdateUserData) {
  const { name, email } = updateData

  if (!email) {
    throw createError.badRequest(
      'Email is required to identify the user to update'
    )
  }

  if (!name) {
    throw createError.badRequest('Name is required for update')
  }

  const updates = {
    name: name,
    isOnboarded: true,
  }

  const result = await updateUser(email, updates)

  return {
    message: 'User updated successfully',
    user: result,
  }
}
