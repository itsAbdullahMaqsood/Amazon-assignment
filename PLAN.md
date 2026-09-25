# Markaz redesign: build plan

Working plan for turning the Amazon clone into **Markaz**. Nothing here is implemented yet.
`DECISIONS.md` (the deliverable) is written page by page as each page lands; this file is the
roadmap and progress tracker.

Deadline: **Saturday 26 September 2026, end of day.**

---

## 0. Decisions already made

| # | Decision | Source |
|---|---|---|
| D1 | Store is **Markaz**; Prime Video → **Markaz Movies**; Alexa → **Shabana** | brief |
| D2 | Light purple replaces the orange/yellow accent; navy chrome and white surfaces stay | brief |
| D3 | **No page is cut.** Every page, including pharmacy, groceries, furniture, registry, business, sell, gift cards, Prime and the account sub-pages, is redesigned one by one. Sections *inside* a page can still be cut. | answer 1 |
| D4 | **Guest cart:** `/cart` no longer needs sign-in; sign-in happens at checkout | answer 2 |
| D5 | **Place order and pay in one step** for PayPal and card (simulated); cash on delivery is placed unpaid | answer 3 |
| D6 | **Broaden the catalogue** in the main seed; `--reset` against the live DB is acceptable, followed by `seed:demo` | answer 4 |
| D7 | **Watchlist is kept** and redesigned as part of Markaz Movies | answer 5 |
| D8 | DB name `amazonclone` and the `amazon-assignment.vercel.app` URL stay (not user-facing) | answer 6 |

**How D3 and D6 fit together (my assumption, please confirm):** answer 4 agreed to "drop
Grocery", but answer 1 keeps the Groceries page. So Grocery stays as a department. And because
no page is cut, `npm run seed -- --reset` has to build the *whole* store, not just the six
core departments (see §5).

---

## 1. Naming map

Every user-facing string, label, alt text, metadata entry, email, seed label and localStorage key gets renamed.

| Amazon | Markaz | Notes |
|---|---|---|
| Amazon | Markaz | wordmark is text plus a purple dot, no image logo |
| Prime (membership) | **Markaz Plus** | *proposed name, confirm*; route `/prime` → `/plus` (redirect) |
| Prime Video | Markaz Movies | `/prime-video` → `/movies` (redirect) |
| Watchlist | My List | `/watchlist` → `/movies/my-list` (redirect) |
| Alexa | Shabana | `/api/alexa/chat` → `/api/shabana/chat`, `components/alexa` → `components/shabana` |
| Amazon Pharmacy, RxPass, PillPack, One Medical | Markaz Pharmacy, Rx Saver; the other two brands are removed | |
| Amazon Business / Sell on Amazon | Markaz Business / Sell on Markaz | |
| Amazon Home | Markaz Home | `/furniture` URL kept |
| Whole Foods | removed (the Groceries link covers it) | |
| Amazon Family / Household | Household | `/profile/family` → `/profile/household` (redirect) |
| Amazon's Choice / Limited time deal | Top pick / On sale | same data rules as today |
| Subscribe & Save | Auto-reorder | |
| Amazon Pay (orders tab) | removed; the Markaz balance lives on the Gift cards page | |
| `AMZN-` gift-card codes | `MRKZ-` | same check-digit scheme |
| Kindle / Echo / Fire devices (seeded) | removed; see Devices below | |

---

## 2. Phase 0: foundation (before any page)

The goal: when Phase 0 ends, **every** page is Markaz-branded, sits in the shared shell and uses the
new palette, even before its own redesign. Any stopping point after that is shippable.

### 0.1 Tokens (`styles/globals.css`, `@theme`)
```
ink-950 #0c121c · ink-900 #121a27 (header) · ink-800 #1c2636 (nav row, footer) · ink-700 #2a3547
canvas #f5f6f8 · surface #ffffff · surface-muted #eef0f4 · line #e3e6eb · line-strong #c9ced6
fg #0f1419 · fg-muted #525a66 · fg-subtle #7a828e · fg-inverse #ffffff
accent #c4b5fd (buttons, focus rings, badges on navy) · accent-strong #a78bfa (hover)
accent-soft #f1edff (tints) · accent-ink #5c3fb8 (links/text on white, ~7.5:1)
success #1a7f4b / success-soft · warning #a15c07 / warning-soft · danger #c0262d / danger-soft
```
- **Type:** Bricolage Grotesque (display: wordmark, headings, large prices) and Inter (UI and body), both
  through `next/font` and exposed as `--font-display` / `--font-sans`. Prices use tabular figures.
- **Scale:** 12 / 14 / 16 / 18 / 22 / 28 / 36 / 48 as `--text-*`.
- **Spacing:** Tailwind's 4px grid. `--container-page: 1280px`, gutters 16 / 24 / 32, sections 32 (mobile) and 48 (desktop).
- **Radius:** 6 (inputs, chips), 10 (cards, buttons), 16 (sheets, panels), full (pills).
- **Shadow:** `card`, `pop`. **Motion:** 150ms ease-out, `prefers-reduced-motion` respected.
- The legacy `amazon-blue_dark`, `amazon-blue_light` and `amazon-orange` tokens become **aliases** of ink-900, ink-800 and accent, then get removed once no component uses them.
- The Amazon-specific utilities (`button-orange`, `show-account*`, `show-language*`, `link-footer`, `footer-link-services`, `auth-divider`) are deleted as their last users are redesigned.

### 0.2 Hex codemod
566 hardcoded hex classes, 110 distinct values. The top 12 account for about 400 of them:
`#007185 #0f5fa6 #0066c0` → `accent-ink` · `#c7511f #c45500 #e77600` (hover orange) → `accent-ink` with underline ·
`#0f1111` → `fg` · `#ffd814 #f7ca00 #fcd200` → `accent` / `accent-strong` · `#cc0c39 #c40000` → `danger` ·
`#007a72 #067d62 #00a19a` → `success` · `#102b3f #232f3e #0f171e` → ink shades · greys → `line` / `surface-muted`.
A script does this mechanically, and each page's redesign removes whatever is left. After that, `npm run check:tokens`
fails on any hex value or raw palette class in the redesigned folders.

### 0.3 Primitives (`components/ui/`)
Button (primary / secondary / outline / ghost / danger; sm 32 · md 40 · lg 48; min 44px touch on mobile) · IconButton ·
Field (label, hint, error) · Input · Select · Checkbox · RadioCard · Card · Badge (neutral / accent / success / warning /
danger) · Price (one `Intl.NumberFormat` formatter, list price and saving) · Rating · QuantityStepper · Sheet (side
and bottom) · Toast · EmptyState · Skeleton · Container · SectionHeader · Tabs (URL-driven) · Breadcrumbs.
`components/shared/Price.tsx` and `StarRating.tsx` are replaced by these.

### 0.4 Shells (route groups; URLs unchanged)
- `app/(store)/layout.tsx`: header, footer, mobile drawer, Shabana panel, toast region. All ~45 store pages
  move in with `git mv`, and in the same commit their own `<Header/>`, `<Footer/>` and `<MenuSideBar/>` imports come out
  (otherwise every page would show two headers).
- `app/(auth)/layout.tsx`: minimal shell with the wordmark only.
- `app/(store)/profile/layout.tsx`: account shell (side nav on desktop, scrolling tabs on mobile).
- `app/admin` keeps its own layout.
- Root `app/layout.tsx`: fonts on `<html>`, metadata `title: { template: "%s · Markaz", default: "Markaz" }`, description.

### 0.5 Brand sweep
- `app/icon.svg` (an "m" in light purple on navy), `app/apple-icon.png` regenerated from it; `app/icon.png` and
  `favicon_amazon.jpg`, `amazon-logo.png` and `amazon-dark.png` deleted; hero slides 1–5 (Amazon's banners) deleted.
- Email templates (`emails/*`), `package.json` name → `markaz`, localStorage keys `amazon-clone:*` → `markaz:*`.
- String sweep over all 133 files using the naming map. Code comments that explain Amazon's behaviour stay only where the comparison is useful.
- `next.config.ts` redirects: `/prime-video` → `/movies`, `/watchlist` → `/movies/my-list`, `/prime` → `/plus`,
  `/profile/family` → `/profile/household`.
- `sitemap.ts` / `robots.ts` updated.

### 0.6 Verification harness
- `next dev` plus headless Chrome (installed locally) screenshots at **390px** and **1440px** for each page, checked
  signed out and signed in (seeded demo account).
- `npm run lint`, `npm run check:tokens`, and `NEXT_DIST_DIR=.next-verify npm run build` (so it doesn't clash with dev) after every page.

---

## 3. Core path: page by page

Each entry: *problem → keep / change / cut / add → backend*. After each page ships, the final version goes into `DECISIONS.md`.

### 1. Header, nav and footer
*Problem: 13-link strip, a hardcoded "Deliver to Germany" (twice on mobile), a fake language picker, a
drawer that repeats the strip, and "Sign in" showing on mobile even when signed in.*
- **Keep:** department-scoped search, account menu, cart count.
- **Change:**
  - One desktop row: wordmark · wide search · Shabana · Account · Cart.
  - A second row: departments **from the DB** plus Movies, Deals and More (a small menu listing the specialty stores: Groceries, Home, Pharmacy, Registry, Gift cards, Plus, Business, Sell, Help).
  - Mobile: wordmark, account and cart on top, then search, then department chips; the drawer is grouped as Shop / Stores / Account / Help.
- **Cut:** "Deliver to", the language picker, "Join Prime" pill, desktop "All" drawer.
- **Add:** header "Orders" link → `/profile/orders` (returns is a tab there; this reverses commit 4f86421). The footer becomes three short columns (Shop, Your account, Help) plus "coursework project" copyright.

### 2. Home
*Problem: autoplay carousel of banners, tiles overlapping the hero, four look-alike carousels, and the whole catalogue serialized to the client.*
- **Cut:** carousel and slides, the overlap grid, the per-category carousels.
- **Add:**
  - Static hero: one line of value prop and an "Ask Shabana" prompt with 3 example chips.
  - Department cards with real product counts and the top product image.
  - "Pick up where you left off" (`recentlyViewed`, signed in only).
  - "Buy again" (from paid orders, signed in only).
  - "On sale" (real discounts), "Top rated", and a Markaz Movies strip.
- **Change:** rows are fixed grids with "See all" → sorted `/browse`; mobile uses CSS scroll-snap rows, no Swiper. Each row is its own limited query.

### 3. Browse and search (with department-scoped suggestions)
*Problem: filters that are always empty (style, material, gender, shipping), random shuffle, a category button row duplicating the sidebar, price sort and filter ignoring discounts.*
- **Keep:** URL-driven server filtering, pagination, department scope.
- **Change:**
  - Filters are Department → sub-category, Price (min/max plus presets), Rating and Brand (searchable). Colour and size only appear when the scope has them.
  - Applied filters show as removable chips. Filters live in a bottom sheet on mobile.
  - Header line: "37 results for 'watch' in Men".
  - 24 per page with a fixed default order.
- **Cut:** empty filters, shuffle, duplicate category row.
- **Add:**
  - Suggestions with thumbnail, price and department that open the product directly, plus sub-category matches and a "Search 'x' in all departments" escape row.
  - A no-results state offering to drop the department or the last filter.
  - "Compare with Shabana" on 2–3 selected products (**stretch**).
- **Backend:** aggregation `$addFields` for effective (discounted) min price, used by sort and filter; richer `/api/search/suggestions`.

### 4. Product detail
*Problem: price shown twice, fake delivery date, countdown and seller, "Sold" on the last unit, an empty Questions section, and a mid-page carousel pushing reviews down.*
- **Change:**
  - Gallery, plus one decision panel holding: title, brand, rating (jumps to reviews), price and saving, colour and size pickers, quantity, real stock ("Only 3 left"), delivery **estimate** computed from today, returns from `refundPolicy`, Add to cart and Save.
  - Sticky on desktop; sticky bottom bar on mobile.
- **Cut:** second price, "Ships from / Sold by", countdown, "No Import Fees Deposit", empty Questions section, mid-page carousel.
- **Add:**
  - An add-to-cart toast with View cart / Checkout.
  - **Ask Shabana about this product**, answered only from description, details and reviews.
  - "Summarise reviews" at 3+ reviews.
  - Reviews gain star filters and a verified-only toggle.
  - One "More in <department>" row at the end.

### 5. Cart
*Problem: sign-in wall, lines start unticked so Continue is disabled, payment-logo and buyer-protection filler, mixed price formats.*
- **Keep:** server re-pricing, stock caps.
- **Change:** every line counts; each line shows swatch, size, stepper, remove, and a price-change notice; the summary (subtotal, shipping, total, Checkout) is sticky on mobile.
- **Cut:** tick boxes, payment-methods image, buyer-protection box.
- **Add:** guest cart (D4); "Save for later" via the existing wishlist API; an empty state with recently viewed.
- **Backend:** `/cart` removed from the `proxy.ts` matcher; `updatecart` works signed out (read-only re-pricing).

### 6. Checkout
*Problem: two-step place-then-pay, coupon as a separate form, gift card spent before payment, shipping missing from the order total.*
- **Change:**
  - One page: 1 Address → 2 Payment → 3 Review items, each collapsing to a summary once done.
  - Sticky summary with one "Place order" button.
  - Coupon becomes an inline "Have a code?".
- **Add:** D5 (single place-and-pay); a confirmation state on `/order/[id]?placed=1`; clear "payments are simulated" note.
- **Backend:**
  - New `lib/pricing.ts` computes subtotal, shipping, coupon, gift card and total from the Cart doc.
  - New `POST /api/checkout/quote` uses it for the preview, and `order/create` uses **the same function**. Real shipping; card and PayPal are paid and stock adjusted in the same request; the gift card is spent only when the order is placed.
  - `/api/order/payment` stays, for existing unpaid orders.

### 7. Orders and returns
*Problem: a sponsored product and carousel inside the orders page, "Digital" and "Amazon Pay" tabs that don't apply, a 3-month default hiding older orders, and a separate three-tab returns centre.*
- **Change:**
  - Tabs: All / In progress / Delivered / Digital (Movies purchases, now real) / Returns. Time filter defaults to all time.
  - Cards: status pill, thumbnails, total, and View / Buy again (adds all lines to the cart) / Return items.
  - Order detail: status timeline from `createdAt`, `paidAt`, `status` and `deliveredAt`; returns start inline.
- **Cut:** sponsored product, carousel, Amazon Pay tab, "View transactions".
- `/profile/returns` stays as the Returns tab. "Completed" is displayed as "Delivered".

### 8. Auth (sign in, sign up, forgot, reset, activate)
*Problem: two-screen email-then-password sign-in, a 350px Amazon card with yellow buttons, Amazon error wording.*
- **Change:** single-step sign-in with show-password; Google and GitHub buttons first; register without a confirm field but with live password rules; same shell for forgot, reset and activate.
- **Keep:** all flows and `callbackUrl`.
- **Cut:** legal footer, Amazon wording. Emails rebranded.

### 9. Profile / account (shell plus core sections)
*Problem: 12+ cards, many pointing at dead ends; every sub-page is its own island with a breadcrumb.*
- **Change:** account layout (§0.4) with nav: Overview · Orders · Returns · Saved · Lists · Addresses · Payment · Login & security · Membership · Household · Devices · Messages · Privacy & data.
- **Overview:** latest order status, saved count, default address, recently viewed, Plus status.
- **This step:** Overview, Addresses, Payment (default method plus saved cards, merged), Login & security, Saved (wishlist).
- The other sections follow in §4.

### 10. Markaz Movies, My List and Shabana
- **Movies:**
  - `/movies`: navy and purple instead of Prime blue; hero, rows, a title detail sheet with real Buy and Rent.
  - `/movies/my-list`: tabs My list / Purchases & rentals, rental expiry shown.
- **Shabana:**
  - Persona prompt (warm, brief, never invents products).
  - Side sheet on desktop, full screen on mobile.
  - Entry points: header, home hero, product page, compare (stretch).
- **Backend:**
  - Watchlist and purchases move from localStorage to MongoDB (§5). Buy and rent prices come from `Video.price` on the server.
  - `seed-videos` badge relabel.

---

## 4. The rest of the store, page by page

The same process for each page. **The big shared change: pages that fake state in localStorage move to MongoDB**, because
"the backend must stay real". Fabricated testimonials and quotes are removed or replaced with real reviews. Of
the 56 links pointing at `/placeholder`, each is repointed to a real page or removed.

| # | Page(s) | Problem today | Plan |
|---|---|---|---|
| 11 | **Deals** `/coupons` | Prime banner, sponsored strip, fake-feeling countdowns | Rename to Deals. Grid of real discounts with a discount-tier filter and department chips. Countdown cut (no end dates exist). Coupon codes that actually work at checkout (from the `Coupon` collection) shown at the top. |
| 12 | **Buy again** `/buy-again`, **Keep shopping** `/keep-shopping` | Two near-identical Amazon layouts | Buy again: items from paid orders grouped by department, one-tap add to cart. Keep shopping: recently viewed with a clear-history control. Both share a card. |
| 13 | **Lists** `/lists`, `/lists/create`; **Registry** `/registry`, `/registry/find`, `/registry/[id]` | Hub full of Amazon marketing art; registry is a search over lists | Lists: your lists as cards, create in a sheet, privacy clear. Registry: find by name, public registry page with add-to-cart and a "purchased" count. Art stand-ins replaced by product images. |
| 14 | **Gift cards** `/gift-cards` | Amazon card art, `AMZN-` codes | Balance, ledger (`giftCardHistory`), redeem with instant validation, `MRKZ-` codes. Buying a gift card stays out unless you want it. |
| 15 | **Markaz Plus** `/plus`, **Memberships** `/profile/memberships` | Membership, subscriptions and Subscribe & Save all live in localStorage | Membership in MongoDB (join / trial / cancel). Plan table rebuilt. Auto-reorder from real order history stored in MongoDB. Benefits copy only claims what the store actually does. |
| 16 | **Groceries** `/groceries` | Amazon aisle order and Whole Foods references | Aisle tabs plus product grid on the new card, and a "restock" row from your grocery orders. |
| 17 | **Markaz Home** `/furniture` | Art stand-ins, unstocked tiles | Room and category tiles from real sub-categories only (empty tiles hidden), products from Furniture and Home & Kitchen. |
| 18 | **Pharmacy** `/pharmacy`, `/pharmacy/search` | 15-section landing page, fabricated testimonials, 20+ placeholder links, PillPack and One Medical | Short landing page: search, how it works, Rx Saver explained. Search results with cash vs Plus price (real membership). Testimonials cut. Medications stay browse-only (no purchase flow; stated plainly). |
| 19 | **Account sub-pages** | Household and devices are localStorage; the devices list is seeded with fake hardware; saved cards are localStorage | Household → MongoDB. Devices becomes "Where you're signed in": real sign-in records plus "Sign out everywhere" (session version check). Messages (derived from orders), Recalls (honest "nothing flagged" plus the items checked), Recently viewed, Preferences (→ MongoDB), Privacy & data (export, clear, close). |
| 20 | **Help** `/customer-service`, `/customer-service/[topic]` | Amazon tile grid | Search plus topics, your latest order pinned with its actions, articles on the new typography, and a "Was this helpful" control. |
| 21 | **Markaz Business** `/business`, **Sell on Markaz** `/sell` | Long Amazon marketing pages with fabricated quotes | Short, honest landing pages; fabricated quotes cut; the fee calculator kept and restyled; fee copy labelled as illustrative. |
| 22 | **System pages** | Amazon copy on error pages | not-found, error, global-error, forbidden, loading skeletons; `/placeholder` and `/profile/[...section]` restyled (nothing links to them any more). |
| 23 | **Admin** | Amazon wordmark and orange | Rebrand only: tokens, "markaz admin", no layout changes. |
| 24 | **README and DECISIONS** | | New name, design direction summary, link to `DECISIONS.md`, full page list. |

---

## 5. Backend and model changes

**Pricing and checkout**
1. `lib/pricing.ts` + `POST /api/checkout/quote`; `order/create` places and pays in one step with real shipping; gift card spent only on placement.
2. Guest cart: `proxy.ts` matcher drops `/cart`; `updatecart` works signed out.

**Catalogue and search**

3. Browse aggregation for effective price. Suggestions return image, price, department and sub-category matches.

**Shabana**

4. `/api/shabana/chat`: new persona; optional `productId` / `productIds` context loaded from MongoDB (description, details, reviews).

**Moving browser-only state into MongoDB** (new `User` sub-documents, each with a small authenticated route)
5. `watchlist: [{ video, addedAt }]`, `library: [{ video, type: buy|rent, price, at, expiresAt }]` → `/api/user/movies`. The price is read from `Video` on the server.
6. `membership: { plan, status, startedAt, trialEndsAt, renewsAt }` → `/api/user/membership`.
7. `autoReorder: [{ product, style, size, everyWeeks, nextAt, active }]` → `/api/user/auto-reorder`.
8. `cards: [{ brand, last4, expMonth, expYear, holder, isDefault }]` → `/api/user/cards`. **Never** a full card number or CVV; only the last 4 digits are kept after validation.
9. `household: { members: [{ name, email, role, joinedAt }], sharing: {…} }` → `/api/user/household`.
10. `preferences: {…}` → `/api/user/preferences` (the history-off cookie stays as a mirror, so the product page doesn't need an extra read).
11. `signIns: [{ userAgent, firstSeen, lastSeen }]` and `sessionVersion`. The Auth.js `jwt` callback rejects tokens with an old version, which is what makes "Sign out everywhere" real. **Cost:** one small DB read per `auth()`.

**No schema changes needed:** Order (status tabs and timeline read existing fields), Product, Cart, Coupon, Medication (`primePrice` is shown as "Plus price").

**Seeds**
- `seed.mjs --reset` becomes the one command that builds the whole working store:
  - Core departments in Title Case, with the same slugs: Women's Clothing, Men, Shoes, Beauty, Kids, Electronics (+ tablets, mobile accessories).
  - New departments: **Home & Kitchen** (home décor, kitchen), **Sports & Outdoors** (moved out of Kids), **Accessories** (sunglasses, jewellery, watches).
  - It then runs the grocery, furniture, medication and registry seeders, and the video seeder when `TMDB_API_KEY` is set (it is).
- `seed-demo` fills the new User fields (membership, My List, a rental, a saved card, household, sign-ins) and relabels the Amazon strings.
- `seed-videos` badges relabelled.

**Emails:** both templates rebranded.

---

## 6. Definition of done, per page
1. Design: only tokens and primitives, no hex (`check:tokens` passes for its folders).
2. Real data: every number and date on screen comes from MongoDB or is computed and labelled as an estimate.
3. Screenshots at 390px and 1440px, signed out and signed in; the main flow clicked through against the dev DB.
4. `npm run lint` and `npm run build` pass.
5. No "Amazon", "Prime" or "Alexa" in its rendered HTML (grep of the served page).
6. `DECISIONS.md` entry written or updated; this plan's tracker ticked.

---

## 7. Order and time

| Block | Contents | Estimate |
|---|---|---|
| Phase 0 | tokens, codemod, primitives, shells, brand sweep, seeds, harness | ~4–5h |
| Core 1–10 | as §3 | ~14h |
| Backend moves | §5 items 5–11 | ~4h |
| Rest 11–24 | as §4 | ~12–14h |
| **Total** | | **~34–37h** |

**Risk:** that is more hours than remain before Saturday end of day. Phase 0 is deliberately first, so that
every page is Markaz-branded, on the new palette and in the new shell after about 5 hours, whatever
happens next. After that, pages are redesigned **one by one in the order above**, each finished completely before
the next. If time runs out, pages not yet reached are branded and consistent, but still have their old layout.

---

## 8. Open questions
1. **Markaz Plus**: OK as the name for the Prime replacement (route `/plus`)?
2. **Deadline vs. scope**: the estimate above exceeds the time left. Can the deadline move, or should I
   follow the order above and stop where time runs out? If you want a different priority for pages 11–22, say which.
3. **Moving localStorage state to MongoDB** (§5 items 5–11): OK? It's the honest version, but it's about 4 hours of the budget.
4. **"Sign out everywhere"** adds one DB read per `auth()` call. Acceptable?
5. **Git workflow**: your instructions haven't arrived yet. Until they do I won't commit; I'll work on
   a branch (`redesign/markaz`) unless you say otherwise.

---

## Progress
- [x] Phase 0 foundation
- [x] 1 Header / nav / footer · [x] 2 Home · [x] 3 Browse + search · [x] 4 Product · [ ] 5 Cart · [ ] 6 Checkout
- [ ] 7 Orders + returns · [ ] 8 Auth · [ ] 9 Profile · [ ] 10 Movies + My List + Shabana
- [ ] 11 Deals · [ ] 12 Buy again / Keep shopping · [ ] 13 Lists + Registry · [ ] 14 Gift cards · [ ] 15 Plus + Memberships
- [ ] 16 Groceries · [ ] 17 Markaz Home · [ ] 18 Pharmacy · [ ] 19 Account sub-pages · [ ] 20 Help
- [ ] 21 Business + Sell · [ ] 22 System pages · [ ] 23 Admin rebrand · [ ] 24 README + DECISIONS
