import queryString from 'query-string';


export default () => {
  return queryString.parse(location.search);
};
