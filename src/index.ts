import {
  createErrorResponse,
  createSuccessResponse,
  handleCors,
} from "./helpers/utils";
import { handleGetSBTInformation } from "./lib/sbt";

// Handle health check endpoint
async function handleHealthCheck(): Promise<Response> {
  return createSuccessResponse({
    status: "ok",
    timestamp: Date.now(),
  });
}

/**
 * Cloudflare Worker entry point
 */
export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: any // ExecutionContext from @cloudflare/workers-types
  ): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method;
    const pathname = url.pathname;

    switch (true) {
      case method === "OPTIONS":
        return handleCors();

      case method === "GET" && pathname === "/health":
        return handleHealthCheck();

      case method === "GET" && pathname === "/sbt":
        return handleGetSBTInformation(request, env);

      default:
        return createErrorResponse("NOT_FOUND", "Route not found", 404);
    }
  },
};
