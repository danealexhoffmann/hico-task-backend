require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const apiRoutes = require('./routes/api');

//Middleware
app.use(cors());
app.use(express.json());

//Routes
app.use('/api', apiRoutes);

//Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
})
