// Mock dotenv and mysql2/promise before importing anything
jest.mock('dotenv', () => ({
    config: jest.fn(),
  }));

  // Create a mockPool before mocking mysql2/promise
  const mockPool = {
    query: jest.fn(),
    getConnection: jest.fn(),
    end: jest.fn(),
  };

  // Mock mysql2/promise with a proper implementation
  jest.mock('mysql2/promise', () => ({
    createPool: jest.fn().mockReturnValue(mockPool),
  }));

  // Now import mysql after the mocks are set up
  const mysql = require('mysql2/promise');

  describe('Database Connection', () => {
    let pool;

    beforeEach(() => {
      // Clear all mocks before each test
      jest.clearAllMocks();

      // Set up environment variables
      process.env.DB_HOST = 'localhost';
      process.env.DB_USER = 'testuser';
      process.env.DB_PASSWORD = 'testpassword';
      process.env.DB_NAME = 'testdb';
      process.env.DB_PORT = '3306';

      // Reset modules to ensure a clean require
      jest.resetModules();
    });

    it('should create a pool with correct configuration', () => {
      // Import the module to test
      pool = require('./connection');

      // Check if createPool was called with correct config
      expect(mysql.createPool).toHaveBeenCalledWith({
        host: 'localhost',
        user: 'testuser',
        password: 'testpassword',
        database: 'testdb',
        port: '3306',
        waitForConnections: true,
        connectionLimit: 10,
      });
    });

    it('should export the pool instance', () => {
      // Import the module to test
      pool = require('./connection');

      // Verify that the exported object is the pool returned by createPool
      expect(pool).toBe(mockPool);
    });
  });