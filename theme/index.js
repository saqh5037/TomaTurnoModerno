// theme/index.js
import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  styles: {
    global: {
      "html, body": {
        background: "white",
        color: "black",
        fontFamily: "Arial, sans-serif",
        margin: 0,
        padding: 0,
      },
    },
  },
});

export default theme;
