const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const app = express();
const PORT = process.env.PORT || 3000;

const corsOptions = {
    origin: 'http://localhost:3000',
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

const jwtSecret = process.env.JWT_SECRET || 'eyJhbGciOiJIUzI1NiJ9.eyJSb2xlIjoiQWRtaW4iLCJJc3N1ZXIiOiJJc3N1ZXIiLCJVc2VybmFtZSI6IkphdmFJblVzZSIsImV4cCI6MTcwNzQ3NDM3MywiaWF0IjoxNzA3NDc0MzczfQ.LwUTjSy2Z8jGYtYPatJraX2vD9-obq1uOmMW52gvDd8';
const tokenExpiration = '1h'; // Example: Token expires in 1 hour

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    programs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Program' }],
});

const User = mongoose.model('User', userSchema);

const { Schema, model } = mongoose;

const bookSchema = new Schema({
    title: { type: String, required: true },
    author: { type: String },
    language: { type: String, required: true },
    level: { type: String },
    publisher: { type: String },
});

const Book = model('Book', bookSchema);

const programSchema = new mongoose.Schema({
    name: { type: String, required: true },
    language: { type: String, required: true },
    books_id: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Book' }],
});
const Program = model('Program', programSchema);
const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization').split(' ')[1];
    console.log('Received Token:', token);

    jwt.verify(token, jwtSecret, (err, user) => {
        if (err) {
            console.error('Token Verification Error:', err);
            return res.status(401).json({ error: 'Invalid token' });
        }

        req.user = user;
        next();
    });
};

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

        const token = jwt.sign({ userId: user._id }, jwtSecret, {
            expiresIn: tokenExpiration,
        });

        const populatedUser = await User.findById(user._id).populate('programs');

        res.cookie('authToken', token, {
            httpOnly: true,
            maxAge: 3600000,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'None',
        });

        res.status(200).json({ token, userId: user._id, programs: populatedUser.programs });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
app.post('/logout', (req, res) => {
    res.status(200).json({ message: 'Logout successful' });
});


app.get('/protected-route', authenticateJWT, (req, res) => {
    res.json({ message: 'Access granted' });
});

app.post('/books/:language', async (req, res) => {
    try {
        const { title, author, level, publisher } = req.body;
        const language = req.params.language.toLowerCase();
        const newBook = new Book({ title, author, language, level, publisher });
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

app.get('/books', async (req, res) => {
    try {
        const { language, sortBy, page, limit, level, author, publisher } = req.query;

        let query = {};

        if (language) {
            query.language = language.toLowerCase();
        }

        if (level) {
            query.level = level;
        }

        if (author) {
            query.author = author;
        }

        if (publisher) {
            query.publisher = publisher;
        }

        const sortOrder = sortBy === 'desc' ? -1 : 1;
        const books = await Book.find(query)
            .sort({ title: sortOrder })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        res.json(books);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/programs', async (req, res) => {
    try {
        const { name } = req.body;
        const newProgram = new Program({ name });
        await newProgram.save();

        res.status(201).json({ message: 'Program created successfully', program: newProgram });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/programs', async (req, res) => {
    try {
        const programs = await Program.find();
        res.json(programs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
app.post('/add-program/:userId/:programId', authenticateJWT, async (req, res) => {
    try {
        const userId = req.params.userId;
        const programId = req.params.programId;

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.programs.includes(programId)) {
            return res.status(400).json({ error: 'Program already added' });
        }

        user.programs.push(programId);
        await user.save();

        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error adding program:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});






