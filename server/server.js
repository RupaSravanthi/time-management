import express from 'express';
import mysql from 'mysql2/promise';
import cors from "cors";
import dotenv from 'dotenv';
import userRouter from './routes/userRoutes.js';

// Load environment variables from .env file
dotenv.config();

// Create an Express application
const app = express();

// Parse JSON bodies (as sent by API clients)
app.use(express.json());
app.use(cors());

let db;

// Create a MySQL database connection using async/await
const connectDB = async () => {
    try {
        db = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            // password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
        });
        console.log('Connected to the MySQL database.');
    } catch (err) {
        console.error('Error connecting to the database:', err);
        process.exit(1); // Exit process with failure
    }
};

// Call the function to connect to the database
connectDB();

// Define a simple route
app.get('/', (req, res) => {
    res.send('Task Management API is running...');
});

// Use the user routes
app.use('/users', userRouter);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export { db };
