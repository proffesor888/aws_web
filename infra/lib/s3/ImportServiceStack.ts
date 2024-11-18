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
import * as iam from "aws-cdk-lib/aws-iam";

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

    const Layer = new lambda.LayerVersion(this, "Layer", {
      code: lambda.Code.fromAsset(
        path.join(__dirname, "../", "../", "aws-cdk-lib-layer")
      ), // Adjust the path as necessary
      compatibleRuntimes: [lambda.Runtime.NODEJS_20_X], // Specify compatible runtimes,
    });

    const CVSLayer = new lambda.LayerVersion(this, "CVSLayer", {
      code: lambda.Code.fromAsset(path.join(__dirname, "../", "../", "layers")), // Adjust the path as necessary
      compatibleRuntimes: [lambda.Runtime.NODEJS_20_X], // Specify compatible runtimes,
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
        layers: [Layer, CVSLayer],
      }
    );

    importProductsFileFunction.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["s3:GetObject", "s3:PutObject"],
        resources: [`${bucket.bucketArn}/uploaded/*`],
      })
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

    const resource = api.root.addResource("import");

    const importProductsFileIntegration = new apigateway.LambdaIntegration(
      importProductsFileFunction,
      {
        integrationResponses: [{ statusCode: "200" }],
        proxy: false,
        // requestTemplates: {
        //   "application/json": JSON.stringify({
        //     context: {
        //       accountId: "$context.accountId",
        //       apiId: "$context.apiId",
        //       context: "$context",
        //     },
        //     filename: "$input.params('filename')",
        //   }),
        // },
        requestTemplates: {
          "application/json": `{ "filename": "$input.params('filename')" }`,
        },
      }
    );

    const lambdaAuthorizerFunction = new lambda.Function(
      this,
      "LambdaAuthorizerFunction",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        memorySize: 1024,
        timeout: cdk.Duration.seconds(5),
        handler: "basic_authorizer_handler.basicAuthorizer",
        code: lambda.Code.fromAsset(path.resolve(__dirname, "../", "lambda")),
        layers: [Layer],
        environment: {
          proffesor888: "TEST_PASSWORD",
        },
      }
    );

    const authorizer = new apigateway.TokenAuthorizer(
      this,
      "APIGatewayAuthorizer",
      {
        handler: lambdaAuthorizerFunction,
        identitySource: "method.request.header.Authorization",
        authorizerName: "LambdaTokenAuthorizer",
      }
    );

    resource.addMethod("GET", importProductsFileIntegration, {
      authorizer: authorizer,
      authorizationType: apigateway.AuthorizationType.CUSTOM,
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
