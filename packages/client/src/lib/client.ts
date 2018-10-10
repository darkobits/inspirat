import axios from 'axios';
import {API_URL} from 'etc/constants';


/**
 * Axios client configured to make requests to our lambda functions.
 */
export default axios.create({
  baseURL: API_URL
});
