import { writeFile, mkdtemp, rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { afterEach } from 'vitest';
import { faker } from '@faker-js/faker';

type FileSpec = {
  path?: string;
  lines: number;
  coveredLines?: number[];
  branches?: number;
  coveredBranches?: number[];
};

const tempFiles: string[] = [];

afterEach(async () => {
  await Promise.all(tempFiles.map(file => rm(file, { force: true, recursive: true })));
  tempFiles.length = 0;
});

const buildLineEntry = (lineNumber: number, isCovered: boolean): string => {
  const hitCount = isCovered ? 1 : 0;
  return `DA:${lineNumber},${hitCount}`;
};

const buildLinesSection = (totalLines: number, coveredLines: number[]): string => {
  const lineEntries = Array.from({ length: totalLines }, (_, i) => {
    const lineNumber = i + 1;
    const isCovered = coveredLines.includes(lineNumber);
    return buildLineEntry(lineNumber, isCovered);
  });

  return lineEntries.join('\n');
};

const buildBranchEntry = (branchNumber: number, isCovered: boolean): string => {
  const taken = isCovered ? 1 : 0;
  const line = branchNumber + 1;
  const block = 0;
  const branch = branchNumber % 2;
  return `BRDA:${line},${block},${branch},${taken}`;
};

const buildBranchesSection = (totalBranches: number, coveredBranches: number[]): string => {
  const branchEntries = Array.from({ length: totalBranches }, (_, i) => {
    const branchNumber = i + 1;
    const isCovered = coveredBranches.includes(branchNumber);
    return buildBranchEntry(branchNumber, isCovered);
  });

  return branchEntries.join('\n');
};

type NormalizedFileSpec = {
  path: string;
  lines: number;
  coveredLines: number[];
  branches: number;
  coveredBranches: number[];
};

const generateFilePath = (): string => {
  const dir = faker.system.directoryPath();
  const fileName = faker.system.fileName();
  return `${dir}/${fileName}`;
};

const buildFileSection = (file: NormalizedFileSpec): string => {
  const linesSection = buildLinesSection(file.lines, file.coveredLines);
  const branchesSection = file.branches > 0
    ? `\n${buildBranchesSection(file.branches, file.coveredBranches)}\nBRF:${file.branches}\nBRH:${file.coveredBranches.length}`
    : '';

  return `TN:
SF:${file.path}
${linesSection}
LF:${file.lines}
LH:${file.coveredLines.length}${branchesSection}
end_of_record`;
};

const buildLcovContent = (files: NormalizedFileSpec[]): string => {
  return files.map(buildFileSection).join('\n');
};

const writeToTempFile = async (content: string): Promise<string> => {
  const tempDir = await mkdtemp(join(tmpdir(), 'lcov-test-'));
  const filePath = join(tempDir, 'coverage.lcov');
  await writeFile(filePath, content);

  tempFiles.push(tempDir);
  return filePath;
};

const allLinesCovered = (totalLines: number): number[] => {
  return Array.from({ length: totalLines }, (_, i) => i + 1);
};

const allBranchesCovered = (totalBranches: number): number[] => {
  return Array.from({ length: totalBranches }, (_, i) => i + 1);
};

export const createLcovFile = async (files: FileSpec[]): Promise<string> => {
  const normalizedFiles = files.map(file => ({
    path: file.path ?? generateFilePath(),
    lines: file.lines,
    coveredLines: file.coveredLines ?? allLinesCovered(file.lines),
    branches: file.branches ?? 0,
    coveredBranches: file.coveredBranches ?? (file.branches ? allBranchesCovered(file.branches) : [])
  }));

  const content = buildLcovContent(normalizedFiles);
  return writeToTempFile(content);
};

export const createDefaultLcovFile = async (): Promise<string> => {
  return createLcovFile([{ lines: 3, coveredLines: [1, 2] }]);
};

export const generateNonExistentPath = (): string => {
  return faker.system.filePath();
};
