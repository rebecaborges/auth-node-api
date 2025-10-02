import 'reflect-metadata'
import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import router from './routes'
import { AppDataSource } from './config/data-source'

const app = new Koa()
app.use(bodyParser())
app.use(router.routes()).use(router.allowedMethods())

async function startApi() {
  try {
    await AppDataSource.initialize()
    console.log('✅ Database connected successfully')

    app.listen(3000, () =>
      console.log('🚀 Server running on http://localhost:3000')
    )
  } catch (err) {
    console.error('❌ Error during initialization: ', err)
  }
}

startApi()
