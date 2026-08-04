# query_mind_frontend

Web frontend for **QueryMind** — an AI-powered data analysis platform. Upload a CSV, review the automated cleaning report, and ask questions in plain English. The assistant validates and runs its own query plans against your data and answers with real numbers and interactive charts.

## Features

- **Authentication** — email/password sign-up with email verification, password reset, and Google OAuth sign-in; session refresh with single-flight token rotation and CSRF-protected requests
- **Dataset upload** — CSV ingestion with an automatic cleaning report (row counts, duplicates removed, per-column null counts and types)
- **Dataset management** — list, inspect records, and view schema/profile information for each dataset
- **AI assistant chat** — streaming (NDJSON) answers backed by an LLM that plans, validates, and executes DSL queries against your data; responses include real computed values and interactive chart blocks (bar, line, pie, table, metric)
- **Chart record blocks** — saved chart queries re-execute against the dataset so charts always reflect the validated plan
- **Protected routes** — middleware-level optimistic guard on `/dashboard/*` with client-side session validation

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js 16 (App Router) + React 19 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Charts | Recharts 3 |
| HTTP | Axios (with CSRF + 401-refresh interceptor) |
| State | Zustand |
| Icons | lucide-react |
| Runtime | Node 22 (Docker image: `node:22-alpine`) |

## Getting Started

### Prerequisites

- Node.js 22+
- npm 10+
- A running QueryMind backend (FastAPI) at the API URL below

### 1. Install dependencies

```bash
npm ci
```

### 2. Configure environment

Copy the example and set the values:

```bash
cp .env.local.example .env.local
```

| Variable | Required | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Yes | Base URL of the QueryMind backend, e.g. `http://localhost:8000` |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Only for Google sign-in | OAuth 2.0 web client ID from Google Cloud Console |

> `NEXT_PUBLIC_` variables are inlined at build time — changing them requires a rebuild. Never commit real secrets to `.env.local` (it is git-ignored).

### 3. Run

Development server with hot reload:

```bash
npm run dev
```

Open http://localhost:3000.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build (`--hostname 0.0.0.0 --port 3000` via entrypoint) |
| `npm run lint` | Run ESLint |

## Docker

```bash
docker build -t query-mind-frontend \
  --build-arg NEXT_PUBLIC_API_URL=http://localhost:8000 \
  --build-arg NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id \
  .
docker run -p 3000:3000 query-mind-frontend
```

The image builds the app at container start (`entry_point.sh` runs `next build` then `next start`), so build-time variables can be supplied via `--build-arg`. In the full QueryMind docker-compose stack the service maps host port `3001` to container port `3000`.

## Project Structure

```
frontend/
├── app/                    # App Router pages
│   ├── (dashboard)         # Protected: datasets list, dataset detail, assistant
│   ├── account/            # Account page
│   ├── signin/ signup/     # Auth pages
│   ├── verify-email/       # Email verification
│   ├── forgot-password/    # Password reset flow
│   └── layout.tsx          # Root layout
├── components/
│   ├── assistant/          # Chat UI: message list, record blocks (charts), tool calls
│   ├── auth/               # Auth shell with Google OAuth
│   └── datasets/           # Upload modal, dataset views
├── hooks/                  # useAuth, useChat (NDJSON streaming), useDatasets
├── lib/
│   ├── api/                # axios client, auth/chat/dataset API modules, types
│   └── types.ts            # Shared TypeScript types
├── proxy.ts                # Middleware: optimistic auth redirect on /dashboard
└── Dockerfile / entry_point.sh
```

## Architecture Notes

- **API client** (`lib/api/client.ts`): axios instance with `withCredentials: true`, CSRF token injection on state-changing requests, and a single-flight 401 → refresh-token → retry interceptor.
- **Chat streaming** (`hooks/useChat.ts` + `lib/api/chat.ts`): reads newline-delimited JSON events from `POST /api/v1/chat/{dataset_id}/query`; assistant messages arrive as separate text and record events, so charts render as their own blocks.
- **Record blocks** (`components/assistant/record-block.tsx`): each saved record re-queries `POST /api/v1/datasets/{id}/query` with its DSL and renders the matching chart type; backend errors are normalized into readable messages.
- **Route protection** (`proxy.ts`): optimistic cookie check for `/dashboard/*`; authoritative session validation happens server-side and in `useAuth`.

## Security

- Credentials and session tokens are stored in HTTP-only cookies; CSRF tokens are attached to all state-changing requests.
- No secrets are committed: `.env*` and `next-env.d.ts` are git-ignored.
- The backend is the source of truth for authorization — the frontend only optimistically hides protected pages.

## License

Private project.
