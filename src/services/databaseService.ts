import { AppDataSource } from '../config/data-source'
import { User } from '../entity/User'
import { createError } from '../middlewares/errorHandler'

export class DatabaseService {
  static async createUser(email: string, name?: string) {
    try {
      const userRepository = AppDataSource.getRepository(User)
      const user = userRepository.create({
        email,
        name: name,
        role: 'user',
        isOnboarded: false,
      })
      return await userRepository.save(user)
    } catch (error) {
      console.error(error)
      throw createError.internalError('Error creating user or logging in!')
    }
  }

  static async findUserByEmail(email: string) {
    try {
      const userRepository = AppDataSource.getRepository(User)
      const user = await userRepository.findOne({ where: { email } })
      return user
    } catch (error) {
      console.error(error)
      throw createError.internalError('Error finding email!')
    }
  }
}
