const express = require('express');
const router = require('./api');

// Mock the database pool
jest.mock('../db/connection', () => ({
  query: jest.fn(),
}));

const pool = require('../db/connection');

describe('API Routes', () => {
  let app;
  let request;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Create a new Express app for each test
    app = express();
    app.use(express.json());
    app.use('/api', router);

    // Use supertest for HTTP assertions
    request = require('supertest')(app);
  });

  describe('GET /api/test', () => {
    it('should return a success message', async () => {
      const response = await request.get('/api/test');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'API working' });
    });
  });

  describe('GET /api/employees', () => {
    it('should return all employees', async () => {
      // Mock the database response
      const mockEmployees = [
        { id: 1, first_name: 'John', last_name: 'Doe' },
        { id: 2, first_name: 'Jane', last_name: 'Smith' },
      ];

      pool.query.mockResolvedValueOnce([mockEmployees]);

      const response = await request.get('/api/employees');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: mockEmployees });
      expect(pool.query).toHaveBeenCalledWith('SELECT * FROM current_employees');
    });

    it('should handle database errors', async () => {
      // Mock a database error
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request.get('/api/employees');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Database error' });
    });
  });

  describe('POST /api/employees', () => {
    it('should add a new employee', async () => {
      const newEmployee = {
        firstName: 'John',
        lastName: 'Doe',
        salutation: 'Mr',
        gender: 'Male',
        employeeNumber: '12345',
        grossSalary: 50000,
        profileColour: '#FF0000',
      };

      pool.query.mockResolvedValueOnce([{ insertId: 1 }]);

      const response = await request
        .post('/api/employees')
        .send(newEmployee);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'Employee added successfully',
        employeeId: 1,
      });
      expect(pool.query).toHaveBeenCalledWith(
        'INSERT INTO current_employees (first_name, last_name, salutation, gender, employee_number, gross_salary, profile_colour) VALUES (?,?,?,?,?,?,?)',
        ['John', 'Doe', 'Mr', 'Male', '12345', 50000, '#FF0000']
      );
    });

    it('should return 400 if required fields are missing', async () => {
      const incompleteEmployee = {
        firstName: 'John',
        // Missing lastName, salutation, employeeNumber
      };

      const response = await request
        .post('/api/employees')
        .send(incompleteEmployee);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Required fields are missing' });
      expect(pool.query).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      const newEmployee = {
        firstName: 'John',
        lastName: 'Doe',
        salutation: 'Mr',
        gender: 'Male',
        employeeNumber: '12345',
        grossSalary: 50000,
        profileColour: '#FF0000',
      };

      pool.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request
        .post('/api/employees')
        .send(newEmployee);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Database error' });
    });
  });

  describe('PUT /api/employees/:id', () => {
    it('should update an employee', async () => {
      const updatedEmployee = {
        firstName: 'John',
        lastName: 'Doe',
        salutation: 'Mr',
        gender: 'Male',
        employeeNumber: '12345',
        grossSalary: 60000, // Updated salary
        profileColour: '#FF0000',
      };

      pool.query.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const response = await request
        .put('/api/employees/1')
        .send(updatedEmployee);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Employee updated successfully' });
      expect(pool.query).toHaveBeenCalledWith(
        'UPDATE current_employees SET first_name=?, last_name=?, salutation=?, gender=?, employee_number=?, gross_salary=?, profile_colour=? WHERE id=?',
        ['John', 'Doe', 'Mr', 'Male', '12345', 60000, '#FF0000', '1']
      );
    });

    it('should return 400 if required fields are missing', async () => {
      const incompleteEmployee = {
        firstName: 'John',
        // Missing lastName, salutation, employeeNumber
      };

      const response = await request
        .put('/api/employees/1')
        .send(incompleteEmployee);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Required fields are missing' });
      expect(pool.query).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      const updatedEmployee = {
        firstName: 'John',
        lastName: 'Doe',
        salutation: 'Mr',
        gender: 'Male',
        employeeNumber: '12345',
        grossSalary: 60000,
        profileColour: '#FF0000',
      };

      pool.query.mockRejectedValueOnce(new Error('Database error'));

      const response = await request
        .put('/api/employees/1')
        .send(updatedEmployee);

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Database error' });
    });
  });
});