import Router from 'koa-router'
import authRoutes from './auth'
import confirmRoutes from './confirm'
import meRoutes from './me'
import editAccountRoutes from './editAccount'
import userRoutes from './users'
import healthRoutes from './health'
import { verifyAccessToken } from '../middlewares/authMiddleware'
import { requireAdmin } from '../middlewares/roleMiddleware'
import { validateEmail } from '../middlewares/emailValidation'

const router = new Router()

router.use('/health', healthRoutes.routes())
router.use('/auth', validateEmail, authRoutes.routes())
router.use('/confirm', confirmRoutes.routes())
router.use('/me', verifyAccessToken, meRoutes.routes())
router.use('/users', verifyAccessToken, requireAdmin, userRoutes.routes())
router.use('/edit-account', verifyAccessToken, editAccountRoutes.routes())

export default router
