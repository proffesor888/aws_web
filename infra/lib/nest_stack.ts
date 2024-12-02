import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import {
  aws_apigateway as apigateway,
  aws_secretsmanager as secretsmanager,
} from "aws-cdk-lib";
import * as rds from "aws-cdk-lib/aws-rds";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as cdk from "aws-cdk-lib";
import * as path from "path";
import { Construct } from "constructs";

export class NestStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const databaseUsername = process.env.DATABASE_USERNAME;
    const databasePassword = process.env.DATABASE_PASSWORD;

    const vpc = new ec2.Vpc(this, "MyVPC", {
      maxAzs: 2, // Default is all AZs in the region
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: "PublicSubnet",
          subnetType: ec2.SubnetType.PUBLIC,
        },
      ],
    });

    const securityGroup = new ec2.SecurityGroup(this, "DatabaseSecurityGroup", {
      vpc,
      description: "Allow access to RDS from VPC",
      allowAllOutbound: true,
    });

    securityGroup.addIngressRule(
      ec2.Peer.ipv4(vpc.vpcCidrBlock),
      ec2.Port.tcp(5432),
      "Allow PostgreSQL access from within the VPC"
    );

    // Instance properties
    const instanceProps: rds.DatabaseInstanceProps = {
      engine: rds.DatabaseInstanceEngine.postgres({
        version: rds.PostgresEngineVersion.VER_16_4,
      }),
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T3,
        ec2.InstanceSize.MICRO
      ),
      vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      securityGroups: [securityGroup],
      multiAz: false,
      autoMinorVersionUpgrade: false,
      allocatedStorage: 20,
      storageType: rds.StorageType.GP2,
      deletionProtection: false,
      databaseName: "Postgress",
    };

    new rds.DatabaseInstance(this, "RDSInstance", instanceProps);

    const lambdaFunction = new lambdaNodejs.NodejsFunction(
      this,
      "LambdaFunction",
      {
        runtime: lambda.Runtime.NODEJS_20_X,
        entry: path.join(
          __dirname,
          "..",
          "..",
          "nestjs",
          "nodejs-aws-cart-api",
          "dist",
          "main.js"
        ),
        bundling: {
          externalModules: [
            "aws-sdk",
            "@nestjs/microservices",
            "class-transformer",
            "@nestjs/websockets/socket-module",
            "cache-manager",
            "class-validator",
          ], // Exclude non-runtime dependencies
        },
        handler: "bootstrap",
        vpc,
        allowPublicSubnet: true,
        securityGroups: [securityGroup],
        environment: {
          DATABASE_USERNAME: process.env.DATABASE_USERNAME || "",
          DATABASE_PASSWORD: process.env.DATABASE_PASSWORD || "",
        },
      }
    );

    // dbInstance.connections.allowDefaultPortFrom(lambdaFunction);
    // dbCredentialsSecret.grantRead(lambdaFunction);

    const api = new apigateway.RestApi(this, "NestApi", {
      restApiName: "Nest Service",
      description: "This service serves a Nest.js application.",
    });

    const getLambdaIntegration = new apigateway.LambdaIntegration(
      lambdaFunction
    );

    const resource = api.root.addResource("carts");
    resource.addMethod("GET", getLambdaIntegration); // Add more methods as needed
    resource.addMethod("POST", getLambdaIntegration);
  }
}
