import { useState, useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble"; // Import the MessageBubble component

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

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "zh", name: "Chinese" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
  { code: "ru", name: "Russian" },
  { code: "pt", name: "Portuguese" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "it", name: "Italian" },
  { code: "nl", name: "Dutch" },
  { code: "tr", name: "Turkish" },
  { code: "pl", name: "Polish" },
  { code: "sv", name: "Swedish" },
  { code: "no", name: "Norwegian" },
  { code: "fi", name: "Finnish" },
  { code: "da", name: "Danish" },
  { code: "el", name: "Greek" },
  { code: "he", name: "Hebrew" },
  { code: "th", name: "Thai" },
  { code: "vi", name: "Vietnamese" },
  { code: "id", name: "Indonesian" },
  { code: "ms", name: "Malay" },
  { code: "tl", name: "Tagalog" },
  { code: "uk", name: "Ukrainian" },
  { code: "ro", name: "Romanian" },
  { code: "hu", name: "Hungarian" },
  { code: "cs", name: "Czech" },
  { code: "sk", name: "Slovak" },
  { code: "bg", name: "Bulgarian" },
  { code: "hr", name: "Croatian" },
  { code: "sl", name: "Slovenian" },
  { code: "lt", name: "Lithuanian" },
  { code: "lv", name: "Latvian" },
  { code: "et", name: "Estonian" },
  { code: "is", name: "Icelandic" },
  { code: "ga", name: "Irish" },
  { code: "cy", name: "Welsh" },
  { code: "eu", name: "Basque" },
  { code: "gl", name: "Galician" },
  { code: "ca", name: "Catalan" },
  { code: "az", name: "Azerbaijani" },
  { code: "hy", name: "Armenian" },
  { code: "ka", name: "Georgian" },
  { code: "mk", name: "Macedonian" },
  { code: "sr", name: "Serbian" },
  { code: "bs", name: "Bosnian" },
  { code: "mn", name: "Mongolian" },
  { code: "sw", name: "Swahili" },
  { code: "yo", name: "Yoruba" },
  { code: "zu", name: "Zulu" },
  { code: "am", name: "Amharic" },
  { code: "af", name: "Afrikaans" },
  { code: "bn", name: "Bengali" },
  { code: "pa", name: "Punjabi" },
  { code: "gu", name: "Gujarati" },
  { code: "ta", name: "Tamil" },
  { code: "te", name: "Telugu" },
  { code: "ml", name: "Malayalam" },
  { code: "kn", name: "Kannada" },
  { code: "mr", name: "Marathi" },
  { code: "or", name: "Odia" },
  { code: "si", name: "Sinhala" },
  { code: "ne", name: "Nepali" },
  { code: "ur", name: "Urdu" },
  { code: "fa", name: "Persian" },
  { code: "ps", name: "Pashto" },
  { code: "sd", name: "Sindhi" },
  { code: "ku", name: "Kurdish" },
  { code: "tg", name: "Tajik" },
  { code: "uz", name: "Uzbek" },
  { code: "ky", name: "Kyrgyz" },
  { code: "tk", name: "Turkmen" },
  { code: "az", name: "Azerbaijani" },
  { code: "my", name: "Burmese" },
  { code: "mai", name: "Maithili" },
  { code: "bho", name: "Bhojpuri" },
  { code: "mni-Mtei", name: "Manipuri (Meitei Mayek)" },
  { code: "doi", name: "Dogri" },
  { code: "ks", name: "Kashmiri" },
];

const ChatBox = () => {
  const [messages, setMessages] = useState([]);

  const [input, setInput] = useState("");
  const [userId, setUserId] = useState(null);
  const [image, setImage] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  //
  const messagesEndRef = useRef(null);
  const [replyTo, setReplyTo] = useState(null);
  //const userEmail = sessionStorage.getItem("userEmail");
  const [preferredLanguage, setPreferredLanguage] = useState("en");
  //for active users
  const [activeUsers, setActiveUsers] = useState([]);

  useEffect(() => {
    //Load preferred language from session storage
    const storedLang = sessionStorage.getItem("preferredLanguage");
    if (storedLang) setPreferredLanguage(storedLang);
    const email = sessionStorage.getItem("userEmail");
    console.log("fetching history:", email);
    // Check if email is already in session storage
    if (email) {
      setUserEmail(email);
      socket.emit("register", email); // Emit register event to backend with user's email
      // Emit register event to backend with user's email
    }

    //active users
    socket.on("activeUsers", (users) => {
      setActiveUsers(users);
    });

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
      socket.off("activeUsers");
      socket.off("receiveMessage");
    };
  }, []);

  const habdleLanguageChange = async (e) => {
    const newLang = e.target.value;
    setPreferredLanguage(newLang);
    sessionStorage.setItem("preferredLanguage", newLang); // Store in session storage
    try {
      const response = await fetch(
        "http://localhost:4000/api/set-preferred-language",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: userEmail,
            language: newLang,
          }),
        }
      );
      if (response.data.success) {
        console.log("Preferred language updated successfully");
      } else {
        console.error("Failed to update preferred language");
      }
    } catch (error) {
      console.error("Error updating preferred language:", error);
    }
  };

  const sendMessage = () => {
    if (input.trim() || image) {
      const message = {
        email: userEmail,
        //password: sessionStorage.getItem("password") || "", // Assuming password is stored in session storage
        replyTo: replyTo?._id || null, // Include replyTo if set

        userId,
        text: input.trim() ? input : null,
        image: image ? URL.createObjectURL(image) : null,
      };

      socket.emit("sendMessage", message);
      //setMessages((prevMessages) => [...prevMessages, message]);
      setInput("");
      setImage(null);
      setReplyTo(null); // Clear replyTo after sending the message
    }
  };
  const handleChatGPTMessage = async (userInput) => {
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
        { text: userInput, email: userEmail }, // Add user's input
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

  //reply

  //Handle image selection
  const handleImages = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("http://localhost:4000/upload-image", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      console.log("Image uploaded:", data);

      const message = {
        userId,
        email: userEmail,
        text: null,
        image: data.imageUrl, // Assuming the server returns the image URL
      };
      socket.emit("sendMessage", message);
      setImage(null);
      e.target.value = ""; // Clear the input field
    } catch (error) {
      console.error("Error uploading image:", error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behaviour: "smooth" });
  };

  // const handleSendVoice = async (file) => {
  //   const formData = new FormData();
  //   formData.append("voice", file);
  //   formData.append("userId", userId);

  //   await fetch("http://localhost:4000/upload-voice", {
  //     method: "POST",
  //     body: formData,
  //   })
  //     .then((response) => response.json())
  //     .then((data) => {
  //       console.log("Voice message sent:", data);
  //       setMessages((prevMessages) => [
  //         ...prevMessages,
  //         { userId, voice: data.voiceUrl },
  //       ]);
  //       scrollToBottom();
  //     })
  //     .catch((error) => {
  //       console.error("Error sending voice message:", error);
  //     });
  // };
  const handleSendVoice = (voiceUrl) => {
    const message = {
      userId,
      email: userEmail,
      text: null,
      image: null,
      audioUrl: voiceUrl,
    };
    socket.emit("sendMessage", message);
    //setMessages((prevMessages) => [...prevMessages, message]);
    scrollToBottom();
  };

  const handleReply = (message) => {
    setReplyTo(message);
  };

  return (
    <HStack align="stretch" w="100%" height="100%" spacing={0}>
      {/* Active Users List */}
      <Box
        w={{ base: "100%", md: "300px" }}
        bg={"gray.50"}
        borderWidth={1}
        borderRadius="lg"
        p={4}
        minH="100vh"
        boxShadow={"md"}
        display="flex"
        flexDirection="column"
        justifyContent="space-between"
      >
        <Box>
          <Text fontSize="lg" fontWeight="bold" mb={2}>
            Active Users
          </Text>

          <Text fontSize="sm" color="gray.500" mb={2}>
            {activeUsers.length} online
          </Text>
          <VStack align="stretch" spacing={3}>
            {activeUsers.map((user) => (
              <HStack
                key={user.id || user.socketId || user.email}
                spacing={3}
                bg={user.email === userEmail ? "teal.100" : "white"}
                borderRadius="md"
                p={2}
                boxShadow={user.email === userEmail ? "sm" : "none"}
              >
                <Avatar size="sm" name={user.email} />
                <Box flex="1">
                  <Text
                    fontWeight={user.email === userEmail ? "bold" : "normal"}
                    fontSize="sm"
                    color={user.email === userEmail ? "teal.700" : "gray.700"}
                    isTruncated
                  >
                    {user.email}
                  </Text>
                </Box>
                {user.email === userEmail && (
                  <Box
                    bg="teal.400"
                    color="white"
                    px={2}
                    py={1}
                    borderRadius="md"
                    fontSize="xs"
                    fontWeight="bold"
                  >
                    You
                  </Box>
                )}
              </HStack>
            ))}
          </VStack>
        </Box>
        <Box mt={8}>
          <Text fontSize="xs" color="gray.400" textAlign="center">
            Chat App &copy; 2025
          </Text>
        </Box>
      </Box>
      <VStack flex="1" p={4} spacing={4} align="stretch" w="100%">
        {/* Language Selection Dropdown */}
        <Box mb={2} textAlign="right">
          <label
            htmlFor="language-select"
            style={{ marginRight: "0.5rem", fontWeight: "bold" }}
          >
            🌐 Preferred Language:
          </label>
          <select
            id="language-select"
            value={preferredLanguage}
            onChange={habdleLanguageChange}
            style={{
              padding: "0.4rem 1rem",
              borderRadius: "6px",
              border: "1px solid #ccc",
              background: "#f9f9f9",
              fontSize: "1rem",
              minWidth: "140px",
            }}
          >
            {LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.name}
              </option>
            ))}
          </select>
        </Box>
        <Box h="100vh"  p={4} borderWidth={2} borderRadius="lg" overflowY="auto">
          {messages.map((msg, index) => (
            <HStack
              key={index}
              justify={msg.email === userEmail ? "flex-start" : "flex-end"}
              mb={2}
            >
              {msg.email === userEmail && <Avatar name={msg.email} />}
              <Box
                bg={msg.email === userEmail ? "blue.100" : "green.100"}
                p={3}
                borderRadius="lg"
                maxW="70%"
              >
                {msg.text && <Text>{msg.text}</Text>}

                {msg.image && (
                  <img
                    src={msg.image}
                    alt="Sent"
                    style={{ maxWidth: "100px", borderRadius: "20px" }}
                  />
                )}
                {msg.audioUrl && (
                  <audio
                    controls
                    onLoadedMetadata={(e) => {
                      const duration = e.target.duration;
                      console.log(`Audio duration: ${duration} seconds`);
                    }}
                  >
                    <source
                      src={`http://localhost:4000${msg.audioUrl}`}
                      type="audio/webm"
                    />
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
              {msg.userId !== userId && <Avatar name={msg.email} />}
              {replyTo && (
                <Box bg="gray.100" p={2} borderRadius="md" mt={2} mb={2}>
                  Replying to : {replyTo.text || "Image"}
                  <Button
                    size="xs"
                    colorScheme="red"
                    onClick={() => setReplyTo(null)}
                    ml={2}
                  >
                    Cancel
                  </Button>
                  {messages.map((msg, index) => (
                    <MessageBubble
                      key={msg._id || index}
                      message={msg}
                      onReply={handleReply}
                      currentUserEmail={userEmail}
                    />
                  ))}
                </Box>
              )}
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
          <Button onClick={handleChatGPTMessage} colorScheme="purple">
            Ask ChatGPT
          </Button>
        </HStack>
      </VStack>
    </HStack>
  );
};

export default ChatBox;
