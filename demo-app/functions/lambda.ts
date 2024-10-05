import { APIGatewayProxyEventV2, LambdaFunctionURLHandler } from "aws-lambda";
import { Effect } from "effect";
import * as XraySdk from "../../src/XraySdk";

// Function to simulate a task with possible subtasks
const task = (
  name: string,
  delay: number,
  children: ReadonlyArray<Effect.Effect<void>> = []
) =>
  Effect.gen(function* () {
    yield* Effect.log(name);
    yield* Effect.sleep(`${delay} millis`);
    for (const child of children) {
      yield* child;
    }
    yield* Effect.sleep(`${delay} millis`);
  }).pipe(Effect.withSpan(name));

const poll = task("/poll", 1);

// Create a program with tasks and subtasks
const simulation = task("client", 2, [
  task("/api", 3, [
    task("/authN", 4, [task("/authZ", 5)]),
    task("/payment Gateway", 6, [task("DB", 7), task("Ext. Merchant", 8)]),
    task("/dispatch", 9, [
      task("/dispatch/search", 10),
      // poll,
      Effect.all([poll, poll, poll], { concurrency: "inherit" }),
      task("/pollDriver/id", 11),
    ]),
  ]),
]);

export const program = (event: APIGatewayProxyEventV2) =>
  Effect.gen(function* () {
    yield* simulation;
    if (event.queryStringParameters?.bad === "true") {
      yield* Effect.fail(new BadInputError());
    }
    if (event.queryStringParameters?.fatal === "true") {
      yield* Effect.dieMessage("Fatal error");
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Success" }),
    };
  }).pipe(Effect.withSpan("Program"));

class BadInputError {
  readonly _tag = "BadInputError";
}

export const handler: LambdaFunctionURLHandler = async (event) => {
  const liveProgram = program(event).pipe(
    Effect.catchTags({
      BadInputError: () =>
        Effect.succeed({
          statusCode: 400,
          body: JSON.stringify({ message: "Bad input" }),
        }),
    }),
    Effect.catchAllDefect((defect) =>
      Effect.succeed({
        statusCode: 500,
        body: JSON.stringify({ message: `An error occurred: ${defect}` }),
      })
    ),
    Effect.provide(XraySdk.layer())
  );
  return Effect.runPromise(liveProgram);
};