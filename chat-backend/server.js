const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const multer = require("multer");
const cors = require("cors");

const mongoose = require("mongoose");
//const { timeStamp } = require("timeStamp");
const timeStamp = require("timeStamp");

//const { timeStamp } = require("console");

const app = express();
app.use(cors());
app.use("/uploads", express.static("uploads"));

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

//image upload
app.post("/upload-image", upload.single("image"), (req, res) => {
  const imageUrl = `/uploads/${req.file.filename}`;
  res.json({ imageUrl });
  //save the path if userId to DB if required
  res.status(200).json({ message: "uploaded", url: imageUrl });
});
//voice upload

app.post("/upload-voice", upload.single("voice"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const filePath = `/uploads/${req.file.filename}`;
  //save the path if userId to DB if required
  res.status(200).json({ message: "uploaded", url: filePath });
});
//app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "50mb" })); // Increase the limit to 50mb
app.use(express.static("public"));
app.use(express.static("uploads")); // Serve static files from the uploads directory
app.use(express.static("public"));
const server = http.createServer(app);

//Schema for user

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  text: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: false,
  },

  timeStamp: {
    type: Date,
    default: Date.now,
  },
});

//schema for messages
const messageSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    //unique: true,
  },
  text: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: false,
  },
  timeStamp: {
    type: Date,
    default: Date.now,
  },
});

//connection mongoose
//password:drjdnurjaha1
//username:drjdchat

mongoose
  .connect(
    "mongodb+srv://drjdchat:drjdnurjaha1@drjdchat.ge1uv.mongodb.net/chatApp?retryWrites=true&w=majority&appName=DRJDCHAT",
    { connectTimeoutMS: 30000 }
  )
  .then(() => console.log("mongodb connected"))
  .catch((err) => console.log("mongodb error", err));
// Model
const User = mongoose.model("User", userSchema);
const Message = mongoose.model("Message", messageSchema);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

//API endpoint to help user to retrieve their previous chat messages on the application.
app.get("/api/chat-history", async (req, res) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const messages = await Message.find({ email })
      .sort({ timeStamp: -1 })
      .exec();

    res.json(messages);
  } catch (error) {
    console.log("Error fetching chat history:", error);
    res.status(500).json({ error: "Error fetching chat history" });
  }
});

io.on("connection", async (socket) => {
  console.log("A user connected:", socket.id);

  //send previously stored message to the connected user
  /*User.find()
    .sort({ timestamp: 1 }) //sort message by timeStamp
    .exec((err, user) => {
      if (err) {
        console.log("Error fetching messages:", err);
      } else {
        socket.emit("previousMessages", user);
      }
    });*/

  try {
    const users = await User.find().sort({ timestamp: 1 });
    socket.emit("previousMessages", users);
  } catch (err) {
    console.log("Error fetching messages:", err);
  }

  socket.on("sendMessage", async (message) => {
    try {
      let user = await User.findOne({ email: message.email });

      //if the user doesnt exist create the new user
      if (!user) {
        user = new User({
          email: message.email,
          password: message.password,
          text: message.text,
          //image: message.image || null,
          ...(message.image && { image: message.image }),
        });
        await user.save();
      }
      const newMessage = new Message({
        email: message.email,
        password: message.password,
        text: message.text,
        //image: message.image || null, //it will handle image URL
        ...(message.image && { image: message.image }),
      });
      await newMessage.save(); //save to mongoDB
      console.log("Message saved:", newMessage);

      io.emit("receiveMessage", {
        ...message,
        userId: message.userId,
      });
    } catch (error) {
      console.log("Error saving message", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

server.listen(4000, () => {
  console.log("Server listening on port 4000");
});
