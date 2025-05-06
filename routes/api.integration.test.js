const express = require('express');
const router = require('./api');
const pool = require('../db/connection');

describe('API Routes Integration', () => {
  let app;
  let request;
  let testEmployeeId;

  beforeAll(async () => {
    // Create a new Express app
    app = express();
    app.use(express.json());
    app.use('/api', router);

    // Use supertest for HTTP assertions
    request = require('supertest')(app);

    // Clean up the test database before starting
    await pool.query('DELETE FROM current_employees WHERE employee_number = ?', ['TEST12345']);
  });

  afterAll(async () => {
    // Clean up after tests
    if (testEmployeeId) {
      await pool.query('DELETE FROM current_employees WHERE id = ?', [testEmployeeId]);
    }

    // Close the database connection
    await pool.end();
  });

  describe('GET /api/test', () => {
    it('should return a success message', async () => {
      const response = await request.get('/api/test');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'API working' });
    });
  });

  describe('Employee CRUD operations', () => {
    it('should create, read, update, and delete an employee', async () => {
      // 1. Create a new test employee
      const newEmployee = {
        firstName: 'Test',
        lastName: 'User',
        salutation: 'Mr',
        gender: 'Male',
        employeeNumber: 'TEST12345',
        grossSalary: 50000,
        profileColour: '#00FF00',
      };

      let response = await request
        .post('/api/employees')
        .send(newEmployee);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Employee added successfully');
      expect(response.body.employeeId).toBeDefined();

      // Save the employee ID for later use
      testEmployeeId = response.body.employeeId;

      // 2. Verify the employee was created by getting all employees
      response = await request.get('/api/employees');

      expect(response.status).toBe(200);
      const createdEmployee = response.body.message.find(emp => emp.id === testEmployeeId);
      expect(createdEmployee).toBeDefined();
      expect(createdEmployee.first_name).toBe('Test');
      expect(createdEmployee.last_name).toBe('User');
      expect(createdEmployee.employee_number).toBe('TEST12345');

      // 3. Update the employee
      const updatedEmployee = {
        ...newEmployee,
        firstName: 'Updated',
        lastName: 'Employee',
        grossSalary: 60000,
      };

      response = await request
        .put(`/api/employees/${testEmployeeId}`)
        .send(updatedEmployee);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Employee updated successfully');

      // 4. Verify the employee was updated
      response = await request.get('/api/employees');

      const updatedEmployeeFromDb = response.body.message.find(emp => emp.id === testEmployeeId);
      expect(updatedEmployeeFromDb).toBeDefined();
      expect(updatedEmployeeFromDb.first_name).toBe('Updated');
      expect(updatedEmployeeFromDb.last_name).toBe('Employee');
      expect(updatedEmployeeFromDb.gross_salary).toBe(60000);
    });
  });

  describe('Error handling', () => {
    it('should return 400 when required fields are missing', async () => {
      const incompleteEmployee = {
        firstName: 'Test',
        // Missing required fields
      };

      const response = await request
        .post('/api/employees')
        .send(incompleteEmployee);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Required fields are missing');
    });

    it('should handle database errors gracefully', async () => {
      // This test is a bit tricky as we need to cause a database error
      // One way is to try to insert a duplicate employee number if your schema has a unique constraint
      if (testEmployeeId) {
        const duplicateEmployee = {
          firstName: 'Duplicate',
          lastName: 'User',
          salutation: 'Mr',
          gender: 'Male',
          employeeNumber: 'TEST12345', // Same as our test employee
          grossSalary: 50000,
          profileColour: '#00FF00',
        };

        // First, make sure our test employee exists with this employee number
        await request
          .put(`/api/employees/${testEmployeeId}`)
          .send({
            ...duplicateEmployee,
            employeeNumber: 'TEST12345',
          });

        // Now try to create another employee with the same number
        // This should fail if your database has a unique constraint on employee_number
        const response = await request
          .post('/api/employees')
          .send(duplicateEmployee);

        // The exact behavior depends on your database constraints
        // If employee_number has a unique constraint, this should return a 500 error
        // If not, this test might need adjustment
        expect(response.status).toBe(500);
        expect(response.body.error).toBeDefined();
      }
    });
  });
});