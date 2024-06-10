import type { FastifyReply, FastifyRequest } from 'fastify'

import { prisma } from '@/lib/prisma'

import { z } from 'zod'

export async function create(request: FastifyRequest, reply: FastifyReply) {
  const userId = request.user.sub
  const createBodySchema = z.object({
    text: z.string(),
    athlete_id: z.string(),
  })

  const {
    text,
    athlete_id,
  } = createBodySchema.parse(request.body)

  await prisma.observation.create({
    data: {
      text: text,
      user_id: userId,
      athlete_id: athlete_id,
    },
  })

  return reply.status(201).send()
}
