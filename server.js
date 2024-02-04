const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
    origin: 'http://localhost:3000/',
    credentials: true,
};

app.use(cors(corsOptions));

app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/backend', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
});

const User = mongoose.model('User', userSchema);

const { Schema, model } = mongoose;

const bookSchema = new Schema({
    title: { type: String, required: true },
    author: { type: String },
    language: { type: String, required: true },
});

const Book = model('Book', bookSchema);

app.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const token = jwt.sign({ userId: user._id }, 'your-secret-key', {
            expiresIn: '1min',
        });

        res.cookie('authToken', token, { httpOnly: true, maxAge: 3600000 });

        res.status(200).json({ token, userId: user._id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/logout', (req, res) => {
    res.status(200).json({ message: 'Logout successful' });
});

const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    jwt.verify(token, 'your-secret-key', (err, user) => {
        if (err) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        req.user = user;
        next();
    });
};

app.get('/protected-route', authenticateJWT, (req, res) => {
    res.json({ message: 'Access granted' });
});

app.post('/books/:language', async (req, res) => {
    try {
        const { title, author } = req.body;
        const language = req.params.language.toLowerCase();
        const newBook = new Book({ title, author, language });
        await newBook.save();

        res.status(201).json({ message: 'Book added successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
app.use('/books', express.static('books'));

app.get('/books/:language', async (req, res) => {
    try {
        const language = req.params.language.toLowerCase();
        const books = await Book.find({language }) ;
        res.json(books);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
app.use('*.css', (req, res, next) => {
    res.header('Content-Type', 'text/css');
    next();
});
app.get('/books', async (req, res) => {
    try {
        const { language, sortBy, filterBy, page, limit } = req.query;

        let query = {};

        if (language) {
            query.language = language.toLowerCase();
        }

        if (filterBy) {
            // more filter criteria in the future
        }

        const sortOrder = sortBy === 'desc' ? -1 : 1;

        const sortField = 'title';

        const books = await Book.find(query)
            .sort({ [sortField]: sortOrder })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.json(books);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
