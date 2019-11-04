// @flow strict

import React, { useState } from 'react';
import { IconButton, Slide, Snackbar, Typography } from '@material-ui/core';
import Update from '@material-ui/icons/UpdateOutlined';
import {
  withServiceWorkerContextProvider,
  useServiceWorkerContext,
} from './ServiceWorkerContext';

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

export default withServiceWorkerContextProvider(ServiceWorkerStatus);
