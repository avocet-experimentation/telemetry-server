import Fastify from "fastify";
import mercurius from "mercurius";
import mercuriusLogging from "mercurius-logging";
import cors from '@fastify/cors';
import { resolvers } from "./graphql/resolvers";
import { schemas } from "./graphql/schemas";

const app = Fastify({
  logger: true,
  disableRequestLogging: true,
});

await app.register(cors, { origin: '*' });
await app.register(mercurius, {
  schema: schemas,
  resolvers,
  graphiql: true,
});

await app.register(mercuriusLogging);
app.listen({ port: 3000 });
