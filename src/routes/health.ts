import Router from 'koa-router'
import { healthController } from '../controllers/userController'

const router = new Router()

router.get('/', healthController)

export default router
