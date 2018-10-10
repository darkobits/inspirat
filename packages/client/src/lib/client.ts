import axios from 'axios';
import {API_URL} from 'etc/constants';


/**
 * Axios client pre-configured to make requests to our backend.
 */
export default axios.create({baseURL: API_URL});
