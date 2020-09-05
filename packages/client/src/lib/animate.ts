/**
 * @private
 *
 * Map of animate.css animation speed modifier classes and their corresponding
 * animation times.
 *
 * https://animate.style/#utilities
 */
const ANIMATE_SPEEDS = {
  'animate__faster': 500,
  'animate__fast':	800,
  'animate__animated': 1000, // Default
  'animate__slow': 2000,
  'animate__slower': 3000
};


/**
 * Valid animation speeds.
 */
export type AnimationSpeed = 'faster' | 'fast' | 'default' | 'slow' | 'slower';


/**
 * Shape of the options object accepted by setupShowHideAnimation.
 */
export interface AnimationOptions {
  speed?: AnimationSpeed;
  in?: string;
  out?: string;
  initialState: 'show' | 'hide';
}


/**
 * Shape of the object returned by setupShowHideAnimation.
 */
export interface AnimateDescriptor {
  show: () => void;
  hide: () => void;
}


/**
 * Ensures this function can be safely called multiple times on the same element
 * and only perform setup once, and return the same AnimateDescriptor.
 */
const configCache = new Map<HTMLElement | null, AnimateDescriptor>();


/**
 * Provided an options object and a DOM element reference, configures the
 * provided animate.css animations on the element and returns an object with
 * `show` and `hide` methods that will run the configured animations.
 */
export default function setupShowHideAnimation<E extends HTMLElement | null>(options: AnimationOptions, el: E): AnimateDescriptor {
  if (!el) {
    throw new Error('[setupShowHideAnimation] No element provided.');
  }

  if (!configCache.has(el)) {
    el.classList.add('animate__animated');

    // Compute animation speed.
    const animationSpeed: number = !options.speed || options.speed === 'default'
      ? ANIMATE_SPEEDS['animate__animated']
      // @ts-expect-error
      : ANIMATE_SPEEDS[`animate__${options.speed}`];

    // Apply custom animation speed class to the element if applicable.
    if (options.speed && options.speed !== 'default') {
      el.classList.add(`animate__${options.speed}`);
    }

    const show = () => {
      // console.debug('[setupShowHideAnimation] Showing element.');
      el.style.display = 'block';

      if (options.in) {
        el.classList.remove(`animate__${options.out}`);
        el.classList.add(`animate__${options.in}`);
      }
    };

    const hide = () => {
      // console.debug('[setupShowHideAnimation] Hiding element.');

      if (options.out) {
        el.classList.remove(`animate__${options.in}`);
        el.classList.add(`animate__${options.out}`);

        setTimeout(() => {
          el.style.display = 'none';
          el.style.display = 'none';
        }, animationSpeed);
      } else {
        el.style.display = 'none';
        el.style.display = 'none';
      }
    };

    if (options.initialState === 'hide') {
      el.style.display = 'none';
    } else {
      el.style.display = 'block';
    }

    configCache.set(el, { show, hide  });
  }

  return configCache.get(el) as AnimateDescriptor;
}
