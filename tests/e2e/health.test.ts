import { jest } from '@jest/globals'
import request from 'supertest'
import testApp from '../testApp'

describe('Health E2E Tests', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(testApp).get('/health')

      expect(response.status).toBe(200)
      expect(response.body).toEqual({
        status: 'ok',
        timestamp: expect.any(String),
        uptime: expect.any(Number),
      })
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date)
      expect(response.body.uptime).toBeGreaterThanOrEqual(0)
    })

    it('should return valid timestamp format', async () => {
      const response = await request(testApp).get('/health')

      expect(response.status).toBe(200)
      const timestamp = new Date(response.body.timestamp)
      expect(timestamp.getTime()).not.toBeNaN()
    })

    it('should return positive uptime', async () => {
      const response = await request(testApp).get('/health')

      expect(response.status).toBe(200)
      expect(response.body.uptime).toBeGreaterThanOrEqual(0)
    })

    it('should handle multiple requests', async () => {
      const response1 = await request(testApp).get('/health')
      const response2 = await request(testApp).get('/health')

      expect(response1.status).toBe(200)
      expect(response2.status).toBe(200)
      expect(response2.body.uptime).toBeGreaterThanOrEqual(
        response1.body.uptime
      )
    })

    it('should return consistent status', async () => {
      const response = await request(testApp).get('/health')

      expect(response.status).toBe(200)
      expect(response.body.status).toBe('ok')
    })
  })
})
