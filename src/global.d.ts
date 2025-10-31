/// <reference types="@cloudflare/workers-types" />

declare global {
  // Type definition for Env (environment variables)
  interface Env {
    // Add your environment variables here
    // EXAMPLE_API_KEY?: string;
    // VALIDATION_CACHE?: KVNamespace;
    INFURA_API_KEY?: string;
  }
}

export {};
