export type CoverageInfo = {
  linesCoveragePercentage: number;
  branchesCoveragePercentage: number;
};

export type CoverageDiffInfo = {
  linesPercentageImpact: number;
  branchesPercentageImpact: number;
};



export type FileCoverageInfo = {
  path: string;
  linesCoveragePercentage: number;
  branchesCoveragePercentage: number;
};

export type MultiFileCoverageInfo = {
  filesCoverageInfo: FileCoverageInfo[];
};

export type DetailedFileCoverage = {
  path: string;
  totalLines: number;
  coveredLines: number;
  uncoveredLines: number[];
  linesCoveragePercentage: number;
};

export type LcovSection = {
  name: string;
  path: string;
  lines: {
    instrumented: number;
    hit: number;
    details: LcovLineDetail[];
  };
  functions?: {
    instrumented: number;
    hit: number;
    details: LcovFunctionDetail[];
  };
  branches?: {
    instrumented: number;
    hit: number;
    details: LcovBranchDetail[];
  };
};

export type LcovLineDetail = {
  line: number;
  hit: number;
};

export type LcovFunctionDetail = {
  name: string;
  line: number;
  hit: number;
};

export type LcovBranchDetail = {
  line: number;
  block: number;
  branch: number;
  taken: number;
};
