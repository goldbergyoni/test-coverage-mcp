import { promises as fs } from "fs";
import { join } from "path";
import { parseLcovFile } from "./parser.js";
import { resolveLcovPath } from "./path-resolver.js";
import { LcovSection } from "./types.js";

const RECORDING_DIR = "recording";
const BASELINE_FILENAME = "baseline-recording.lcov";

const getBaselinePath = () => join(RECORDING_DIR, BASELINE_FILENAME);

const ensureRecordingDirExists = async () => {
  try {
    await fs.mkdir(RECORDING_DIR, { recursive: true });
  } catch {
    //TODO: What if other error occured? Check if it exists explicitly, so when trying to create errors should be handled
    // Directory might already exist, that's fine
  }
};

export const recordBaseline = async (lcovPath?: string): Promise<void> => {
  const resolvedPath = await resolveLcovPath(lcovPath);
  await ensureRecordingDirExists();

  const baselinePath = getBaselinePath();

  // Delete existing baseline if it exists
  try {
    await fs.unlink(baselinePath);
  } catch {
    // File doesn't exist, that's fine
  }

  console.error(
    "Recorder: Copying LCOV file to baseline location",
    resolvedPath,
    baselinePath
  );
  // Copy the LCOV file to the baseline location
  const lcovContent = await fs.readFile(resolvedPath, "utf-8");
  await fs.writeFile(baselinePath, lcovContent);
};

export const baselineExists = async (): Promise<boolean> => {
  try {
    await fs.access(getBaselinePath());
    return true;
  } catch {
    return false;
  }
};

export const readBaseline = async (): Promise<LcovSection[]> => {
  const baselinePath = getBaselinePath();
  console.error("Recorder: Got baseline path", baselinePath);
  return await parseLcovFile(baselinePath);
};
