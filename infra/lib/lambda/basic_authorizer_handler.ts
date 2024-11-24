import { Effect } from "aws-cdk-lib/aws-iam";
import {
  APIGatewayTokenAuthorizerEvent,
  APIGatewayAuthorizerResult,
  APIGatewayAuthorizerResultContext,
} from "aws-lambda";

export async function basicAuthorizer(event: APIGatewayTokenAuthorizerEvent) {
  const authorizationHeader = event.authorizationToken;

  if (!authorizationHeader) {
    return generatePolicy("default", Effect.DENY, event.methodArn, {
      authorized: false,
    });
  }

  const encodedCredentials = authorizationHeader.split(" ")[1];
  const [username, password] = Buffer.from(encodedCredentials, "base64")
    .toString("utf8")
    .split("=");
  const envPassword = process.env[username];
  if (process.env[username] && password === envPassword) {
    return generatePolicy("default", Effect.ALLOW, event.methodArn, {
      authorized: true,
    });
  }
  return generatePolicy("default", Effect.DENY, event.methodArn, {
    authorized: false,
  });
}

function generatePolicy(
  principalId: string,
  effect: Effect,
  resource: string,
  context: APIGatewayAuthorizerResultContext | null
): unknown {
  return {
    principalId,
    policyDocument: {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: effect,
          Resource: resource,
        },
      ],
    },
  };
}
