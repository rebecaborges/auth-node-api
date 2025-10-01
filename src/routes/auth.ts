import Router from 'koa-router'
import { signInOrRegister } from '../controllers/authController'

const router = new Router()

router.post('/', signInOrRegister)

export default router
