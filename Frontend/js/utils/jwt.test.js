import { describe, it, expect } from 'vitest';
import { parseJwt } from './jwt.js';

// Mock atob for Node environment if necessary, but vitest usually handles it if using jsdom
// Actually, vitest in node doesn't have atob by default.
if (typeof atob === 'undefined') {
  global.atob = (str) => Buffer.from(str, 'base64').toString('binary');
}

describe('parseJwt', () => {
  it('should parse a valid JWT', () => {
    const payload = { userId: 123, username: 'testuser' };
    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64')
      .replace(/=/g, ''); // Simple base64 for testing
    const mockToken = `header.${base64Payload}.signature`;

    const result = parseJwt(mockToken);
    expect(result).toEqual(payload);
  });

  it('should return null for an invalid JWT format', () => {
    const result = parseJwt('invalid-token');
    expect(result).toBeNull();
  });

  it('should return null for malformed base64', () => {
    const result = parseJwt('header.!!!.signature');
    expect(result).toBeNull();
  });

  it('should handle JWT with special characters', () => {
    const payload = { name: 'Filić' };
    const base64Payload = Buffer.from(JSON.stringify(payload)).toString('base64');
    const mockToken = `header.${base64Payload}.signature`;

    const result = parseJwt(mockToken);
    expect(result.name).toBe('Filić');
  });

  it('should return null for empty string', () => {
    const result = parseJwt('');
    expect(result).toBeNull();
  });
});
