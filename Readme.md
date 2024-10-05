# Effect X-Ray

AWS X-Ray Powertools SDK for Effect. This experimental library allows you to trace your Effect programs and send them to AWS X-Ray leveraging the [Powertools SDK](https://docs.powertools.aws.dev/lambda/typescript/latest/core/tracer/).

Install (NodeJS):

```bash
npx jsr add @sellooh/effect-xray
```

```typescript
const example = Effect.gen(function* () {
  yield* Effect.log("Hello");
}).pipe(
  Effect.withSpan("Example"),
  Effect.provide(XraySdk.layer())
);
```

Check out the a more complete example in the [demo-app](https://github.com/sellooh/effect-xray/blob/main/demo-app/functions/lambda.ts).

Traces:

![Traces](./docs/traces.png)
![TracesFault](./docs/traces-fault.png)

Logs:

![Logs](./docs/logs.png)
