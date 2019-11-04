// @flow strict

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { AbstractComponent } from 'react';
import Analytics from './Analytics';

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

export function withServiceWorkerContextProvider<Config: {}>(
  Component: AbstractComponent<Config>,
): AbstractComponent<Config> {
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
          waitingServiceWorker.addEventListener('statechange', () => {
            if (waitingServiceWorker.state === 'activated') {
              window.location.reload();
            }
          });

          waitingServiceWorker.postMessage({ type: 'SKIP_WAITING' });
        },
      };
    }, [updateAvailable, cacheComplete, waitingServiceWorker]);

    useEffect(() => {
      (async () => {
        if (navigator.serviceWorker) {
          const serviceWorker = navigator.serviceWorker;
          const registration = await serviceWorker.getRegistration('/');
          if (!registration) {
            return;
          }

          registration.addEventListener('updatefound', () => {
            const installingWorker = registration.installing;
            if (installingWorker == null) {
              return;
            }

            installingWorker.addEventListener('statechange', () => {
              if (installingWorker.state === 'installed') {
                if (serviceWorker.controller) {
                  Analytics.logEvent(
                    'service_worker',
                    'update_available',
                    null,
                    null,
                    false,
                  );

                  setUpdateAvailable(true);
                  setWaitingServiceWorker(registration.waiting);
                } else {
                  Analytics.logEvent(
                    'service_worker',
                    'cache_complete',
                    null,
                    null,
                    false,
                  );

                  setCacheComplete(true);
                }
              }
            });
          });
        }
      })();
      return () => {};
    });

    return (
      <ServiceWorkerContext.Provider value={value}>
        <Component {...props} />
      </ServiceWorkerContext.Provider>
    );
  };
}

export function useServiceWorkerContext(): ServiceWorkerContextValue {
  const context = useContext(ServiceWorkerContext);
  return context;
}
