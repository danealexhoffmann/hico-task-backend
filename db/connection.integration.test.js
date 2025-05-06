const pool = require('./connection');

// These tests will actually connect to your database
// Only run these in a test environment, not production
describe('Database Connection Integration', () => {
  // Close the pool after all tests are done
  afterAll(async () => {
    await pool.end();
  });

  it('should connect to the database', async () => {
    // Try to get a connection from the pool
    const connection = await pool.getConnection();
    expect(connection).toBeDefined();
    // Release the connection back to the pool
    connection.release();
  });

  it('should execute a simple query', async () => {
    // Execute a simple query that should work on any MySQL server
    const [result] = await pool.query('SELECT 1 + 1 AS solution');
    expect(result[0].solution).toBe(2);
  });

  it('should handle connection errors gracefully', async () => {
    // Save original env vars
    const originalHost = process.env.DB_HOST;

    try {
      // Temporarily modify env var to cause a connection error
      process.env.DB_HOST = 'nonexistent-host';

      // Reset module registry and reimport the pool
      jest.resetModules();
      const errorPool = require('./connection');

      // Attempt to query with the bad connection
      await expect(errorPool.query('SELECT 1')).rejects.toThrow();
    } finally {
      // Restore original env var
      process.env.DB_HOST = originalHost;
    }
  });
});