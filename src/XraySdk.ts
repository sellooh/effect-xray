import { Effect, Layer } from "effect";
import * as Tracer from "./Tracer";

/**
 * AWS X-Ray Powertools SDK for Effect
 * (experimental)
 *
 * @since 1.0.0
 * @category layer
 */
export const layer = (): Layer.Layer<never> =>
  Layer.unwrapEffect(Effect.sync(() => Tracer.layer));
