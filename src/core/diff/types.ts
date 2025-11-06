export type CoverageDiff = {
  summary: SummaryDiff;
  files: FileDiff[];
};

export type SummaryDiff = {
  linesCoveragePercentage: {
    before: number;
    after: number;
    delta: number;
  };
  linesFound: {
    before: number;
    after: number;
    delta: number;
  };
  linesHit: {
    before: number;
    after: number;
    delta: number;
  };
};

export type FileDiff = {
  path: string;
  linesCoveragePercentage: {
    before: number;
    after: number;
    delta: number;
  };
  linesFound: {
    before: number;
    after: number;
    delta: number;
  };
  linesHit: {
    before: number;
    after: number;
    delta: number;
  };
};
