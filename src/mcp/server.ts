import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { handleCoverageSummary, handleFileCoverageSummary, handleStartRecording, handleGetDiffSinceStart } from './handlers.js';
import {
  CoverageSummaryInputSchema,
  CoverageFileSummaryInputSchema,
  StartRecordingInputSchema,
  GetDiffSinceStartInputSchema,
  TOOL_CONFIGS,
} from '../schemas/tool-schemas.js';

export const createServer = (): Server => {
  const server = new Server(
    {
      name: 'coverage-mcp',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      {
        name: 'coverage_summary',
        description: TOOL_CONFIGS.coverage_summary.description,
        inputSchema: {
          type: 'object',
          properties: {
            lcovPath: {
              type: 'string',
              description: 'Path to the LCOV coverage file. Can be absolute or relative. Defaults to ./coverage/lcov.info',
            },
          },
        },
      },
      {
        name: 'coverage_file_summary',
        description: TOOL_CONFIGS.coverage_file_summary.description,
        inputSchema: {
          type: 'object',
          properties: {
            lcovPath: {
              type: 'string',
              description: 'Path to the LCOV coverage file. Can be absolute or relative. Defaults to ./coverage/lcov.info',
            },
            filePath: {
              type: 'string',
              description: 'File path to get coverage for',
            },
          },
          required: ['filePath'],
        },
      },
      {
        name: 'start_recording',
        description: TOOL_CONFIGS.start_recording.description,
        inputSchema: {
          type: 'object',
          properties: {
            lcovPath: {
              type: 'string',
              description: 'Absolute or relative path to the LCOV coverage file to record as baseline',
            },
          },
          required: ['lcovPath'],
        },
      },
      {
        name: 'get_diff_since_start',
        description: TOOL_CONFIGS.get_diff_since_start.description,
        inputSchema: {
          type: 'object',
          properties: {
            lcovPath: {
              type: 'string',
              description: 'Absolute or relative path to the current LCOV coverage file to compare against baseline',
            },
          },
          required: ['lcovPath'],
        },
      },
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (request.params.name === 'coverage_summary') {
      const validatedInput = CoverageSummaryInputSchema.parse(request.params.arguments);
      return handleCoverageSummary(validatedInput);
    }

    if (request.params.name === 'coverage_file_summary') {
      const validatedInput = CoverageFileSummaryInputSchema.parse(request.params.arguments);
      return handleFileCoverageSummary(validatedInput);
    }

    if (request.params.name === 'start_recording') {
      const validatedInput = StartRecordingInputSchema.parse(request.params.arguments);
      return handleStartRecording(validatedInput);
    }

    if (request.params.name === 'get_diff_since_start') {
      const validatedInput = GetDiffSinceStartInputSchema.parse(request.params.arguments);
      return handleGetDiffSinceStart(validatedInput);
    }

    throw new Error(`Unknown tool: ${request.params.name}`);
  });

  return server;
};

export const startServer = async (server: Server): Promise<void> => {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('[Coverage MCP] Server started successfully');
};
