import React from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";

const Loading = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    position="fixed"
    top={0}
    left={0}
    width="100%"
    height="100%"
    bgcolor="rgba(255, 255, 255, 0.8)" // Fondo semitransparente
    zIndex={9999}
  >
    <CircularProgress />
  </Box>
);

export default Loading;
