export type CoverageErrorCode =
  | 'LCOV_FILE_NOT_FOUND'
  | 'LCOV_PARSE_ERROR'
  | 'FILE_NOT_IN_COVERAGE'
  | 'NO_RECORDING_FOUND'
  | 'INVALID_RECORDING_ID'
  | 'PATH_RESOLUTION_ERROR';

export class CoverageError extends Error {
  code: CoverageErrorCode;
  details?: unknown;

  constructor(code: CoverageErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = 'CoverageError';
    this.code = code;
    this.details = details;
  }
}

export type ErrorResponse = {
  error: {
    code: CoverageErrorCode;
    message: string;
    details?: unknown;
  };
  timestamp: number;
};

export const createError = (
  code: CoverageErrorCode,
  message: string,
  details?: unknown
): CoverageError => new CoverageError(code, message, details);
