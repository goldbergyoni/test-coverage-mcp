/**
 * MCP Tool Schemas for Coverage Analyzer
 *
 * This file contains Zod schemas for all MCP tool inputs and outputs.
 * These schemas provide runtime validation and TypeScript type inference.
 */
import { z } from 'zod';
/**
 * Schema for coverage_summary tool input
 */
export declare const CoverageSummaryInputSchema: z.ZodEffects<z.ZodObject<{
    lcovPath: z.ZodOptional<z.ZodString>;
    filePath: z.ZodOptional<z.ZodString>;
    filePaths: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    lcovPath?: string | undefined;
    filePath?: string | undefined;
    filePaths?: string[] | undefined;
}, {
    lcovPath?: string | undefined;
    filePath?: string | undefined;
    filePaths?: string[] | undefined;
}>, {
    lcovPath?: string | undefined;
    filePath?: string | undefined;
    filePaths?: string[] | undefined;
}, {
    lcovPath?: string | undefined;
    filePath?: string | undefined;
    filePaths?: string[] | undefined;
}>;
/**
 * Schema for start_coverage_record tool input
 */
export declare const StartRecordingInputSchema: z.ZodObject<{
    lcovPath: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    lcovPath?: string | undefined;
}, {
    lcovPath?: string | undefined;
}>;
/**
 * Schema for end_coverage_record tool input
 */
export declare const EndRecordingInputSchema: z.ZodObject<{
    recordingId: z.ZodString;
    lcovPath: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    recordingId: string;
    lcovPath?: string | undefined;
}, {
    recordingId: string;
    lcovPath?: string | undefined;
}>;
/**
 * Basic coverage info structure
 */
declare const CoverageInfoSchema: z.ZodObject<{
    linesCoveragePercentage: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    linesCoveragePercentage: number;
}, {
    linesCoveragePercentage: number;
}>;
/**
 * File coverage info structure
 */
declare const FileCoverageInfoSchema: z.ZodObject<{
    path: z.ZodString;
    coverageInfo: z.ZodObject<{
        linesCoveragePercentage: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        linesCoveragePercentage: number;
    }, {
        linesCoveragePercentage: number;
    }>;
}, "strip", z.ZodTypeAny, {
    path: string;
    coverageInfo: {
        linesCoveragePercentage: number;
    };
}, {
    path: string;
    coverageInfo: {
        linesCoveragePercentage: number;
    };
}>;
/**
 * Multi-file coverage info structure
 */
declare const MultiFileCoverageInfoSchema: z.ZodObject<{
    filesCoverageInfo: z.ZodArray<z.ZodObject<{
        path: z.ZodString;
        coverageInfo: z.ZodObject<{
            linesCoveragePercentage: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            linesCoveragePercentage: number;
        }, {
            linesCoveragePercentage: number;
        }>;
    }, "strip", z.ZodTypeAny, {
        path: string;
        coverageInfo: {
            linesCoveragePercentage: number;
        };
    }, {
        path: string;
        coverageInfo: {
            linesCoveragePercentage: number;
        };
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    filesCoverageInfo: {
        path: string;
        coverageInfo: {
            linesCoveragePercentage: number;
        };
    }[];
}, {
    filesCoverageInfo: {
        path: string;
        coverageInfo: {
            linesCoveragePercentage: number;
        };
    }[];
}>;
/**
 * Schema for coverage_summary tool output
 * Can return overall, single file, or multi-file coverage
 */
export declare const CoverageSummaryOutputSchema: z.ZodUnion<[z.ZodObject<{
    linesCoveragePercentage: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    linesCoveragePercentage: number;
}, {
    linesCoveragePercentage: number;
}>, z.ZodObject<{
    path: z.ZodString;
    coverageInfo: z.ZodObject<{
        linesCoveragePercentage: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        linesCoveragePercentage: number;
    }, {
        linesCoveragePercentage: number;
    }>;
}, "strip", z.ZodTypeAny, {
    path: string;
    coverageInfo: {
        linesCoveragePercentage: number;
    };
}, {
    path: string;
    coverageInfo: {
        linesCoveragePercentage: number;
    };
}>, z.ZodObject<{
    filesCoverageInfo: z.ZodArray<z.ZodObject<{
        path: z.ZodString;
        coverageInfo: z.ZodObject<{
            linesCoveragePercentage: z.ZodNumber;
        }, "strip", z.ZodTypeAny, {
            linesCoveragePercentage: number;
        }, {
            linesCoveragePercentage: number;
        }>;
    }, "strip", z.ZodTypeAny, {
        path: string;
        coverageInfo: {
            linesCoveragePercentage: number;
        };
    }, {
        path: string;
        coverageInfo: {
            linesCoveragePercentage: number;
        };
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    filesCoverageInfo: {
        path: string;
        coverageInfo: {
            linesCoveragePercentage: number;
        };
    }[];
}, {
    filesCoverageInfo: {
        path: string;
        coverageInfo: {
            linesCoveragePercentage: number;
        };
    }[];
}>]>;
/**
 * Schema for start_coverage_record tool output
 */
export declare const StartRecordingOutputSchema: z.ZodObject<{
    recordingId: z.ZodString;
    timestamp: z.ZodNumber;
    baselineCoverage: z.ZodObject<{
        linesCoveragePercentage: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        linesCoveragePercentage: number;
    }, {
        linesCoveragePercentage: number;
    }>;
}, "strip", z.ZodTypeAny, {
    recordingId: string;
    timestamp: number;
    baselineCoverage: {
        linesCoveragePercentage: number;
    };
}, {
    recordingId: string;
    timestamp: number;
    baselineCoverage: {
        linesCoveragePercentage: number;
    };
}>;
/**
 * Schema for end_coverage_record tool output
 */
export declare const EndRecordingOutputSchema: z.ZodObject<{
    before: z.ZodObject<{
        linesCoveragePercentage: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        linesCoveragePercentage: number;
    }, {
        linesCoveragePercentage: number;
    }>;
    after: z.ZodObject<{
        linesCoveragePercentage: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        linesCoveragePercentage: number;
    }, {
        linesCoveragePercentage: number;
    }>;
    changeInPercentage: z.ZodNumber;
    fileChanges: z.ZodOptional<z.ZodArray<z.ZodObject<{
        path: z.ZodString;
        beforePercentage: z.ZodNumber;
        afterPercentage: z.ZodNumber;
        changePercentage: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        path: string;
        beforePercentage: number;
        afterPercentage: number;
        changePercentage: number;
    }, {
        path: string;
        beforePercentage: number;
        afterPercentage: number;
        changePercentage: number;
    }>, "many">>;
    newFiles: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    removedFiles: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    before: {
        linesCoveragePercentage: number;
    };
    after: {
        linesCoveragePercentage: number;
    };
    changeInPercentage: number;
    fileChanges?: {
        path: string;
        beforePercentage: number;
        afterPercentage: number;
        changePercentage: number;
    }[] | undefined;
    newFiles?: string[] | undefined;
    removedFiles?: string[] | undefined;
}, {
    before: {
        linesCoveragePercentage: number;
    };
    after: {
        linesCoveragePercentage: number;
    };
    changeInPercentage: number;
    fileChanges?: {
        path: string;
        beforePercentage: number;
        afterPercentage: number;
        changePercentage: number;
    }[] | undefined;
    newFiles?: string[] | undefined;
    removedFiles?: string[] | undefined;
}>;
export type CoverageSummaryInput = z.infer<typeof CoverageSummaryInputSchema>;
export type StartRecordingInput = z.infer<typeof StartRecordingInputSchema>;
export type EndRecordingInput = z.infer<typeof EndRecordingInputSchema>;
export type CoverageInfo = z.infer<typeof CoverageInfoSchema>;
export type FileCoverageInfo = z.infer<typeof FileCoverageInfoSchema>;
export type MultiFileCoverageInfo = z.infer<typeof MultiFileCoverageInfoSchema>;
export type CoverageSummaryOutput = z.infer<typeof CoverageSummaryOutputSchema>;
export type StartRecordingOutput = z.infer<typeof StartRecordingOutputSchema>;
export type EndRecordingOutput = z.infer<typeof EndRecordingOutputSchema>;
/**
 * Tool configuration for MCP server registration
 */
export declare const TOOL_CONFIGS: {
    readonly coverage_summary: {
        readonly title: "Get Coverage Summary";
        readonly description: "Analyzes an LCOV coverage file and returns line coverage percentage. Can return overall project coverage or coverage for specific files. Use this before making code changes to establish a baseline or after changes to verify impact.";
        readonly inputSchema: z.ZodEffects<z.ZodObject<{
            lcovPath: z.ZodOptional<z.ZodString>;
            filePath: z.ZodOptional<z.ZodString>;
            filePaths: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            lcovPath?: string | undefined;
            filePath?: string | undefined;
            filePaths?: string[] | undefined;
        }, {
            lcovPath?: string | undefined;
            filePath?: string | undefined;
            filePaths?: string[] | undefined;
        }>, {
            lcovPath?: string | undefined;
            filePath?: string | undefined;
            filePaths?: string[] | undefined;
        }, {
            lcovPath?: string | undefined;
            filePath?: string | undefined;
            filePaths?: string[] | undefined;
        }>;
    };
    readonly start_coverage_record: {
        readonly title: "Start Coverage Recording";
        readonly description: "Creates a snapshot of the current coverage state for later comparison. Use this before making code changes to track coverage impact. Returns a recording ID that must be provided to end_coverage_record.";
        readonly inputSchema: z.ZodObject<{
            lcovPath: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            lcovPath?: string | undefined;
        }, {
            lcovPath?: string | undefined;
        }>;
    };
    readonly end_coverage_record: {
        readonly title: "End Coverage Recording and Compare";
        readonly description: "Compares current coverage against a previously created recording and returns the difference. Shows overall coverage change and per-file changes. Use this after making code changes to measure coverage impact.";
        readonly inputSchema: z.ZodObject<{
            recordingId: z.ZodString;
            lcovPath: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            recordingId: string;
            lcovPath?: string | undefined;
        }, {
            recordingId: string;
            lcovPath?: string | undefined;
        }>;
    };
};
export {};
//# sourceMappingURL=tool-schemas.d.ts.map