/**
 * AuthService Unit Tests
 *
 * Tests for passphrase management: set, verify, check, remove, and change.
 * Uses react-native-keychain for secure storage (mocked in jest.setup.ts).
 */

// Override the global keychain mock to include ACCESSIBLE constant
jest.mock('react-native-keychain', () => ({
  setGenericPassword: jest.fn(() => Promise.resolve(true)),
  getGenericPassword: jest.fn(() => Promise.resolve(false)),
  resetGenericPassword: jest.fn(() => Promise.resolve(true)),
  ACCESSIBLE: {
    WHEN_UNLOCKED: 'AccessibleWhenUnlocked',
    AFTER_FIRST_UNLOCK: 'AccessibleAfterFirstUnlock',
    ALWAYS: 'AccessibleAlways',
  },
}));

import { authService } from '../../../src/services/authService';
import * as Keychain from 'react-native-keychain';

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ========================================================================
  // setPassphrase
  // ========================================================================
  describe('setPassphrase', () => {
    it('stores hashed passphrase in keychain and returns true', async () => {
      (Keychain.setGenericPassword as jest.Mock).mockResolvedValue(true);

      const result = await authService.setPassphrase('mySecret123');

      expect(result).toBe(true);
      expect(Keychain.setGenericPassword).toHaveBeenCalledTimes(1);
      expect(Keychain.setGenericPassword).toHaveBeenCalledWith(
        'passphrase_hash',
        expect.any(String),
        expect.objectContaining({
          service: 'ai.offgridmobile.auth',
        }),
      );
    });

    it('returns false when keychain storage fails', async () => {
      (Keychain.setGenericPassword as jest.Mock).mockRejectedValue(
        new Error('Keychain unavailable'),
      );

      const result = await authService.setPassphrase('mySecret123');

      expect(result).toBe(false);
    });
  });

  // ========================================================================
  // verifyPassphrase
  // ========================================================================
  describe('verifyPassphrase', () => {
    it('returns true when passphrase matches stored hash', async () => {
      // First, capture the hash that setPassphrase stores
      let storedHash = '';
      (Keychain.setGenericPassword as jest.Mock).mockImplementation(
        (_key: string, hash: string) => {
          storedHash = hash;
          return Promise.resolve(true);
        },
      );

      await authService.setPassphrase('correctPassphrase');

      // Mock getGenericPassword to return the stored hash
      (Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
        username: 'passphrase_hash',
        password: storedHash,
        service: 'ai.offgridmobile.auth',
      });

      const result = await authService.verifyPassphrase('correctPassphrase');

      expect(result).toBe(true);
    });

    it('returns false when passphrase does not match stored hash', async () => {
      let storedHash = '';
      (Keychain.setGenericPassword as jest.Mock).mockImplementation(
        (_key: string, hash: string) => {
          storedHash = hash;
          return Promise.resolve(true);
        },
      );

      await authService.setPassphrase('correctPassphrase');

      (Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
        username: 'passphrase_hash',
        password: storedHash,
        service: 'ai.offgridmobile.auth',
      });

      const result = await authService.verifyPassphrase('wrongPassphrase');

      expect(result).toBe(false);
    });

    it('returns false when no credentials are stored', async () => {
      (Keychain.getGenericPassword as jest.Mock).mockResolvedValue(false);

      const result = await authService.verifyPassphrase('anyPassphrase');

      expect(result).toBe(false);
    });

    it('returns false when keychain retrieval fails', async () => {
      (Keychain.getGenericPassword as jest.Mock).mockRejectedValue(
        new Error('Keychain error'),
      );

      const result = await authService.verifyPassphrase('anyPassphrase');

      expect(result).toBe(false);
    });
  });

  // ========================================================================
  // hasPassphrase
  // ========================================================================
  describe('hasPassphrase', () => {
    it('returns true when credentials exist in keychain', async () => {
      (Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
        username: 'passphrase_hash',
        password: 'somehash',
        service: 'ai.offgridmobile.auth',
      });

      const result = await authService.hasPassphrase();

      expect(result).toBe(true);
      expect(Keychain.getGenericPassword).toHaveBeenCalledWith({
        service: 'ai.offgridmobile.auth',
      });
    });

    it('returns false when no credentials exist', async () => {
      (Keychain.getGenericPassword as jest.Mock).mockResolvedValue(false);

      const result = await authService.hasPassphrase();

      expect(result).toBe(false);
    });

    it('returns false when keychain check fails', async () => {
      (Keychain.getGenericPassword as jest.Mock).mockRejectedValue(
        new Error('Keychain error'),
      );

      const result = await authService.hasPassphrase();

      expect(result).toBe(false);
    });
  });

  // ========================================================================
  // removePassphrase
  // ========================================================================
  describe('removePassphrase', () => {
    it('resets keychain credentials and returns true', async () => {
      (Keychain.resetGenericPassword as jest.Mock).mockResolvedValue(true);

      const result = await authService.removePassphrase();

      expect(result).toBe(true);
      expect(Keychain.resetGenericPassword).toHaveBeenCalledWith({
        service: 'ai.offgridmobile.auth',
      });
    });

    it('returns false when keychain reset fails', async () => {
      (Keychain.resetGenericPassword as jest.Mock).mockRejectedValue(
        new Error('Keychain error'),
      );

      const result = await authService.removePassphrase();

      expect(result).toBe(false);
    });
  });

  // ========================================================================
  // changePassphrase
  // ========================================================================
  describe('changePassphrase', () => {
    it('changes passphrase when old passphrase is correct', async () => {
      // Set up initial passphrase
      let storedHash = '';
      (Keychain.setGenericPassword as jest.Mock).mockImplementation(
        (_key: string, hash: string) => {
          storedHash = hash;
          return Promise.resolve(true);
        },
      );

      await authService.setPassphrase('oldPass');

      // Mock getGenericPassword to return the stored hash for verification
      (Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
        username: 'passphrase_hash',
        password: storedHash,
        service: 'ai.offgridmobile.auth',
      });

      const result = await authService.changePassphrase('oldPass', 'newPass');

      expect(result).toBe(true);
      // setGenericPassword called twice: once for initial set, once for change
      expect(Keychain.setGenericPassword).toHaveBeenCalledTimes(2);
    });

    it('returns false when old passphrase is incorrect', async () => {
      let storedHash = '';
      (Keychain.setGenericPassword as jest.Mock).mockImplementation(
        (_key: string, hash: string) => {
          storedHash = hash;
          return Promise.resolve(true);
        },
      );

      await authService.setPassphrase('oldPass');

      (Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
        username: 'passphrase_hash',
        password: storedHash,
        service: 'ai.offgridmobile.auth',
      });

      const result = await authService.changePassphrase(
        'wrongOldPass',
        'newPass',
      );

      expect(result).toBe(false);
      // setGenericPassword called only once for the initial set, not for change
      expect(Keychain.setGenericPassword).toHaveBeenCalledTimes(1);
    });
  });

  // ========================================================================
  // Legacy hash migration
  // ========================================================================
  describe('legacy hash migration', () => {
    it('accepts a v1 hash and migrates to v2 on successful verify', async () => {
      // Compute a v1 (legacy) hash exactly as the old algorithm did
      /* eslint-disable no-bitwise */
      function legacyHash(passphrase: string): string {
        let hash = 0;
        for (let i = 0; i < passphrase.length; i++) {
          const char = passphrase.codePointAt(i) ?? 0;
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash;
        }
        const baseHash = Math.abs(hash).toString(16);
        let extendedHash = baseHash;
        for (let i = 0; i < 1000; i++) {
          let tempHash = 0;
          for (let j = 0; j < extendedHash.length; j++) {
            const char = extendedHash.codePointAt(j) ?? 0;
            tempHash = ((tempHash << 5) - tempHash) + char;
            tempHash = tempHash & tempHash;
          }
          extendedHash = Math.abs(tempHash).toString(16) + extendedHash.slice(0, 8);
        }
        return extendedHash;
      }
      /* eslint-enable no-bitwise */

      const passphrase = 'myOldPassphrase';
      const v1Hash = legacyHash(passphrase);

      // Simulate a v1 hash stored in keychain (no "v2:" prefix)
      (Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
        username: 'passphrase_hash',
        password: v1Hash,
        service: 'ai.offgridmobile.auth',
      });
      (Keychain.setGenericPassword as jest.Mock).mockResolvedValue(true);

      const result = await authService.verifyPassphrase(passphrase);

      expect(result).toBe(true);
      // Migration: setGenericPassword should be called to upgrade to v2
      expect(Keychain.setGenericPassword).toHaveBeenCalledTimes(1);
      const storedHash = (Keychain.setGenericPassword as jest.Mock).mock.calls[0][1] as string;
      expect(storedHash).toMatch(/^v2:/);
    });

    it('rejects a v1 hash with wrong passphrase without migrating', async () => {
      const v1Hash = '0badcafe'; // arbitrary non-v2 hash

      (Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
        username: 'passphrase_hash',
        password: v1Hash,
        service: 'ai.offgridmobile.auth',
      });

      const result = await authService.verifyPassphrase('wrongPassphrase');

      expect(result).toBe(false);
      expect(Keychain.setGenericPassword).not.toHaveBeenCalled();
    });
  });

  // ========================================================================
  // Hermes (no Web Crypto) regression
  //
  // The app engine is Hermes, which does NOT expose globalThis.crypto unless a
  // polyfill is installed. Hashing must therefore use the pure-JS PBKDF2 path
  // and never touch crypto.subtle. This block removes global.crypto entirely to
  // prove set/verify still work — the scenario the previous crypto.subtle
  // implementation failed silently in production.
  // ========================================================================
  describe('without a Web Crypto runtime (Hermes without polyfill)', () => {
    let originalCrypto: unknown;

    beforeEach(() => {
      originalCrypto = (global as { crypto?: unknown }).crypto;
      // @ts-ignore - intentionally removing crypto to emulate Hermes
      delete (global as { crypto?: unknown }).crypto;
    });

    afterEach(() => {
      (global as { crypto?: unknown }).crypto = originalCrypto;
    });

    it('sets and verifies a passphrase using the pure-JS PBKDF2 path', async () => {
      let storedHash = '';
      (Keychain.setGenericPassword as jest.Mock).mockImplementation(
        (_key: string, hash: string) => {
          storedHash = hash;
          return Promise.resolve(true);
        },
      );

      const setResult = await authService.setPassphrase('hermesSecret');

      expect(setResult).toBe(true);
      // Format is "v2:<saltHex>:<hashHex>" with a 16-byte salt and 32-byte hash
      expect(storedHash).toMatch(/^v2:[0-9a-f]{32}:[0-9a-f]{64}$/);

      (Keychain.getGenericPassword as jest.Mock).mockResolvedValue({
        username: 'passphrase_hash',
        password: storedHash,
        service: 'ai.offgridmobile.auth',
      });

      expect(await authService.verifyPassphrase('hermesSecret')).toBe(true);
      expect(await authService.verifyPassphrase('wrongSecret')).toBe(false);
    });
  });

  // ========================================================================
  // Per-installation salt
  // ========================================================================
  describe('salting', () => {
    it('produces a different stored hash for the same passphrase each time', async () => {
      const hashes: string[] = [];
      (Keychain.setGenericPassword as jest.Mock).mockImplementation(
        (_key: string, hash: string) => {
          hashes.push(hash);
          return Promise.resolve(true);
        },
      );

      await authService.setPassphrase('samePassphrase');
      await authService.setPassphrase('samePassphrase');

      expect(hashes).toHaveLength(2);
      expect(hashes[0]).not.toEqual(hashes[1]);
    });
  });
});
