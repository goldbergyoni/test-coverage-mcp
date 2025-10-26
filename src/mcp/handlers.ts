import { resolveLcovPath } from '../core/coverage/path-resolver.js';
import { parseLcovFile } from '../core/coverage/parser.js';
import { calculateOverallCoverage } from '../core/coverage/calculator.js';
import { CoverageError } from '../core/errors.js';
import { CoverageSummaryInput } from '../schemas/tool-schemas.js';

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
