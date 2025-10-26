import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { handleCoverageSummary, handleFileCoverageSummary } from './handlers.js';
import {
  CoverageSummaryInputSchema,
  CoverageFileSummaryInputSchema,
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

    throw new Error(`Unknown tool: ${request.params.name}`);
  });

  return server;
};

export const startServer = async (server: Server): Promise<void> => {
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('[Coverage MCP] Server started successfully');
};
