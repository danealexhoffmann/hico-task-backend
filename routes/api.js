const express = require('express');
const router = express.Router();
const pool = require('../db/connection');

//Test route
router.get('/test', (req, res) => {
	res.json({ message: 'API working' });
});

//Getting data from mysql
router.get('/data', async (req, res) => {
	try {
		const [rows] = await pool.query('SELECT * FROM your_table');
		res.json({ message: rows });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
})

//Task employee data
router.get('/employees', async (req, res) => {
	try {
		const [rows] = await pool.query('SELECT * FROM current_employees');
		res.json({ message: rows });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
})

//Post employee data
router.post('/employees', async (req, res) => {
	const { firstName, lastName, salutation, employeeNumber, grossSalary, profileColour } = req.body;
	if (!firstName || !lastName || !salutation || !employeeNumber) {
		return res.status(400).json({ error: 'Required fields are missing' });
	}
	try {
		const [rows] = await pool.query('INSERT INTO current_employees (first_name, last_name, salutation, employee_number, gross_salary, profile_colour) VALUES (?,?,?,?,?,?)', [firstName, lastName, salutation, employeeNumber, grossSalary, profileColour]);
		res.json({ message: 'Employee added successfully', employeeId: rows.insertId });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
})

module.exports = router;
