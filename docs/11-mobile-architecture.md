# 11 — Mobile App Architecture

A single **Flutter** codebase ships **Android + iOS** apps for the role-based portals (Student, Parent,
Teacher, Admin), consuming the same versioned API as the web app.

## 11.1 Why Flutter

One codebase, native performance, excellent offline + animation support, mature biometric/push plugins, and a
design system that can mirror the web tokens (see [doc 07](./07-design-system.md)) for a consistent, Apple-grade feel.

## 11.2 App architecture (Clean Architecture + feature-first)

```
lib/
├── core/
│   ├── network/        # Dio client, auth interceptor (tenant + JWT), refresh, retry
│   ├── storage/        # secure storage (tokens), Isar/Drift (offline DB)
│   ├── sync/           # offline queue + conflict resolution
│   ├── di/             # Riverpod / get_it providers
│   ├── theme/          # tokens → ThemeData (light/dark), white-label colors
│   └── error/
├── features/
│   ├── auth/           # login (institution id, email, OTP, Google/MS, biometric)
│   ├── dashboard/
│   ├── attendance/     # QR scan, geofence/GPS check-in
│   ├── timetable/
│   ├── exams_results/
│   ├── fees/           # in-app payments
│   ├── lms/            # video lessons (cached), assignments
│   ├── messaging/
│   └── notifications/
│       each feature: data/ (repo, dto) · domain/ (entities, usecases) · presentation/ (screens, widgets, state)
└── main.dart
```

- **State**: Riverpod (or Bloc) for predictable, testable state.
- **Routing**: go_router with auth/role guards.
- **Data**: Dio + Retrofit-style clients generated from the OpenAPI spec → type-safe, no drift from backend.

## 11.3 Offline-first sync

- Local DB (**Isar** or **Drift**) mirrors needed entities; UI reads local, syncs in background.
- **Outbox queue** for mutations made offline (mark attendance, submit assignment) → replayed on reconnect.
- **Conflict resolution**: last-write-wins for simple fields; server-authoritative + merge for records;
  server returns `updatedAt`/version for optimistic concurrency.
- Delta sync via `?updatedSince=<cursor>` endpoints; media cached with LRU eviction.

## 11.4 Security on device

- Tokens in **Keychain/Keystore** via `flutter_secure_storage`; never in plain prefs.
- **Biometric login** (Face ID / fingerprint) unlocks a stored refresh token; PIN fallback.
- Certificate pinning; jailbreak/root detection; screenshot protection on sensitive screens.
- Per-tenant config fetched on login (branding, enabled modules, feature flags).

## 11.5 Push notifications

- **FCM** (Android) + **APNs** (iOS) via the backend Notifications service.
- Topics keyed by `tenantId:role:userId`; deep links route to the right screen.
- Categories: attendance, fees due, results published, announcements, emergency alerts (high priority).

## 11.6 Realtime

WebSocket (Socket.IO client) for live chat, attendance, and transport GPS; auto-reconnect with backoff;
falls back to polling on poor networks.

## 11.7 Theming & white-label

Design tokens are shared as a JSON artifact from `packages/design-tokens`; a build step generates Dart theme
constants so mobile and web stay visually identical. Tenant branding (logo, primary color) overrides at runtime.
Dark mode fully supported.

## 11.8 Quality, release & distribution

- Tests: unit (usecases), widget, golden (visual), integration (flows).
- CI: `flutter analyze` + tests + build; **Fastlane** for signing & store upload.
- Distribution: Play Store + App Store; **Firebase App Distribution** / TestFlight for beta.
- Crash/perf: Firebase Crashlytics + Sentry; OTA-style config via Remote Config / feature flags.
- Accessibility: semantic labels, dynamic type, contrast — matches web WCAG 2.1 AA targets.
