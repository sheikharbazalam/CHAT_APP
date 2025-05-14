import { useState, useEffect, useRef } from "react";

import { FaPlus, FaPaperPlane } from "react-icons/fa";
import {
  Box,
  Input,
  Button,
  HStack,
  VStack,
  Text,
  Avatar,
  IconButton,
} from "@chakra-ui/react";

import { io } from "socket.io-client";
import VoiceRecorder from "./VoiceRecord"; // Import the VoiceRecorder component

const socket = io("http://localhost:4000");

const ChatBox = () => {
  const [messages, setMessages] = useState([]);

  const [input, setInput] = useState("");
  const [userId, setUserId] = useState(null);
  const [image, setImage] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  //
  const messagesEndRef = useRef(null);
  //const userEmail = sessionStorage.getItem("userEmail");

  useEffect(() => {
    const email = sessionStorage.getItem("userEmail");
    console.log("fetching history:", email);
    // Check if email is already in session storage
    if (email) {
      setUserEmail(email);
    }

    const fetchChatHistory = async () => {
      try {
        const response = await fetch(
          `http://localhost:4000/api/chat-history?email=${email}`
        );
        const data = await response.json();
        setMessages(data.reverse()); //Set the fetched chat history
      } catch (error) {
        console.error("Error fetching Chat History", error);
      }
      console.log("Stored email:", sessionStorage.getItem("userEmail"));
    };

    /*axios
      .get("http://localhost:4000/api/chat-history?email=thespoof1@gmail.com")
      .then((response) => {
        setMessages(response.data); //Set the fetched chat history
      })
      .catch((error) => {
        console.error("Error fetching Chat History", error);
      });*/

    // Generate or get userId from session storage
    let storedUserId = sessionStorage.getItem("userId");
    if (!storedUserId) {
      storedUserId = Math.random().toString(36).substring(7);
      sessionStorage.setItem("userId", storedUserId);
    }

    setUserId(storedUserId);

    //Fetch and listen for previous messages sent by the server
    //socket.emit("getMessages");

    /*socket.on("previousMessagesSent", (previousMessagesSent) => {
      setMessages(previousMessagesSent);
    });*/

    //Set user email from session storage

    if (email) {
      fetchChatHistory(email);
    }
    // Listen for incoming messages
    socket.on("receiveMessage", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
      scrollToBottom(); //scroll to bottom of new messages
    });

    return () => {
      //socket.off("previousMessagesSent");
      socket.off("receiveMessage");
    };
  }, []);

  const sendMessage = () => {
    if (input.trim() || image) {
      const message = {
        email: "thespoof318@gmail.com",
        password: "thespoof1A1",
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

  //handle the message to send when press enter button

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  //Handle image selection
  const handleImages = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);

    try {
      fetch("http://localhost:4000/upload-image", {
        method: "POST",
        body: formData,
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Image uploaded:", data);
          setMessages((prevMessages) => [
            ...prevMessages,
            { userId, image: data.imageUrl },
          ]);
          scrollToBottom();
        })
        .catch((error) => {
          console.error("Error uploading image:", error);
        });
    } catch (error) {
      console.error("Error uploading image:", error);
    }
    setImage(file);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behaviour: "smooth" });
  };

  const handleSendVoice = async (file) => {
    const formData = new FormData();
    formData.append("voice", file);
    formData.append("userId", userId);

    await fetch("http://localhost:4000/upload-voice", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Voice message sent:", data);
        setMessages((prevMessages) => [
          ...prevMessages,
          { userId, voice: data.voiceUrl },
        ]);
        scrollToBottom();
      })
      .catch((error) => {
        console.error("Error sending voice message:", error);
      });
  };

  return (
    <VStack p-2 spacing={4} align="stretch">
      <Box h="400px" p={4} borderWidth={1} borderRadius="lg" overflowY="auto">
        {messages.map((msg, index) => (
          <HStack
            key={index}
            justify={msg.email === userEmail ? "flex-start" : "flex-end"}
            mb={2}
          >
            {msg.email === userEmail && <Avatar name="Me" />}
            <Box
              bg={msg.email === userEmail ? "blue.100" : "green.100"}
              p={3}
              borderRadius="lg"
              maxW="70%"
            >
              {msg.text && <Text>{msg.text}</Text>}
              {msg.image && (
                <img src={msg.image} alt="Sent" style={{ maxWidth: "100px" }} />
              )}
              {msg.audioUrl && (
                <audio controls>
                  <source src={msg.audioUrl} type="audio/webm" />
                  Your browser does not support the audio element.
                </audio>
              )}
              {msg.voice && (
                <audio controls>
                  <source src={msg.voice} type="audio/webm" />
                  Your browser does not support the audio element.
                </audio>
              )}
            </Box>
            {msg.userId !== userId && <Avatar name="Other" />}
          </HStack>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      <HStack>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message"
        />
        {/*'+' Icon for uploading an image */}
        <IconButton
          as="label"
          htmlFor="image-upload"
          icon={<FaPlus />}
          colorScheme="teal"
          aria-label="Upload Image"
          cursor={"pointer"}
          variant="outline"
        />
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleImages}
        />
        <VoiceRecorder onSendVoice={handleSendVoice} />
        <Button
          onClick={sendMessage}
          colorScheme="teal"
          leftIcon={<FaPaperPlane />}
        >
          Send
        </Button>
      </HStack>
    </VStack>
  );
};

export default ChatBox;
