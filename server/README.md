# Backend for Pro

This is a simple Express + MongoDB backend used by the frontend. It exposes:

- `POST /api/auth/register` — register with `{ name, email, password }`.
- `POST /api/auth/login` — login with `{ email, password }`.

Create a `.env` file with values from `.env.example`, install dependencies and run:

```bash
cd server
npm install
npm run dev
```
