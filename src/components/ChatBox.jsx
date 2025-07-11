import React, { useState, useEffect } from "react";
//import { FaPlus } from "react-icons/fa";
import {
  Box,
  Input,
  Button,
  HStack,
  VStack,
  Text,
  Avatar,
} from "@chakra-ui/react";
import { io } from "socket.io-client";

const socket = io("http://localhost:4000");

const ChatBox = () => {
  const [messages, setMessages] = useState([]);

  const [input, setInput] = useState("");
  const [userId, setUserId] = useState(null);
  const [image, setImage] = useState(null);

  useEffect(() => {
    // Generate or get userId from session storage
    let storedUserId = sessionStorage.getItem("userId");
    if (!storedUserId) {
      storedUserId = Math.random().toString(36).substring(7);
      sessionStorage.setItem("userId", storedUserId);
    }
    setUserId(storedUserId);

    //Fetch and listen for previous messages sent by the server
    //socket.emit("getMessages");

    socket.on("previousMessagesSent", (previousMessagesSent) => {
      setMessages(previousMessagesSent);
    });

    // Listen for incoming messages
    socket.on("receiveMessage", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off("previousMessagesSent");
      socket.off("receiveMessage");
    };
  }, []);

  const sendMessage = () => {
    if (input.trim() || image) {
      const message = {
        email: "thespoof1@gmail.com",
        password: "thespoof@A1",
        userId,
        text: input.trim() ? input : null,
        image: image ? URL.createObjectURL(image) : null,
      };

      socket.emit("sendMessage", message);
      //setMessages((prevMessages) => [...prevMessages, message]);
      setInput("");
      setImage(null);
    }
  };

  const handleChatGPTMessage = async () => {
    try {
      const response = await fetch("http://localhost:4000/chatgpt-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: input }),
      });
      const data = await response.json();
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: input, email: "thespoof1@gmail.com" },
        { text: data.reply, email: "chatgpt@bot.com" },
      ]);
      setInput("");
    } catch (error) {
      console.error("Error fetching chatgpt message:", error);
    }
  };

  //handle the message to send when press enter button

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  //Handle image selection
  const handleImages = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file); //set selected image
    }
  };

  return (
    <VStack spacing={4} align="stretch">
      <Box h="400px" p={4} borderWidth={1} borderRadius="lg" overflowY="auto">
        {messages.map((msg, index) => (
          <HStack
            key={index}
            justify={msg.userId === userId ? "flex-start" : "flex-end"}
            mb={2}
          >
            {msg.userId === userId && <Avatar name="Me" />}
            <Box
              bg={msg.userId === userId ? "blue.100" : "green.100"}
              p={3}
              borderRadius="lg"
              maxW="70%"
            >
              {msg.text && <Text>{msg.text}</Text>}
              {msg.image && (
                <img src={msg.image} alt="Sent" style={{ maxWidth: "100px" }} />
              )}
            </Box>
            {msg.userId !== userId && <Avatar name="Other" />}
          </HStack>
        ))}
      </Box>

      <HStack>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message here..."
        />
        {/*'+' Icon for uploading an image */}

        <input
          id="image-upload"
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleImages}
        />
        <Button onClick={sendMessage} colorScheme="teal">
          Send
        </Button>
        <Button onClick={handleChatGPTMessage} colorScheme="purple">
          Ask ChatGPT
        </Button>
      </HStack>
    </VStack>
  );
};

export default ChatBox;
