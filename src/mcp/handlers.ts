import { CoverageError } from '../core/errors.js';
import { CoverageSummaryInput, CoverageFileSummaryInput, StartRecordingInput, GetDiffSinceStartInput } from '../schemas/tool-schemas.js';
import { getOverallCoverageSummary, getFileCoverageSummary, startCoverageRecording, getCoverageDiffSinceStart } from '../core/coverage/facade.js';

export const handleCoverageSummary = async (input: CoverageSummaryInput) => {
  try {
    const coverage = await getOverallCoverageSummary(input.lcovPath);
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
    const coverage = await getFileCoverageSummary(input.lcovPath, input.filePath);
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
    await startCoverageRecording(input.lcovPath);
    return {
      content: [{ type: 'text' as const, text: '"Recording started"' }],
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
    const diff = await getCoverageDiffSinceStart(input.lcovPath);
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
