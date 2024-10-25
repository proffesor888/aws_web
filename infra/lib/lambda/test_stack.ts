import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as path from "path";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";

export class TestStack extends cdk.Stack {
  constructor(construct: Construct, id: string, props?: cdk.StackProps) {
    super(construct, id, props);

    const getProductsListFunction = new lambda.Function(
      this,
      "get-products-lambda",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        memorySize: 1024,
        timeout: cdk.Duration.seconds(5),
        handler: "handler.getProductsList",
        code: lambda.Code.fromAsset(path.join(__dirname, "./")),
      }
    );

    const getProductByIdFunction = new lambda.Function(
      this,
      "get-product-by-id",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        memorySize: 1024,
        timeout: cdk.Duration.seconds(5),
        handler: "handler.getProductById",
        code: lambda.Code.fromAsset(path.join(__dirname, "./")),
      }
    );

    const getAllStockFunction = new lambda.Function(this, "get-all-stock", {
      runtime: lambda.Runtime.NODEJS_20_X,
      memorySize: 1024,
      timeout: cdk.Duration.seconds(5),
      handler: "handler.getAllStock",
      code: lambda.Code.fromAsset(path.join(__dirname, "./")),
    });

    const api = new apigateway.RestApi(this, "api", {
      restApiName: "API Gateway",
      description: "This API serves the Lambda functions.",
    });

    const getAllStockIntegration = new apigateway.LambdaIntegration(
      getAllStockFunction,
      {
        integrationResponses: [{ statusCode: "200" }],
        proxy: false,
      }
    );

    const getProductsListIntegration = new apigateway.LambdaIntegration(
      getProductsListFunction,
      {
        integrationResponses: [{ statusCode: "200" }],
        proxy: false,
      }
    );

    const getProductByIdIntegration = new apigateway.LambdaIntegration(
      getProductByIdFunction,
      {
        requestTemplates: {
          "application/json": `{ "id": "$input.params('id')" }`,
        },
        integrationResponses: [{ statusCode: "200" }],
        proxy: false,
      }
    );

    const productsList = api.root.addResource("products");
    const stock = api.root.addResource("stock");

    const productById = productsList.addResource("{id}");

    productsList.addMethod("GET", getProductsListIntegration, {
      methodResponses: [{ statusCode: "200" }],
    });

    productById.addMethod("GET", getProductByIdIntegration, {
      methodResponses: [{ statusCode: "200" }],
    });

    stock.addMethod("GET", getAllStockIntegration, {
      methodResponses: [{ statusCode: "200" }],
    });
  }
}
