/**
 * Custom hook for introspecting URL query parameters.
 *
 * Example usage:
 *
 * const query = useQuery();
 * query.get('foo');
 */
export default function useQuery() {
  return new URLSearchParams(window.location.search);
}
