import { Context } from 'koa'

export const createMockContext = (
  overrides: Partial<Context> = {}
): Context => {
  const ctx = {
    request: {
      body: {},
      header: {},
      headers: {},
    },
    response: {
      status: 200,
      body: {},
    },
    state: {},
    status: 200,
    body: {},
    headers: {},
    header: {},
    method: 'GET',
    url: '/',
    path: '/',
    query: {},
    params: {},
    ...overrides,
  } as unknown as Context

  return ctx
}

export const createMockNext = () => jest.fn().mockResolvedValue(undefined)
