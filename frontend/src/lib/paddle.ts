import { initializePaddle, type Environments, type Paddle } from "@paddle/paddle-js";

let paddlePromise: Promise<Paddle> | null = null;

const getRequiredEnvironmentVariable = (name: string, value: string | undefined) => {
  const normalized = value?.trim();
  if (!normalized) {
    throw new Error(`${name} is required. Paddle has not been initialized.`);
  }
  return normalized;
};

const readPaddleConfig = () => {
  const environment = getRequiredEnvironmentVariable(
    "VITE_PADDLE_ENVIRONMENT",
    import.meta.env.VITE_PADDLE_ENVIRONMENT,
  );
  const token = getRequiredEnvironmentVariable(
    "VITE_PADDLE_CLIENT_TOKEN",
    import.meta.env.VITE_PADDLE_CLIENT_TOKEN,
  );

  if (environment !== "sandbox" && environment !== "production") {
    throw new Error('VITE_PADDLE_ENVIRONMENT must be either "sandbox" or "production".');
  }
  if (environment === "sandbox" && !token.startsWith("test_")) {
    throw new Error("Sandbox Paddle requires a client-side token beginning with test_.");
  }
  if (environment === "production" && !token.startsWith("live_")) {
    throw new Error("Production Paddle requires a client-side token beginning with live_.");
  }

  return { environment: environment as Environments, token };
};

export const getPaddle = () => {
  if (!paddlePromise) {
    try {
      const config = readPaddleConfig();
      paddlePromise = initializePaddle(config).then((paddle) => {
        if (!paddle) throw new Error("Paddle.js could not be initialized.");
        return paddle;
      });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  return paddlePromise;
};
