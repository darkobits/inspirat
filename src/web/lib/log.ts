/* eslint-disable no-console */
import { getPlatformDetails } from '@darkobits/react-kit/platform';
import chalkModule from 'chalk';
import React from 'react';
import styleToCss from 'style-object-to-css-string';

import globalStore from 'web/lib/storage';

/**
 * TODO:
 * - Implement debug scopes.
 * - Move to own package (used in joshua.dev)
 * - Adjust left margin so that lines line up when one line does not have a
 *   counter badge and others below it do.
 */

/**
 * @private
 *
 * Scope store for the logger.
 */
const store = globalStore.createInstance({ storeName: 'log' });

/**
 * @private
 *
 * Predicates for various major browsers.
 */
const platform = getPlatformDetails();
const isChrome = platform.browser.name?.toLowerCase().includes('chrome');
const isFirefox = platform.browser.name?.toLowerCase().includes('firefox');
const isSafari = platform.browser.name?.toLowerCase().includes('safari');

/**
 * @private
 *
 * List of log levels in increasing order of severity.
 */
const logLevels = [
  'silly',
  'debug',
  'info',
  'success',
  'danger',
  'warn',
  'error'
] as const;

/**
 * @private
 *
 * Icons for our various log levels.
 */
const icons = {
  silly: {
    square: '🟪',
    circle: '🟣'
  },
  debug: {
    square: '🟦',
    circle: '🔵'
  },
  info: {
    square: '⬜️',
    circle: '⚪️'
  },
  success: {
    square: '🟩',
    circle: '🟢'
  },
  danger: {
    square: '🟧',
    circle: '🟠'
  },
  warning: {
    square: '🟨',
    circle: '🟡'
  },
  error: {
    square: '🟥',
    circle: '🔴'
  }
};

/**
 * Union type of log levels.
 */
export type LogLevel = typeof logLevels[number];

/**
 * @private
 *
 * Contract that ensures a logger has implemented a method for each log level.
 */
type RequiredLogMethods = Record<LogLevel, (...args: Array<any>) => void>;

/**
 * Options accepted by `processLogMessage`.
 */
interface ProcessLogArgumentsOptions<A extends Array<any>> {
  /**
   * Optional string prepended to all log messages.
   */
  prefix?: string;

  /**
   * Argument list to process.
   */
  args: A;

  /**
   * Optional CSS rules to apply to text.
   */
  style?: React.CSSProperties;
}

/**
 * @private
 *
 * Provided prefix, list of arguments, and optional style object, returns an
 * array of arguments to pass to a logging function, such as `console.log` or
 * `console.debug`.
 */
function processLogMessage<A extends Array<any>>(opts: ProcessLogArgumentsOptions<A>) {
  const { prefix, args, style } = opts ?? {};
  const message: Array<string> = [];
  const restArgs: Array<any> = [];

  if (prefix) message.push(prefix);

  args.forEach(arg => {
    if (typeof arg === 'string') {
      message.push(arg);
      return;
    }

    if (typeof arg === 'number') {
      message.push('%f');
      restArgs.push(arg);
      return;
    }

    if (arg instanceof HTMLElement) {
      message.push('%o');
      restArgs.push(arg);
      return;
    }

    message.push('%O');
    restArgs.push(arg);
    return;
  });

  // Process CSS properties, if present.
  if (typeof style === 'object') {
    message[0] = `%c${message[0]}`;
    restArgs.unshift(styleToCss(style));
  }

  return  [message.join(' ').trim(), ...restArgs];
}

/**
 * @private
 *
 * Tracks logger instances to facilitate inter-instance communication.
 */
const loggerInstances = new Set<Logger>();

/**
 * Optional options object that may be passed to the `Logger` constructor.
 */
export interface LoggerOptions {
  /**
   * Optional string to prepend to all log messages dispatched by the logger
   * instance.
   */
  prefix?: string;

  /**
   * Optional debug scope for the logger.
   */
  // debugScope?: string;
}

/**
 * Creates a new logger that may have its own prefix, but shares the same log
 * level as other instances.
 */
export class Logger implements RequiredLogMethods {
  /**
   * @private
   *
   * Default / current log level. Persisted in our store.
   *
   * See getter/setter below.
   */
  #level: LogLevel = 'info';

  /**
   * Tracks the current prefix for this instance.
   */
  prefix = '';

  /**
   * Chalk instance for convenient text styling.
   */
  chalk: chalkModule.Chalk;

  constructor(opts: LoggerOptions = {}) {
    // Add to instance registry.
    loggerInstances.add(this);

    // Initialize prefix.
    if (opts.prefix) this.prefix = opts.prefix;

    // Initialize Chalk instance.
    // TODO: Add config to our options.
    this.chalk = new chalkModule.Instance({
      level: 3
    });

    // Initialize level.
    void store.getItem<LogLevel>('level').then(fromStorage => {
      if (typeof fromStorage === 'string' && logLevels.includes(fromStorage)) {
        // If storage contains a valid log level, Update the log level for all
        // instances in the registry (including our own) but do so by setting
        // the property directly.
        loggerInstances.forEach(instance => {
          instance.#level = fromStorage;
        });
      } else {
        // Otherwise, init with our default level and write it to storage.
        void store.setItem('level', this.#level);
      }
    });
  }

  /**
   * Gets the current log level for all instances.
   */
  get level() {
    return this.#level;
  }

  /**
   * Returns `true` if a message at the indicated level would be logged given
   * the current log level.
   */
  isLevelAtLeast(level: LogLevel, cb: () => void | Promise<void>) {
    void store.getItem<LogLevel>('level').then(currentLevel => {
      if (currentLevel && logLevels.indexOf(currentLevel) <= logLevels.indexOf(level)) {
        void cb();
      }
    });
  }

  /**
   * Sets the log level for all instances synchronously, then asynchronously
   * persists it to storage.
   */
  setGlobalLevel(level: LogLevel) {
    if (!logLevels.includes(level))
      throw new Error(`Expected log level to be one of: ${logLevels.join(', ')}.`);

    // Update the log level for all instances in the registry (including our
    // own) but do so by setting the property directly.
    loggerInstances.forEach(instance => {
      instance.#level = level;
    });

    // Finally, persist the new value to storage.
    void store.setItem('level', level);
  }

  /**
   * Issue a `silly` message to `console.debug`.
   */
  silly(...args: Array<any>) {
    void this.isLevelAtLeast('silly', () => {
      console.log(...processLogMessage({
        prefix: [icons.silly.square, this.prefix].filter(Boolean).join(' '),
        args,
        style: { color: '#BA55D3' } // medium orchid
      }));
    });
  }

  /**
   * Issue a `debug` message to `console.debug`.
   */
  debug(...args: Array<any>) {
    void this.isLevelAtLeast('debug', () => {
      console.log(...processLogMessage({
        prefix: [icons.debug.square, this.prefix].filter(Boolean).join(' '),
        args,
        style: { color: '#1E90FF' } // dodger blue
      }));
    });
  }

  /**
   * Issue an `info` message to `console.log`.
   */
  info(...args: Array<any>) {
    void this.isLevelAtLeast('info', () => {
      console.log(...processLogMessage({
        prefix: [icons.info.square, this.prefix].filter(Boolean).join(' '),
        args,
        style: { color: '#A9A9A9' } // dark gray
      }));
    });
  }

  /**
   * Issue a `success` message to `console.log`.
   */
  success(...args: Array<any>) {
    void this.isLevelAtLeast('success', () => {
      console.log(...processLogMessage({
        prefix: [icons.success.square, this.prefix].filter(Boolean).join(' '),
        args,
        style: { color: '#32CD32' } // lime green
      }));
    });
  }

  /**
   * Issue a `danger` message to `console.log`.
   */
  danger(...args: Array<any>) {
    void this.isLevelAtLeast('danger', () => {
      console.log(...processLogMessage({
        prefix: [icons.danger.square, this.prefix].filter(Boolean).join(' '),
        args,
        style: { color: '#FFA500' } // orange
      }));
    });
  }

  /**
   * Issue a `warn` message to `console.warn`.
   */
  warn(...args: Array<any>) {
    void this.isLevelAtLeast('warn', () => {
      console.warn(...processLogMessage({
        prefix: [icons.warning.square, this.prefix].filter(Boolean).join(' '),
        args,
        style: {
          color: '#DAA520',
          marginLeft: isChrome
            ? '-1.26em'
            : undefined
        }
      }));
    });
  }

  /**
   * Issue an `error` message to `console.error`.
   */
  error(...args: Array<any>) {
    void this.isLevelAtLeast('error', () => {
      console.error(...processLogMessage({
        prefix: [icons.error.square, this.prefix].filter(Boolean).join(' '),
        args: args,
        style: {
          color: '#DA3633',
          fontWeight: 'bold',
          marginLeft: isChrome
            ? '-1.26em'
            : isFirefox
              ? '0.32em'
              : isSafari
                ? '0.24em'
                : undefined
        }
      }));
    });
  }
}


/**
 * Default logger instance.
 */
export default new Logger();
