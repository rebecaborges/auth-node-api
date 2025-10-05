import Router from 'koa-router'
import { confirmEmail } from '../controllers/authController'

const router = new Router()

router.post('/', confirmEmail)

export default router
