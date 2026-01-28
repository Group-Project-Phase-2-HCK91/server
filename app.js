require('dotenv').config();
const express = require('express');
const app = express();
const port = 3000;
const multer = require('multer');
const cors = require('cors'); 

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const upload = multer({ 
    storage: multer.memoryStorage(), 
    limits: { fileSize: 5 * 1024 * 1024 } 
});

// Controller
const UserController = require('./controllers/userController');
const MessageController = require('./controllers/messageController');

// Middleware
const errorHandler = require('./middlewares/errorHandlers');
const AIController = require('./controllers/aiController');
const UploadController = require('./controllers/uploadController');

// Routes
app.post('/users', UserController.createUser);
app.get('/messages', MessageController.getMessage);
app.post('/messages', MessageController.createMessage);
app.post('/upload', upload.single('image'), UploadController.uploadImage);

app.post('/ai/summarize', AIController.summarizeChat);


app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});