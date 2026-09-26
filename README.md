# Markaz

A general store, built on the bones of an Amazon clone and then rebuilt page by page.

**Live:** https://amazon-assignment.vercel.app

Markaz sells clothes, electronics, home and kitchen, beauty, sports, accessories and
groceries; it has a pharmacy price look-up, a film catalogue called **Markaz Movies**, a
membership called **Markaz Plus**, and an assistant called **Shabana**. Everything on screen —
every price, count, date and status — comes from MongoDB or is computed from it on the server.

---

## The design direction

Amazon was the reference, not the blueprint. For every page the question was what Amazon's
version does *badly* for the shopper; then what to **keep**, **change**, **cut** and **add**.
The answers, page by page with the reasoning, are in **[DECISIONS.md](DECISIONS.md)**.

Three rules held throughout:

1. **Real data only.** If a number is on screen, it came out of the database or was computed
   from it, and an estimate is labelled as one. Prices are always recomputed on the server —
   the cart, the checkout preview and the order are the same function.
2. **Nothing is claimed that the store cannot do.** Pages that sold features this build does
   not have now say so plainly, and the features that *are* real were made real end to end:
   a Plus membership actually waives delivery at checkout; a registry's "bought" count is a
   record of someone saying they bought it; a help article describes this code, not a policy.
3. **No page was cut.** Every page from the clone survives and was redesigned. What got cut
   were sections inside pages that did not earn their place — sponsored strips, carousels,
   invented testimonials, fourteen preference switches where one did something.

**The look.** Navy chrome over white surfaces, because it reads as "shop" instantly and keeps
the product photographs the brightest thing on screen. The orange accent became a light purple
(`accent #c4b5fd`), with a deeper `accent-ink #5c3fb8` wherever purple has to be read as text.
Bricolage Grotesque for the wordmark, headings and big prices; Inter for everything else;
tabular figures wherever numbers line up. One money format, `$1,234.50`, from a single
`Intl.NumberFormat`.

Every colour, size, radius and shadow is a token in `styles/globals.css`, and
`npm run check:tokens` fails the build if a redesigned folder contains a hex value or a raw
Tailwind palette class. Components are built from the primitives in `components/ui/`.

---

## Stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16.3 (App Router, Turbopack, `proxy.ts` middleware) |
| UI | React 19, Tailwind CSS 4.3 (`@theme` tokens), heroicons v2 |
| State | Redux Toolkit 2 + redux-persist (cart, toasts, assistant) |
| Data | MongoDB via mongoose 9, cached connection in `lib/db.ts` |
| Auth | Auth.js (NextAuth) v5 — Credentials, Google, GitHub; JWT sessions |
| Forms | react-hook-form + zod |
| Mail | nodemailer over SMTP (activation, password reset, order confirmation) |
| AI | Gemini, behind Shabana |

### Tests

`npm test` runs the suite in `tests/` on Node's own test runner — no framework, no extra
dependency, and no build step: Node 24 strips the types, and `tests/alias.mjs` teaches it the
`@/…` imports the app uses.

It covers the rules that decide what someone is charged and what they are told, which is where
a mistake is expensive and a unit test is cheap: `lib/pricing` (delivery per line, the coupon
never touching delivery, the gift card capped at what is left), `lib/giftcards` (the claim-code
scheme — this suite exists partly because a prefix rename broke redemption silently),
`lib/returns` (each product's own window, and the clock starting at delivery), `lib/movies`,
`lib/membership`, `lib/authRules`, `lib/sellerFees`, the account rules, and the order
confirmation email. Anything that needs a database or a browser is left to the seed scripts and
`scripts/dev/shot.mjs`.

TypeScript runs loose on purpose (`strict: false`, `ignoreBuildErrors: true`): the codebase
uses `any` at route boundaries the way the original tutorial code did.

---

## Running it locally

```bash
npm install
cp .env.example .env.local     # then fill in the values below
npm run seed -- --reset        # products, categories, coupons, an admin user
npm run dev                    # http://localhost:3000
npm test                       # the money and correctness rules
```

Node 20.9+ is required.

### Seed scripts

| Command | What it loads | Source |
| --- | --- | --- |
| `npm run seed` | products, categories, sub-categories, coupons, admin user | dummyjson |
| `npm run seed:videos` | the Markaz Movies catalogue | TMDB |
| `npm run seed:grocery` | grocery aisles and products | dummyjson |
| `npm run seed:meds` | pharmacy drug labels | openFDA (no key needed) |
| `npm run seed:furniture` | the Markaz Home catalogue | dummyjson |
| `npm run seed:registries` | public gift lists to search for | generated |
| `npm run seed:demo -- --email=you@example.com` | a lived-in account: orders in every status, a return, reviews, saved items, named lists, a Plus trial, a household, My list and a rental, browsing history, addresses, sign-in records and a gift balance | generated from the catalogue |

Pass `-- --reset` to drop what a script owns before inserting. `seed:demo` is safe to re-run —
it replaces its own rows and never touches data you created by hand — and takes `--remove` to
undo itself.

**One gotcha:** after editing a file in `models/`, restart `next dev`. The mongoose connection
survives hot reload and `mongoose.models.User` keeps the old schema, so writes to a new field
are silently dropped by strict mode while the route still returns 200.

### Environment

`MONGODB_URI` and `AUTH_SECRET` are the only two that must be set for the site to boot. The
rest unlock individual features:

| Variable | Needed for |
| --- | --- |
| `MONGODB_URI` | everything (include the database name) |
| `AUTH_SECRET` | session signing |
| `BASE_URL` | links inside activation and password-reset emails |
| `AUTH_URL` / `NEXTAUTH_URL` | **local development only** — never set these on a hosted deployment, or Auth.js builds its callbacks from the stale value instead of the request host |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google sign-in |
| `GITHUB_ID` / `GITHUB_SECRET` | GitHub sign-in |
| `SMTP_*`, `MAIL_FROM` | activation, password reset and order confirmation email |
| `TMDB_API_KEY` | `npm run seed:videos` |
| `GEMINI_API_KEY`, `GEMINI_MODEL` | Shabana |
| `CLOUDINARY_*` | image uploads from the admin product form |

---

## What's in scope

Everything below is built, works against the database, and has a section in
[DECISIONS.md](DECISIONS.md) explaining what was kept, changed, cut and added.

### Shopping
- **Home** — a still hero, department cards with real counts, and rows built from your own
  history and the catalogue's own discounts.
- **`/browse`** — server-side filtering on department, sub-category, price, rating, brand,
  colour and size, with removable chips, facet counts and a bottom sheet on phones. Price
  sorting runs on the discounted price.
- **`/product/[slug]`** — gallery, one decision panel, real stock, a delivery estimate computed
  from today, reviews with filters, and "Ask Shabana about this product".
- **`/cart`** — open to guests, re-priced from the database on every visit, with save-for-later
  and a price-change notice.
- **`/checkout`** — one page, three steps, and a single "Pay $x" that places *and* pays. The
  preview is the charge.
- **`/profile/orders`** — tabs by state, a real timeline, buy again, and returns as a tab with
  each line's own return window.
- **`/coupons`** — Deals: the browse grid scoped to discounts, with the coupon codes checkout
  will actually accept.

### Departments
`/movies` and `/movies/my-list`, `/groceries`, `/furniture` (Markaz Home), `/pharmacy`,
`/buy-again`, `/lists` and `/lists/[id]`, `/registry`, `/gift-cards`, `/plus`.

### Account
`/profile` with a shared shell: overview, orders, returns, product recalls, saved items,
lists, browsing history, addresses, payment, login & security, shopping preferences, Markaz
Plus and auto-reorder, household, sign-in activity, messages, and privacy & data.

### Everything else
`/customer-service` with per-topic articles written against this code, `/business`, `/sell`
with a working marketplace fee calculator, and the auth screens: one-step sign in, register,
forgot, reset and activate.

---

## How the money is kept honest

Client code never decides a price.

- `lib/pricing.ts` holds the arithmetic. The cart, `POST /api/checkout/quote` and
  `POST /api/order/create` all call it, so the three totals cannot disagree.
- `computeQuote` re-reads every line from its product document as it is *now* — price,
  discount, stock and delivery charge — and blocks the order if something sold out.
- A coupon is re-checked against its own start and end dates on the server; it discounts the
  goods, never the delivery. The gift-card balance is spent only when the order is placed,
  with a guard so two tabs cannot spend it twice.
- A Markaz Plus membership is read from the account at quote time, never from the request, and
  it waives the delivery charges — including for anyone in that member's household.
- `POST /api/user/savecart` rebuilds the Cart document from the database; nothing the client
  sent about price, name or image is stored.
- Returns re-fetch the order scoped to the session user and copy the line's own name, image and
  price rather than trusting the request.
- Search terms are escaped before they reach a Mongo `$regex` (`utils/regex.ts`).

## Auth notes

- Sessions are JWTs; there is no database adapter. OAuth users get a Mongo document on first
  sign-in so every route can resolve a user by `token.sub`, and they are stored with **no**
  password, which is what lets "Login & security" say honestly how an account signs in.
- Every token carries the account's `sessionVersion`. "Sign out everywhere" raises it, so every
  token issued before that moment is refused on its next request. The lookup is shared and
  briefly cached (`lib/sessionVersion.ts`): a page render calls `auth()` twice, concurrently,
  and each API call it makes adds another, so without that a signed-in page view cost two
  identical primary-key reads and every fetch cost one more. It is now one read per account per
  five seconds, and a sign-out reaches a mid-burst session within that window.
- `authorize()` throws a `CredentialsSignin` subclass because Auth.js v5 swallows plain
  `Error`s — the message travels in `code` and the sign-in form reads it back.
- `proxy.ts` (Next 16's renamed middleware) guards `/checkout`, `/order/*`, `/profile/*`,
  `/lists/*`, `/gift-cards`, `/movies/my-list` and `/admin/*`. The cart is deliberately not on
  that list: anyone can fill one, and signing in happens at checkout.

## Admin

The dashboard lives at `/admin/dashboard` (orders, products, categories, sub-categories,
coupons, users), in the store's own palette. `npm run seed` creates an admin account and prints
its password once. To make an existing account an admin, change its `role` to `"admin"` from the
Users screen. Every admin page and route re-reads the role from the database, so a demoted admin
loses access immediately.

---

## Known limits

These are the things the store cannot do, and every page that touches one says so in its own
words rather than leaving you to find out.

- **Payment is simulated.** No card details are ever collected and no processor is contacted.
  Card and PayPal orders are marked paid the moment they are placed; cash on delivery is not.
- **Markaz Plus is never billed.** The membership, its plan and its dates are real and stored,
  and the delivery waiver is real; no money moves at any point.
- **Nothing streams.** Markaz Movies records a purchase or a rental against your account, with
  its price and expiry, and no film plays.
- **The pharmacy dispenses nothing.** It is a look-up over openFDA drug labels. openFDA
  publishes labels, not prices, so the two prices shown are generated from the label's id —
  stable per medication, and illustrative.
- **There is no support desk, no marketplace and no business programme.** `/customer-service`,
  `/sell` and `/business` say so and then offer what does exist.
- **Auto-reorder is a reminder.** There is no scheduler; Markaz never places an order by itself.
- **A registry's "bought" count is what a guest said**, not what Markaz observed — the cart
  carries no list with it, so anything else would be a guess.
- **Closing an account** deletes the user, their cart and their lists but leaves their orders,
  because `Order.user` is required by the schema. The confirmation dialog says so.
- **Gift-card claim codes** are validated arithmetically and per account, not against a global
  ledger, so the same code can be redeemed once by each account.
