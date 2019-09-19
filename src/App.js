// @flow

import React, { useState } from 'react';
import './App.css';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Container,
  CssBaseline,
  TextField,
  Typography,
} from '@material-ui/core';
import OpenInNew from '@material-ui/icons/OpenInNew';

type NetworkState = 'unknown' | 'working' | 'success' | 'failure';
type Resolution = { url: string } | { urls: Array<string> };

const PRODUCTION_ORIGIN = 'https://traceurl.herokuapp.com';
const DEVELOPMENT_ORIGIN =
  process.env.REACT_APP_API_ORIGIN || 'http://localhost:4000';
const RESOLVE_ENDPOINT = '/resolve.json';

function App() {
  const [network, setNetwork] = useState<NetworkState>('unknown'); // @todo show network indicator when fetching
  const [url, setURL] = useState<string>(
    new URL(window.location.href).searchParams.get('url') || '',
  );
  const [resolution, setResolution] = useState<?Resolution>(null);

  window.addEventListener('popstate', (event) => {
    // @todo restore component state from history state
  });

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

              const navigationURL = new URL(window.location.href);
              navigationURL.searchParams.delete('url');
              navigationURL.searchParams.append('url', url);
              window.history.pushState(
                { url },
                document.title,
                navigationURL.toString(),
              );

              setNetwork('working');
              try {
                // @todo make API configurable in development
                const origin =
                  process.env.NODE_ENV === 'production'
                    ? PRODUCTION_ORIGIN
                    : DEVELOPMENT_ORIGIN;
                const api = new URL(origin);
                api.pathname = RESOLVE_ENDPOINT;
                api.searchParams.append('url', url);

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
              defaultValue={url}
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
          {resolution ? (
            typeof resolution.url === 'string' ? (
              <Box my={2}>
                <Card>
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="h2">
                      Resolved URL
                    </Typography>
                    <Box
                      fontFamily="Monospace"
                      style={{ overflowWrap: 'break-word' }}
                    >
                      {resolution.url}
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button
                      href={resolution.url}
                      target="_blank"
                      rel="noreferrer"
                      color="primary"
                    >
                      Open
                      {/*
                        @todo add spacing between text and icon
                      */}
                      <OpenInNew />
                    </Button>
                  </CardActions>
                </Card>
              </Box>
            ) : null
          ) : null}
        </Container>
      </CssBaseline>
    </div>
  );
}

export default App;
