const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const mongoose = require("mongoose");
//const { timeStamp } = require("console");

const app = express();
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
  image: String,
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
  image: String,
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
    "mongodb+srv://drjdchat:drjdnurjaha1@drjdchat.ge1uv.mongodb.net/?retryWrites=true&w=majority&appName=DRJDCHAT",
    {
      serverSelectionTimeoutMS: 30000,
    }
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
          image: message.image || null,
        });
        await user.save();
      }
      const newMessage = new Message({
        email: message.email,
        password: message.password,
        text: message.text,
        image: message.image || null, //it will handle image URL
      });
      await newMessage.save(); //save to mongoDB
      console.log("Message saved:", newMessage);
      io.emit("receiveMessage", message);
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
