import Router from 'koa-router'
import authRoutes from './auth'
import meRoutes from './me'
import editAccountRoutes from './editAccount'
import userRoutes from './users'

const router = new Router()

router.use('/auth', authRoutes.routes())
router.use('/me', meRoutes.routes())
router.use('/edit-account', editAccountRoutes.routes())
router.use('/users', userRoutes.routes())

export default router
