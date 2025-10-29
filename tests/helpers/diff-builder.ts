import type { CoverageDiff, SummaryDiff, FileDiff } from '../../src/core/diff/types.js';

type SummaryDiffSpec = {
  linesCoveragePercentage: { before: number; after: number };
  linesFound?: { before: number; after: number };
  linesHit?: { before: number; after: number };
};

type FileDiffSpec = {
  path: string;
  linesCoveragePercentage: { before: number; after: number };
  linesFound?: { before: number; after: number };
  linesHit?: { before: number; after: number };
};

type CoverageDiffSpec = {
  summary: SummaryDiffSpec;
  files?: FileDiffSpec[];
};

const calculateDelta = (before: number, after: number): number => {
  return after - before;
};

const buildSummaryDiff = (spec: SummaryDiffSpec): SummaryDiff => {
  const { linesCoveragePercentage, linesFound, linesHit } = spec;

  return {
    linesCoveragePercentage: {
      before: linesCoveragePercentage.before,
      after: linesCoveragePercentage.after,
      delta: calculateDelta(linesCoveragePercentage.before, linesCoveragePercentage.after),
    },
    linesFound: linesFound
      ? {
          before: linesFound.before,
          after: linesFound.after,
          delta: calculateDelta(linesFound.before, linesFound.after),
        }
      : { before: 0, after: 0, delta: 0 },
    linesHit: linesHit
      ? {
          before: linesHit.before,
          after: linesHit.after,
          delta: calculateDelta(linesHit.before, linesHit.after),
        }
      : { before: 0, after: 0, delta: 0 },
  };
};

const buildFileDiff = (spec: FileDiffSpec): FileDiff => {
  const { path, linesCoveragePercentage, linesFound, linesHit } = spec;

  return {
    path,
    linesCoveragePercentage: {
      before: linesCoveragePercentage.before,
      after: linesCoveragePercentage.after,
      delta: calculateDelta(linesCoveragePercentage.before, linesCoveragePercentage.after),
    },
    linesFound: linesFound
      ? {
          before: linesFound.before,
          after: linesFound.after,
          delta: calculateDelta(linesFound.before, linesFound.after),
        }
      : { before: 0, after: 0, delta: 0 },
    linesHit: linesHit
      ? {
          before: linesHit.before,
          after: linesHit.after,
          delta: calculateDelta(linesHit.before, linesHit.after),
        }
      : { before: 0, after: 0, delta: 0 },
  };
};

export const buildExpectedDiff = (spec: CoverageDiffSpec): CoverageDiff => {
  return {
    summary: buildSummaryDiff(spec.summary),
    files: spec.files?.map(buildFileDiff) ?? [],
  };
};
