/**
 * Speed up consecutive function calls by caching the result of calls with identical input
 * https://en.wikipedia.org/wiki/Memoization
 * @param {function} compute - the function to be memoized
 */
export default function memoize<In, Out>(compute: (args: In) => Out): (args: In) => Out;
// # sourceMappingURL=memoize.d.ts.map
