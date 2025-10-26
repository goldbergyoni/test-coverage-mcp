import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../../src/mcp/server.js';
import type {
  CoverageSummaryOutput,
  CoverageFileSummaryOutput,
  StartRecordingOutput,
  EndRecordingOutput,
} from '../../src/schemas/tool-schemas.js';

type ToolResultMap = {
  coverage_summary: CoverageSummaryOutput;
  coverage_file_summary: CoverageFileSummaryOutput;
  start_coverage_record: StartRecordingOutput;
  end_coverage_record: EndRecordingOutput;
};

type ToolSuccess<T> = {
  isError: false;
  data: T;
};

type ToolError = {
  isError: true;
  error: string;
};

type ToolResult<T> = ToolSuccess<T> | ToolError;

type MCPClient = {
  callTool<TName extends keyof ToolResultMap>(
    name: TName,
    args: Record<string, unknown>
  ): Promise<ToolResultMap[TName]>;

  callToolWithError<TName extends keyof ToolResultMap>(
    name: TName,
    args: Record<string, unknown>
  ): Promise<ToolResult<ToolResultMap[TName]>>;
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

    callToolWithError: async (name, args) => {
      const result = await client.callTool({ name: name as string, arguments: args });

      if (result.isError) {
        const errorText = Array.isArray(result.content) && result.content[0] && 'text' in result.content[0]
          ? result.content[0].text
          : 'Unknown error';
        return {
          isError: true,
          error: errorText,
        };
      }

      const responseText = Array.isArray(result.content) && result.content[0] && 'text' in result.content[0]
        ? result.content[0].text
        : '{}';
      return {
        isError: false,
        data: JSON.parse(responseText),
      };
    },
  };
};
