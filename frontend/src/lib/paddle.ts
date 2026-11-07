import { initializePaddle, type Environments, type Paddle, type PaddleEventData } from "@paddle/paddle-js";

export { CheckoutEventNames } from "@paddle/paddle-js";
export type { PaddleEventData } from "@paddle/paddle-js";

export type PaddleEventListener = (event: PaddleEventData) => void;

let paddlePromise: Promise<Paddle> | null = null;
const listeners = new Set<PaddleEventListener>();

// Events only signal that consumers should refresh authoritative server state.
const dispatchPaddleEvent: PaddleEventListener = (event) => {
  for (const listener of [...listeners]) {
    if (!listeners.has(listener)) continue;
    try {
      listener(event);
    } catch {
      // A failing consumer must not prevent other mounted consumers receiving events.
    }
  }
};

// Subscribing does not load/reinitialize the SDK. Each registration owns its cleanup.
export const subscribePaddleEvents = (listener: PaddleEventListener): (() => void) => {
  const subscription: PaddleEventListener = (event) => listener(event);
  listeners.add(subscription);
  return () => { listeners.delete(subscription); };
};

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

// The installed wrapper retains rejected CDN promises. Load the official script
// first so failed downloads remain retryable without poisoning its internal cache.
const loadPaddleScript = (): Promise<void> => {
  if (window.PaddleBillingV1) return Promise.resolve();
  const src = "https://cdn.paddle.com/paddle/v2/paddle.js";
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${src}"]`);
    const script = existing ?? document.createElement("script");
    const cleanup = () => {
      script.removeEventListener("load", loaded);
      script.removeEventListener("error", failed);
    };
    const failed = () => {
      cleanup();
      script.remove();
      reject(new Error("Paddle.js could not be loaded."));
    };
    const loaded = () => {
      if (!window.PaddleBillingV1) return failed();
      cleanup();
      resolve();
    };
    script.addEventListener("load", loaded);
    script.addEventListener("error", failed);
    if (!existing) {
      script.src = src;
      document.head.appendChild(script);
    }
  });
};

export const getPaddle = () => {
  if (!paddlePromise) {
    try {
      const config = readPaddleConfig();
      paddlePromise = loadPaddleScript().then(() =>
        initializePaddle({ ...config, eventCallback: dispatchPaddleEvent }),
      ).then((paddle) => {
        if (!paddle?.Initialized) throw new Error("Paddle.js could not be initialized.");
        return paddle;
      }).catch((error: unknown) => {
        // Retry only on a subsequent explicit call; never reset a successful singleton.
        paddlePromise = null;
        throw error;
      });
    } catch (error) {
      return Promise.reject(error);
    }
  }

  return paddlePromise;
};
