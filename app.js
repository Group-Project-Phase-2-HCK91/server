require("dotenv").config();
const express = require("express");
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});
// const port = 3000;
const multer = require("multer");
const cors = require("cors");
const { User, Message } = require("./models");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

// CONTROLLER
const UserController = require("./controllers/userController");
const MessageController = require("./controllers/messageController");

// Middleware
const errorHandler = require("./middlewares/errorHandlers");
const AIController = require("./controllers/aiController");
const UploadController = require("./controllers/uploadController");

// Routes
app.post("/users", UserController.createUser);
app.get("/messages", MessageController.getMessage);
app.post("/messages", MessageController.createMessage);
app.post("/upload", upload.single("image"), UploadController.uploadImage);

app.post("/ai/summarize", AIController.summarizeChat);

app.use(errorHandler);

io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  socket.on("send-message", async (messageData) => {
    // --> Untuk menerima pesan
    try {
      console.log("Message Received:", messageData);

      // Find or create user by username if userId not provided
      let userId = messageData.userId;
      if (!userId && messageData.username) {
        const [user] = await User.findOrCreate({
          where: { username: messageData.username },
          defaults: { username: messageData.username },
        });
        userId = user.id;
      }

      const savedMessage = await Message.create({
        // --> Simpan pesan ke database
        UserId: userId,
        content: messageData.content,
        imgUrl: messageData.image_url || null,
      });

      const messageWithUser = await Message.findByPk(savedMessage.id, {
        // --> Ambil pesan beserta informasi user
        include: [{ model: User, attributes: ["username"] }],
      });

      io.emit("receive-message", messageWithUser); // --> Kirim pesan ke semua client yang terhubung
    } catch (error) {
      console.log("error", error);
      socket.emit("error", { message: "Failed to send message." });
    }
  });
});

server.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
