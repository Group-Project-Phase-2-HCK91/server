const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Controller
const UserController = require('./controllers/userController');

// Middleware
const errorHandler = require('./middlewares/errorHandlers');

// Routes
app.post('/users', UserController.createUser);
// app.get('/')


app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});