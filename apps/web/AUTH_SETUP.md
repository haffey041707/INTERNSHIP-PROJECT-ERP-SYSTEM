# Authentication — how it works & how to enable Google / Microsoft

The app has a **real** auth system: signup, email+password login, sessions (signed
httpOnly cookie), and password reset with single-use tokens. Google and Microsoft use
the real OAuth 2.0 authorization-code flow — they just need you to register an OAuth app
(no one can skip this; it's how OAuth works).

## What works with zero setup
- **Sign up** (`/signup`): registers an institution + admin account, then sends you to sign in.
- **Sign in** (`/login`): email + password. Institution is resolved from your email automatically.
- **Forgot password** (`/forgot-password`) → **Reset** (`/reset-password?token=…`): real tokens, 1-hour expiry, single use.
  - There's no email server in this environment, so the reset link is shown on screen (clearly labelled "dev mode"). In production you'd send it via an email provider — see `forgotPasswordAction` in `src/app/login/actions.ts` (the `TODO`).

## Enabling Google sign-in
1. Go to https://console.cloud.google.com/apis/credentials → **Create Credentials → OAuth client ID**.
2. Application type: **Web application**.
3. **Authorized redirect URI**: `http://localhost:3000/api/auth/google/callback`
   (use your real domain in production, e.g. `https://app.yourschool.com/api/auth/google/callback`).
4. Copy the **Client ID** and **Client secret** into `apps/web/.env`:
   ```
   GOOGLE_CLIENT_ID="...apps.googleusercontent.com"
   GOOGLE_CLIENT_SECRET="..."
   ```
5. Restart the dev server. The **Google** button is now live.

The callback is built into this ERP at `/api/auth/google/callback`. Do not use a
separate callback repository or relay page: OAuth state is verified with a secure,
same-site cookie and must return directly to this application.

## Enabling Microsoft sign-in
1. Go to https://portal.azure.com → **Azure Active Directory → App registrations → New registration**.
2. Supported account types: choose what fits (e.g. "Accounts in any organizational directory and personal Microsoft accounts").
3. **Redirect URI** (Web): `http://localhost:3000/api/auth/microsoft/callback`
4. Under **Certificates & secrets**, create a **client secret**.
5. Put the values in `apps/web/.env`:
   ```
   MICROSOFT_CLIENT_ID="..."
   MICROSOFT_CLIENT_SECRET="..."
   ```
6. Restart. The **Microsoft** button is now live.

## How OAuth maps to an account
On callback we read the verified email from the provider and match it to an existing
institution account (created via signup). If no account matches, a new institution admin
workspace is created from the provider profile. A password account that signs in with a matching Google/Microsoft email is linked
automatically. Until a provider's `CLIENT_ID`/`SECRET` are set, its button shows a
"not set up yet" message instead of pretending to work.
