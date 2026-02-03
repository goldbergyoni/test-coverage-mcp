import { resolveLcovPath } from "./path-resolver.js";
import { parseLcovFile } from "./parser.js";
import {
  calculateOverallCoverage,
  calculateFileCoverage,
  calculateMultiFileCoverage,
} from "./calculator.js";
import { recordBaseline } from "./recorder.js";
import { calculateDiffSinceRecording } from "./diff-calculator.js";
import { CoverageInfo, FileCoverageInfo, CoverageDiffInfo } from "./types.js";

export const getOverallCoverageSummary = async (
  lcovPath?: string
): Promise<CoverageInfo> => {
  const resolvedPath = await resolveLcovPath(lcovPath);
  const sections = await parseLcovFile(resolvedPath);
  return calculateOverallCoverage(sections);
};

export const getFileCoverageSummary = async (
  lcovPath: string | undefined,
  filePath: string
): Promise<FileCoverageInfo> => {
  const resolvedPath = await resolveLcovPath(lcovPath);
  const sections = await parseLcovFile(resolvedPath);
  return calculateFileCoverage(sections, filePath);
};

export const getMultiFileCoverageSummary = async (
  lcovPath: string | undefined,
  filePaths: string[]
): Promise<FileCoverageInfo[]> => {
  const resolvedPath = await resolveLcovPath(lcovPath);
  const sections = await parseLcovFile(resolvedPath);
  return calculateMultiFileCoverage(sections, filePaths);
};

export const startCoverageRecording = async (
  lcovPath: string
): Promise<void> => {
  await recordBaseline(lcovPath);
};

export const getCoverageDiffSinceStart = async (
  lcovPath: string
): Promise<CoverageDiffInfo> => {
  return await calculateDiffSinceRecording(lcovPath);
};
