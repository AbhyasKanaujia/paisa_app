require('dotenv').config();
const express = require('express');
const connectDB = require('./config/db');
const budgetRoutes = require('./routes/budgetRoutes');

const cors = require('cors');

const app = express();
app.use(cors());
connectDB();
app.use(express.json());

app.use('/api/budget', budgetRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
