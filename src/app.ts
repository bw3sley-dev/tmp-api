import fastify from 'fastify'

import { env } from './env'

import { ZodError } from 'zod'

import { fastifyCors } from '@fastify/cors'

import { fastifyJwt } from '@fastify/jwt'

import fastifyCookie from '@fastify/cookie'

import { authRoutes } from './http/controllers/auth/routes'
import { metricsRoutes } from './http/controllers/metrics/routes'
import { userRoutes } from './http/controllers/users/routes'
import { orgRoutes } from './http/controllers/orgs/routes'
import { athleteRoutes } from './http/controllers/athletes/routes'
import { uploadRoutes } from './http/controllers/upload/routes'
import { observationRoutes } from './http/controllers/observation/routes'

export const app = fastify()

app.register(fastifyCors, {
  credentials: true,
  allowedHeaders: ['content-type'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],

  origin: (_, callback) => {
    callback(null, true)
  },
})

app.register(fastifyJwt, {
  secret: env.JWT_SECRET,

  cookie: {
    cookieName: 'auth',
    signed: false,
  },
})

app.register(fastifyCookie)

app.register(authRoutes)
app.register(orgRoutes)
app.register(userRoutes)
app.register(athleteRoutes)
app.register(metricsRoutes)
app.register(uploadRoutes)
app.register(observationRoutes)

app.setErrorHandler((error, _, reply) => {
  if (error instanceof ZodError) {
    return reply.status(400).send({
      message: 'Erro de validação',
      issues: error.format(),
    })
  }

  if (env.NODE_ENV !== 'production') {
    console.log(error)
  } else {
    // TODO: Here we should log to an external tool like DataDog/NewRelic/Sentry
  }

  return reply.status(500).send({ message: 'Error interno de servidor' })
})
