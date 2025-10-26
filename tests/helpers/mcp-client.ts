import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { createServer } from '../../src/mcp/server.js';
import { CoverageInfo } from '../../src/core/coverage/types.js';

type MCPClient = {
  callTool: (name: string, args: Record<string, unknown>) => Promise<CoverageInfo>;
};

const isCoverageInfo = (value: unknown): value is CoverageInfo => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'linesCoveragePercentage' in value &&
    typeof (value as { linesCoveragePercentage: unknown }).linesCoveragePercentage === 'number'
  );
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
    callTool: async (name: string, args: Record<string, unknown>) => {
      const result = await client.callTool({ name, arguments: args });

      return JSON.parse(result.content[0]?.text || '{}') as CoverageInfo;
    },
  };
};
