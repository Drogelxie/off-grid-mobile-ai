# Code-Review-Bericht — Off Grid (offgrid-mobile)

**Datum:** 2026-06-18
**Tech-Stack:** React Native 0.83.1 (Hermes), React 19.2, TypeScript 5.8, Zustand, op-sqlite, llama.rn / whisper.rn, native Android (Kotlin) + iOS (Swift). Build: npm + Gradle + CocoaPods. Tests: Jest + RNTL, JUnit, XCTest, Maestro.
**Branch/Commit:** `claude/security-audit-ux-redesign-x4bblv` (Merge-Base `fbd22c70`)
**Scope:** Diff dieses Branches gegen `origin/main` — 57 Dateien, +3267/-777. Schwerpunkt laut Branch-Name: Security-Audit + UX-Redesign. Es ist KI-generierter Code (Branch-Prefix `claude/`, Commit "security: strengthen passphrase hashing").
**Verifikation (BELEG):**
- `npx tsc --noEmit` → EXIT 0 (sauber)
- `npx eslint src` → EXIT 0, **0 errors / 30 warnings** (alle `react-hooks/exhaustive-deps`, vorbestehend)
- `npx jest __tests__/unit/services/authService.test.ts` → **15 passed** (Time 1.628 s) — siehe 🔴-1, das ist Teil des Problems, kein Beleg für Korrektheit
- `npm audit` (vom User ausgeführt): 53 → nach `npm audit fix` verbleiben mehrere, davon **3 kritisch** (`xmldom`, `fast-xml-parser`-Kette), nur per `--force` / Breaking-Change behebbar

---

## 1. Recherche-Findings

### 1.1 Aktuelle Best Practices (React Native / Hermes / Crypto)
**Geprüfte Kernfrage:** Stellt die Hermes-Engine `globalThis.crypto.subtle` (Web Crypto / PBKDF2) bereit?

**Ergebnis: Nein.** Hermes implementiert die Web-Crypto-API nicht nativ — nicht einmal `crypto.getRandomValues()`. Es ist ein Polyfill nötig (`react-native-get-random-values`, `react-native-quick-crypto` mit JSI, oder `react-native-webview-crypto`). Stand 2025/2026 unverändert.

Quellen:
- [Using Hermes — reactnative.dev](https://reactnative.dev/docs/hermes)
- [Increase Speed and Security With Native Crypto Libraries — callstack.com](https://www.callstack.com/blog/increase-speed-and-security-with-native-crypto-libraries)
- [Fix crypto.getRandomValues() Error in React Native with Hermes — Medium](https://medium.com/@manthankaslemk/how-to-fix-crypto-getrandomvalues-error-in-react-native-with-hermes-engine-8637cdf58e65)
- [react-native-quick-crypto — GitHub](https://github.com/margelo/react-native-quick-crypto)
- [Web Crypto API — Node.js Docs](https://nodejs.org/api/webcrypto.html) (Node 20+ HAT `globalThis.crypto` → erklärt, warum Jest grün ist)

### 1.2 KI-Coding-Fehlermuster im Repo

| Muster | Beschreibung | Im Repo gesehen? | Beleg |
|---|---|---|---|
| **Confident-but-wrong** | Code sieht fertig aus, ist auf dem Zielgerät still kaputt | **JA — 🔴** | `authService.ts:36-42`, Kommentar "available in Hermes" ist falsch |
| **Halluzinierte API** | Aufruf gegen API geraten statt gegen reale Engine geprüft | **JA — 🔴** | `globalThis.crypto.subtle` existiert auf Hermes nicht |
| **Test-Gaming / Tests prüfen die falsche Umgebung** | Test grün auf Node, deckt Zielplattform nie ab | **JA — 🔴** | `authService.test.ts:32-46` mockt `crypto` nicht; läuft nur dank Node-20-WebCrypto |
| **Doku-Claims ohne Beleg** | Versions-/Kompatibilitätsaussage ohne Quelle | **JA — 🟠** | derselbe Kommentar `authService.ts:38-40` |
| **Lokaler Fix ohne Systemsicht** | Symptom behoben, Wiring unvollständig | teilweise — 🟡 | Private-Network-Gate nur in `generate()`, nicht in `loadModel`/`getTokenCount` (Defense-in-Depth) |
| **Over-Engineering / Over-Documentation** | — | gering | Kommentardichte ok, keine unnötigen Abstraktionen im Diff |
| **Cross-File-Halluzination** | geratene Signaturen | nein | tsc EXIT 0 bestätigt Signatur-Konsistenz |

---

## 2. Architektur-Überblick

Saubere Schichtung: `screens/` → `stores/` (Zustand) → `services/` (LLM-Provider, RAG, Tools, Auth, HTTP) → native Module. Der Security-Audit-Teil dieses Branches betrifft drei Pfade:

1. **Passphrase-Auth** (`authService.ts`, `PassphraseSetupScreen`, `LockScreen`, `SecuritySettingsScreen`) — Hash-Upgrade djb2 → PBKDF2.
2. **Remote-Server-Egress** (`httpClientUtils.ts`, `openAICompatibleProvider.ts`, `RemoteServerModal`) — Beschränkung auf private Netze + Tailscale-CGNAT.
3. **Tool-Transparenz** (`tools/registry.ts`) — präzisere Datenfluss-Beschreibung für `web_search`.

Pfad 2 und 3 sind solide. Pfad 1 ist der kritische Befund.

---

## 3. Review-Befunde

### 🔴 Befund 1 — PBKDF2-Passphrase-Hashing ist auf dem Gerät kaputt (Achse 2/4/9/10)
**Datei:** `src/services/authService.ts:38-65` (neu eingeführt in Commit `79b75136` "strengthen passphrase hashing")

```ts
// Uses the Web Crypto API available in Hermes (React Native) and Node.js 20+.
const subtle = (globalThis as unknown as { crypto: Crypto }).crypto.subtle;
```

**Problem:** Die Behauptung "available in Hermes" ist falsch (siehe 1.1, belegt). Auf der App-Engine ist `hermesEnabled=true` (`android/gradle.properties:39`) und **kein Crypto-Polyfill** ist installiert:
- kein Import in `index.js`, `App.tsx`, `jest.setup.ts`
- keine `crypto`-Dependency in `package.json` (grep: leer)

**Laufzeitfolge auf Gerät:** `globalThis.crypto` ist `undefined` → `.subtle` wirft `TypeError` → vom `try/catch` in `setPassphrase`/`verifyPassphrase` verschluckt → **`setPassphrase` gibt still `false` zurück**. Ein Nutzer kann keine neue Passphrase setzen; die "verstärkte" Sicherheit ist faktisch eine Verschlechterung (Feature defekt). Bestehende v1-Nutzer können sich noch einloggen (Legacy-Pfad braucht kein crypto), aber ihre Migration zu v2 scheitert ebenfalls still.

**Warum die Tests das nicht fingen (Test-Gaming-Klasse):** `authService.test.ts` mockt `crypto` nicht. Jest läuft auf Node 20+, das `globalThis.crypto.subtle` echt bereitstellt → 15/15 grün (belegt oben). Der Test prüft nie die Zielplattform Hermes. Damit ist der grüne Test selbst ein Confident-but-wrong-Artefakt.

**Empfohlener Fix (verhaltensändernd → nicht blind umgesetzt):**
- Polyfill ergänzen: `react-native-quick-crypto` (JSI, `subtle.deriveBits` nativ) ODER `react-native-get-random-values` + reine PBKDF2-Impl, und in `index.js` ganz oben importieren.
- Im Jest-Setup denselben Pfad erzwingen (statt sich auf Node-Crypto zu verlassen) bzw. einen Hermes-nahen Negativtest: Test der bei fehlendem `globalThis.crypto` den erwarteten Fehlerpfad prüft.
- Erst danach den Code-Kommentar korrigieren (Doku-Drift, siehe Befund 4).

### 🟠 Befund 2 — PBKDF2 mit statischem, hartcodiertem Salt (Achse 2)
**Datei:** `src/services/authService.ts` — `salt: encoder.encode('ai.offgridmobile.auth.v2')`

Ein über alle Installationen konstantes Salt hebt den Hauptzweck des Salts auf (Schutz vor Vorberechnung/Rainbow-Tables; identische Passphrasen → identische Hashes). Nutzen bleibt nur die Iterationszahl. Bei einem lokalen Single-User-Keychain ist das Risiko begrenzt, aber für ein Feature, das explizit als Sicherheitsverstärkung verkauft wird, sub-standard.
**Empfehlung:** Pro-Installation zufälliges Salt (16 B aus dem Polyfill-RNG) erzeugen und neben dem Hash speichern (`v2:<saltHex>:<hashHex>`). Verify parst Salt aus dem gespeicherten Wert.

### 🟡 Befund 3 — Vergleich nicht konstantzeitig (Achse 2)
**Datei:** `src/services/authService.ts` — `return inputHash === stored;`

String-`===` ist nicht timing-sicher. Im lokalen Geräte-Threat-Model marginal, daher 🟡. Bei Umsetzung von Befund 1 ohnehin gleich konstantzeitig vergleichen.

### 🟡 Befund 4 — Doku-Claim ohne Beleg (Achse 10)
**Datei:** `src/services/authService.ts:38-40` — Kommentar behauptet Hermes-Verfügbarkeit ohne Quelle und entgegen der Realität. Nach Fix korrigieren; Versions-/Kompatibilitätsaussagen grundsätzlich nur mit belegbarer Quelle.

### 🟡 Befund 5 — Migration schluckt Fehlschlag still (Achse 4)
**Datei:** `src/services/authService.ts:99-104` (verify-Legacy-Pfad)

```ts
await this.setPassphrase(passphrase); // Ergebnis ignoriert
return true;
```

Wenn die v2-Migration scheitert (heute: immer, wegen Befund 1), bleibt der Nutzer still auf v1 — ohne Logging. Mindestens `const ok = await this.setPassphrase(...)` und bei `!ok` ein `logger.warn`, damit Migrationsausfälle sichtbar sind.

### 🟡 Befund 6 — Private-Network-Gate nur teilweise verdrahtet (Achse 2/6, Defense-in-Depth)
**Datei:** `src/services/providers/openAICompatibleProvider.ts:123`

Das Gate sitzt korrekt in `generate()` vor beiden Egress-Pfaden (Ollama + OpenAI-Streaming) — der eigentliche Chat-Datenfluss ist also geschützt, und `useRemoteServerForm.ts:121` verhindert das Speichern öffentlicher Endpunkte. Aber `loadModel`, `getTokenCount` und Discovery/`testEndpoint` re-prüfen nicht, während der Kommentar `httpClient.ts:180` pauschal "Requests are validated by isPrivateNetworkEndpoint before use" behauptet — das stimmt nur für `generate()`. Entweder die Prüfung in `httpClient` zentralisieren oder den Kommentar präzisieren.

### 🟡 Befund 7 — CGNAT-Regex validiert Oktett-Bereiche nicht (Achse 2)
**Datei:** `src/services/httpClientUtils.ts:106-112` — `/^100\.(\d{1,3})\.\d{1,3}\.\d{1,3}$/` akzeptiert auch `100.70.999.1`. Da der Wert aus einem geparsten URL-Hostnamen kommt, praktisch unkritisch (konsistent mit dem Stil der übrigen Range-Checks), daher nur 🟡.

### 🟠 Befund 8 — Dependency-Audit: kritische transitive CVEs (Achse 8)
**Beleg:** `npm audit` (User-Lauf). Nach `npm audit fix` verbleiben u. a.:
- **kritisch:** `xmldom` (mehrere XML-Injection/DoS), `fast-xml-parser`-Kette über `@react-native-community/cli-*` — nur per `--force` (`cli@20.1.3`, außerhalb Range) behebbar.
- **moderate, no fix:** `markdown-it` (ReDoS) via `@ronradtke/react-native-markdown-display` — rendert Modell-/Dokument-Markdown, also angreifbare Eingabe → beobachten / Upstream-Update verfolgen.
- `js-yaml`, `uuid`/`xml2js` (via `@react-native-voice/voice`) nur mit Breaking-Change behebbar.

Die meisten betreffen Build-/Dev-Toolchain (kein Runtime-Risiko in der App). `markdown-it` ist der einzige mit plausiblem Runtime-Eingabepfad. **Empfehlung:** `markdown-it` priorisieren; CLI-Kette in einem separaten, getesteten Chore-PR per `--force` aktualisieren.

### 🟡 Befund 9 — Vorbestehende ESLint-Warnings (Achse 1)
30 `react-hooks/exhaustive-deps`-Warnings (z. B. `RemoteServersScreen.tsx`, `OnboardingScreen.tsx`, `useThemedStyles.ts`). Nicht durch diesen Branch verschlechtert (Baseline). Kein Blocker, aber bei `t`-Dependencies (i18n) können veraltete Closures zu nicht-neu-übersetzten Strings bei Sprachwechsel führen — stichprobenartig prüfen.

---

## 4. Durchgeführte Änderungen (behebt Befunde 1–6)

Alle Fixes verhaltensbewahrend für gültige Logins; Hash-Mechanismus geändert (war auf dem Gerät ohnehin nicht funktional). **BELEG:** `npx tsc --noEmit` EXIT 0; `npx eslint` auf geänderten Dateien EXIT 0; **`npx jest` → 182 Suites, 5498 passed, 4 skipped (Baseline)**, Time 31.8 s.

- **Dependency:** `@noble/hashes@^2.2.0` ergänzt (pure JS, audited, zero-dep). `npm install` reicht — kein nativer Rebuild nötig.
- **Befund 1 (🔴) — `authService.ts`:** `crypto.subtle` ersetzt durch `pbkdf2(sha256, …)` aus `@noble/hashes`. Reine-JS-Implementierung, läuft auf Hermes ohne Polyfill; Output byte-identisch zu Web-Crypto/Node-PBKDF2 (verifiziert). 100k Iterationen, SHA-256.
- **Befund 2 (🟠) — Salt:** Pro-Aufruf zufälliges 16-Byte-Salt via `crypto.getRandomValues` mit Math.random-Fallback (analog zum bestehenden `generateId`-Muster). Neues Format `v2:<saltHex>:<hashHex>`. Gleiche Passphrase erzeugt jetzt unterschiedliche Hashes (getestet).
- **Befund 3 (🟡) — Vergleich:** konstantzeitiger Hex-Vergleich `timingSafeEqualHex` statt `===`.
- **Befund 4 (🟡) — Doku:** falscher "available in Hermes"-Kommentar entfernt, durch korrekte Beschreibung (pure-JS, Hermes-safe) ersetzt.
- **Befund 5 (🟡) — Migration:** `setPassphrase`-Rückgabe wird geprüft; bei Fehlschlag `logger.warn` statt stillem Schlucken.
- **Tests — `authService.test.ts`:** Neuer Regressionstest "ohne Web-Crypto-Runtime (Hermes)" entfernt `global.crypto` und beweist, dass set/verify weiterhin funktionieren — genau der Fall, der vorher still in Produktion versagte. Plus Salt-Eindeutigkeits-Test. `jest.config.js`: `@noble` zu `transformIgnorePatterns` ergänzt (noble ist ESM).
- **Befund 6 (🟡) — re-bewertet als Non-Issue:** `generate()` ist der einzige Egress-Pfad mit Nutzerdaten und ist gegated; `getTokenCount` ist eine lokale `length/4`-Schätzung (kein Netz), `loadModel` setzt nur ein Feld. Der Kommentar in `httpClient.ts:180` ist damit korrekt.

## 5. Offene Punkte — priorisiert

| # | Befund | Schwere | Status |
|---|--------|---------|--------|
| 1 | PBKDF2 auf Hermes kaputt | 🔴 | **behoben** (pure-JS noble) — vor Release einmal echten App-Build verifizieren (siehe Schritt 1) |
| 2 | Statisches PBKDF2-Salt | 🟠 | **behoben** (per-install Salt) |
| 3 | Nicht-konstantzeitiger Vergleich | 🟡 | **behoben** |
| 4 | Falscher Hermes-Kommentar | 🟡 | **behoben** |
| 5 | Migration schluckt Fehlschlag | 🟡 | **behoben** |
| 6 | Network-Gate-Kommentar | 🟡 | **re-bewertet: kein Issue** |
| 8 | Transitive CVEs / `markdown-it` ReDoS | 🟠 | **offen** — `markdown-it` zuerst; CLI-Kette per `--force` in eigenem Chore-PR |
| 7 | CGNAT-Regex ohne Oktett-Range | 🟡 | **offen** (kosmetisch; bewusst gelassen, sonst inkonsistent zu den übrigen Range-Checks) |
| 9 | 30 exhaustive-deps-Warnings | 🟡 | **offen** (Baseline; bei i18n-`t`-Closures priorisiert prüfen) |

## 6. Nächste Schritte
1. **Echten App-Build verifizieren:** Der einzige nicht in dieser Umgebung prüfbare Punkt ist Metros Auflösung der `@noble/hashes`-ESM-`.js`-Subpath-Exports zur Laufzeit. RN 0.83 Metro unterstützt Package-Exports; noble v2 wird breit in RN genutzt. Einmal `npm run android`/`ios` starten und einen Passphrase-Setup-Durchlauf am Gerät bestätigen.
2. Separater Chore-PR für die Dependency-Audit-Bereinigung (Befund 8), getrennt vom Security-/UX-Branch.
3. Optional: 🟡-Reste (7, 9) bei Gelegenheit.
