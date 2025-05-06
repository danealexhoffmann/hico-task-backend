module.exports = {
  testEnvironment: 'node',
  testPathIgnorePatterns: [
    '/node_modules/'
  ],
  // By default, run only unit tests (not integration tests)
  // Use npm run test:integration to run integration tests
  testPathIgnorePatterns: process.env.TEST_INTEGRATION !== 'true' ? [
    '\\.integration\\.test\\.js$'
  ] : [],
};