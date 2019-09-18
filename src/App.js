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
          <Box m={4}>
            <Typography variant="h3" component="h1">Trace URL</Typography>
            <form>
              <TextField
                autoFocus={true}
                fullWidth={true}
                label="URL"
                name="url"
                placeholder="Any URL that redirects"
                variant="filled"
              />
              <Button fullWidth={true} variant="contained" color="primary">
                Trace
              </Button>
            </form>
          </Box>
        </Container>
      </CssBaseline>
    </div>
  );
}

export default App;
