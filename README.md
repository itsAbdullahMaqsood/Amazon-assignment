# Amazon clone

A full-stack Amazon storefront built with the Next.js App Router, MongoDB and Auth.js.
Everything on the site is backed by real data: products, orders, carts, reviews, videos and
medications all live in MongoDB, and every price a customer sees at checkout is recomputed on
the server from those documents.

**Live:** https://amazon-assignment.vercel.app

---

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16.3 (App Router, Turbopack, `proxy.ts` middleware) |
| UI | React 19, Tailwind CSS 4.3 (`@theme` tokens in `styles/globals.css`), heroicons v2 |
| State | Redux Toolkit 2 + redux-persist (cart, dialogs) |
| Data | MongoDB via mongoose 9, cached connection in `lib/db.ts` |
| Auth | Auth.js (NextAuth) v5 — Credentials, Google, GitHub; JWT sessions |
| Forms | react-hook-form + zod |
| Mail | nodemailer over SMTP (activation, password reset) |
| AI | Gemini, for the "alexa for shopping" panel |

TypeScript runs loose on purpose (`strict: false`, `ignoreBuildErrors: true`) — the codebase
uses `any` at route boundaries the way the original tutorial code did.

---

## Running it locally

```bash
npm install
cp .env.example .env.local     # then fill in the values below
npm run seed -- --reset        # products, categories, coupons, an admin user
npm run dev                    # http://localhost:3000
```

Node 20.9+ is required.

### Seed scripts

| Command | What it loads | Source |
| --- | --- | --- |
| `npm run seed` | products, categories, sub-categories, coupons, admin user | dummyjson |
| `npm run seed:videos` | Prime Video catalogue | TMDB |
| `npm run seed:grocery` | grocery aisles and products | dummyjson |
| `npm run seed:meds` | pharmacy medications | openFDA (no key needed) |
| `npm run seed:furniture` | Amazon Home catalogue | dummyjson |
| `npm run seed:registries` | gift registries | generated |

Pass `-- --reset` to drop what the script owns before inserting.

### Environment

`MONGODB_URI` and `AUTH_SECRET` are the only two that must be set for the site to boot. The
rest unlock individual features:

| Variable | Needed for |
| --- | --- |
| `MONGODB_URI` | everything (include the database name, e.g. `…/amazonclone`) |
| `AUTH_SECRET` | session signing |
| `BASE_URL` | links inside activation and password-reset emails |
| `AUTH_URL` / `NEXTAUTH_URL` | **local development only** — never set these on a hosted deployment, or Auth.js will build its callbacks from the stale value instead of the request host |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google sign-in |
| `GITHUB_ID` / `GITHUB_SECRET` | GitHub sign-in |
| `SMTP_*`, `MAIL_FROM` | activation and reset email |
| `TMDB_API_KEY` | `npm run seed:videos` |
| `GEMINI_API_KEY`, `GEMINI_MODEL` | the Alexa panel |
| `CLOUDINARY_*` | image uploads (not used by any current screen) |

---

## What is built

### Shopping
- **Home** — hero carousel, category cards, product swipers built from the catalogue.
- **`/browse`** — filter sidebar (category, brand, size, colour, style, material, price,
  rating, shipping), sorting, pagination and search. Category links accept a slug so they
  survive a reseed.
- **`/product/[slug]`** — gallery, buy box, colour and size variants, reviews, accordions,
  similar products from the same category. A variant with one size row has no picker and adds
  straight to the cart; multi-size variants preselect the smallest row.
- **`/cart`** — every line is re-priced against the database before it is shown, so a tampered
  client price or stock number cannot survive.
- **`/checkout`** — saved addresses, payment method, coupon, gift-card balance.
- **`/order/[id]`** — order detail, simulated payment, stock bookkeeping.

### Departments
`/prime-video` (TMDB-seeded), `/groceries`, `/furniture`, `/pharmacy` (openFDA-seeded with
search), `/buy-again`, `/coupons`, `/registry`, `/keep-shopping`, `/lists`.

### Account
`/profile` and its sections: orders, returns, addresses, payments, credit cards, security,
wishlist, browsing history, messages, memberships, devices, shopping preferences and data
controls (export, history clear, account closure).

### Everything else
`/customer-service` with per-topic help articles, `/gift-cards` with a real claim-code scheme,
`/prime`, `/watchlist`, `/business`, `/sell`, plus the Amazon-style `ap/*` auth screens:
sign-in (two-step), register, password assistance and reset.

---

## How the money is kept honest

Client code never decides a price.

- `POST /api/user/updatecart` re-prices each persisted cart line from the product document.
- `POST /api/user/savecart` rebuilds the Cart document from the database; nothing the client
  sent about price, name or image is stored.
- `POST /api/order/create` reads the products and totals from that Cart document only. The
  request body contributes the address, the payment method, a coupon code that is re-checked
  against its own start and end dates, and a flag saying whether to spend the gift-card
  balance — the amount spent is `min(balance, total)`, computed on the server.
- `POST /api/user/returns` re-fetches the order scoped to the session user and copies the
  line's own name, image and price rather than trusting the request.
- Search terms are escaped before they reach a Mongo `$regex` (`utils/regex.ts`).

## Auth notes

- Sessions are JWTs; there is no database adapter. OAuth users get a Mongo document on first
  sign-in so every route can resolve a user by `token.sub`.
- `authorize()` throws a `CredentialsSignin` subclass because Auth.js v5 swallows plain
  `Error`s — the message travels in `code` and the sign-in form reads it back.
- `proxy.ts` (Next 16's renamed middleware) guards `/cart`, `/checkout`, `/order/*`,
  `/profile/*` and `/admin/*`.

---

## Known limits

- Payment is simulated; no processor is contacted.
- Prime membership, device registration, watchlists and shopping preferences are per-browser
  simulations stored in `localStorage`.
- Closing an account deletes the user and their cart but leaves their orders in place, because
  `Order.user` is required by the schema. The confirmation dialog says so.
- Gift-card claim codes are validated per account, not against a global ledger.
- `/placeholder` still backs a handful of account links that have no screen in this build.
