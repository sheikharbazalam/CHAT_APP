import PropTypes from "prop-types";
import {
  Box,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
} from "@chakra-ui/react";

export default function MessageBubble({ message, onReply, currentUserEmail }) {
  return (
    <Menu placement="right">
      <MenuButton
        as={Box}
        p={3}
        borderRadius="lg"
        bg={message.email === currentUserEmail ? "blue.100" : "green.100"}
        maxW="70%"
        mb={2}
        cursor="pointer"
      >
        {message.text && <Text>{message.text}</Text>}
        {message.image && (
          <img
            src={message.image}
            alt="Sent"
            style={{ maxWidth: "100px", borderRadius: "20px" }}
          />
        )}
      </MenuButton>
      <MenuList>
        <MenuItem
          onClick={() =>
            onReply({
              _id: message._id,
              text: message.text,
              image: message.image,
            })
          }
        >
          Reply
        </MenuItem>
        <MenuItem
          onClick={() => {
            navigator.clipboard.writeText(message.text || "");
            alert("Message copied to clipboard");
          }}
        >
          Copy
        </MenuItem>
      </MenuList>
    </Menu>
  );
}

MessageBubble.propTypes = {
  message: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    text: PropTypes.string,
    image: PropTypes.string,
    email: PropTypes.string.isRequired,
  }).isRequired,
  onReply: PropTypes.func.isRequired,
  currentUserEmail: PropTypes.string.isRequired,
};
