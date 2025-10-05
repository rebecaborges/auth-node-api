import Router from 'koa-router'
import { listUsersController } from '../controllers/userController'

const router = new Router()

router.get('/', listUsersController)

export default router
