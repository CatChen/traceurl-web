import React from "react";
import "./App.css";
import {
  Box,
  Button,
  Container,
  CssBaseline,
  TextField,
  Typography
} from "@material-ui/core";

function App() {
  return (
    <div className="App">
      <CssBaseline>
        <Container maxWidth="sm">
          <Box textAlign="center" my={2}>
            <Typography variant="h3" component="h1">
              Trace URL
            </Typography>
          </Box>
          <Typography fontWeight="fontWeightLight">
            This tool helps you expand shortened URL into original UR or trace
            any URL with redirections towards the destionation.
          </Typography>
          <form>
            <TextField
              autoFocus={true}
              fullWidth={true}
              label="URL"
              name="url"
              placeholder="Any URL that redirects"
              variant="filled"
              margin="normal"
            />
            <Button
              type="submit"
              fullWidth={true}
              variant="contained"
              color="primary"
            >
              Trace
            </Button>
          </form>
        </Container>
      </CssBaseline>
    </div>
  );
}

export default App;
