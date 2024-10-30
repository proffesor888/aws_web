import * as s3 from "aws-cdk-lib/aws-s3";
import * as cdk from "aws-cdk-lib";
import { aws_s3, RemovalPolicy } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3notifications from "aws-cdk-lib/aws-s3-notifications";
import * as path from "path";
import {
  AwsCustomResource,
  AwsCustomResourcePolicy,
} from "aws-cdk-lib/custom-resources";
import * as apigateway from "aws-cdk-lib/aws-apigateway";

export class ImportServiceStack extends cdk.Stack {
  constructor(construct: Construct, id: string, options?: cdk.StackProps) {
    super(construct, id, options);

    const bucket = new aws_s3.Bucket(this, "service", {
      autoDeleteObjects: true,
      removalPolicy: RemovalPolicy.DESTROY,
      bucketName: "servicenkjsfngjknsrjktejt535",
    });

    new AwsCustomResource(this, "CreateFolder", {
      onCreate: {
        service: "S3",
        action: "putObject",
        parameters: {
          Bucket: bucket.bucketName,
          Key: "uploaded",
          Body: "",
        },
        physicalResourceId: {
          id: `${bucket.bucketName}-uploaded`,
        },
      },
      policy: AwsCustomResourcePolicy.fromSdkCalls({
        resources: [bucket.arnForObjects("*")],
      }),
    });

    const importProductsFileFunction = new lambda.Function(
      this,
      "import-products",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        memorySize: 1024,
        timeout: cdk.Duration.seconds(5),
        handler: "importProductsFile.importProductsFile",
        code: lambda.Code.fromAsset(path.resolve(__dirname, "../", "lambda")),
      }
    );

    const importFileParserFunction = new lambda.Function(
      this,
      "import-file-parser",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        memorySize: 1024,
        timeout: cdk.Duration.seconds(5),
        handler: "importProductsFile.importFileParser",
        code: lambda.Code.fromAsset(path.resolve(__dirname, "../", "lambda")),
      }
    );

    const api = new apigateway.RestApi(this, "api-bucket", {
      restApiName: "API Bucket",
      description: "This API serves the Lambda functions for S3.",
    });

    const importProductsFileIntegration = new apigateway.LambdaIntegration(
      importProductsFileFunction,
      {
        integrationResponses: [{ statusCode: "200" }],
        proxy: false,
        requestTemplates: {
          "application/json": `{ "filename": "$input.params('filename')" }`,
        },
      }
    );

    const resource = api.root.addResource("import");
    resource.addMethod("GET", importProductsFileIntegration, {
      methodResponses: [{ statusCode: "200" }],
    });

    bucket.grantReadWrite(importProductsFileFunction);
    bucket.grantReadWrite(importFileParserFunction);

    bucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3notifications.LambdaDestination(importFileParserFunction),
      { prefix: "uploaded/" }
    );
  }
}
