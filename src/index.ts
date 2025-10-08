import 'reflect-metadata'
import Koa from 'koa'
import bodyParser from 'koa-bodyparser'
import router from './routes'
import { AppDataSource } from './config/data-source'
import { errorHandler } from './middlewares/errorHandler'

const app = new Koa()

app.use(errorHandler)
app.use(bodyParser())
app.use(router.routes()).use(router.allowedMethods())

async function startApi() {
  try {
    await AppDataSource.initialize()
    console.info('✅ Database connected successfully')

    app.listen(process.env.PORT || 3000, () =>
      console.info(`🚀 Server running on http://localhost:${process.env.PORT || 3000}`)
    )
  } catch (err) {
    console.error('❌ Error during initialization: ', err)
  }
}

startApi()
