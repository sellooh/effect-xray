import { Layer } from "effect/Layer";
import * as internal from "./internal/tracer";

/**
 * @category layers
 */
export const layer: Layer<never, never, never> = internal.layer;
