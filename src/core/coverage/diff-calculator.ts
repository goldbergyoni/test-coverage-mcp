import { CoverageDiffInfo } from "./types.js";
import { readBaseline, baselineExists } from "./recorder.js";
import { resolveLcovPath } from "./path-resolver.js";
import { parseLcovFile } from "./parser.js";
import {
  calculateOverallCoverage,
} from "./calculator.js";
import { CoverageError } from "../errors.js";

export const calculateDiffSinceRecording = async (
  lcovPath?: string
): Promise<CoverageDiffInfo> => {
  const exists = await baselineExists();
  if (!exists) {
    throw new CoverageError(
      "NO_RECORDING_FOUND",
      "No coverage recording found. Please run start_recording first."
    );
  }

  const latestLcovPath = await resolveLcovPath(lcovPath);

  console.error(
    "Diff calculator: About to read baseline and parse current LCOV",
    latestLcovPath
  );
  const [baselineSections, latestSections] = await Promise.all([
    readBaseline(),
    parseLcovFile(latestLcovPath),
  ]);

  const baselineCoverage = calculateOverallCoverage(baselineSections);
  const currentCoverage = calculateOverallCoverage(latestSections);

  console.error(
    "Diff calculator: Calculated coverage, lines base line and then branches base line:",
    baselineCoverage.linesCoveragePercentage,
    currentCoverage.linesCoveragePercentage,
    baselineCoverage.branchesCoveragePercentage,
    currentCoverage.branchesCoveragePercentage
  );

  const linesPercentageImpact =
    currentCoverage.linesCoveragePercentage -
    baselineCoverage.linesCoveragePercentage;
  const branchesPercentageImpact =
    currentCoverage.branchesCoveragePercentage - baselineCoverage.branchesCoveragePercentage;

  console.error(
    "Diff calculator: Calculated impact",
    linesPercentageImpact,
    branchesPercentageImpact
  );
  return {
    linesPercentageImpact: Math.round(linesPercentageImpact * 100) / 100,
    branchesPercentageImpact: Math.round(branchesPercentageImpact * 100) / 100,
  };
};
