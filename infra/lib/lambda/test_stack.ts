import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as path from "path";
import * as lambda from "aws-cdk-lib/aws-lambda";

export class TestStack extends cdk.Stack {
  constructor(construct: Construct, id: string, props?: cdk.StackProps) {
    super(construct, id, props);

    const lambdaFunction = new lambda.Function(this, "test-lambda", {
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      handler: "handler.main",
      code: lambda.Code.fromAsset(path.join(__dirname, "./")),
    });
  }
}
