// @flow strict

import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Container,
  CssBaseline,
  Link,
  TextField,
  Typography,
} from '@material-ui/core';
import FileCopy from '@material-ui/icons/FileCopyOutlined';
import ShareNew from '@material-ui/icons/ShareOutlined';
import OpenInNew from '@material-ui/icons/OpenInNewOutlined';
import Refresh from '@material-ui/icons/RefreshOutlined';
import Skeleton from '@material-ui/lab/Skeleton';
import Analytics from './Analytics';
import API from './API';
import ServiceWorkerStatus from './ServiceWorkerStatus';

type NetworkState = 'none' | 'working' | 'success' | 'failure';
type Destination = {| url: string |};
type Hops = {| urls: Array<string> |};
type Resolution = Destination | Hops;

function extractURL(): string {
  const locationURL = new URL(window.location.href);
  const urlParam = locationURL.searchParams.get('url');
  const textParam = locationURL.searchParams.get('text');
  let maybeURL = '';
  if (urlParam) {
    try {
      new URL(urlParam);
      maybeURL = urlParam;
    } catch {}
  }
  if (maybeURL === '' && textParam) {
    try {
      new URL(textParam);
      maybeURL = textParam;
    } catch {}
  }
  return maybeURL;
}

function App(): React$Element<'div'> {
  const [network, setNetwork] = useState<NetworkState>('none');
  const [url, setURL] = useState<string>(extractURL());
  const [resolution, setResolution] = useState<?Resolution>(null);
  const [requestID, setRequestID] = useState<string>('');

  useEffect(() => {
    Analytics.logEvent('app', 'mount');

    const handler = (event) => {
      Analytics.logEvent('history', 'popstate');

      setURL(extractURL());
      if (event.state) {
        setRequestID(event.state.requestID);
        setResolution(event.state.resolution);
      } else {
        // null state of the full page load
        setRequestID('');
        setResolution(null);
      }
    };
    window.addEventListener('popstate', handler);

    const initialURL = extractURL();
    if (initialURL !== '') {
      trace(initialURL); // no await -- fire and forget
    }
    return () => {
      window.removeEventListener('popstate', handler);

      Analytics.logEvent('app', 'unmount');
    };
  }, []);

  const requestIDElement = useRef(null);

  const trace = async (url: string): Promise<void> => {
    Analytics.logEvent('trace', 'start', url, undefined, false);

    const thisRequestID = Math.floor(Math.random() * Math.pow(36, 8)).toString(
      36,
    );

    setNetwork('working');
    setRequestID(thisRequestID);
    window.history.replaceState({ requestID: thisRequestID }, document.title);

    try {
      const api = new URL(API.RESOLVE_ENDPOINT);
      api.searchParams.append('url', url);

      const response = await fetch(api);
      const resolution = await response.json();

      if (
        requestIDElement.current &&
        requestIDElement.current.value === thisRequestID
      ) {
        // discord response if it's not for the current request
        setResolution(resolution);
        setNetwork('success');
        window.history.replaceState(
          { requestID: thisRequestID, resolution },
          document.title,
        );

        Analytics.logEvent('trace', 'succeed', url, 1, false);
      }
    } catch {
      setNetwork('failure');

      Analytics.logEvent('trace', 'fail', url, undefined, false);
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
              <Skeleton width={70} height={24} style={{ margin: 0 }} />
            </Button>
            <Button>
              <Skeleton width={70} height={24} style={{ margin: 0 }} />
            </Button>
          </CardActions>
        </Card>
      );
      break;
    case 'success':
      if (resolution) {
        if (typeof resolution.url === 'string') {
          const resolutionURL = resolution.url;
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
                  {resolutionURL}
                </Box>
              </CardContent>
              <CardActions>
                <Button
                  color="primary"
                  onClick={async (event) => {
                    Analytics.logEvent('resolution', 'copy');
                    if (navigator.clipboard) {
                      await navigator.clipboard.writeText(resolutionURL);
                    } else {
                      const documentBody = document.body;
                      if (documentBody !== null) {
                        const textarea = document.createElement('textarea');
                        textarea.value = resolutionURL;
                        documentBody.appendChild(textarea);
                        textarea.select();
                        document.execCommand('copy');
                        documentBody.removeChild(textarea);
                      }
                    }
                  }}
                >
                  <Box mr={1} component="span">
                    Copy
                  </Box>
                  <FileCopy />
                </Button>
                {'share' in navigator ? (
                  <Button
                    color="primary"
                    onClick={async (event) => {
                      Analytics.logEvent('resolution', 'share');
                      if (navigator.share) {
                        navigator.share({
                          url: resolutionURL,
                        });
                      }
                    }}
                  >
                    <Box mr={1} component="span">
                      Share
                    </Box>
                    <ShareNew />
                  </Button>
                ) : null}
                <Button
                  href={resolutionURL}
                  target="_blank"
                  rel="noreferrer"
                  color="primary"
                  onClick={(event) => {
                    Analytics.logEvent('resolution', 'open');
                  }}
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
            <Button
              color="secondary"
              onClick={(event) => {
                Analytics.logEvent('retry', 'click');

                trace(url);
              }}
            >
              <Box mr={1} component="span">
                Retry
              </Box>
              <Refresh />
            </Button>
          </CardActions>
        </Card>
      );
      break;
    case 'none':
    default:
      result = null;
      break;
  }

  return (
    <div>
      <CssBaseline />
      <Container maxWidth="sm">
        <Box textAlign="center" my={2}>
          <Typography variant="h3" component="h1">
            Trace URL
          </Typography>
        </Box>
        <Typography fontWeight="fontWeightLight">
          This tool helps you expand shortened URL into original URL or trace
          any URL with redirections towards the destination. It's{' '}
          <Link href="https://github.com/CatChen/traceurl-web/">
            open source
          </Link>
          .
        </Typography>
        <form
          onSubmit={async (event) => {
            Analytics.logEvent('form', 'submit');

            event.preventDefault();

            const navigationURL = new URL(window.location.href);
            navigationURL.searchParams.delete('url');

            try {
              new URL(url);
            } catch {
              // empty or invalid URL
              setNetwork('none');
              window.history.pushState(
                {},
                document.title,
                navigationURL.toString(),
              );
              return;
            }

            navigationURL.searchParams.append('url', url);
            window.history.pushState(
              {},
              document.title,
              navigationURL.toString(),
            );

            await trace(url);
          }}
        >
          <input ref={requestIDElement} value={requestID} type="hidden" />
          <TextField
            autoFocus={true}
            value={url}
            fullWidth={true}
            label="URL"
            name="url"
            placeholder="Any URL that redirects"
            variant="filled"
            inputProps={{
              autoCapitalize: 'none',
              autoCorrect: 'off',
            }}
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
        <ServiceWorkerStatus />
      </Container>
    </div>
  );
}

export default App;
