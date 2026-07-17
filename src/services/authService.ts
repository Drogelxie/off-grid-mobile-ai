import * as Keychain from 'react-native-keychain';
import { pbkdf2Async } from '@noble/hashes/pbkdf2.js';
import { sha256 } from '@noble/hashes/sha2.js';
import { bytesToHex, hexToBytes, utf8ToBytes } from '@noble/hashes/utils.js';
import logger from '../utils/logger';

const SERVICE_NAME = 'ai.offgridmobile.auth';
const PASSPHRASE_KEY = 'passphrase_hash';
/**
 * v2 hashes were written with 100k iterations. Pure-JS PBKDF2 on Hermes (no JIT)
 * runs ~100x slower than native crypto: measured on a budget MediaTek device
 * (Oukitel WP22, 2026-07-17) 100k iterations froze the JS thread for MINUTES,
 * making set/verify appear hung. Kept only to verify existing v2 hashes, which
 * are migrated to v3 on the next successful login.
 */
const PBKDF2_ITERATIONS_V2 = 100_000;
/**
 * v3 default: seconds instead of minutes on low-end devices. This gate protects
 * UI access on a personal device (the data is not encrypted with this key), so
 * the per-install random salt + a few thousand iterations remain an acceptable
 * trade-off. The iteration count is stored inside the hash string, so it can be
 * raised later without breaking existing hashes.
 */
const PBKDF2_ITERATIONS_V3 = 5_000;
const PBKDF2_MAX_ITERATIONS = 1_000_000;
const SALT_BYTES = 16;

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
   * Generate a per-installation salt. Uses crypto.getRandomValues when the
   * runtime exposes it; otherwise falls back to a best-effort source.
   *
   * Hermes (the React Native engine) does not ship a Web Crypto implementation
   * unless a polyfill is installed, so the fallback keeps the salt unique per
   * install (defeating shared precomputation) even without a CSPRNG. The
   * derivation itself (PBKDF2 below) is pure JS and needs no native crypto.
   */
  private generateSalt(): Uint8Array {
    const salt = new Uint8Array(SALT_BYTES);
    const webCrypto = (globalThis as unknown as { crypto?: Crypto }).crypto;
    if (typeof webCrypto !== 'undefined' && webCrypto.getRandomValues) {
      webCrypto.getRandomValues(salt);
      return salt;
    }
    // Fallback: no CSPRNG available. Not cryptographically strong, but unique
    // enough per install to prevent a single precomputed table from covering
    // all users.
    for (let i = 0; i < salt.length; i++) {
      salt[i] = Math.floor(Math.random() * 256); // NOSONAR
    }
    return salt;
  }

  /**
   * Derive a 256-bit key from the passphrase + salt using PBKDF2-SHA256.
   *
   * Implemented with @noble/hashes (pure JS, audited) so it runs on Hermes
   * without a native crypto module. Output is byte-identical to a Web Crypto /
   * Node PBKDF2 with the same parameters. The async variant yields to the
   * event loop between blocks, so the UI (spinner, "Wird überprüft…") keeps
   * rendering while the derivation runs.
   */
  private deriveHash(passphrase: string, salt: Uint8Array, iterations: number): Promise<string> {
    return pbkdf2Async(sha256, utf8ToBytes(passphrase), salt, {
      c: iterations,
      dkLen: 32,
    }).then(bytesToHex);
  }

  /**
   * Produce a stored hash string in the format
   * "v3:<iterations>:<saltHex>:<hashHex>". The salt is generated fresh per
   * call so each stored hash is unique; the iteration count is embedded so it
   * can be tuned without invalidating existing hashes.
   */
  private async hashPassphrase(passphrase: string): Promise<string> {
    const salt = this.generateSalt();
    const hash = await this.deriveHash(passphrase, salt, PBKDF2_ITERATIONS_V3);
    return `v3:${PBKDF2_ITERATIONS_V3}:${bytesToHex(salt)}:${hash}`;
  }

  /**
   * Constant-time comparison of two equal-length hex strings, to avoid leaking
   * how many leading characters matched via timing.
   */
  private timingSafeEqualHex(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }
    let mismatch = 0;
    for (let i = 0; i < a.length; i++) {
      mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i); // eslint-disable-line no-bitwise
    }
    return mismatch === 0;
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

      if (stored.startsWith('v3:')) {
        // Format: "v3:<iterations>:<saltHex>:<hashHex>"
        const parts = stored.split(':');
        const iterations = Number(parts[1]);
        if (parts.length !== 4 || !Number.isInteger(iterations) || iterations < 1 || iterations > PBKDF2_MAX_ITERATIONS) {
          logger.error('Stored passphrase hash is malformed');
          return false;
        }
        const [, , saltHex, expectedHash] = parts;
        const actualHash = await this.deriveHash(passphrase, hexToBytes(saltHex), iterations);
        return this.timingSafeEqualHex(actualHash, expectedHash);
      }

      if (stored.startsWith('v2:')) {
        // Format: "v2:<saltHex>:<hashHex>" — slow on-device (see
        // PBKDF2_ITERATIONS_V2); verify once, then migrate to v3.
        const parts = stored.split(':');
        if (parts.length !== 3) {
          logger.error('Stored passphrase hash is malformed');
          return false;
        }
        const [, saltHex, expectedHash] = parts;
        const actualHash = await this.deriveHash(passphrase, hexToBytes(saltHex), PBKDF2_ITERATIONS_V2);
        if (!this.timingSafeEqualHex(actualHash, expectedHash)) {
          return false;
        }
        if (!(await this.setPassphrase(passphrase))) {
          logger.warn('Passphrase verified but migration to v3 hash failed');
        }
        return true;
      }

      // Legacy v1 hash: verify, then migrate to v3 on success.
      const legacyHash = this.hashPassphraseLegacy(passphrase);
      if (legacyHash !== stored) {
        return false;
      }
      const migrated = await this.setPassphrase(passphrase);
      if (!migrated) {
        // Migration failed (e.g. keychain write error). The passphrase is
        // still valid, so allow login, but surface the failure for diagnosis.
        logger.warn('Passphrase verified but migration to v3 hash failed');
      }
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
