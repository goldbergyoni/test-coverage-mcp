import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../../src/mcp/server.js';
import type {
  CoverageSummaryOutput,
  CoverageFileSummaryOutput,
  StartRecordingOutput,
  GetDiffSinceStartOutput,
} from '../../src/schemas/tool-schemas.js';

type ToolResultMap = {
  coverage_summary: CoverageSummaryOutput;
  coverage_file_summary: CoverageFileSummaryOutput;
  start_recording: StartRecordingOutput;
  get_diff_since_start: GetDiffSinceStartOutput;
};

type ErrorResult = {
  isError: true;
  code: string;
  message: string;
  details?: unknown;
};

type MCPClient = {
  callTool<TName extends keyof ToolResultMap>(
    name: TName,
    args: Record<string, unknown>
  ): Promise<ToolResultMap[TName]>;

  callToolExpectingError<TName extends keyof ToolResultMap>(
    name: TName,
    args: Record<string, unknown>
  ): Promise<ErrorResult>;
};

export const createMCPClient = async (): Promise<MCPClient> => {
  const server = createServer();
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

  const client = new Client(
    { name: 'test-client', version: '1.0.0' },
    { capabilities: {} }
  );

  await Promise.all([
    client.connect(clientTransport),
    server.connect(serverTransport),
  ]);

  return {
    callTool: async (name, args) => {
      const result = await client.callTool({ name: name as string, arguments: args });

      if (result.isError) {
        const errorText = Array.isArray(result.content) && result.content[0] && 'text' in result.content[0]
          ? result.content[0].text
          : 'Unknown error';
        throw new Error(errorText);
      }

      const responseText = Array.isArray(result.content) && result.content[0] && 'text' in result.content[0]
        ? result.content[0].text
        : '{}';
      return JSON.parse(responseText);
    },

    callToolExpectingError: async (name, args) => {
      const result = await client.callTool({ name: name as string, arguments: args });

      if (!result.isError) {
        throw new Error('Expected tool to return error, but it succeeded');
      }

      const errorText = Array.isArray(result.content) && result.content[0] && 'text' in result.content[0]
        ? result.content[0].text
        : '{}';

      const errorData = JSON.parse(errorText);

      return {
        isError: true,
        code: errorData.error || 'UNKNOWN_ERROR',
        message: errorData.message || 'Unknown error',
        details: errorData.details,
      };
    },
  };
};
