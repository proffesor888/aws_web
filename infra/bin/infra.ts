// #!/usr/bin/env node
// import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import { DeployWebAppStack } from "../lib/deploy_webapp_stack";
import { TestStack } from "../lib/lambda/test_stack";
import { DBStockStack } from "../lib/db/db_stock_stack";
import { DBProductsStack } from "../lib/db/db_products_stack";
import { ImportServiceStack } from "../lib/s3/ImportServiceStack";
import { ProductSqsStack } from "../lib/sqs_stack";
import { ProductSnsStack } from "../lib/sns_stack";
import { NestStack } from "../lib/nest_stack";

const envAPS = { account: process.env["ACCOUNT_ID"], region: "us-east-1" };

const app = new cdk.App();
new DeployWebAppStack(app, "InfraStack", {});
new TestStack(app, "TestStack", {});
new DBStockStack(app, "Stock");
new DBProductsStack(app, "Products");
new ImportServiceStack(app, "ImportService");
new ProductSqsStack(app, "ProductSqsStack");
new ProductSnsStack(app, "ProductSnsStack");
new NestStack(app, "NestStack", { env: envAPS });
