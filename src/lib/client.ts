import axios from 'axios';
import {API_PREFIX} from 'etc/constants';


/**
 * Axios client configured to make requests to our lambda functions.
 */
export default axios.create({
  baseURL: API_PREFIX
});
