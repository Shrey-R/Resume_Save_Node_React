require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { createTable } = require('./db/dbsetup');
const cors = require('cors');
const uploadResumeDetails = require('./routes/resume/uploadResumeDetails');
const getResumeById = require('./routes/resume/getResumeById');
const getResumeByName = require('./routes/resume/getResumeByName');
const { client, addToCache } = require('./redis/redisClient');

const app = express();

app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001']
}));

app.use(bodyParser.json());

app.use('/api/uploadResumeDetails',uploadResumeDetails)

app.use('/api/getResumeById',getResumeById);

app.use('/api/getResumeByName',getResumeByName)

const PORT = process.env.PORT || 8080;
const start = async () => {
    try {
        await createTable();
        console.log("Connected to the database and ensured the table is ready.");

        await client.connect();
        console.log("Connected to redit")

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (err) {
        console.error("Failed to start the server due to database connection error:", err);
        process.exit(1);
    }
};

start();