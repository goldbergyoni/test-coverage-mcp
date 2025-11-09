// @ts-check
/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
const config = {
  packageManager: "npm",
  testRunner: "vitest",
  vitest: {
    configFile: "vitest.config.ts",
  },
  mutate: [
    "src/**/*.ts",
    "!src/**/*.test.ts",
    "!src/**/*.spec.ts",
    "!src/index.ts",
  ],
  reporters: ["html", "clear-text", "progress"],
  htmlReporter: {
    fileName: "mutation-report.html",
  },
  coverageAnalysis: "perTest",
  concurrency: 4,
  timeoutMS: 60000,
};

export default config;
