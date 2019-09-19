// @flow

import React, { useState } from 'react';
import './App.css';
import {
  Box,
  Button,
  Container,
  CssBaseline,
  TextField,
  Typography,
} from '@material-ui/core';

type NetworkState = 'unknown' | 'working' | 'success' | 'failure';

function App() {
  const [network, setNetwork] = useState<NetworkState>('unknown');
  const [url, setURL] = useState<string>(''); // @todo use URL from query string
  const [resolution, setResolution] = useState(null);

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
            This tool helps you expand shortened URL into original URL or trace
            any URL with redirections towards the destionation.
          </Typography>
          <form
            onSubmit={async (event) => {
              event.preventDefault();
              // @todo update query string to the user input URL
              setNetwork('working');
              try {
                // @todo make API production
                // @todo make API configurable in development
                const api = `http://localhost:4000/resolve.json?url=${encodeURIComponent(
                  url,
                )}`;
                const response = await fetch(api);
                const json = await response.json();
                setResolution(json);
                setNetwork('success');
              } catch {
                setNetwork('failure');
              }
            }}
          >
            <TextField
              autoFocus={true}
              fullWidth={true}
              label="URL"
              name="url"
              placeholder="Any URL that redirects"
              variant="filled"
              margin="normal"
              onChange={(event) => {
                setURL(event.target.value);
              }}
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
