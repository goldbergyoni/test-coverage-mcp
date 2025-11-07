import { CoverageInfo, FileCoverageInfo, LcovSection } from './types.js';

export const calculateOverallCoverage = (sections: LcovSection[]): CoverageInfo => {
  if (sections.length === 0) {
    return {
      linesCoveragePercentage: 0,
      branchesCoveragePercentage: 0
    };
  }

  let instrumented = 0;
  let hit = 0;

  for (const section of sections) {
    instrumented += section.lines.instrumented;
    hit += section.lines.hit;
  }

  if (instrumented === 0) {
    return {
      linesCoveragePercentage: 0,
      branchesCoveragePercentage: 0
    };
  }

  const percentage = (hit / instrumented) * 100;
  const branchesCoveragePercentage = extractBranchCoverage(sections);

  return {
    linesCoveragePercentage: Math.round(percentage * 10) / 10,
    branchesCoveragePercentage
  };
};

export const calculateFileCoverage = (sections: LcovSection[], filePath: string): FileCoverageInfo => {
  const section = sections.find(s => s.path === filePath);

  if (!section) {
    return {
      path: filePath,
      linesCoveragePercentage: 0,
      branchesCoveragePercentage: 0
    };
  }

  if (section.lines.instrumented === 0) {
    return {
      path: filePath,
      linesCoveragePercentage: 0,
      branchesCoveragePercentage: 0
    };
  }

  const percentage = (section.lines.hit / section.lines.instrumented) * 100;
  const branchesCoveragePercentage = extractBranchCoverage([section]);

  return {
    path: filePath,
    linesCoveragePercentage: Math.round(percentage * 10) / 10,
    branchesCoveragePercentage
  };
};

export const extractBranchCoverage = (sections: LcovSection[]): number => {
  if (sections.length === 0) {
    return 0;
  }

  let instrumented = 0;
  let hit = 0;

  for (const section of sections) {
    if (section.branches) {
      instrumented += section.branches.instrumented;
      hit += section.branches.hit;
    }
  }

  if (instrumented === 0) {
    return 0;
  }

  const percentage = (hit / instrumented) * 100;
  return Math.round(percentage * 10) / 10;
};
