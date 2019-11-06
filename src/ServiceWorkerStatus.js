// @flow strict

import React, { useState } from 'react';
import { IconButton, Slide, Snackbar, Typography } from '@material-ui/core';
import SystemUpdate from '@material-ui/icons/SystemUpdateOutlined';
import Analytics from './Analytics';
import {
  withServiceWorkerContextProvider,
  useServiceWorkerContext,
} from './ServiceWorkerContext';

import type { ElementConfig } from 'react';

function ServiceWorkerStatus() {
  const [open, setOpen] = useState(false);
  const context = useServiceWorkerContext();

  if (open !== context.updateAvailable) {
    setOpen(context.updateAvailable);
  }

  return (
    <Snackbar
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      TransitionComponent={Slide}
      open={open}
      message={<Typography component="span">Update available.</Typography>}
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

export default withServiceWorkerContextProvider<ElementConfig<typeof Snackbar>>(
  ServiceWorkerStatus,
);
