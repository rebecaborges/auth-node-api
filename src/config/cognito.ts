import 'dotenv/config'
import AWS from 'aws-sdk'

const REGION = process.env.AWS_REGION
const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID

AWS.config.update({ region: REGION })

export const cognito = new AWS.CognitoIdentityServiceProvider()

export const COGNITO_CONFIG = {
  CLIENT_ID: process.env.COGNITO_CLIENT_ID,
  CLIENT_SECRET: process.env.COGNITO_CLIENT_SECRET,
  REGION,
  USER_POOL_ID,
  ISSUER: `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}`,
  JWKS_URI: `https://cognito-idp.${REGION}.amazonaws.com/${USER_POOL_ID}/.well-known/jwks.json`,
}
