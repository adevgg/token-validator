import { ErrorResponse } from "./types";

// Create error response
export function createErrorResponse(
  error: string,
  message: string,
  code?: number
): Response {
  const errorResponse: ErrorResponse = {
    error,
    message,
    code,
  };

  return new Response(JSON.stringify(errorResponse), {
    status: code || 400,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

// Create success response
export function createSuccessResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data, JSONReplacer), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

// Validate Ethereum address format
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

// Handle CORS preflight
export function handleCors(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}

export type MulticallResult = MulticallSuccessResult | MulticallFailureResult;

export type MulticallSuccessResult = {
  status: "success";
  result: unknown;
};

export type MulticallFailureResult = {
  status: "failure";
  error: Error;
  result?: undefined;
};

export function isMulticallSuccess(
  result: MulticallResult
): result is MulticallSuccessResult {
  return result.status === "success";
}

export function isMulticallFailure(
  result: MulticallResult
): result is MulticallFailureResult {
  return result.status === "failure";
}

export function JSONReplacer(key: string, value: any) {
  if (typeof value === "bigint") {
    return value.toString();
  }

  if (value instanceof Error) {
    return value.message;
  }

  return value;
}
