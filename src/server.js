require('dotenv').config();
const express = require('express');
const connectDatabase = require('./config/database');
const createError = require('http-errors');
const cors = require('cors');
const morgan = require('morgan');
const port = process.env.PORT || 3000;
const app = express();

const authRoutes = require('./routes/auth');


app.use(cors());
app.use(morgan('dev'));

app.use(express.json());



app.get('/', (req, res) => {
    res.send('Hello World');
});
app.use('/api/auth', authRoutes);

app.use((req, res, next) => {
    next(createError(404, "Route not found"));
});


app.use((err, req, res, next) => {
    console.error(err.stack);
    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({ error: { message: 'Unauthorized', status: 401 } });
    }
    res.status(err.status || 500);
    res.json({
        error: {
            message: err.message,
            status: err.status || 500
        }
    });
});

connectDatabase();

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}/ 🚀`);
});