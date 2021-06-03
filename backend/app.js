const express = require('express');
const app = express();
const server = require('http').createServer(app);
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const csrf = require('csurf');
const { connectToDB } = require('./db');
const { verifyUser } = require('./auth/authMiddleware');
const mainRouter = require('./routers/mainRouter');

require('dotenv').config({
    path: `${__dirname}/.env`
});

connectToDB().then(res => {
    console.log('Connected to DB with threadID: ', res.threadId);
});

let csrfOmit = ['/api/auth/login','/api/auth/signup'];

server.listen(process.env.DEV_PORT, () => {
    console.log('Listening on Port', process.env.DEV_PORT);
});

app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());
app.use(helmet());
// app.use((req, res, next) => {
//     res.setHeader("Content Security Policy", "default src 'self' ");
//     next();
// });
app.use((req, res, next) => {
    if(csrfOmit.indexOf(req.path)!==-1){
        next();
    }else{
        csrf({ cookie: true })(req, res, next);
    }
});
app.use(verifyUser);

app.get('/', (req, res, next) => {
    res.send('Welcome to calorie tracker.');
});

app.use(mainRouter);

app.use((req, res) => {
    res.status(404).send({ error: 'the requested endpoint does not exist' });
});