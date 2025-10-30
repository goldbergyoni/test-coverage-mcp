export type CoverageErrorCode =
  | 'LCOV_FILE_NOT_FOUND'
  | 'LCOV_PARSE_ERROR'
  | 'FILE_NOT_IN_COVERAGE'
  | 'NO_RECORDING_FOUND'
  | 'INVALID_RECORDING_ID'
  | 'PATH_RESOLUTION_ERROR';

export type CoverageError = {
  code: CoverageErrorCode;
  message: string;
  details?: unknown;
};

export type ErrorResponse = {
  error: CoverageError;
  timestamp: number;
};

export const createError = (
  code: CoverageErrorCode,
  message: string,
  details?: unknown
): CoverageError => ({
  code,
  message,
  details,
});
