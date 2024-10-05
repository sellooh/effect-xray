/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "demo-app",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
    };
  },
  async run() {
    const fn = new sst.aws.Function("Effect", {
      handler: "functions/lambda.handler",
      url: true,
      transform: {
        function: {
          tracingConfig: {
            mode: "Active",
          },
        },
      },
      permissions: [
        {
          actions: ["xray:PutTraceSegments", "xray:PutTelemetryRecords"],
          resources: ["*"],
        },
      ],
    });
    return {
      url: fn.url,
    };
  },
});
