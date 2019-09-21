// @flow strict

const PRODUCTION_ORIGIN = 'https://traceurl.herokuapp.com';
const DEVELOPMENT_ORIGIN =
  process.env.REACT_APP_API_ORIGIN || 'http://localhost:4000';
const RESOLVE_ENDPOINT = '/resolve.json';

const origin =
  process.env.NODE_ENV === 'production'
    ? PRODUCTION_ORIGIN
    : DEVELOPMENT_ORIGIN;

const API = {};
Object.defineProperties(API, {
  RESOLVE_ENDPOINT: {
    value: origin + RESOLVE_ENDPOINT,
    configurable: false,
    enumerable: true,
    writable: false,
  },
});

export default API;
