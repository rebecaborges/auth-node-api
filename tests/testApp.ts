import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import router from '../src/routes'
import { errorHandler } from '../src/middlewares/errorHandler'
import { Server } from 'http'

const createTestApp = () => {
  const app = new Koa()

  app.use(errorHandler)
  app.use(bodyParser())
  app.use(router.routes()).use(router.allowedMethods())

  const server = new Server(app.callback())
  const testApp = app as any

  testApp.address = () => server.address()
  testApp.listen = server.listen.bind(server)
  testApp.close = server.close.bind(server)

  return testApp
}

export default createTestApp()
