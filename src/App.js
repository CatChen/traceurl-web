// @flow

import React, { useEffect, useState } from 'react';
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
import Refresh from '@material-ui/icons/Refresh';
import Skeleton from '@material-ui/lab/Skeleton';

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

  useEffect(() => {
    const handler = (event) => {
      setURL(new URL(window.location.href).searchParams.get('url') || '');
      if (event.state) {
        setResolution(event.state.resolution);
        // @todo handle page navigation before fetch completion
      } else {
        // null state of the full page load
        setResolution(null);
      }
    };
    window.addEventListener('popstate', handler);
    return () => {
      window.removeEventListener('popstate', handler);
    };
  }, []);

  const trace = async (event) => {
    // @todo don't trace empty string or invalid URL
    // @todo cancel previous trace when starting new trace
    setNetwork('working');

    try {
      // @todo move development config outside of component
      const origin =
        process.env.NODE_ENV === 'production'
          ? PRODUCTION_ORIGIN
          : DEVELOPMENT_ORIGIN;
      const api = new URL(origin);
      api.pathname = RESOLVE_ENDPOINT;
      api.searchParams.append('url', url);

      const response = await fetch(api);
      const resolution = await response.json();
      setResolution(resolution);
      setNetwork('success');

      window.history.replaceState({ resolution }, document.title);
    } catch {
      setNetwork('failure');
    }
  };

  let result;
  switch (network) {
    case 'working':
      result = (
        <Card>
          <CardContent>
            <Typography gutterBottom variant="h5" component="h2">
              <Skeleton width="30%" style={{ margin: 0 }} />
            </Typography>
            <Box fontFamily="Monospace" style={{ overflowWrap: 'break-word' }}>
              <Skeleton />
              <Skeleton />
              <Skeleton width="60%" style={{ margin: 0 }} />
            </Box>
          </CardContent>
          <CardActions>
            <Button>
              <Skeleton width={90} height={24} style={{ margin: 0 }} />
            </Button>
          </CardActions>
        </Card>
      );
      break;
    case 'success':
      if (resolution) {
        if (typeof resolution.url === 'string') {
          result = (
            <Card>
              <CardContent>
                <Typography gutterBottom variant="h5" component="h2">
                  Result
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
                  <Box mr={1} component="span">
                    Open
                  </Box>
                  <OpenInNew />
                </Button>
              </CardActions>
            </Card>
          );
        } else {
        }
      }
      break;
    case 'failure':
      result = (
        <Card>
          <CardContent>
            <Typography gutterBottom variant="h5" component="h2">
              Failure
            </Typography>
          </CardContent>
          <CardActions>
            <Button color="secondary" onClick={trace}>
              <Box mr={1} component="span">
                Retry
              </Box>
              <Refresh />
            </Button>
          </CardActions>
        </Card>
      );
      break;
    case 'unknown':
    default:
      result = null;
      break;
  }

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
                {},
                document.title,
                navigationURL.toString(),
              );

              await trace();
            }}
          >
            <TextField
              autoFocus={true}
              value={url}
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
          <Box my={2}>{result}</Box>
        </Container>
      </CssBaseline>
    </div>
  );
}

export default App;
