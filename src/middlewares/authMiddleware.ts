import jwt from 'jsonwebtoken'
import jwksClient from 'jwks-rsa'
import { Context, Next } from 'koa'
import { COGNITO_CONFIG } from '../config/cognito'

const client = jwksClient({
  jwksUri: COGNITO_CONFIG.JWKS_URI,
})

function getKey(header: any, callback: any) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err)
    const signingKey = key?.getPublicKey()
    callback(null, signingKey)
  })
}

export async function verifyAccessToken(ctx: Context, next: Next) {
  const authHeader = ctx.headers.authorization
  if (!authHeader) {
    ctx.status = 401
    ctx.body = { message: 'Token not provided' }
    return
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = await new Promise((resolve, reject) => {
      jwt.verify(
        token,
        getKey,
        {
          algorithms: ['RS256'],
          issuer: COGNITO_CONFIG.ISSUER,
        },
        (err, decoded: any) => {
          if (err) reject(err)
          else if (decoded.token_use !== 'access')
            reject(new Error('Token is not an access token'))
          else resolve(decoded)
        }
      )
    })

    ctx.state.user = decoded
    await next()
  } catch (err: any) {
    ctx.status = 401
    ctx.body = { message: 'Invalid token', error: err.message }
  }
}
