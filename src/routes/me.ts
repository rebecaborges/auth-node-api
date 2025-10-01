import Router from 'koa-router'
import { getMe } from '../controllers/userController'

const router = new Router()

router.get('/', getMe)

export default router
