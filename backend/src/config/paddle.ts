import { Environment, Paddle } from "@paddle/paddle-node-sdk";

let paddleClient: Paddle | undefined;

const requireEnvironmentVariable = (name: string) => {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is required`);
  return value;
};

export const getPaddleEnvironment = () => {
  const environment = requireEnvironmentVariable("PADDLE_ENVIRONMENT");

  if (environment === "sandbox") return Environment.sandbox;
  if (environment === "production") return Environment.production;

  throw new Error('PADDLE_ENVIRONMENT must be either "sandbox" or "production"');
};

export const getPaddleClient = () => {
  if (!paddleClient) {
    paddleClient = new Paddle(requireEnvironmentVariable("PADDLE_API_KEY"), {
      environment: getPaddleEnvironment(),
    });
  }

  return paddleClient;
};

export const getPaddleWebhookSecret = () =>
  requireEnvironmentVariable("PADDLE_WEBHOOK_SECRET");
