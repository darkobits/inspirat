import queryString from 'query-string';


/**
 * Returns the parsed query string.
 */
export default () => {
  return queryString.parse(location.search);
};
