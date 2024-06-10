import type { FastifyReply, FastifyRequest } from 'fastify'

import { prisma } from '@/lib/prisma'

import { z } from 'zod'

import dayjs from 'dayjs'

export async function search(request: FastifyRequest, reply: FastifyReply) {

  const searchQuerySchema = z.object({
    pageIndex: z.coerce.number().min(0),
    athlete_id: z.string(),
  })

  const PAGE_SIZE = 10

  const { pageIndex, athlete_id } = searchQuerySchema.parse(request.query)

  const observation = await prisma.observation.findMany({
    skip: pageIndex * PAGE_SIZE,
    take: PAGE_SIZE,

    where: {
        athlete_id: String(athlete_id)
    },

    select: {
      id: true,
      text: true
    },
  })


  const result = {
    observation: observation,

    meta: {
      pageIndex,
      perPage: PAGE_SIZE,
      totalCount: 1,
    },
  }

  return reply.send(result)
}
