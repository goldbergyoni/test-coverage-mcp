import { describe, it, expect } from 'vitest';
import { createMCPClient } from '../helpers/mcp-client.js';
import { createLcovFile } from '../helpers/lcov-builder.js';
import { buildExpectedDiff } from '../helpers/diff-builder.js';

describe('coverage_diff tool', () => {
  it('when coverage stays at 100%, then returns zero delta', async () => {
    const beforeLcovPath = await createLcovFile([
      { path: 'src/main.ts', lines: 3, coveredLines: [1, 2, 3] }
    ]);
    const afterLcovPath = await createLcovFile([
      { path: 'src/main.ts', lines: 3, coveredLines: [1, 2, 3] }
    ]);
    const client = await createMCPClient();

    const result = await client.callTool('coverage_diff', {
      beforeLcovPath,
      afterLcovPath
    });

    const expected = buildExpectedDiff({
      summary: {
        linesCoveragePercentage: { before: 100, after: 100 },
        linesFound: { before: 3, after: 3 },
        linesHit: { before: 3, after: 3 }
      },
      files: [
        {
          path: 'src/main.ts',
          linesCoveragePercentage: { before: 100, after: 100 },
          linesFound: { before: 3, after: 3 },
          linesHit: { before: 3, after: 3 }
        }
      ]
    });

    expect(result).toEqual(expected);
  });
});
