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

module.exports = router;
