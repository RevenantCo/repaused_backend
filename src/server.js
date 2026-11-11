require('dotenv').config();
const express  = require('express');

const createError = require('http-errors');
const cors = require('cors');
const morgan = require('morgan');

const port = process.env.PORT || 3000;

const app = express();


app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World');
});

app.use((req, res, next) => {
    next(createError(404, "Route not found"));
});


app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
        error: {
            message: err.message,
            status: err.status || 500
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}/ 🚀`);
});