import queryString from 'query-string';
import { registerSW } from 'virtual:pwa-register';


/**
 * Note: Hella contains a much more robust implementation of this logic that
 * better integrates with React. Migrate to that once it has been factored-out
 * into its own package.
 */


/**
 * Tracks the number of failed update check attempts.
 */
let updateErrorCount = 0;


/**
 * Sets the maximum number of failed update attempts allowed. When this is
 * reached, scheduling of future update checks will be halted.
 */
const maxUpdateErrors = 10;


/**
 * Handle for the update check timeout.
 */
let updateCheckTimeout: NodeJS.Timeout;


/**
 * How often to check for updates.
 */
const updateCheckInterval = 10_000;


/**
 * Enables debug logging if the 'debug' query param is set.
 */
const debug = Object.keys(queryString.parse(location.search)).includes('debug');


if (import.meta.env.NODE_ENV === 'production') {
  const updateSW = registerSW({
    onRegistered: registration => {
      if (debug) console.debug('[ServiceWorker] Got event: onRegistered');

      const doUpdateCheck = () => {
        registration?.update().then(() => {
          if (debug) console.debug('[ServiceWorker] Update check completed.');
          updateCheckTimeout = setTimeout(doUpdateCheck, updateCheckInterval);
        }).catch(() => {
          updateErrorCount += 1;

          if (updateErrorCount >= maxUpdateErrors) {
            if (debug) console.error('[ServiceWorker] Maximum failed update check attempts reached; cancelling further update checks.');

            if (updateCheckTimeout) {
              clearTimeout(updateCheckTimeout);
            }
          } else {
            if (debug) console.error(`[ServiceWorker] Update check failed. ${maxUpdateErrors - updateErrorCount} failed attempts remaining.`);
            updateCheckTimeout = setTimeout(doUpdateCheck, updateCheckInterval);
          }
        });
      };

      updateCheckTimeout = setTimeout(doUpdateCheck, updateCheckInterval);
    },
    // Emitted when an error occurs when trying to install or register the
    // service worker.
    onRegisterError: err => {
      if (debug) console.error('[ServiceWorker] Got event: onRegistrationError', err);
    },
    // Emitted when the service worker has downloaded new assets and a page
    // refresh is needed to apply them.
    onNeedRefresh: () => {
      if (debug) console.debug('[ServiceWorker] Got event: onNeedRefresh; reloading page.');

      void updateSW().then(() => {
        window.location.reload();
      });
    },
    // Emitted when all assets that should be pre-cached for offline mode have
    // been downloaded. This typically is only emitted the first time the
    // service worker is installed and has primed the cache.
    onOfflineReady: () => {
      if (debug) console.debug('[ServiceWorker] Got event: onOfflineReady');
    }
  });
}
