// @flow strict

import React, { useState } from 'react';
import { IconButton, Slide, Snackbar, Typography } from '@material-ui/core';
import Close from '@material-ui/icons/Close';
import SystemUpdate from '@material-ui/icons/SystemUpdateOutlined';
import Analytics from './Analytics';
import {
  withServiceWorkerContextProvider,
  useServiceWorkerContext,
} from './ServiceWorkerContext';

import type { ElementConfig } from 'react';

function ServiceWorkerStatus() {
  return (
    <>
      <ServiceWorkerUpdateStatus />
      <ServiceWorkerCacheStatus />
    </>
  );
}

function ServiceWorkerUpdateStatus() {
  const context = useServiceWorkerContext();

  return (
    <Snackbar
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      TransitionComponent={Slide}
      open={context.updateAvailable}
      message={<Typography component="span">App update available.</Typography>}
      action={
        <IconButton
          color="inherit"
          onClick={(event) => {
            Analytics.logEvent('update', 'click');

            context.applyUpdate();
          }}
        >
          <SystemUpdate />
        </IconButton>
      }
    />
  );
}

function ServiceWorkerCacheStatus() {
  const [dismissed, setDismissed] = useState(false);
  const context = useServiceWorkerContext();

  const close = () => {
    setDismissed(true);
  };

  return (
    <Snackbar
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      TransitionComponent={Slide}
      open={context.cacheComplete && !dismissed}
      onClock={close}
      message={<Typography component="span">App available offline.</Typography>}
      action={
        <IconButton
          color="inherit"
          onClick={(event) => {
            Analytics.logEvent('close', 'click');

            close();
          }}
        >
          <Close />
        </IconButton>
      }
    />
  );
}

export default withServiceWorkerContextProvider<
  ElementConfig<typeof React.Fragment>,
>(ServiceWorkerStatus);
