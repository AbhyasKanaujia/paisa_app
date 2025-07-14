const path = require('path');

require('dotenv').config();
const express = require('express');

const connectDB = require('./config/db');
const budgetRoutes = require('./routes/budgetRoutes');

const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

connectDB();

app.use("/api/users", require("./routes/user"));
app.use("/api/transactions", require("./routes/transaction"));
app.use("/api/batches", require("./routes/batch"));
app.use("/api/accounts", require("./routes/account"));
app.use("/api/tags", require("./routes/tag"));

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'client/build')));

    app.get('/{*splat}', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
