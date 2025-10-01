import 'reflect-metadata'
import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import router from './routes'

const app = new Koa()
app.use(bodyParser())
app.use(router.routes()).use(router.allowedMethods())

async function startApi() {
  try {
    app.listen(3000, () =>
      console.log('🚀 Server running on http://localhost:3000')
    )
  } catch (err) {
    console.error('❌ Error during initialization: ', err)
  }
}

startApi()
