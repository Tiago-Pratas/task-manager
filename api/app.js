import express from 'express';
import * as db from './db/mongoose.js';
import { router as listRouter } from './routes/list.routes.js'
import { router as usersRoute } from './routes/user.routes.js'


const port = process.env.PORT || 3000;

const app = express();

db.connect();

//load middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }))


//allow CORS
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

/* route handlers */

app.use('/lists', listRouter);
app.use('/users', usersRoute);

//exception handling
app.use('*', (req, res, next) => {
    const error = new Error('Route not found');
    error.status = 404;
    next(error);
});

app.use((err, req, res, next) => {
    return res.status(err.status || 500).json(err.message || 'Unexpected error')
})

app.listen(port, () => {
    console.log(`Listening on ${port}`);
})