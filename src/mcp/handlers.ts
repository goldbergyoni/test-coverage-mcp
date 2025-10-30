import { resolveLcovPath } from '../core/coverage/path-resolver.js';
import { parseLcovFile } from '../core/coverage/parser.js';
import { calculateOverallCoverage, calculateFileCoverage } from '../core/coverage/calculator.js';
import { CoverageError } from '../core/errors.js';
import { CoverageSummaryInput, CoverageFileSummaryInput, StartRecordingInput, GetDiffSinceStartInput } from '../schemas/tool-schemas.js';
import { recordSnapshot } from '../core/coverage/recorder.js';
import { calculateDiffSinceRecording } from '../core/coverage/diff-calculator.js';

export const handleCoverageSummary = async (input: CoverageSummaryInput) => {
  try {
    const lcovPath = await resolveLcovPath(input.lcovPath);
    const sections = await parseLcovFile(lcovPath);
    const coverage = calculateOverallCoverage(sections);

    return {
      content: [{ type: 'text' as const, text: JSON.stringify(coverage) }],
    };
  } catch (error) {
    const coverageError = error as CoverageError;
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify({
            error: coverageError.code,
            message: coverageError.message
          }),
        },
      ],
      isError: true,
    };
  }
};

export const handleFileCoverageSummary = async (input: CoverageFileSummaryInput) => {
  try {
    const lcovPath = await resolveLcovPath(input.lcovPath);
    const sections = await parseLcovFile(lcovPath);
    const coverage = calculateFileCoverage(sections, input.filePath);

    return {
      content: [{ type: 'text' as const, text: JSON.stringify(coverage) }],
    };
  } catch (error) {
    const coverageError = error as CoverageError;
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify({
            error: coverageError.code,
            message: coverageError.message
          }),
        },
      ],
      isError: true,
    };
  }
};

export const handleStartRecording = async (input: StartRecordingInput) => {
  try {
    await recordSnapshot(input.lcovPath);
    return {
      content: [{ type: 'text' as const, text: 'Recording started' }],
    };
  } catch (error) {
    const coverageError = error as CoverageError;
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify({
            error: coverageError.code,
            message: coverageError.message
          }),
        },
      ],
      isError: true,
    };
  }
};

export const handleGetDiffSinceStart = async (input: GetDiffSinceStartInput) => {
  try {
    const diff = await calculateDiffSinceRecording(input.lcovPath);
    return {
      content: [{ type: 'text' as const, text: JSON.stringify(diff) }],
    };
  } catch (error) {
    const coverageError = error as CoverageError;
    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify({
            error: coverageError.code,
            message: coverageError.message
          }),
        },
      ],
      isError: true,
    };
  }
};
