// Request types
export interface ValidationRequest {
  contractAddress: string;
  chainId?: number;
  contractType?: string;
  metadata?: Record<string, any>;
}

// Response types
export interface ValidationResponse {
  isValid: boolean;
  contractAddress: string;
  chainId?: number;
  details?: {
    verified: boolean;
    sourceCode?: string;
    abi?: any;
    compilerVersion?: string;
    optimizationEnabled?: boolean;
    errors?: string[];
  };
  timestamp: number;
}

// Error response
export interface ErrorResponse {
  error: string;
  message: string;
  code?: number;
}
