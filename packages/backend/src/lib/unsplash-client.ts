import https from 'https';

import env from '@darkobits/env';
import axios from 'axios';


/**
 * Create an HTTPS Agent that uses Keep Alive.
 */
const httpsAgent = new https.Agent({
  keepAlive: true
});


export default axios.create({
  baseURL: 'https://api.unsplash.com/',
  headers: {
    'Accept-Version': 'v1',
    'Authorization': `Client-ID ${env<string>('UNSPLASH_ACCESS_KEY', true)}`
  },
  httpsAgent
});
