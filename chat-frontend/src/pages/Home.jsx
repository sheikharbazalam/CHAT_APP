import { ChakraProvider, Box, Heading } from "@chakra-ui/react";
import ChatBox from "../components/ChatBox";

function Home() {
  return (
    <ChakraProvider>
      <Box p={5}>
        <Heading as="h1" mb={6}>
          DRJD Chat
        </Heading>
        <ChatBox />
      </Box>
    </ChakraProvider>
  );
}

export default Home;
