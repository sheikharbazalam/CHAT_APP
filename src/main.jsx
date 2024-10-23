import ReactDOM from "react-dom/client";
import App from "./App";
import { Auth0Provider } from "@auth0/auth0-react";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";

const customTheme = extendTheme({
  config: {
    initialColorMode: "dark",
    useStyleColorMode: false,
  },
  styles: {
    global: {
      body: {
        bg: "dark",
        color: "white",
      },
    },
  },
});

//IP ADDRESS :(172.236.171.191/32
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Auth0Provider
    domain="dev-irulxihw41hcgzjh.us.auth0.com"
    clientId="2LGd2lVXrx98XzqtsgPk3SaI9bbcAgXz"
    authorizationParams={{ redirect_uri: window.location.origin }}
  >
    <ChakraProvider theme={customTheme}>
      <App />
    </ChakraProvider>
  </Auth0Provider>
);
