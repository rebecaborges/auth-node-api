import Router from 'koa-router'
import { listUsers } from '../controllers/userController'

const router = new Router()

router.get('/', listUsers)

export default router
