# VittaSetu — AI-assisted banking for small enterprises (SIH project)

A full working slice of the platform: signup/login, a transaction passbook,
a loan EMI calculator with a simple rule-based approval check, and
**Samarth**, an AI assistant powered by OpenRouter.

## Project structure

```
vittasetu-app/
├── backend/                 Node.js + Express API
│   ├── server.js            App entry point
│   ├── db.js                SQLite schema + connection (better-sqlite3)
│   ├── middleware/auth.js   JWT auth guard
│   ├── routes/
│   │   ├── auth.js          POST /api/auth/signup, /login, GET /me
│   │   ├── transactions.js  POST/GET/DELETE /api/transactions, /summary
│   │   ├── loan.js          POST /api/loan/calculate, /apply
│   │   └── chat.js          POST /api/chat  (Samarth, via OpenRouter)
│   ├── utils/validators.js  Shared validation rules
│   ├── .env                 Your local secrets (see below) — not committed
│   ├── .env.example         Template for .env
│   └── package.json
└── public/                  Static frontend, served by Express
    ├── index.html           Signup / login
    ├── dashboard.html        Passbook: add & list transactions, summary
    ├── loan-calculator.html EMI calculator + loan application
    ├── css/  (style.css, app.css, chatbot.css)
    └── js/   (validators.js, auth.js, app-shell.js, dashboard.js,
               loan-calculator.js, chatbot.js)
```

## 1. Install and run

```bash
cd backend
npm install
npm start
```

The server serves both the API and the frontend at **http://localhost:5000**.
(`npm run dev` uses nodemon to restart on changes, if you install it.)

## 2. Environment variables (`backend/.env`)

| Variable | Purpose |
|---|---|
| `PORT` | Port the server listens on (default 5000) |
| `JWT_SECRET` | Signs login tokens — replace with a long random string before deploying |
| `DB_PATH` | Path to the SQLite file (created automatically) |
| `OPENROUTER_API_KEY` | Key for Samarth's AI replies — **rotate this key**, see note below |
| `OPENROUTER_MODEL` | Which model OpenRouter routes to (default `openai/gpt-4o-mini`) |

**About the API key:** the key you shared was pasted into a chat conversation,
which means it may already be logged somewhere outside your control. Before
you rely on this for anything beyond local testing, generate a fresh key at
https://openrouter.ai/keys and swap it into `.env`. The key is only ever read
by `backend/routes/chat.js` on the server — it is never sent to the browser,
which is what keeps it safe from anyone opening dev tools on your site.

## 3. How the pieces fit together

- **Signup/login** (`routes/auth.js`) — passwords are hashed with bcrypt,
  never stored in plain text. A successful signup/login returns a JWT, which
  the frontend stores in `localStorage` and sends as `Authorization: Bearer
  <token>` on every later request.
- **Transactions** (`routes/transactions.js`) — every credit/debit is tied to
  the logged-in user (`req.user.id` from the JWT). `/summary` computes total
  credit, debit and balance directly in SQL.
- **Loan calculator** (`routes/loan.js`) — `/calculate` is a pure EMI/interest
  calculation, no login required. `/apply` requires login and runs
  `runApprovalCheck()`, a small transparent rule engine that looks at the
  user's own recorded transactions. **This is a placeholder** — swap its body
  for a call to your real ML/AI scoring model when it's ready; the
  request/response shape is already designed to stay the same.
- **Samarth** (`routes/chat.js`) — proxies chat messages to OpenRouter's
  `chat/completions` endpoint with a system prompt describing Samarth's role,
  and stores the transcript per user in the `chat_messages` table.

## 4. Suggested next steps

1. Swap the placeholder loan approval rule for your actual AI/ML model.
2. Add password reset (forgot-password flow is stubbed as a link only).
3. Add pagination to `/api/transactions` once a user has a lot of entries.
4. Consider moving from SQLite to Postgres if you expect concurrent writers
   in production — `db.js` is the only file you'd need to rewrite.
5. Deploy: any Node host (Render, Railway, a VPS) works, since everything is
   one Express process serving both API and static frontend.
