# SocialHouse

A social photo-sharing app: email/OTP registration, profiles, follow/unfollow, a
personalized feed, and image uploads.

## Tech stack

| Concern        | Choice                                    |
| -------------- | ----------------------------------------- |
| Framework      | Next.js 16 (App Router), React 19         |
| Language       | TypeScript (strict)                       |
| Database / ORM | PostgreSQL (Neon) + Prisma                |
| Auth           | NextAuth v4 (JWT, credentials provider)   |
| Image storage  | Cloudinary                                |
| Email          | Resend                                    |
| Styling        | Tailwind CSS v4                           |
| Validation     | Zod                                       |
| Tests          | Vitest                                    |

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env   # then fill in real values

# 3. Apply the database schema
npx prisma migrate deploy   # or `npx prisma migrate dev` when developing

# 4. Run the dev server
npm run dev                 # http://localhost:3000
```

> In local dev, leaving `RESEND_API_KEY` empty logs OTP codes to the server
> console instead of emailing them.

## Scripts

| Script               | Description                          |
| -------------------- | ------------------------------------ |
| `npm run dev`        | Start the dev server                 |
| `npm run build`      | Production build (also type-checks)  |
| `npm start`          | Serve the production build           |
| `npm run lint`       | Lint with ESLint                     |
| `npm test`           | Run the Vitest suite once            |
| `npm run test:watch` | Run Vitest in watch mode             |

## Project structure

```
app/                     # App Router
  api/                   # Route handlers (thin — logic lives in lib/)
  (pages)/               # login, register, feed, profile, search, settings
components/              # Reusable client components
lib/                     # Shared server logic:
  auth.ts                #   NextAuth config (authOptions)
  api.ts                 #   requireUser / parseBody / handleRoute / responses
  validations.ts         #   Zod request schemas
  constants.ts           #   Tunable limits (OTP, upload, pagination, rate limits)
  otp.ts                 #   Secure OTP generate / hash / verify
  rate-limit.ts          #   DB-backed fixed-window limiter
  upload.ts              #   Image validation + data-URI helper
  prisma.ts / cloudinary.ts / email.ts
types/                   # Shared DTO + NextAuth type augmentation
prisma/                  # schema.prisma + migrations
proxy.ts                 # Route protection at the edge (Next.js 16 proxy)
```

## Conventions

- **Route handlers stay thin.** They authenticate (`requireUser`), validate
  (`parseBody` + a Zod schema), do the work, and return via `apiSuccess` /
  `apiError`. Cross-cutting error handling is provided by `handleRoute`, so
  handlers never leak stack traces to clients.
- **Input is validated on the server** with Zod schemas in `lib/validations.ts` —
  client-side checks are UX only.
- **Secrets** live in `.env` (git-ignored). Update `.env.example` when adding a
  new variable.

## Security notes

- Passwords and OTP codes are hashed with bcrypt; OTPs are generated with a
  CSPRNG, single-window, attempt-capped, and re-verified server-side at signup.
- Auth endpoints are rate-limited (DB-backed) per email and per IP.
- Uploads are constrained by MIME allowlist and size cap.
