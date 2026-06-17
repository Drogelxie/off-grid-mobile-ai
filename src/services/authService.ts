import * as Keychain from 'react-native-keychain';
import logger from '../utils/logger';

const SERVICE_NAME = 'ai.offgridmobile.auth';
const PASSPHRASE_KEY = 'passphrase_hash';

class AuthService {
  /**
   * Legacy djb2-based hash kept only for migrating existing stored hashes.
   * New hashes use PBKDF2 (v2 prefix). Bitwise ops here are the original algorithm.
   */
  private hashPassphraseLegacy(passphrase: string): string {
    let hash = 0;
    for (let i = 0; i < passphrase.length; i++) {
      const char = passphrase.codePointAt(i) ?? 0;
      hash = ((hash << 5) - hash) + char; // eslint-disable-line no-bitwise
      hash = hash & hash; // eslint-disable-line no-bitwise
    }
    const baseHash = Math.abs(hash).toString(16);
    let extendedHash = baseHash;
    for (let i = 0; i < 1000; i++) {
      let tempHash = 0;
      for (let j = 0; j < extendedHash.length; j++) {
        const char = extendedHash.codePointAt(j) ?? 0;
        tempHash = ((tempHash << 5) - tempHash) + char; // eslint-disable-line no-bitwise
        tempHash = tempHash & tempHash; // eslint-disable-line no-bitwise
      }
      extendedHash = Math.abs(tempHash).toString(16) + extendedHash.slice(0, 8);
    }
    return extendedHash;
  }

  /**
   * Derive a 256-bit key from the passphrase using PBKDF2-SHA256 (100k iterations).
   * Returns a hex string with a "v2:" prefix to distinguish from legacy hashes.
   *
   * Uses the Web Crypto API available in Hermes (React Native) and Node.js 20+.
   */
  private async hashPassphrase(passphrase: string): Promise<string> {
    // Type assertion needed because TypeScript's default lib doesn't include
    // globalThis.crypto unless "lib": ["DOM"] or "WebWorker" is in tsconfig.
    const subtle = (globalThis as unknown as { crypto: Crypto }).crypto.subtle;
    const encoder = new TextEncoder();
    const keyMaterial = await subtle.importKey(
      'raw',
      encoder.encode(passphrase),
      'PBKDF2',
      false,
      ['deriveBits'],
    );
    const bits = await subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: encoder.encode('ai.offgridmobile.auth.v2'),
        iterations: 100_000,
        hash: 'SHA-256',
      },
      keyMaterial,
      256,
    );
    const hex = Array.from(new Uint8Array(bits))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    return `v2:${hex}`;
  }

  async setPassphrase(passphrase: string): Promise<boolean> {
    try {
      const hash = await this.hashPassphrase(passphrase);
      await Keychain.setGenericPassword(PASSPHRASE_KEY, hash, {
        service: SERVICE_NAME,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
      });
      return true;
    } catch (error) {
      logger.error('Failed to set passphrase:', error);
      return false;
    }
  }

  async verifyPassphrase(passphrase: string): Promise<boolean> {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: SERVICE_NAME,
      });

      if (!credentials) {
        return false;
      }

      const stored = credentials.password;

      if (stored.startsWith('v2:')) {
        const inputHash = await this.hashPassphrase(passphrase);
        return inputHash === stored;
      }

      // Legacy v1 hash: verify, then silently migrate to v2 on success.
      const legacyHash = this.hashPassphraseLegacy(passphrase);
      if (legacyHash !== stored) {
        return false;
      }
      await this.setPassphrase(passphrase);
      return true;
    } catch (error) {
      logger.error('Failed to verify passphrase:', error);
      return false;
    }
  }

  async hasPassphrase(): Promise<boolean> {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: SERVICE_NAME,
      });
      return credentials !== false;
    } catch (error) {
      logger.error('Failed to check passphrase:', error);
      return false;
    }
  }

  async removePassphrase(): Promise<boolean> {
    try {
      await Keychain.resetGenericPassword({
        service: SERVICE_NAME,
      });
      return true;
    } catch (error) {
      logger.error('Failed to remove passphrase:', error);
      return false;
    }
  }

  async changePassphrase(oldPassphrase: string, newPassphrase: string): Promise<boolean> {
    const isValid = await this.verifyPassphrase(oldPassphrase);
    if (!isValid) {
      return false;
    }
    return this.setPassphrase(newPassphrase);
  }
}

export const authService = new AuthService();
