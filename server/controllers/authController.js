import bcrypt from 'bcrypt';
import { db } from '../server.js';
import jwt from 'jsonwebtoken'; // Assuming you're using JWT for token generation

// Register a new user
export const registerUser = async (req, res) => {
    const { name, email, age, profession, contact_number, username, password } = req.body;

    try {
        // Check if the username or email already exists
        const [existingUser] = await db.execute(
            'SELECT * FROM users WHERE username = ? OR email = ?',
            [username, email]
        );

        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'Username or email already exists.' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert the new user into the database
        await db.execute(
            'INSERT INTO users (name, email, age, profession, contact_number, username, password) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, email, age, profession, contact_number, username, hashedPassword]
        );

        res.status(201).json({ message: 'User registered successfully.' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};


// Login a user
export const loginUser = async (req, res) => {
    const { username, password } = req.body;

    try {
        // Fetch the user by username
        const [users] = await db.execute(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }

        const user = users[0];

        // Compare the provided password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid username or password.' });
        }

        // Generate a JWT token (assuming you have a secret key defined in your environment variables)
        const token = jwt.sign(
            { id: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1h' } // Token expires in 1 hour
        );

        res.status(200).json({ message: 'Login successful.', token });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

// Controller to get logged-in user details
export const getUserProfile = async (req, res) => {
    const userId = req.user.id;

    try {
        // Fetch the user details from the database
        const [users] = await db.execute(
            'SELECT name, age, profession, contact_number FROM users WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const user = users[0];

        res.status(200).json({ user });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

// Controller to update user profile
export const updateUserProfile = async (req, res) => {
    const userId = req.user.id;
    const { name, age, profession, contact_number, currentPassword, newPassword } = req.body;

    try {
        // If newPassword is provided, check if currentPassword is also provided
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ message: 'Current password is required to update password.' });
            }

            // Fetch the current hashed password from the database
            const [users] = await db.execute('SELECT password FROM users WHERE id = ?', [userId]);

            if (users.length === 0) {
                return res.status(404).json({ message: 'User not found.' });
            }

            const user = users[0];

            // Compare currentPassword with the hashed password
            const isMatch = await bcrypt.compare(currentPassword, user.password);

            if (!isMatch) {
                return res.status(401).json({ message: 'Current password is incorrect.' });
            }

            // Hash the new password
            const hashedNewPassword = await bcrypt.hash(newPassword, 10);

            // Update the user with the new password
            await db.execute(
                'UPDATE users SET name = ?, age = ?, profession = ?, contact_number = ?, password = ? WHERE id = ?',
                [name, age, profession, contact_number, hashedNewPassword, userId]
            );
        } else {
            // Update the user without changing the password
            await db.execute(
                'UPDATE users SET name = ?, age = ?, profession = ?, contact_number = ? WHERE id = ?',
                [name, age, profession, contact_number, userId]
            );
        }

        res.status(200).json({ message: 'Profile updated successfully.' });
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};


// Controller to post a new task
export const postTask = async (req, res) => {
    const userId = req.user.id; // Get user ID from token
    const { title, description, status, priority, due_date, time_limit } = req.body;

    try {
        // Insert the new task into the database
        await db.execute(
            'INSERT INTO tasks (user_id, title, description, status, priority, due_date, time_limit) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [userId, title, description, status, priority, due_date, time_limit]
        );

        res.status(201).json({ message: 'Task created successfully.' });
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

// Controller to get all tasks for the logged-in user
export const getUserTasks = async (req, res) => {
    const userId = req.user.id; // Get the user ID from the token

    try {
        // Fetch tasks from the database for the logged-in user
        const [tasks] = await db.execute(
            'SELECT id, title, description, status, priority, due_date, created_at, updated_at FROM tasks WHERE user_id = ?',
            [userId]
        );

        res.status(200).json({ tasks });
    } catch (error) {
        console.error('Error fetching user tasks:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

// Controller to update a task
export const updateTask = async (req, res) => {
    const userId = req.user.id; // Get the user ID from the token
    const { taskId } = req.params; // Get the task ID from the request parameters
    const { title, description, status, priority, due_date } = req.body;

    try {
        // Check if the task belongs to the user
        const [tasks] = await db.execute(
            'SELECT * FROM tasks WHERE id = ? AND user_id = ?',
            [taskId, userId]
        );

        if (tasks.length === 0) {
            return res.status(404).json({ message: 'Task not found or does not belong to the user.' });
        }

        // Update the task
        await db.execute(
            'UPDATE tasks SET title = ?, description = ?, status = ?, priority = ?, due_date = ? WHERE id = ? AND user_id = ?',
            [title || tasks[0].title, description || tasks[0].description, status || tasks[0].status, priority || tasks[0].priority, due_date || tasks[0].due_date, taskId, userId]
        );

        res.status(200).json({ message: 'Task updated successfully.' });
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};


// Controller to delete a task
export const deleteTask = async (req, res) => {
    const userId = req.user.id; // Get the user ID from the token
    const { taskId } = req.params; // Get the task ID from the request parameters

    try {
        // Check if the task belongs to the user
        const [tasks] = await db.execute(
            'SELECT * FROM tasks WHERE id = ? AND user_id = ?',
            [taskId, userId]
        );

        if (tasks.length === 0) {
            return res.status(404).json({ message: 'Task not found or does not belong to the user.' });
        }

        // Delete the task
        await db.execute(
            'DELETE FROM tasks WHERE id = ? AND user_id = ?',
            [taskId, userId]
        );

        res.status(200).json({ message: 'Task deleted successfully.' });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ message: 'Server error. Please try again later.' });
    }
};

export const createQuote = async (req, res) => {
    console.log('Request body:', req.body);
    const { text, author } = req.body;

    if (!text || !author) {
        return res.status(400).json({ message: 'Text and author are required' });
    }

    const query = 'INSERT INTO quotes (text, author) VALUES (?, ?)';
    const values = [text, author];

    db.query(query, values, (err, results) => {
        if (err) {
            console.error('Error inserting quote:', err);
            return res.status(500).json({ message: 'Internal Server Error' });
        }

        res.status(201).json({
            id: results.insertId,
            text,
            author,
            created_at: new Date()
        });
    });
};

export const getRandomQuote = async (req, res) => {
    try {
        // Query to get a random quote
        const [results] = await db.query('SELECT * FROM quotes ORDER BY RAND() LIMIT 1');

        if (results.length === 0) {
            return res.status(404).json({ message: 'No quotes found' });
        }

        const quote = results[0];
        res.status(200).json({
            id: quote.id,
            text: quote.text,
            author: quote.author,
            created_at: quote.created_at
        });
    } catch (error) {
        console.error('Error fetching random quote:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
