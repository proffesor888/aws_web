import { Effect } from "aws-cdk-lib/aws-iam";
import {
  APIGatewayTokenAuthorizerEvent,
  CustomAuthorizerResult,
} from "aws-lambda";

export async function basicAuthorizer(
  event: APIGatewayTokenAuthorizerEvent
): Promise<unknown> {
  const authorizationHeader = event.authorizationToken;

  if (!authorizationHeader) {
    return {
      httpStatus: "401",
      message: "Authorization header is not provided",
    };
    // throw new Error("Unauthorized");
  }

  const encodedCredentials = authorizationHeader.split(" ")[1];
  const [username, password] = Buffer.from(encodedCredentials, "base64")
    .toString("utf8")
    .split(":");

  const envPassword = process.env[username];
  // const envPassword = process.env.BASIC_AUTH_PASSWORD;

  if (process.env[username] && password === envPassword) {
    return generatePolicy("user", Effect.ALLOW, event.methodArn);
  } else {
    return {
      httpStatus: "403",
      message: "Cccess is denied for this user ",
    };
  }
}

function generatePolicy(
  principalId: string,
  effect: Effect,
  resource: string
): CustomAuthorizerResult {
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
