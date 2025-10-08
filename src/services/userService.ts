import { AppDataSource } from '../config/data-source'
import { User } from '../entity/User'
import { createError } from '../middlewares/errorHandler'

export async function createUser(
  cognitoId: string,
  email: string,
  role: string,
  name?: string
) {
  try {
    const userRepository = AppDataSource.getRepository(User)
    const user = userRepository.create({
      id: cognitoId,
      email,
      name,
      role,
      isOnboarded: false,
    })
    return await userRepository.save(user)
  } catch (error) {
    console.error('Error creating user or logging in:', error)
    throw createError.internalError('Error creating user or logging in!')
  }
}

export async function findUserByEmail(email: string) {
  try {
    const userRepository = AppDataSource.getRepository(User)
    const user = await userRepository.findOne({
      where: { email }
    })
    return user
  } catch (error) {
    console.error('Error finding user:', error)
    throw createError.internalError('User not found!')
  }
}

export async function findUserById(id: string) {
  try {
    const userRepository = AppDataSource.getRepository(User)
    const user = await userRepository.findOne({
      where: { id }
    })
    return user
  } catch (error) {
    console.error('Error finding user:', error)
    throw createError.internalError('User not found!')
  }
}

export async function updateUser(email: string, updates: Partial<User>) {
  try {
    const userRepository = AppDataSource.getRepository(User)
    const user = await findUserByEmail(email)

    if (!user) {
      throw createError.notFound('User not found')
    }

    Object.assign(user, updates)
    return await userRepository.save(user)
  } catch (error) {
    throw createError.internalError('Error updating user!')
  }
}
