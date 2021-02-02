import { getHeaderValue, getFormattedUserAgent } from '../utils';

describe('API Logs Utils', () => {
  describe('getHeaderValue', () => {
    let headers;

    beforeEach(() => {
      headers = [
        { name: 'Content-Type', value: 'image/jpeg' },
        { name: 'User-Agent', value: 'Mozilla' },
      ];
    });

    it('returns the value of a specified http header', () => {
      expect(getHeaderValue(headers, 'User-Agent')).toBe('Mozilla');
    });

    it('normalizes case of header key', () => {
      expect(getHeaderValue(headers, 'content-type')).toBe('image/jpeg');
    });

    it('returns null if the header is not present', () => {
      expect(getHeaderValue(headers, 'not-here')).toBeNull();
    });
  });

  describe('getFormattedUserAgent', () => {
    it('outputs an empty string when fed a falsy value user agent', () => {
      expect(getFormattedUserAgent('')).toBe('');
      expect(getFormattedUserAgent(undefined)).toBe('');
      expect(getFormattedUserAgent(null)).toBe('');
    });

    it('trims whitespace', () => {
      expect(getFormattedUserAgent(' ')).toBe('');
      expect(getFormattedUserAgent(' a ')).toBe('a');
    });

    it('handles readme api explorer', () => {
      expect(getFormattedUserAgent('ReadMe-API-Explorer')).toBe('ReadMe API Explorer');
    });

    it('handles node-fetch', () => {
      expect(getFormattedUserAgent('node-fetch/x.x.x')).toBe('node');
    });

    it('handles python-request', () => {
      expect(getFormattedUserAgent('python-request/x.x.x')).toBe('python');
    });

    it('leaves an unknown user agent untouched', () => {
      expect(getFormattedUserAgent('foo-bar/baz')).toBe('foo-bar/baz');
    });
  });
});
