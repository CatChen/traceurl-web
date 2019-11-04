// @flow strict

import React, { useState } from 'react';
import { IconButton, Slide, Snackbar, Typography } from '@material-ui/core';
import Update from '@material-ui/icons/UpdateOutlined';
import Analytics from './Analytics';
import {
  withServiceWorkerContextProvider,
  useServiceWorkerContext,
} from './ServiceWorkerContext';

import type { ElementConfig } from 'react';

function ServiceWorkerStatus() {
  const [open, setOpen] = useState(false);
  const context = useServiceWorkerContext();

  if (context.updateAvailable) {
    setOpen(true);
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
            Analytics.logEvent('service_worker', 'apply_update');

            setOpen(false);
            context.applyUpdate();
          }}
        >
          <Update />
        </IconButton>
      }
    />
  );
}

export default withServiceWorkerContextProvider<ElementConfig<typeof Snackbar>>(
  ServiceWorkerStatus,
);