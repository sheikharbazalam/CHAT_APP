//import { ChakraProvider, Box, Heading } from "@chakra-ui/react";
//import ChatBox from "./components/ChatBox";
import LoginButton from "./components/LoginButton";
import "bootstrap/dist/css/bootstrap.min.css";
import Home from "./pages/Home";
import { useAuth0 } from "@auth0/auth0-react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import ChatBox from "./components/ChatBox";

function App() {
  const { isAuthenticated } = useAuth0();

  return (
    <Router>
      <div>
        <Navbar />
        {isAuthenticated ? (
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        ) : (
          <LoginButton />
        )}
      </div>
    </Router>
  );
}

export default App;
