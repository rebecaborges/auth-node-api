export interface SignInOrRegisterBody {
  email: string
  password: string
  role: string
  name: string
}

export interface ListUsers {
  page: number
  limit: number
}

export interface UpdateUserData {
  email: string
  name?: string
  role?: string
}

export interface ConfirmEmailBody {
  email: string
  code: string
}

export interface SignInRequestParameters {
  AuthFlow: string
  ClientId: string
  AuthParameters: {
    USERNAME: string
    PASSWORD: string
    SECRET_HASH: string
  }
}

export interface SignUpRequestParameters {
  ClientId: string
  Username: string
  Password: string
  SecretHash: string
  UserAttributes: Array<{ Name: string; Value: string }>
}
