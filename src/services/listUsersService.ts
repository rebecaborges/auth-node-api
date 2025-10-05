import { AppDataSource } from '../config/data-source'
import { User } from '../entity/User'
import { createError } from '../middlewares/errorHandler'
import { ListUsers } from '../interfaces/requests'

export async function listUsers({ page, limit }: ListUsers) {
  try {
    const userRepository = AppDataSource.getRepository(User)
    const [users, total] = await userRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    })
    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  } catch (error) {
    console.error('Error listing users:', error)
    throw createError.internalError('Error listing users!')
  }
}
