import type { FastifyReply, FastifyRequest } from 'fastify'

import { env } from '@/env'

export async function logout(_: FastifyRequest, reply: FastifyReply) {
  return reply
    .clearCookie('auth', {
      path: '/',
      secure: env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: true,
    })
    .send()
}
