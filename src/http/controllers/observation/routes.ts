import type { FastifyInstance } from 'fastify'

import { update } from './update'
import { create } from './create'
import { search } from './search'


import { verifyJWT } from '@/http/middlewares/verify-jwt'

export async function observationRoutes(app: FastifyInstance) {
  app.addHook('onRequest', verifyJWT)

  app.get('/observation/athlete', search)

  app.post('/observation', create)

  app.patch('/observation/:id', update)
}
