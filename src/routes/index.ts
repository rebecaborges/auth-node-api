import Router from 'koa-router'
import authRoutes from './auth'
import meRoutes from './me'
import editAccountRoutes from './editAccount'
import userRoutes from './users'
import { verifyAccessToken } from '../middlewares/authMiddleware'
import { requireAdmin } from '../middlewares/roleMiddleware'
import { validateEmail } from '../middlewares/emailValidation'

const router = new Router()

router.use('/auth', validateEmail, authRoutes.routes())
router.use('/me', verifyAccessToken, requireAdmin, meRoutes.routes())
router.use('/users', verifyAccessToken, requireAdmin, userRoutes.routes())
router.use(
  '/edit-account',
  verifyAccessToken,
  requireAdmin,
  editAccountRoutes.routes()
)

export default router
