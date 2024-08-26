import express from 'express';
import { createQuote, deleteTask, getRandomQuote, getUserProfile, getUserTasks, loginUser, postTask, registerUser, updateTask, updateUserProfile } from '../controllers/authController.js';
import { authenticateToken } from '../middlewares/authmiddleware.js';


const userRouter = express.Router();

// Route to register a new user
userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.get('/user-profile', authenticateToken, getUserProfile);
userRouter.put('/update-profile', authenticateToken, updateUserProfile);
userRouter.post('/tasks', authenticateToken, postTask);
userRouter.get('/tasks', authenticateToken, getUserTasks);
userRouter.put('/tasks/:taskId', authenticateToken, updateTask);
userRouter.delete('/tasks/:taskId', authenticateToken, deleteTask);
userRouter.post('/quotes', createQuote);
userRouter.get('/quotes', getRandomQuote);


export default userRouter;
