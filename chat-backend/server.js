require("dotenv").config();
const express = require("express");
const axios = require("axios");
const http = require("http");
const { Server } = require("socket.io");
const multer = require("multer");
const cors = require("cors");

const mongoose = require("mongoose");

const timeStamp = require("timeStamp");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json({ limit: "50mb" })); // Increase the limit to 50mb
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

//image upload
app.post("/upload-image", upload.single("image"), (req, res) => {
  const filePath = `http://localhost:4000/uploads/${req.file.filename}`;
  res.json({ imageUrl: filePath });
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

//chatgpt message api integration
app.post("/chatgpt-message", async (req, res) => {
  const { message } = req.body;
  try {
    const response = await axios.post(
      " https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: message }],
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPPEN_AI_API_KEY}`,
        },
      }
    );
    res.json({ reply: response.choices[0].message.content });
  } catch (error) {
    console.log(
      "Error fetching chatgpt message:",
      error.response?.data || error.message
    );
    res.status(500).json({ error: "Error fetching chatgpt message" });
  }
});

//endpoint to set user preferred language
app.post("/api/set-preferred-language", async (req, res) => {
  const { email, language } = req.body;
  try {
    await User.updateOne(
      { email },
      { preferredLanguage: language },
      { upsert: true } // Create a new user if not exists
    );
    res.json({
      success: true,
      message: "Preferred language updated successfully",
    });
  } catch (error) {
    console.error("Error updating preferred language:", error);
    res.status(500).json({ error: "Error updating preferred language" });
  }
});

//Translation utility Function
const translateMessage = async (text, targetLanguage) => {
  const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY; // Ensure you have set this in your environment variables
  const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;
  try {
    const response = await axios.post(url, {
      q: text,
      target: targetLanguage,
      format: "text",
    });
    return response.data.data.translations[0].translatedText;
  } catch (error) {
    console.error(
      "Error translating message:",
      error.response?.data || error.message
    );
    return text; // Return original message if translation fails
  }
};
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

  image: {
    type: String,
    required: false,
  },

  timeStamp: {
    type: Date,
    default: Date.now,
  },
  preferredLanguage: {
    type: String,
    default: "en", // Default language is English
  },
  createdAt: {
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
    required: false,
  },

  image: {
    type: String,
    required: false,
  },
  timeStamp: {
    type: Date,
    default: Date.now,
  },
  replyTo: {
    type: mongoose.Schema.Types.Mixed,
    default: null, // Allow null for no reply
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

//connection mongoose
//password:drjdnurjaha1
//username:drjdchat

mongoose
  .connect(process.env.MONGODB_URI, {
    connectTimeoutMS: 30000,

    //useCreateIndex: true, // Use this if you are using an older version of mongoose
  })
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
const userSockets = {};
io.on("connection", async (socket) => {
  console.log("A user connected:", socket.id);
  // Register user with their email
  socket.on("register", async (email) => {
    userSockets[email] = socket.id; // Store the socket ID for the user
    console.log(`User registered: ${email} with socket ID: ${socket.id}`);
  });

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
          // text: message.text,
          // //image: message.image || null,
          // ...(message.image && { image: message.image }),
        });
        await user.save();
      }
      // const recipient = await User.findOne({ email: message.toEmail });
      // const targetLanguage = recipient?.preferredLanguage || "en"; // Default to English if no preference is set

      // let translatedText = message.text;
      // if (message.text && targetLanguage !== "en") {
      //   translatedText = await translateMessage(message.text, targetLanguage);
      // }

      // const newMessage = new Message({
      //   email: message.email,
      //   password: message.password,
      //   //text: message.text,
      //   text: translatedText, // Use the translated text

      //   //image: message.image || null, //it will handle image URL
      //   ...(message.image && { image: message.image }),
      // });
      // await newMessage.save(); //save to mongoDB
      // console.log("Message saved:", newMessage);
      // Emit the message to all connected clients
      //io.emit("receiveMessage", newMessage);
      // Emit the message to the specific recipient
      const allUsers = await User.find();
      //for each user , translate and emit
      for (const user of allUsers) {
        let translatedText = message.text; // Default to original text if translation fails
        if (message.text && user.preferredLanguage !== "en") {
          translatedText = await translateMessage(
            message.text,
            user.preferredLanguage
          );
        }

        //send to users socket only if they are connected
        const socketId = userSockets[user.email];
        if (socketId) {
          io.to(socketId).emit("receiveMessage", {
            ...message,
            text: translatedText, // Use the translated text
            userId: message.userId,
          });
        }
      }

      // io.emit("receiveMessage", {
      //   ...message,
      //   text: translatedText, // Use the translated text
      //   userId: message.userId,
      // });
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
