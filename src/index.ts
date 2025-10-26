#!/usr/bin/env node

import { createServer, startServer } from './mcp/server.js';

const main = async () => {
  try {
    const server = createServer();
    await startServer(server);
  } catch (error) {
    console.error('[Coverage MCP] Fatal error:', error);
    process.exit(1);
  }
};

main();
