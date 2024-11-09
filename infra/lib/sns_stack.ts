import * as path from "path";
import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { SnsEventSource } from "aws-cdk-lib/aws-lambda-event-sources";
import * as sns from "aws-cdk-lib/aws-sns";
import * as subscriptions from "aws-cdk-lib/aws-sns-subscriptions";

export class ProductSnsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const productTopic = new sns.Topic(this, "createProductTopic");

    const lambdaFunction = new lambda.Function(this, "sns-lambda", {
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      handler: "sns_handler.main",
      code: lambda.Code.fromAsset(path.join(__dirname, "./", "lambda")),
    });

    const emailSubscription = new subscriptions.EmailSubscription(
      "proffesor888@gmail.com"
    );

    productTopic.addSubscription(emailSubscription);

    lambdaFunction.addEventSource(new SnsEventSource(productTopic));
  }
}
