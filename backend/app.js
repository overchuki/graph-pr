const express = require('express');
const app = express();
const server = require('http').createServer(app);
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const { connectToDB, db } = require('./db');
const { verifyUser } = require('./auth/authMiddleware');
const mainRouter = require('./routers/mainRouter');

require('dotenv').config({
    path: `${__dirname}/.env`
});

// Establish connection with MySQL server
connectToDB().then(res => {
    console.log('Connected to DB with threadID: ', res.threadId);
});

// Start server on development port
server.listen(process.env.DEV_PORT, () => {
    console.log('Listening on Port', process.env.DEV_PORT);
});

// Various middleware for logging and parsing
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
// app.use((req, res, next) => {
//     res.setHeader("Content Security Policy", "default src 'self' ");
//     next();
// });

//Connect and user db
app.use(db);

// Verify JWT token
app.use(verifyUser);

app.get('/', (req, res, next) => {
    res.send('Welcome to calorie tracker.');
});

// Use main router for every request
app.use(mainRouter);

// Catch unknown requests
app.use((req, res) => {
    res.status(404).send({ error: 'the requested endpoint does not exist' });
});