import * as path from "path";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { SqsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";

export class ProductSqsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const catalogItemsQueue = new sqs.Queue(this, "catalogItemsQueue");

    const lambdaFunction = new lambda.Function(this, "catalogBatchProcess", {
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      handler: "sqs_handler.catalogBatchProcess",
      code: lambda.Code.fromAsset(path.join(__dirname, "./", "lambda")),
    });

    lambdaFunction.addEventSource(
      new SqsEventSource(catalogItemsQueue, { batchSize: 5 })
    );
  }
}
