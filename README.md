# ecoLoop Frontend (React + Vite + Tailwind CSS v3)

This is a minimal frontend scaffold to use with the existing backend. It implements registration, login (password + OTP), OTP verification, and a simple profile viewer.

## Getting started

1. Copy `.env.example` to `.env` and set `VITE_API_BASE_URL` (default: `http://localhost:8000`).
2. Install dependencies:
   - npm install
3. Start dev server:
   - npm run dev

Notes:
- Tailwind CSS v3 is used (see `tailwind.config.cjs`).
- The project expects the backend to be available at `VITE_API_BASE_URL` and the auth endpoints described in the backend.
- For production use, store refresh tokens in a secure HttpOnly cookie (this scaffold stores them in localStorage for demo purposes).

Caveats:
- Product listing and CRUD pages have been implemented in the frontend (see /products).
- The backend still lacks an endpoint to initiate sending the RESET_PASSWORD OTP; frontend provides Verify OTP UI to complete reset if OTP is already obtained.

- The backend does not expose an endpoint to initiate a password reset OTP (i.e., to request sending the RESET_PASSWORD OTP). The backend has `send_password_reset_otp` but no route to trigger it. If you want a password reset UI that sends OTPs, the backend must add an endpoint for initiating password reset.
- OTPs are delivered via email using configured SMTP settings. For local development, ensure email settings or use a local SMTP testing server.
