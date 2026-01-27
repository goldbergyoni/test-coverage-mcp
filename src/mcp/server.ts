import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { zodToJsonSchema } from "zod-to-json-schema";
import {
  CoverageFileSummaryInputSchema,
  CoverageSummaryInputSchema,
  GetDiffSinceStartInputSchema,
  StartRecordingInputSchema,
  TOOL_CONFIGS,
} from "../schemas/tool-schemas.js";
import {
  handleCoverageSummary,
  handleFileCoverageSummary,
  handleGetDiffSinceStart,
  handleStartRecording,
} from "./handlers.js";

/** Options for MCP tool inputSchema: inline schema with type + properties (no $ref) so clients show "Capabilities: tools" */
const MCP_SCHEMA_OPTIONS = { $refStrategy: "none" as const };

export const createServer = (): Server => {
  const server = new Server(
    {
      name: "coverage-mcp",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: "coverage_summary",
        description: TOOL_CONFIGS.coverage_summary.description,
        inputSchema: zodToJsonSchema(
          CoverageSummaryInputSchema,
          MCP_SCHEMA_OPTIONS,
        ),
      },
      {
        name: "coverage_file_summary",
        description: TOOL_CONFIGS.coverage_file_summary.description,
        inputSchema: zodToJsonSchema(
          CoverageFileSummaryInputSchema,
          MCP_SCHEMA_OPTIONS,
        ),
      },
      {
        name: "start_recording",
        description: TOOL_CONFIGS.start_recording.description,
        inputSchema: zodToJsonSchema(
          StartRecordingInputSchema,
          MCP_SCHEMA_OPTIONS,
        ),
      },
      {
        name: "get_diff_since_start",
        description: TOOL_CONFIGS.get_diff_since_start.description,
        inputSchema: zodToJsonSchema(
          GetDiffSinceStartInputSchema,
          MCP_SCHEMA_OPTIONS,
        ),
      },
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === "coverage_summary") {
      const validatedInput = CoverageSummaryInputSchema.parse(
        request.params.arguments,
      );
      return handleCoverageSummary(validatedInput);
    }

    if (request.params.name === "coverage_file_summary") {
      const validatedInput = CoverageFileSummaryInputSchema.parse(
        request.params.arguments,
      );
      return handleFileCoverageSummary(validatedInput);
    }

    if (request.params.name === "start_recording") {
      const validatedInput = StartRecordingInputSchema.parse(
        request.params.arguments,
      );
      return handleStartRecording(validatedInput);
    }

    if (request.params.name === "get_diff_since_start") {
      const validatedInput = GetDiffSinceStartInputSchema.parse(
        request.params.arguments,
      );
      return handleGetDiffSinceStart(validatedInput);
    }

    throw new Error(`Unknown tool: ${request.params.name}`);
  });

  return server;
};

export const startServer = async (server: Server): Promise<void> => {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error("[Coverage MCP] Server started successfully");
};
