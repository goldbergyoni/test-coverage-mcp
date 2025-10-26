import type { CoverageInfo, DetailedFileCoverage } from '../coverage/types.js';

export type RecordingSession = {
  id: string;
  timestamp: number;
  lcovPath: string;
  coverageSnapshot: CoverageSnapshot;
};

export type CoverageSnapshot = {
  overallCoverage: CoverageInfo;
  fileCoverage: Map<string, DetailedFileCoverage>;
  totalFiles: number;
  timestamp: number;
};

export type RecordResults = {
  before: CoverageInfo;
  after: CoverageInfo;
  changeInPercentage: number;
};

export type CoverageDelta = {
  overallChange: number;
  fileChanges: FileDeltaInfo[];
  newFiles: string[];
  removedFiles: string[];
};

export type FileDeltaInfo = {
  path: string;
  beforePercentage: number;
  afterPercentage: number;
  changePercentage: number;
};
