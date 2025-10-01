import Router from 'koa-router'
import { editAccount } from '../controllers/userController'

const router = new Router()

router.put('/', editAccount)

export default router
