import type {
  FastifyBaseLogger,
  FastifyInstance,
  FastifyRequest,
  FastifyReply,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerDefault,
} from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";

declare global {
  type AppInstance = FastifyInstance<
    RawServerDefault,
    RawRequestDefaultExpression<RawServerDefault>,
    RawReplyDefaultExpression<RawServerDefault>,
    FastifyBaseLogger,
    ZodTypeProvider
  >;
  
  type FRequest = FastifyRequest;
  type FReply = FastifyReply;
}

export {};