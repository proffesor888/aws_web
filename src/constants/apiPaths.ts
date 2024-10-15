const ID = "a0r5eyhpk7";
const REGION = "us-east-1";
const ENV = "prod";

const API_PATHS = {
  product: "https://.execute-api.eu-west-1.amazonaws.com/dev",
  order: "https://.execute-api.eu-west-1.amazonaws.com/dev",
  import: "https://.execute-api.eu-west-1.amazonaws.com/dev",
  bff: `https://${ID}.execute-api.${REGION}.amazonaws.com/${ENV}`,
  cart: "https://.execute-api.eu-west-1.amazonaws.com/dev",
};

export default API_PATHS;
