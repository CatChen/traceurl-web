// @flow strict

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { AbstractComponent } from 'react';

type ServiceWorkerContextValue = {|
  updateAvailable: boolean,
  cacheComplete: boolean,
  applyUpdate: () => void,
|};

const ServiceWorkerContext = createContext<ServiceWorkerContextValue>({
  updateAvailable: false,
  cacheComplete: false,
  applyUpdate: () => {},
});

export function withServiceWorkerContextProvider<Config>(
  Component: AbstractComponent<Config>,
) {
  return (props: Config) => {
    const [updateAvailable, setUpdateAvailable] = useState(false);
    const [cacheComplete, setCacheComplete] = useState(false);
    const [
      waitingServiceWorker,
      setWaitingServiceWorker,
    ] = useState<?ServiceWorker>(null);

    const value = useMemo(() => {
      return {
        updateAvailable,
        cacheComplete,
        applyUpdate: () => {
          if (!waitingServiceWorker) {
            return;
          }
          waitingServiceWorker.addEventListener('statechange', (event) => {
            if (event.target.state === 'activated') {
              window.location.reload();
            }
          });

          waitingServiceWorker.postMessage({ type: 'SKIP_WAITING' });
        },
      };
    }, [updateAvailable, cacheComplete, waitingServiceWorker]);

    useEffect(() => {
      if ('serviceWorker' in navigator) {
        const serviceWorker = navigator.serviceWorker;
        (async () => {
          const registration = await serviceWorker.getRegistration();
          if (!registration) {
            return;
          }

          registration.addEventListener('updatefound', (event) => {
            const installingWorker = registration.installing;
            if (installingWorker == null) {
              return;
            }

            installingWorker.addEventListener('statechange', (event) => {
              if (event.target.state === 'installed') {
                if (navigator.serviceWorker.controller) {
                  setUpdateAvailable(true);
                  setWaitingServiceWorker(registration.waiting);
                } else {
                  setCacheComplete(true);
                }
              }
            });
          });
        })();
        return () => {};
      }
    });

    return (
      <ServiceWorkerContext.Provider value={value}>
        <Component {...props} />
      </ServiceWorkerContext.Provider>
    );
  };
}

export function useServiceWorkerContext(): ServiceWorkerContext {
  const context = useContext(ServiceWorkerContext);
  return context;
}
