/**
 * Netlify path where lambda functions are hosted. Provided by the DefinePlugin.
 */
export const API_PREFIX = process.env.API_PREFIX;


/**
 * How long image collection data may persist in the cache before it must be
 * updated.
 */
export const CACHE_TTL = '1 day';


/**
 * Map of Unsplash photo IDs to background-position values.
 */
export const BACKGROUND_RULE_OVERRIDES: any = {
  'oMneOBYhJxY': {
    maskAmount: '0.4'
  },
  'tKQ9NhQVCjM': {
    maskAmount: '0.5'
  },
  'u0cSubf5F-E': {
    backgroundPosition: 'center top'
  },
  'BM08uZ_Qu24': {
    maskAmount: '0.4'
  },
  '-N_UwPdUs7E': {
    backgroundPosition: 'center top'
  },
  '0NhhIdDUcqw': {
    backgroundPosition: 'center 20%'
  },
  '1HkVV14d8Bg': {
    backgroundPosition: 'right center'
  },
  '3TmLV0fLzfU': {
    backgroundPosition: 'center 20%'
  },
  'FxU8KV7psMY': {
    backgroundPosition: 'center top'
  },
  'o8Utw2ETExA': {
    backgroundPosition: 'right center'
  },
  'pZXg_ObLOM4': {
    backgroundPosition: 'center top'
  },
  'Zm2n2O7Fph4': {
    backgroundPosition: 'center 75%'
  },
  'LgCj9qcrfhI': {
    backgroundPosition: 'center top'
  },
  'kZ1zThg6G40': {
    backgroundPosition: 'center top',
    transform: 'scale(1.2) translateY(8.3333333%)'
  },
  'vpHCfunwDrQ': {
    backgroundPosition: 'center top'
  },
  'c4XoMGxfsVU': {
    backgroundPosition: 'center top'
  },
  '_WuPjE-MPHo': {
    backgroundPosition: 'center top',
    transform: 'scale(1.1)'
  },
  '_QoAuZGAoPY': {
    maskAmount: '0.32'
  },
  'r7GOO6M2TmU': {
    backgroundPosition: 'center 20%'
  },
  '9qvZSH_NOQs': {
    backgroundPosition: 'center top'
  },
  '3bpKvzknix0': {
    maskAmount: '0.4'
  },
  'qpemSW6_1Z0': {
    backgroundPosition: 'center top',
    transform: 'scale(1.2) translateY(8.3333333%)'
  },
  'KqVHRmHVwwM': {
    maskAmount: '0.32'
  }
};
