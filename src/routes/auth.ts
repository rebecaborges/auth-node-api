import Router from 'koa-router'
import { signInOrRegister } from '../controllers/authController'
import { validateEmail } from '../middlewares/emailValidation'

const router = new Router()

router.post('/', validateEmail, signInOrRegister)

export default router
