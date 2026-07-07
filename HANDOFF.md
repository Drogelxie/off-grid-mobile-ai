# Handoff — branch `claude/security-audit-ux-redesign-x4bblv`

**Date:** 2026-06-18
**Author of changes:** code review + fixes (see `CODE_REVIEW_REPORT.md`)
**State:** pushed to GitHub, in sync with `origin`. Not yet merged to `main`.
**Goal of this handoff:** build a test APK, verify the passphrase fix on a real device, and merge if it works.

---

## 1. What this branch changes

Two themes: a security audit and a UX/i18n redesign (57 files vs `main`). Full review in `CODE_REVIEW_REPORT.md`. The one change that needs on-device verification before merge:

### The critical fix — passphrase hashing (`src/services/authService.ts`)
The previous "strengthen passphrase hashing" commit derived the hash with `globalThis.crypto.subtle` (Web Crypto / PBKDF2). Hermes (the app's JS engine, `hermesEnabled=true`) does **not** ship Web Crypto and no polyfill is installed, so on-device `setPassphrase` threw and was silently swallowed — setting a passphrase failed in production. Jest only passed because Node 20+ has Web Crypto.

Fixed by replacing `crypto.subtle` with `@noble/hashes` PBKDF2 (pure JS, audited, byte-identical output to Web Crypto, runs on Hermes with no native module). Also: per-installation random salt (`v2:<saltHex>:<hashHex>`), constant-time compare, and logged (not swallowed) migration failures.

**Why a device test is still required:** the one thing that cannot be checked off-device is whether Metro resolves `@noble/hashes` v2's ESM `.js` subpath exports at runtime. RN 0.83's Metro supports package exports and noble v2 is widely used in RN, so this is expected to work, but it must be confirmed on a real build before merge.

---

## 2. Pre-build state (already verified, no device needed)

- `npx tsc --noEmit` → clean (exit 0)
- `npx eslint src` → 0 errors, 30 pre-existing warnings (react-hooks/exhaustive-deps)
- `npx jest` → 182 suites, 5498 passed, 4 skipped (pre-existing). Includes a new regression test that deletes `global.crypto` to emulate Hermes and proves set/verify still work.
- `@noble/hashes@^2.2.0` added to `package.json`; `npm install` is enough (no native rebuild for the dependency itself).

---

## 3. Build a test APK (Linux)

Prereqs: Node 20+, JDK 17, Android SDK 36, `ANDROID_HOME` set. `npm install` already run.

Use a **release** build for testing, because it bundles the JS into the APK and runs offline (no Metro dev server). Release signing falls back to the debug keystore when no upload key is set, so no secrets are needed:

```bash
# from repo root
npm install                      # ensure @noble/hashes is present
cd android
./gradlew clean
./gradlew assembleRelease
cd ..
```

Output APK:
```
android/app/build/outputs/apk/release/app-release.apk
```
App id: `ai.offgridmobile` (the release build; the debug build uses `ai.offgridmobile.dev`).

Install on a connected device/emulator:
```bash
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

Notes:
- `npm run android` / `assembleDebug` produce a debug APK that expects the Metro dev server running, so it is not a clean offline test of the bundled crypto path. Prefer `assembleRelease`.
- The 5 modified `ggml-hexagon/*.so` NPU binaries in the working tree are uncommitted and will be packaged into this local build. They are unrelated to this branch (left as-is per decision). They do not affect the passphrase test.

---

## 4. What to test on-device (acceptance for merge)

The passphrase feature is the gate. In the app:

1. **Set a passphrase** (Security settings / lock setup). Confirm it saves with no error (previously this failed silently).
2. **Lock, then unlock** with the correct passphrase → must succeed.
3. **Unlock with a wrong passphrase** → must be rejected.
4. **Change passphrase** (old → new), then unlock with the new one.
5. If a device already had a passphrase from an older build (v1 djb2 hash): unlock with it once → it should still work and silently migrate to the new v2 format. Re-lock and unlock again to confirm.

If all five pass, the fix is verified on-device.

Smoke-test the redesign while you are in there: language switch (German/English, the i18n work), remote server modal/setup guide, and general navigation, since this branch also touched many screens.

---

## 5. If it works — merge

Branch policy (see `CLAUDE.md`): never push to `main`; merge only through a PR.

```bash
# PR does not exist yet — create it
gh pr create --base main --head claude/security-audit-ux-redesign-x4bblv \
  --title "Security audit + UX redesign" \
  --body "See CODE_REVIEW_REPORT.md. Fixes on-device-broken PBKDF2 passphrase hashing (Hermes had no Web Crypto) by switching to @noble/hashes; per-install salt; constant-time compare. Plus German i18n and UX redesign."
```
(`gh` is not currently installed locally — `brew install gh` or `sudo apt install gh`, or open the PR from the GitHub web UI.)

Three automated reviewers run on the PR (see `CLAUDE.md` → CI Review Loop): **Gemini** (code quality), **Codecov** (coverage), **SonarCloud** (security/smells). Address each, re-run local gates (`npm run lint && npx tsc --noEmit && npm test`), then merge when all are green.

---

## 6. Outstanding (not blockers for this branch)

- **Dependencies (`CODE_REVIEW_REPORT.md` Befund 8):** `markdown-it` ReDoS has no fix yet (real runtime input path via markdown rendering — watch upstream); `xmldom` / `fast-xml-parser` criticals are build-toolchain only and need `npm audit fix --force` (breaking). Do this in a **separate** chore PR, not here.
- **`ggml-hexagon/*.so`:** 5 modified NPU binaries left uncommitted in the working tree (provenance unknown, intentionally untouched). Decide separately whether to revert (`git restore <files>`) or commit them.
- **30 eslint warnings:** pre-existing `react-hooks/exhaustive-deps`. Check the i18n `t` closures (e.g. `RemoteServersScreen.tsx`) since a stale closure could skip re-translation on language switch.

---

## 7. Git / push setup (resolved this session)

- Remote is SSH at the canonical URL: `git@github.com:Drogelxie/off-grid-mobile-ai.git`.
- Auth uses the ed25519 key `~/.ssh/id_ed25519` (fingerprint `SHA256:kIiOL6Qx0CH1DICWUSUxCB4QIcsvXZw5/T+K5B81bkw`), which is registered on the GitHub account with Read/write. The `github_pat_...` token is unrelated (HTTPS only) and not needed.
- The key is passphrase-protected. GNOME Keyring holds it; once the keyring is unlocked at login, `git push` works with no prompt. If the keyring agent ever refuses to sign, push directly with the key file:
  ```bash
  GIT_SSH_COMMAND="ssh -i ~/.ssh/id_ed25519 -o IdentitiesOnly=yes -o IdentityAgent=none" \
    git push origin claude/security-audit-ux-redesign-x4bblv
  ```
  (prompts for the key passphrase interactively).
- To avoid the prompt each session: in Passwords and Keys (Seahorse), set the "Login" keyring password to match your Linux login password so it auto-unlocks at startup.
