import { FastifyInstance } from "fastify";
import { readCsv } from "./upload_file";
import fastifyMultipart from '@fastify/multipart';
import { verifyJWT } from '@/http/middlewares/verify-jwt'

const csvParser = require('csv-parser');

export async function uploadRoutes(app: FastifyInstance) {
    app.addHook('onRequest', verifyJWT)
    app.register(fastifyMultipart, {
        attachFieldsToBody: true
    });
    app.post('/importCsv', readCsv)
}