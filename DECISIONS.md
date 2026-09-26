# Markaz: design decisions

Markaz is a general store built on the backend of an Amazon clone. Amazon was the reference, not
the blueprint: for every page we named what the Amazon version does badly for the shopper, then
decided what to **keep**, **change**, **cut** and **add**. This file records those calls, one
section per page, with the reason for each.

Two rules held everywhere:

- **Real data only.** Every product, price, count, date and status on screen comes from MongoDB
  or is computed from it; an estimate is labelled as one. Prices are always recomputed on the
  server.
- **No page was cut.** Every page from the clone was kept and redesigned. What got cut were
  sections inside pages that did not earn their place.

---

## Design system

**The problem with the original:** Amazon's look is a thousand one-off decisions: 110 different
hex values were hardcoded across the clone's components, buttons came in four shapes, and prices
were printed three different ways (`USD12.99$`, `12.99$`, `$12.99`).

- **Keep:** the feel of the chrome, a dark navy header over clean white surfaces. It reads as
  "shop" instantly and keeps product photos the brightest thing on screen.
- **Change:** the orange/yellow accent becomes **light purple** (`accent #c4b5fd`). Purple fills
  carry dark ink text (about 9.5:1 contrast). Where purple must be read as text on white, it
  uses the deeper `accent-ink #5c3fb8` (about 7.5:1).
- **Change:** prices are ink, not red. Red means "problem" everywhere else in the interface; a
  saving is shown in green as "Save 20%", next to the struck-through list price.
- **Change:** one money format everywhere, `$1,234.50`, from a single `Intl.NumberFormat`.
- **Add:** tokens in `styles/globals.css` (`@theme`) for colour, type scale, radius, shadow and
  container width, and a `check:tokens` script that fails the build of a redesigned folder
  containing a hex value or a raw Tailwind palette class.
- **Add:** primitives in `components/ui/`: Button, IconButton, Field/Input/Select, Checkbox,
  RadioCard, Switch, Card, Badge, Price, Rating, QuantityStepper, Sheet (side, bottom, centre),
  Toast, EmptyState, Skeleton, Container, PageHeader, SectionHeader, Breadcrumbs, LinkTabs,
  Notice, Wordmark.

**Type.** Bricolage Grotesque for the wordmark, headings and big prices: it has character without
being a novelty face, which matters for a store with no logo image. Inter for everything else,
with tabular figures wherever numbers line up. Scale: 12 / 14 / 16 / 18 / 22 / 28 / 36 / 48.

**Space and shape.** 4px grid. Page column 1280px with 16 / 24 / 32px gutters. Radius 6px for
controls, 10px for cards and buttons, 16px for sheets and panels. Two shadows: `card`
(barely there) and `pop` (menus, sheets, toasts).

**Contrast.** Every token pair the store paints is measured against its WCAG bar by
`scripts/dev/contrast.mjs`, which fails if one slips. Two came out of that: small print
(`fg-subtle`) was 3.75:1 on a muted panel and is now 4.58:1, and a form control's edge needs
3:1 to be told apart from the page (WCAG 1.4.11) — a hairline in `line-strong` was 1.58:1, so
controls took a darker `line-control` while decorative edges, which nothing depends on seeing,
kept the lighter one.

**Identity.** The wordmark is set type, lowercase "markaz" with a light purple dot: the centre
the name means. The favicon is the same "m" and dot on navy, drawn in SVG rather than shipped
as a bitmap.

## Brand and routes

| Was | Now |
| --- | --- |
| Amazon | Markaz |
| Prime (membership), `/prime` | Markaz Plus, `/plus` |
| Prime Video, `/prime-video` | Markaz Movies, `/movies` |
| Watchlist, `/watchlist` | My List, `/movies/my-list` |
| Alexa | Shabana |
| Amazon Household, `/profile/family` | Household, `/profile/household` |

Five more redirects came out of the redesign itself, each because two URLs were showing the
same thing:

| Was | Now | Why |
| --- | --- | --- |
| `/profile/credit-cards` | `/profile/payment` | the card page offered three invented cards; payment holds what is real (§9) |
| `/keep-shopping` | `/profile/recent` | both were built from the same `recentlyViewed` list (§12) |
| `/lists/create` | `/lists?new=1` | a URL whose only job is to open a dialog is a dialog (§13) |
| `/registry/find` | `/registry` | the same search box on two pages (§13) |
| `/pharmacy/search` | `/pharmacy` | likewise (§18) |

Old URLs redirect permanently. Pages share one shell through route groups (`app/(store)`,
`app/(auth)`) instead of each page importing its own header and footer, and every `/profile`
page sits inside one account shell.

---

## 1. Header, navigation and footer

**What Amazon's does badly:** the header is a control panel. Two rows carry a delivery location
you can't change, a language flag, an "Account & Lists" hover menu that vanishes when your mouse
drifts, "Returns & Orders" as one label for two things, and a strip of thirteen links mixing
departments, programmes and a brand-name grocery chain. On a phone the location bar appears twice.

- **Keep:** navy chrome; search as the widest thing in the header; the department scope on search
  (it genuinely narrows results); account, orders and cart at the right.
- **Change:** the department row comes **from the database**, biggest department first, so it
  never offers an empty aisle and follows the catalogue when an admin adds one.
- **Change:** the scope picker is a pill inside the search field, tinted when a department is
  picked, and the placeholder says where you're searching ("Search Electronics").
- **Change:** suggestions show a thumbnail, department and price, and open the product directly.
  Amazon's suggestions only re-run a search with the product's name. The first row is always
  "Search for '…'", and a scoped search offers "… in all departments" as a way out. Suggestions
  also match sub-categories, so "lap" finds the MacBooks.
- **Change:** menus open on click, not hover, and close on Escape, outside click or navigation.
- **Change:** the cart badge counts items, not lines (two of the same shirt is 2).
- **Cut:** "Deliver to Germany" (hardcoded, did nothing), the language picker (English only),
  "Join Prime" in the nav, the desktop "All" drawer (it repeated the department row), and the
  footer's 40-link corporate wall.
- **Cut:** the mobile "Sign in" link that showed even when you were signed in.
- **Add:** "Ask Shabana" in the header on every page. On phones it's an icon beside account and cart.
- **Add:** "More stores" holds the specialty storefronts (groceries, home, pharmacy, registry,
  gift cards, Plus, business, selling). Each gets a one-line description, instead of those stores
  crowding the department row.
- **Add:** the phone drawer is grouped by intent: Shop / Stores / Your account / Help, with
  sign in and create account as the first thing a signed-out visitor sees.
- **Add:** a skip-to-content link, and one navigation config (`components/Header/navigation.ts`)
  that the header, drawer and footer all read, so they can't disagree.
- **Footer:** three short columns of pages that exist, plus the data sources (dummyjson, TMDB,
  openFDA) and a plain note that payments are simulated.

## Shabana (the panel)

Shabana is Alexa's replacement, powered by Gemini. The conversation now lives in the store, not
in the panel, so it survives closing the panel and moving between pages.

- **Keep:** retrieval stays grounded. The model picks a department that exists, and products come
  from MongoDB, never from the model's text. When nothing matches, her reply says Markaz doesn't
  carry it instead of claiming it does.
- **Change:** budgets are honoured ("under $50" filters on the discounted price), and each group
  links to the matching filtered browse page.
- **Cut:** "FREE delivery on $35.00 of items shipped by Amazon" under every suggested product.
  No such policy exists in this store. Also cut: thumbs-up/down buttons that recorded nothing.
- **Add:** product context. Opened from a product page, Shabana is handed that product. The
  server loads its description, specs and reviews, and she answers only from them ("two of three
  reviewers say …"), saying so when they don't cover the question.

**She knows the whole store, not just the catalogue.** A shop assistant who can only answer
about shirts is half an assistant, so retrieval was extended to everything Markaz actually has.
The model never returns a result — it says *what kind* of thing it wants and the server looks
it up:

- **`kind: "product"`** — the original department-scoped search.
- **`kind: "movie"`** — Markaz Movies, by title or genre, with both prices as the server
  computes them. She is told that nothing streams and that the cheapest titles are sold
  outright, so she never promises a rental a card would then contradict.
- **`kind: "medication"`** — the pharmacy look-up, by brand, generic name or ingredient, with
  the cash and Plus prices. She is told to suggest nothing the shopper did not name, never to
  advise on taking anything, and to say Markaz only quotes.
- **Add:** **the shopper's own account**, for signed-in visitors. A short summary — first name,
  membership, gift-card balance, saved counts, the four most recent orders with status, date,
  total and first item, live rentals and auto-reorders — goes into the system prompt, so
  "where is my order" is answered from fact and quoted exactly rather than guessed. Signed out,
  she says she cannot see an account until you sign in.
- **Add:** a **link** on her answers. The model names a page rather than writing a URL into its
  prose, and the server validates it against a list of this store's own paths — so it can point
  at your order, your returns or Markaz Plus, and cannot point anywhere else.
- **Privacy:** that account summary is sent to Google Gemini with your message, so the panel
  footer links to it, Privacy & data lists exactly which fields, and the help article says the
  same. It never includes an address, an email, a phone number or a payment detail.

**Add: Compare with Shabana** (the last item from the plan's stretch list). The browse grid has
a Compare button; ticking two or three products and pressing it opens Shabana with all of them
in context, and she answers from their descriptions, specs and reviews — the same grounding as
a single product, which is what makes a comparison worth reading.

**Fix, found while wiring the film search:** the rental price is 40% of the purchase price with
a $1.99 floor, which meant a title selling for $1.99 also "rented" for $1.99. Those are sold
outright now: the rent button, the rent price and the API action are all withheld, and the
sheet says why.

---

## 2. Home

**What Amazon's does badly:** the first screen is an autoplaying banner carousel of promotions,
which most people scroll straight past. Below it, category tiles overlap the banner, and then
come four near-identical carousels, one per category, each asking you to page sideways through
products you didn't ask for. It tells you nothing about the store and nothing about you.

- **Cut:** the carousel and its five banner images (they were Amazon's own artwork).
- **Cut:** the tiles overlapping the hero, and the four per-category swipers.
- **Change:** the hero is one sentence about what this store promises: prices re-checked at
  checkout, delivery and returns stated on every product, no sponsored rows. Beside it are four
  real departments with their best-rated product as the picture.
- **Add:** the fastest way in for someone who doesn't know the product name yet: "Ask Shabana",
  plus three example questions that open her with the question already asked.
- **Add:** "Pick up where you left off" (your browsing history) and "Buy again" (your paid
  orders), only when signed in, and never padded with filler when empty.
- **Add:** "Shop by department" with real product counts, so the store's size is visible at a
  glance.
- **Change:** product rows are fixed grids on desktop and a snap-scrolling row on phones. No
  carousel arrows; every row has one "See all" to a filtered page.
- **Change:** "On sale now" is the deepest real discounts. "Top rated" means 4.5 stars or better
  from at least three reviews, and the row says so in its description.
- **Add:** a Markaz Movies strip, so the store's other half is discoverable from the front page.
- **Change:** each row is its own small query. The old page loaded and serialised the whole
  catalogue to draw four rows.

**The product card** (used everywhere from here on) shows image, name, rating, price and
delivery, in that order. A saving shows as a green "−20%" badge and a struck list price.
"Top pick" is earned (4.5+ from 3+ reviews) and replaces "Amazon's Choice". A product with
colour or size options opens its page instead of guessing an option. A single-option product
has a quick-add button that confirms with a toast.

**Catalogue fix found here:** the furniture seeder and the main seed both imported dummyjson's
kitchen and décor products, so items like the "Boxed Blender" existed twice. Home & Kitchen is now
one department (the Markaz Home storefront's). Grocery and Home & Kitchen appear in the
department row like any other department, and link to their richer storefronts.

---

## 3. Browse and search

**What Amazon's does badly:** results arrive with sponsored listings mixed in. The filter sidebar
lists every facet whether or not it applies (our clone offered Style, Material and Gender filters
that were always empty). There's no single place showing which filters are on, and on a phone
the filters push the results a screen down. The clone also shuffled unsorted results on every
load, and sorted and filtered by list price, ignoring the discount the shopper actually pays.

- **Keep:** filters live in the URL, so a filtered page can be shared, bookmarked and reloaded.
  Filtering and paging happen on the server.
- **Change:** price sorting and the price filter use the **price you pay** (cheapest option after
  its discount), computed in the aggregation, never the list price.
- **Change:** a fixed order. Searches default to "Best match" (name starts with the query, then
  contains it, then brand), everything else to "Most popular" (units sold). No shuffle, so page 2
  never repeats page 1.
- **Change:** search also matches sub-categories ("laptop" finds every laptop) and brands.
- **Change:** filters only appear when they have something to say. Colour and size show only when
  the scope has more than one; "One Size" is not a choice; price presets come from the
  department's own price range.
- **Change:** counts sit beside every department, sub-category, brand and colour, taken over the
  current scope, so a filter never hides its own options.
- **Change:** sub-categories actually filter. In the clone, clicking one did nothing.
- **Change:** colours are filtered by name ("Black"), and a name covers every swatch that reads
  as it, instead of listing raw hex values.
- **Change:** 24 results a page (was 10) in a 2 / 3 / 4-column grid.
- **Cut:** the row of department buttons above the results (it duplicated the sidebar), the
  empty Style / Material / Gender filters, "Free shipping" (a filter that removed nothing), and
  the shuffle.
- **Add:** applied filters as removable chips above the results, with "Clear all".
- **Add:** on phones, a bottom sheet with the same filters and a "Show 37 results" button, and
  sub-category chips under the title for one-tap narrowing.
- **Add:** a no-results state that says why and offers a way out: clear the filters, search all
  departments instead of one, or describe it to Shabana.
- **Add:** a loading skeleton in the page's own shape.

**Search suggestions** (department-scoped, from the header) are covered under the header section.
**Seed fix found here:** dummyjson sells an Amazon Echo, which put "Amazon" in the brand filter.
Amazon-branded items are now skipped by the seed.

---

## 4. Product detail

**What Amazon's does badly:** the price appears twice, once in the description column and again
in the buy box, and they can disagree. The buy box is dense with legalese ("Ships from / Sold
by", "No Import Fees Deposit", "Secure transaction"). The delivery promise is a countdown timer.
Reviews sit below one or more rows of other products. The clone had all of that, plus a hardcoded
"Delivery Thursday, March 23 · order within 23 hrs 53 mins", a seller called "ATUAT", an empty
"Questions" accordion, and a stock check that called the last unit "Sold".

- **Keep:** a large gallery beside the decision; colour and size variants in the URL, so an
  option can be linked to; the review system (half stars, photos, helpful votes, verified
  purchase earned from real orders).
- **Change:** one panel, in the order you decide: what it is (brand, name, rating, units sold),
  what it costs (one price, with the saving), which option, how many, then delivery, returns and
  warranty in three lines.
- **Change:** delivery is an **estimate computed from the product's own dispatch time**
  ("Ships in 2 weeks" moves the estimate out). It says "estimated". Returns come from the
  product's return policy, and warranty from its specs.
- **Change:** stock is real and specific: "In stock", "Only 3 left", or "Out of stock in this
  option". Out-of-stock sizes are struck through, and sizes that cost more say how much.
- **Change:** variants are shown **by their photo**. The seed used to give each variant a random
  swatch colour, so a blue iPhone was offered in "Green". dummyjson has no colour data, so the seed
  no longer invents it. Products with real colours (admin-created) still get named swatches.
- **Change:** specifications are a table from the product's data. Weights and dimensions were
  dropped because the source gives them no units and they weren't plausible (an "8 kg" phone).
- **Change:** saving an item is a heart beside Add to cart that toggles, not a second full-width
  button.
- **Cut:** the second price, "Ships from / Sold by", "No Import Fees", "Secure transaction", the
  countdown, and the empty Questions section.
- **Cut:** the similar-products carousel between the buy box and the reviews. One row of
  alternatives now comes last, preferring the same sub-category.
- **Add:** **Ask Shabana about this product**, where the empty Q&A used to be. Three one-tap
  questions ("What do reviewers say?", "What are the main downsides?", "Is it worth the price?")
  or your own. She answers from this product's description, specs and reviews only.
- **Add:** Add to cart confirms with a toast offering View cart / Check out, instead of a
  spinner and silence.
- **Add:** on phones, a swipeable gallery and a sticky bar with the price and Add to cart.
- **Reviews:** a clickable histogram filters by star. Filters appear only when the reviews vary
  (size, colour, fit, verified, with photos); "Style 1 / Style 2" became colour names. Five per
  page, sorted by most helpful.

---

## 5. Cart

**What Amazon's does badly:** the cart is a checklist you have to tick before you can pay. Every
line starts unticked, so "Proceed" is greyed out until you work out why. Around it: payment
logos, a buyer-protection promo and sponsored products. In the clone you also couldn't see your
cart at all without signing in, and prices printed as "USD37.37$".

- **Keep:** the cart persists in the browser, and every visit **re-prices it against the
  database** before showing a total.
- **Change:** every line counts. There are no tick boxes; to leave something out, save it for
  later or remove it.
- **Change:** the summary is computed with the same function (`lib/pricing.ts`) that checkout and
  order creation use: items, delivery (the product's own charge, once per line), total. The cart
  never shows a number the order won't charge.
- **Change:** quantities are capped at what's in stock. If a saved quantity is now too high, it's
  lowered and a notice says so. Low stock ("Only 3 left") is shown per line.
- **Add:** a **guest cart**. Anyone can fill one; signing in happens at checkout ("Sign in to
  check out · your cart stays as it is").
- **Add:** "Price dropped / went up from $X" when the price has changed since you added it.
  Lines whose product has left the catalogue say "No longer available" instead of keeping an old
  price.
- **Add:** "Save for later" moves a line to saved items (the wishlist API), and the minus button
  becomes a bin at quantity 1, so there's no dead state.
- **Add:** on phones, a sticky total with the checkout button. An empty cart offers a way back
  in, and the row below it shows what you viewed recently (or the store's best-rated products
  for a guest).
- **Cut:** the tick boxes and "select all", the payment-methods image, and the buyer-protection
  panel.

---

## 6. Checkout

**What Amazon's does badly:** checkout keeps selling. Upsells, "add a gift receipt", delivery
speed choices and a membership trial sit between you and the button. The clone had a structural
problem too: "Place order" created an *unpaid* order and sent you to a second page to pay, and
the gift-card balance was spent at the first step even if you never paid. Shipping appeared in
the cart total but was left out of the order (`shippingPrice: 0`), so the two totals could
disagree. The coupon was its own form with its own button styled like the main action.

- **Keep:** saved addresses, coupon codes, the gift-card balance, and every amount recomputed on
  the server.
- **Change:** **one step to place and pay.** Card and PayPal are simulated and paid in the same
  request that creates the order, which also takes the stock. Cash on delivery is placed unpaid,
  and the page says what happens next.
- **Change:** the summary is the server's quote (`/api/checkout/quote`), computed by the same
  `computeQuote` that order creation uses. Each line is re-priced from its product as it is
  *now*; the delivery charge is included; a coupon discounts goods, not delivery; the gift card
  covers what's left. **The preview is the charge.**
- **Change:** the gift card is spent only when the order is actually placed, with a guard on the
  stored balance so two tabs can't spend it twice.
- **Change:** if an item sold out or changed since the cart, checkout lists what and blocks the
  button, instead of failing after you pay.
- **Change:** the address is chosen by id from your saved addresses. The server no longer accepts
  an address body at order time. New addresses are validated on the server with the same schema
  as the form.
- **Change:** one page, three numbered steps (address, payment, review). A settled step
  collapses to one line with "Change".
- **Change:** the coupon is a "Have a coupon code?" link. Its errors are specific ("expired on
  2026-01-31"), and an applied code shows as a line in the summary with "remove".
- **Change:** the button says what it does: "Pay $993.36", or "Place order" for cash on delivery.
- **Add:** a quiet checkout shell: wordmark, "Checkout", "Back to cart", and no store navigation
  to wander off into mid-payment.
- **Add:** a plain statement that payments are simulated and no card details are asked for,
  instead of a fake card form.
- **Cut:** the separate payment page, the "Apply" gradient button, and "please choose a
  payment method." errors that appeared only after pressing the main button.

---

## 7. Orders and returns

**What Amazon's does badly:** the orders page is also an advertising surface (a sponsored product
and a "customers also viewed" carousel under your own orders). It has tabs that don't apply here
("Digital Orders", "Amazon Pay"). It defaults to the last three months, so an older order looks
like it vanished. Every item gets four stacked buttons. Returns live in a separate "Returns
Center" with three tabs of their own. In the clone, every product was returnable for 30 days,
even when its product page said "7-day returns" or "No return policy".

- **Keep:** search by product name, a time filter, per-line returns with reason and refund
  destination, and duplicate-return protection on the server.
- **Change:** tabs by what the shopper cares about (All, In progress, Delivered, Cancelled,
  Returns), each with a count. **All time** is the default.
- **Change:** status in plain words: "Preparing", "On its way", "Delivered", "Pay on
  delivery". The date line says what happened and when.
- **Change:** an order card shows its state, thumbnails, item count and total, with three
  actions: View order, Return items (only when something can go back), Buy again.
- **Change:** **the return window is the one the product page promised**, read from the
  product's own policy per line (7 / 30 / 60 / 90 days, or none). Returns open once an order is
  delivered, not before, so the clock starts when you have the item.
- **Change:** returns are a tab of Orders, not a separate centre. It shows each request's
  progress (Requested → Approved → Refunded) and every item still inside its window, with its
  deadline.
- **Add:** a real **order timeline** built from what the order stores (placed, paid with
  timestamps, dispatched, delivered). Dispatch has no stored timestamp, so it shows as done
  without inventing one.
- **Add:** a confirmation banner after checkout ("Thanks, your order is placed · Paid with
  PayPal"). The line breakdown (items, delivery, coupon, gift card, total) now matches what was
  charged.
- **Add:** **Buy again** puts each line back in the cart in the variant and size it was bought
  in. Lines whose product or option has gone are skipped.
- **Add:** returns are requested from a side sheet on the order itself, showing the deadline
  and the window, with quantity when you bought more than one.
- **Cut:** the sponsored product, the recommendation carousel, the "Digital Orders" and "Amazon
  Pay" tabs, "View transactions", the invoice link (it pointed at the same page), and the per-item
  "Get product support" / "Track package" buttons (all the same page).

---

## 8. Sign in, create account, password reset

**What Amazon's does badly:** sign-in is two screens, email first and then password, which only
makes sense when an account can sign in several ways. Registration asks for the password twice.
Errors are written like validator output ("Wrong or Invalid email address or mobile phone
number"). The clone had the same, plus some security leaks: sign-in said "This email does not
exist" and password reset answered "This email does not exist" (both tell a stranger who has an
account), an expired reset link crashed with a raw 500, and "Me@x.com" and "me@x.com" could be
two accounts.

- **Keep:** email and password, Google and GitHub, email confirmation, password reset by
  emailed link, and returning you to where you were.
- **Change:** **one screen** to sign in: email and password together, with "Forgot it?" beside
  the password label.
- **Change:** Google and GitHub come first. One tap is the fastest way in for most people.
- **Change:** no "re-enter password". A show/hide toggle does that job, and the password rules
  (8+ characters, a letter, a number) tick themselves off as you type.
- **Change:** a new account is signed in straight away. Confirming the email can wait.
- **Change:** choosing a new password after a reset signs you in, instead of sending you back to
  type it again.
- **Change:** the same rules are enforced on the server, from one module (`lib/authRules.ts`)
  shared by the forms and the routes.
- **Change:** errors in plain words: "That email and password don't match an account."; "An
  account already uses this email. Sign in, or reset the password…"; "This reset link has expired.
  Send a new link."
- **Fix:** sign-in and reset no longer reveal whether an email has an account. Emails are stored
  lower case and matched case-insensitively. Expired reset links get a 400 with a way forward.
  `callbackUrl` only follows same-site paths.
- **Add:** a split layout on wide screens. The form is on the left, and a navy panel on the right
  says what an account gets you (only things that are true in this store). Phones get the form
  alone.
- **Add:** coming from the cart, the heading says so ("Then you can check out. Your cart stays
  as it is.").
- **Cut:** the two-step sign-in, "Conditions of Use" legalese, the "Need help?" disclosure (now
  one link in the footer), and the confirm-password field.

---

## 9. Your account: overview, addresses, payment, login & security, saved items

**What Amazon's does badly:** "Your Account" is a wall. Twelve large tiles, then seven more cards
holding about eighty links, most of which are programmes you are not in ("Markaz Coins", "Twitch
settings", "One Medical membership"). Nothing on the page tells you anything about *your* account:
not where your last order is, not where it is being sent, not what you have saved. Underneath, each
section is an island — its own page, its own breadcrumb, no way across to the next one without going
back to the wall. In the clone it was worse: 56 of those links pointed at a `/placeholder` page, the
card page offered three invented credit cards with invented cash-back rates, and "Your Lists" showed
the unnamed wishlist.

- **Keep:** every section. Addresses, payments, password, saved items, orders, returns, household,
  devices, messages and data all stay; they move into one shell instead of being cut.
- **Change:** the account is a **place, not a list of destinations**. One layout wraps every
  `/profile` page: a rail on the left, grouped Orders / Shopping / Settings / Membership & sharing /
  Messages & data, so you can go from addresses to your password without passing through a hub.
  Orders and returns moved into it too, and lost their own breadcrumb and container.
- **Change:** on a phone the rail folds into **one button naming the section you are in**, opening a
  sheet. Not a row of chips: orders and returns already carry a row of tabs, and two scrolling rows
  would compete for the same gesture.
- **Change:** the overview answers "what is happening with my account" before it offers navigation.
  Your latest order with its real status and total, the address checkout will use, the payment method
  it will use, your Markaz balance, and the products you were last looking at. The full section list
  sits underneath with a live count beside each one (7 orders, 5 saved, 2 addresses) — counted from
  the account, not decoration.
- **Cut:** the twelve marketing tiles, the seven link cards and their ~80 links, and with them most
  of the `/placeholder` traffic. What is left is what exists.
- **Cut:** `/profile/credit-cards` entirely, redirected to Payment. It offered three Markaz credit
  cards with invented rewards and an "Apply now" button that opened a dialog admitting nothing had
  been submitted. It also contradicted checkout, which says plainly that no card details are asked
  for or stored.

**Addresses.** Amazon shows addresses as a grid of tiles with a dashed "Add address" tile that looks
like an address until you read it.

- **Change:** the address checkout will use is marked "Used at checkout", sorted first and outlined,
  because that is the only thing that distinguishes one of your addresses from another.
- **Change:** each address has three plain actions — Edit, Use at checkout, Remove — instead of a
  row of buttons under every tile.
- **Add:** **editing in place.** The clone could only add and delete, so fixing a typo left a
  duplicate behind. `PUT /api/user/saveaddress` validates the edit with the same schema the form
  uses, and whether an address is the active one is not something the request body can change.
- **Fix:** deleting the address checkout was using no longer leaves the account with none chosen;
  the next one takes over. Before, checkout had nowhere to ship to and did not say so.
- **Add:** removing asks first, and says what it does not touch: orders already placed keep the
  address they were sent to.

**Payment.** Amazon's payment page is a wallet with an advertisement in it ("Get a $150 gift card
upon approval").

- **Change:** it holds the two things that are real — the payment method checkout opens on, and the
  Markaz gift-card balance with the ledger behind it (redeemed, spent, with dates and amounts, from
  `giftCardHistory`).
- **Change:** choosing a method saves it immediately. There is one setting on the card; a Save button
  would only be a second click.
- **Add:** a plain statement of why there are no cards to manage: no card number, expiry or security
  code is ever asked for or stored, so there is nothing to store. This is the same claim checkout
  makes, and now the account page agrees with it.
- **Trade-off:** the plan (§5, item 8) was to move saved cards into MongoDB as `last4` records. That
  was dropped. A wallet of cards that nothing can ever charge is exactly the kind of decorative state
  this redesign has been removing, and it would have contradicted checkout's own copy.

**Login & security.** Amazon's version is a list of rows that each open a separate page, and the
clone's was a lone "change password" box with three fields.

- **Change:** two cards. "Your details" — your name, editable in place — and "How you sign in".
- **Change:** the password form lost its "re-type your new password" box. The show/hide toggle does
  that job, and the rules tick themselves off as you type, from the same `lib/authRules` the
  registration form and the server use. The route enforced 6 characters while the sign-up form asked
  for 8 plus a letter and a number; now both run the same check.
- **Add:** the page says **how this account actually signs in**. A Google or GitHub account has no
  password stored, so instead of a form it cannot use it offers to email a link to set one, and says
  signing in with the provider keeps working.
- **Fix:** provider accounts used to be created with a random password hash nobody was ever told,
  which made "this account has no password" impossible to detect — the change-password form answered
  "Current password is incorrect" and left you stuck. New provider accounts store no password.
- **Change:** the email address is shown with its confirmed state and an explanation of why it can't
  be swapped here (every order, list and sign-in hangs off it, and changing it needs re-verification)
  rather than a link to a page that doesn't exist.
- **Add:** renaming yourself updates the session, so the header greets you by the new name straight
  away instead of after the next sign-in.
- **Cut:** closing the account is not repeated here; it lives once, under Privacy & data.

**Saved items.** The clone called the wishlist "Your Lists", which is a different thing, and priced
each row from the first variant regardless of which one you saved.

- **Change:** it is **Saved items**, and named lists are a link away, so the two stop pretending to
  be one feature.
- **Change:** each row is priced from the catalogue on every visit, from the **variant you saved**,
  with the discount applied the same way the cards and the cart apply it. It never shows the price
  something was when you saved it.
- **Add:** the same rule the product cards use — something with one option goes straight into the
  cart; something with sizes says "Choose a size" and opens its page, because picking a size for
  someone is a guess. Out of stock is said, not hidden.

**Legacy removed with this page:** `components/checkoutPage/*` (the old shipping and payment
widgets, whose last user was the profile address page), `components/User/{LoginInput,ButtonInput}`,
and the account tile and link-card components. `countries.ts` moved to `lib/`.

---

## 10. Markaz Movies and My list

**What Amazon's does badly:** Prime Video's storefront is a shop that never tells you the price.
Every tile carries the word "prime"; the hero sells a 30-day free trial over the top of the film it
is meant to be showing you; and the row titles ("$4.99 or less movie deals", "Under $10: New movie
price drops") are the only place money is mentioned at all. It also builds a second navigation —
Home / Movies / TV shows / Sports, a search icon and a categories icon — on top of the store's own
header, so there are two of everything.

The clone inherited all of that and added two problems of its own. **Every tile went to
`/placeholder`**: there was no way to find out anything about a title. And the prices were invented
in the browser: `rentPrice = video.price || 3.99` and `buyPrice = rent + 6`, computed in a React
component, for a catalogue where only a third of the titles have a price at all. The watchlist,
purchases and rentals lived in `localStorage`, so "your library" was really "this browser's
library".

- **Keep:** the dark surface. Posters are the content here, and they read better against ink than
  against white; it is the one place in Markaz that isn't a white shop floor.
- **Keep:** the rows, which come from the database (`Video.rows`, filled by the TMDB seeder), and
  the saved-titles idea, which is genuinely useful.
- **Change:** the second navigation becomes one slim bar: "Markaz Movies", Browse, My list, and how
  many titles the catalogue holds. The store header above it already does search and account.
- **Change:** **the title sheet replaces `/placeholder`.** Any poster opens it, and it holds what
  the catalogue actually knows: the backdrop, the synopsis, the genres, the TMDB rating with its
  vote count (attributed, because it is TMDB's rating and not Markaz's), and the two prices.
- **Change:** **prices are the server's.** `Video.price` is what a title costs to own. A rental is
  40% of that, rounded to .99 with a $1.99 floor — one rule in `lib/movies.ts`, applied on the
  server, shown on the poster, in the sheet, and written into the record of the rental. The browser
  never computes a price and never sends one.
- **Change:** a title with no price says so — "Markaz doesn't sell this title yet" — instead of
  being given an invented $3.99. Two thirds of the catalogue is in that state, and pretending
  otherwise was the biggest lie on the page.
- **Change:** the hero is one still title, the most popular one that has a backdrop *and* a price,
  so its button does something. No slides, no dots.
- **Change:** the badges the seeder derives are written out in words — "New release", "Highly
  rated" — and "DEAL" is dropped, because the price is already on the poster.
- **Cut:** "prime" on every tile, "prime original" (nothing here is a Markaz original — those titles
  are simply well-reviewed series, and the row now says "Acclaimed series"), "Watch with Plus ·
  Start your 30-day free trial", the fake tab bar, the search and categories icons, the maturity
  rating badge (the seeder never fills it), and the "See more" links that went to `/placeholder`.
- **Cut:** the hover-only scroll arrows. The rows scroll and snap like the store's rows, which works
  the same with a finger.
- **Add:** **My list and your library live in MongoDB** (PLAN §5, item 5), on `watchlist` and
  `library` sub-documents with one route, `/api/user/movies`. The page says what that buys you:
  "saved on your account, so it follows you between devices".
- **Add:** the rules that make a library a library, enforced on the server: you can't buy a title
  twice, you can't rent one you are already renting, buying a title you had rented replaces the
  rental, and buying or renting takes a title off My list, because it isn't something you mean to
  get around to any more.
- **Add:** a rental keeps its own price and expiry and counts down ("Rental ends in 24 days");
  a purchase says what it cost and when. A rental that a purchase superseded stays on the shelf and
  says so, rather than being deleted — it happened.
- **Honest about what this is:** nothing streams. Buying and renting record what you chose against
  your account and charge nothing, which the sheet says in the same words checkout uses.

**Signed out:** the catalogue browses normally and the prices are shown, because "how much is it"
is the question a signed-out visitor is asking. The buttons go to sign-in rather than failing there.
My list needs an account, and the proxy sends you to sign in with the page you asked for.

---

## 11. Deals

**What Amazon's does badly:** the deals page is five pages stacked on top of each other — a Prime
banner, a sponsored product, a "featured deals" carousel, a tab strip and, eventually, a grid — and
the deals themselves are dressed up rather than described. Timers count down to nothing in
particular, badges say "Limited time deal" and "Early Prime Big Deal" on everything, and the page
tells you a coupon exists without telling you a code you can use.

The clone made those up in code. `dealLabel()` handed out "Deal selling fast" above 500 sold and
"Early Plus Big Deal" above 30% off; `dealEnds()` started a countdown on anything cut by a quarter
or more, to a deadline the database does not hold. Meanwhile the real `Coupon` collection — the two
codes checkout actually accepts — was never shown on the page named after coupons.

- **Keep:** the URL (`/coupons`) and the idea of a place to see what is cut in price.
- **Change:** **Deals is the browse grid with one thing changed — its scope.** Instead of every
  listing, it shows every listing that carries a discount. It is the same `getBrowseData`, so the
  filters, the removable chips, the facet counts, the pagination, the empty state and the phone
  filter sheet are identical to `/browse`. A shopper learns the grid once.
- **Change:** the default order is **Biggest saving**, computed in the aggregation from the deepest
  discount on any of a product's variants, and it joins the ordinary sort menu rather than replacing
  it. Price sorting here, as everywhere, runs on the discounted price.
- **Change:** the discount filter's tiers come from the catalogue. It offers 10 / 15 / 20% off or
  more with a count against each, because that is what the store actually discounts today; a tier
  nothing reaches is never shown, and neither is one that every deal already meets. Amazon's fixed
  "50% off or more" that returns nothing is the failure being avoided.
- **Change:** the department list is scoped to deals, so "Electronics 34" means 34 discounted
  electronics, not 34 electronics.
- **Add:** **the coupon codes, at the top, in full.** They are read from the `Coupon` collection and
  filtered by the same start/end date test `checkCoupon` applies at checkout, so a code shown here
  is a code that will be accepted. Each one can be tapped to copy, with what it takes off, what it
  applies to (goods, not delivery, one per order) and the date it runs until.
- **Cut:** the Prime banner, the sponsored product rail, the "featured deals" carousel, the tab
  strip, the invented deal labels, the countdowns to a deadline no deal has, and the separate
  Amazon-style filter column that duplicated the browse one.
- **Note:** the saving on each card is the product's own discount, shown as "−20%" with the list
  price struck through — the same card, and the same arithmetic, as everywhere else in the store.

---

## 12. Buy again and browsing history

**What Amazon's does badly:** "Buy Again" is barely about buying again. One row of your own
purchases sits at the top, then the page turns into a second storefront: an aisle rail, a "Top
sellers in …" row for every department, and two recommendation carousels. The clone added a search
box and a time filter borrowed from the orders page that filtered nothing on this one.

"Keep shopping for" is worse: it guesses what you are shopping for from the single most recent
product you looked at, then fills the page with products you have **not** looked at, a sponsored
slot, and proof-of-popularity lines rounded into milestones — `boughtLabel()` turned any figure over
50 into "50+ bought in past month", over 100 into "100+", and so on, for a period the database does
not record. Its four tabs (For you / Deals / Best sellers / Bought together) were four sort orders
wearing different names.

- **Buy again — change:** the page is only what you have bought. Items come from **paid** orders,
  one card per product *and option* rather than one per order line, so buying the same shirt twice
  is one card that says "2 bought in all", not two.
- **Buy again — change:** each card is priced from the catalogue today, in the colour and size you
  chose, and "Add to cart" puts that exact variant back. When the colour or size has gone the card
  says so and points at the product page; when the product has left the catalogue it says that
  instead of showing a stale price.
- **Buy again — change:** grouped by department, in the order you last bought from each, so the
  most recent thing leads the page. The search box searches **what you have bought**, which is what
  a search box on this page should do.
- **Buy again — cut:** the aisle rail, the per-department top-seller rows, both recommendation
  carousels and the borrowed orders toolbar. A page called Buy again that is four fifths discovery
  is a page with the wrong name.
- **Browsing history — change:** "Keep shopping for" and "Your Browsing History" were two pages
  built from the same `recentlyViewed` list. They are now one, at `/profile/recent`, inside the
  account where it belongs; `/keep-shopping` redirects to it.
- **Browsing history — change:** it shows what you actually looked at, newest first, with when, at
  today's price — not a grid of things you haven't looked at.
- **Browsing history — add:** a **clear-history control**, behind a confirmation that says what it
  does and does not touch, using the existing `DELETE /api/user/history`. It also says plainly that
  clearing is not the same as switching recording off, and links to the preference that does.
- **Cut:** the sponsored slot, the four tabs, the "50+ bought in past month" milestones, and the
  "previously viewed" hero that repeated the first card underneath it.
- **Add:** one card (`components/shopping/ShoppingCard`) shared by both pages: image, name, one line
  saying why it is here, the price as it is today, and a single action. The pages differ in their
  note and their button, not in how a row reads.

---

## 13. Lists and registries

**What Amazon's does badly:** the Lists hub is a brochure. Three illustrated promises ("Stay
organized", "Shop with friends", "Save money"), a registry tile strip, an "other lists" block, a
help block and a recommendation carousel — and your actual lists are one small panel in the middle.
"Create a List" is a URL that shows the same brochure with a dialog on top of it.

The registry hub is worse, because most of what it promises is not true here: "Extended returns —
registry gifts have an extended return period" (they do not), "We help keep track of who bought what
item and when" (nothing did), and "Earth's biggest selection". Its eight occasions (Baby, Wedding,
Birthday, Holiday, Housewarming, College, Graduation, Gift) were decoration: a list has no occasion
field, so `occasionKeyOf()` **guessed** one by looking for words in the list's name.

And underneath all of it, the feature did not work. A list could be created and deleted, but
**nothing could be put in one** — the product page's save button writes to the wishlist, not to a
named list — so every list was permanently empty.

- **Keep:** lists as named sets with three privacy levels, and search by name over public lists.
  The privacy model was already right: private is invisible, shared works by link, public is
  searchable.
- **Fix, and it is the point of this page:** a list can now hold things. `PUT /api/user/lists` adds
  a product and colour to a list, and **saved items is where you do it** — one save gesture on the
  product page, organising afterwards, the same way the cart's "save for later" works. The decision
  panel on a product page stays one button, not a menu.
- **Add:** `/lists/[id]`, your own list: its items at today's price, remove, add to cart, rename,
  change who can see it, and the share link with a copy button. A private list says plainly that it
  has no link to give out yet.
- **Change:** `/lists` is your lists and nothing else — a card each with the first four thumbnails,
  the count, the privacy, and what has been marked bought. Creating one happens in a sheet and then
  opens the new list, because an empty list is not somewhere to stop.
- **Change:** `/lists/create` redirects to `/lists?new=1`. A URL whose only job is to open a dialog
  is a dialog, not a page.
- **Change:** `/registry` and `/registry/find` were two pages with the same search box. They are one:
  `/registry` is the search, with a short honest paragraph about what a registry is here — a list
  you made public — and `/registry/find` redirects to it.
- **Add:** a **purchased count that is real**. Markaz cannot tell that an order was meant for a
  particular list: the cart carries no list with it, and inferring it from "someone, somewhere
  bought this product" would be a guess. So a signed-in guest marks a gift bought themselves, the
  record keeps **who** and **when**, the list header says "1 of 8 already bought", and the item says
  who has it covered. The mark is a toggle for the person who made it and locked for everyone else.
  The page says in one sentence what marking does and does not do.
- **Cut:** the illustrated promise cards, the occasion strip and the whole occasion guess, "extended
  returns", "Earth's biggest selection", "we keep track of who bought what" (now true, so it is
  stated where it happens instead), the registry hero, the "unique to you" block, the help block,
  the recommendation carousel, and the hand-drawn art files behind them.
- **Note:** a list and a registry are the same object, and the pages say so rather than implying a
  second product with its own rules.

---

## 14. Gift cards

**What Amazon's does badly:** the gift card page is a shop for gift cards — designs, amounts,
delivery by email or post, a personal message, corporate gifting — and your own balance, the one
thing that affects what you pay, is a small box in the corner.

The clone's version had four tabs, and two of them printed money. **"Buy a gift card" issued a
working claim code for free**: pick an amount, press the button, and a code you could immediately
redeem appeared on screen. "Reload your balance" did the same thing again. Nothing was ever paid
for, so the balance was worth exactly as much as the visitor felt like giving themselves.

- **Keep:** the claim-code scheme, which is a genuinely nice piece of design — a code carries its
  own face value and a check digit, so it is validated by arithmetic on the server and a mistyped
  amount fails instead of redeeming a different card. Also kept: the balance, the ledger, and the
  rule that only the redeem route may move money.
- **Fix:** **redeeming was broken.** The Phase 0 rename changed the codes the store prints from
  `AMZN-` to `MRKZ-`, but the parser still matched `^AMZN(\d{4})(\d{4})$`, so every code the page
  showed was rejected as "not in the MRKZ-0000-0000 format". The parser now reads the prefix the
  store issues.
- **Change:** one page, no tabs. The balance first, in big type, with what it actually does —
  spent before your payment method on the next order that uses it, and you can turn it off at
  checkout for one order. Then the code box. Then the ledger.
- **Change:** the ledger is every movement, newest first, with the code money came in on and the
  date it went out on an order. It is the same `giftCardHistory` checkout writes to.
- **Cut:** "Buy a gift card" and "Reload your balance". A store that takes no payment cannot sell a
  gift card, and a button that issues one for nothing is not a feature, it is a hole in the till.
  Also cut: the card designs and their drawn art, and the delivery options.
- **Add:** a plain statement that Markaz does not sell gift cards in this build, and **three demo
  codes** printed on the page so the balance and checkout can actually be tried. They are labelled
  as what they are rather than dressed as a promotion, and the server refuses a code already on your
  account, so each one works once.

---

## 15. Markaz Plus and memberships

**What Amazon's does badly:** the Prime page sells six benefits. In this store, five of them did not
exist — there is no reading library, no photo storage, no games, no member-only coupons, and
delivery was never different for a member. The clone was at least honest about it, in a FAQ answer
that admitted "Plus membership here is a simulation stored in your browser, so joining does not
change what checkout charges you". A page whose own FAQ says the product does nothing is a page
selling nothing.

Underneath: the membership lived in `localStorage`, so it followed a browser rather than an account
and checkout could never see it. The Memberships page then listed three more invented
subscriptions — Kindle Unlimited, Markaz Music Unlimited, Audible Premium Plus — with prices,
blurbs and trial copy for services that do not exist, and a "Subscribe & Save" panel that also wrote
to `localStorage`.

- **Change, and it is the whole point:** **Plus does something.** Markaz prices delivery per item
  (`Product.shipping`), so a membership waives those charges — one flag through `summarize()` in
  `lib/pricing.ts`, applied by the cart and by `computeQuote`, which is what actually charges the
  order. The membership is read from the account on the server; the browser never asserts it.
  Checkout shows the waived amount struck through: "$4.99 Free with Plus".
- **Change:** the membership moves to MongoDB (PLAN §5, item 6) as
  `membership { plan, status, startedAt, trialEndsAt, renewsAt, cancelledAt }`, written only by
  `/api/user/membership`. Joining starts the 30-day trial; the renewal date is **computed** from the
  start date on each read rather than stored, so it cannot go stale while nothing is billing.
- **Change:** two benefits are claimed because two are true — no delivery charges, and the Plus price
  on pharmacy medications (`Medication.primePrice`, which the catalogue already carries). The page
  then says so explicitly: "That is the whole list. There is no music service, no reading library, no
  photo storage and no games behind it, so this page does not sell you any."
- **Change:** two plans, not three. Plus Student was cut: it priced itself on "a valid .edu address"
  that nothing checks, and an eligibility rule a store cannot enforce is not a plan.
- **Keep:** the free trial, the plan prices and the plan table — with a plain line that no payment is
  taken at any point, so the dates behave as if you were billed while the delivery waiver is real.
- **Cut:** the four invented benefits, Kindle Unlimited, Music Unlimited and Audible Premium Plus,
  and the benefit tiles' art.
- **Change:** "Subscribe & Save" becomes **auto-reorder**, in MongoDB (PLAN §5, item 7), and it is
  honest about what it is: a **reminder**, over things this account has actually bought, with the
  next date worked out on the server. Markaz has no scheduler and places no order by itself, so the
  panel says that where the dates are rather than in a footnote, and each row offers "Add to cart",
  "Got it covered" (which moves the date on one interval) and "Stop".
- **Add:** the account overview now says whether you are a member and that delivery is free, because
  that is the part of a membership a shopper needs at a glance.

---

## 16. Groceries

**What Amazon's does badly:** the grocery storefront is a shop inside the shop. A green rule, a
green "grocery" wordmark and circular department tiles illustrated with a random product photo — a
second brand with its own furniture, sitting under the store header you just used. Beside the
wordmark: "Join Prime for FREE delivery on $25+ or $12.99 for Same-day delivery", two claims this
store could not honour, since there was no delivery threshold and no same-day option. The landing
page was then a stack of "Shop Produce", "Shop Beverages" carousels — the whole aisle in a row you
scroll sideways — with the real grid two clicks in.

The taxonomy was also two levels deep for a shop of 27 items: seven departments, each holding
twenty aisles between them, so most "aisles" held one product.

- **Keep:** aisles. Groceries are the one part of this store people browse by shelf rather than by
  searching, and the department each product carries is real data from the seeder.
- **Change:** one row of aisle chips with a count on each, then the store's own product card in a
  grid. The chips are links, so an aisle can be shared and reloaded, and an aisle the shop does not
  stock is never offered.
- **Change:** the second level goes. Twenty aisles over 27 products is a filing system, not a shop;
  the seven departments are the level that has something behind each label.
- **Change:** Markaz's own colours. No green rule, no second wordmark, no circular tiles.
- **Add:** **Restock** at the top — the groceries this account has actually bought, from paid
  orders, with when and today's price, and one tap to put one back in the cart. It is the reason
  anyone opens a grocery shop a second time, and it was the one thing the old page did not have.
- **Add:** "On sale" as a chip with its real count, replacing the "Deals in Grocery" carousel.
- **Cut:** the green chrome, the Prime delivery claims, the department tiles, the per-department
  carousels, and the "For You" / "Buy Again" / "See All" tiles that duplicated pages the header
  already links to.

---

## 17. Markaz Home

**What Amazon's does badly:** the Home storefront is a wall of tiles with nothing behind most of
them. The clone carried Amazon's tile list verbatim — a department strip (Shop all Home, Decor,
Bedding & bath, Storage & organization, Home Improvement, Arts & crafts) where six of the ten links
went to `/placeholder`, and twenty-four "category" tiles (Sectionals, Headboards, Mattresses,
Barstools, Ottomans, Bean bags, Hammocks, Vanities…) for a department that stocks nine
sub-categories. Each of those tiles ran a **keyword search** that mostly missed: "Sectionals"
searched for "sofa", "Headboards" for "bed", "Outdoor dining" for "tray". Every tile was illustrated
by hand-composed art, and where a real photo was fetched it was found by matching the tile's word
against any product name in the catalogue, so a tile could be illustrated by something that was not
in it. Under all that sat a row of partner brand wordmarks — Safavieh, Zinus, Nathan James — naming
suppliers this store does not have.

- **Keep:** the two facets that are real and that a search box cannot ask for — the **room** a piece
  goes in and the **style** it is, both written by the seeder onto every product.
- **Change:** **every tile is built from the catalogue.** A room becomes a tile only if something is
  in it, the count on it is the number of pieces, and the photo is one of those pieces. A tile can
  no longer lead nowhere or show something it does not contain.
- **Change:** styles are counted **inside the room** you are looking at, so picking Living room and
  then a style never lands on an empty grid — the combinations that have nothing are not offered.
- **Change:** the grid is the store's own product card, the same one as browse and groceries.
- **Cut:** the department strip and its six placeholder links, the twenty-four keyword tiles, the
  composed art file, the partner brand wordmarks, and the "Featured deals" carousel (on sale is a
  chip with a real count now).
- **Add:** a link to `/browse?category=furniture` for anyone who wants price, brand, colour and
  rating filters. This page is the room-and-style way in; browse is the everything-else way, and
  neither duplicates the other.

---

## 18. Markaz Pharmacy

**What Amazon's does badly:** it is fifteen sections of marketing for a service this store does not
run. A promo banner, a hero, a benefits strip, "spend less", insurance, caregivers, delivery,
"here for you", how it works, testimonials, more to explore, an FAQ, a call-to-action band and a
second footer — all in Amazon Pharmacy's green, under the store's own header. The four testimonials
were written for the assignment and signed with invented names ("Anita F", "Louis D"), each one
describing a prescription service that does not exist: refills chased with a doctor's office,
deliveries to the door, no queue.

Underneath it, the thing this page can actually do is small and useful: Markaz holds 800 drug
labels from the public openFDA database, and it can look one up.

- **Keep:** the search, which matches brand name, generic name and active ingredient — because
  people are told a medication by whichever of the three someone happened to use.
- **Keep:** the two prices. The Plus price is now real: membership lives on the account
  (see §15), so the page marks **which of the two you would actually be quoted** instead of
  showing a member price as bait.
- **Change:** one short page. What it is, the search, the results. `/pharmacy/search` was the same
  search box on a second URL and now redirects here.
- **Change, and this is the important one:** the page says plainly what it is not. Markaz does not
  dispense medication; there is no prescription to upload, nothing to deliver and no pharmacist
  behind the page. And since openFDA publishes labels rather than prices, it says that the two
  figures are generated from the label's own id — stable, so a medication always quotes the same
  price, and illustrative.
- **Change:** each result shows what the label really carries — generic name, dosage form, route,
  the labelling company and the purpose text — rather than a stock photo and a "Add to cart" that
  could not work.
- **Cut:** the fourteen marketing sections, the invented testimonials, the pharmacy-only nav and
  footer, the green chrome, and the composed art.
- **Cut, against the plan:** Rx Saver. It was to be explained rather than removed, but there is
  nothing to explain: it would be a monthly subscription that charges nothing, covering a
  dispensing service that does not exist. The flag behind it (`rxPassEligible`) only recorded
  whether the cash price was under $20, which the price already says.
- **Add:** a few real medication names to start from, so an empty search is not a dead end, and a
  link to the openFDA API the data comes from.

---

## 19. The rest of the account: household, sign-ins, messages, recalls, preferences, data

Six small pages, and between them they held most of what was left of the clone's invented state.

**Household.** Amazon's version offers seats — one adult, four teens, four children — with rules it
describes and this store does not enforce ("every order asks you to approve it first", "child
profiles cannot buy anything"), and sharing switches for Markaz Photos and Plus Reading, which do
not exist. The whole thing lived in `localStorage`, so it belonged to a browser.

- **Change:** a household is now **the people you share Plus delivery with**, stored on the account
  (PLAN §5, item 9). One benefit, because one is what this store has.
- **Change, and this is what makes it real:** `computeQuote` looks for a member who has your email
  in their household with sharing on, and waives your delivery charges too. The benefit is enforced
  where the money is, not printed on a page.
- **Cut:** seats and roles, the approval and spending-limit claims, and sharing for services that do
  not exist. The page states what is *not* shared — payment methods, orders, lists, addresses — and
  that adding an email does not reveal whether that person has an account.

**Devices → Where you're signed in.** The page listed a Fire TV Stick, a Kindle Paperwhite and an
Echo Dot with registration dates, none of which existed, and "deregister" only hid a row in the
current browser.

- **Change:** it lists **the browsers this account has actually signed in from** (PLAN §5, item 11),
  one row per user-agent with the first and last time it was used, and marks the one you are
  reading in.
- **Add:** **"Sign out everywhere" that works.** Every token carries the account's `sessionVersion`;
  the button raises it, so every token issued before that moment is refused on its next request,
  this browser included. The price of it being real rather than a button that clears local state
  is a database read — so the read is shared. One page render calls `auth()` twice, concurrently,
  and every fetch it makes calls it again, which measured as two identical primary-key lookups per
  page view plus one per request after it. `lib/sessionVersion.ts` shares the in-flight read and
  holds the answer for five seconds: one read per account per five seconds, and a sign-out reaches
  a session that is mid-burst inside that window.
- **Cut:** the invented hardware, and per-row deregistration — a row is a note that a sign-in
  happened, not the session itself, so removing one would mean nothing.

**Messages.** Every notice was already derived from orders, which was right, but it was dressed as
an email client: four folders (two of which could never fill — you cannot send Markaz a message and
there are no sellers), sender addresses like `ship-confirm@markaz`, a marketplace dispatch note
inviting you to "reply to this thread", and a Sent folder containing a cancellation letter the
customer never wrote. Read and archive state sat in `localStorage`.

- **Change:** one list, newest first. Each notice is built from a timestamp the order really carries
  — placed, paid, delivered, return requested, refunded. **Dispatch produces no message**, because
  the order records no time for it and a notice needs a date.
- **Change:** "new" is anything since `messagesReadAt` on the account, so it follows you between
  devices; "Mark all as read" writes one timestamp.
- **Cut:** the folders, the fake sender addresses, the seller thread, the Sent letter, and
  archiving — a notice derived from an order cannot be deleted, it would come back.

**Recalls.** The page said "No safety alerts for anything you have ordered" and "if a notice is ever
issued, it shows up here and we email you". Both were untrue: Markaz subscribes to no recall feed
and sends no such email.

- **Change:** it says nothing has been checked, because nothing has. It lists what it *would* check
  — everything you have ordered — and points at the CPSC and FDA, who publish the real notices.

**Shopping preferences.** Fourteen switches across five sections: language, currency, marketing
email, marketing SMS, price-drop alerts, seller messages, reduced motion, larger text, captions,
personalised adverts, third-party advertising data, interest-based email. **One of them did
anything.**

- **Change:** three switches, each of which changes something you can see — remember what I look at
  (already honoured by the product page), reduce motion, and larger text. The last two are applied
  by the server on the first paint, through a cookie that mirrors the account (PLAN §5, item 10),
  so they are right before React runs rather than flickering afterwards.
- **Add:** a "what isn't here" section that says why the rest is gone: Markaz is English and in US
  dollars; it emails you only about things you did; and there are no adverts in this store at all,
  so there is nothing to set a preference about.

**Privacy & data.** Kept its export, which was already real, and lost the queue of "data requests"
it recorded in `localStorage` — the file is built and downloaded in the same request, so there is
nothing to wait for. What Markaz holds is written from the schema, line by line, including the
sign-in records added on this page, and closing the account still needs the checkbox and your email
typed out.

---

## 20. Help

**What Amazon's does badly:** the help centre opens with a navy band, "Hello. What can we help you
with?", a search box over a "help library", and a grid of tiles. Then it offers a chat and a
call-back. The clone's help *content* was already written honestly — checked against this build's
code rather than against Amazon's policies — but the furniture around it was Amazon's, and the copy
had gone stale as the store was rebuilt.

- **Keep:** the eight topics and their articles, which are the genuinely useful part: they describe
  what this build does, in its own words.
- **Fix, because the store moved underneath them:** returns said "within 30 days" when the window is
  now the one the product page promised, per line. Shipping said the charge was "a single flat charge
  applied once per order … currently zero, so every order ships free" when delivery is priced per
  product and a Plus membership waives it. Plus said "not a paid membership in this build. There is
  no subscription to start, pause or cancel" when it is now a real membership that changes the
  total. Shabana was described as answering "from a fixed set of intents" when she is a language
  model grounded in the catalogue.
- **Change:** **your latest order is pinned at the top**, with its status and the three things you
  can do to it. Most visits to a help centre are about one particular order, and the answer is
  usually "open it".
- **Change:** the search narrows the eight topics as you type instead of pretending to query a
  library. Eight topics is a list you read.
- **Change:** the articles get the store's own typography — a lead paragraph, headed sections, a
  related-topics rail — instead of 14px grey text in a 1000px column.
- **Change:** "Was this information helpful?" no longer thanks you for feedback nobody receives. It
  says the answer is not recorded, because there is no support desk to read it, and on a "no" it
  opens Shabana with the question already framed.
- **Cut:** the chat and call-back options, each of which opened a dialog explaining it did nothing.
  One honest panel says there is nobody to call, and offers the one thing that does answer.

---

## 21. Markaz Business and Sell on Markaz

**What Amazon's does badly:** both are marketing pages for products this store does not have, and
the clone reproduced them feature by feature.

Business promised business-only pricing, multi-user accounts with groups and permissions, approval
workflows, spend dashboards with CSV export, tax exemption with certificates on file, shared company
cards and lines of credit, and VAT-ready invoices. **None of it exists.** There was a comparison
table contrasting a personal account with all of it, an FAQ answering questions about approval rules
and credit terms, three testimonials signed "Priya N., Operations lead", "Tom H., Finance manager"
and "Dana R., Practice manager", and a button that created an ordinary shopper account.

Sell promised a seller programme, with registration steps, seller tools and an FAQ — on a store
whose catalogue is seeded from public data and managed in one admin area by one person.

- **Change:** `/business` says there is no business programme, and then does something more useful
  than a feature list: it sets out what a business buyer **can** do with Markaz as it is — buy in
  whatever quantity is stocked, keep an address per site, have every order kept with its totals and
  return window, and take the whole account out as JSON — each with the link to where it happens.
- **Add:** the matching list of what is not here, one line each, saying *why*: every account sees
  the same price, an account is one person, nothing can be routed to an approver, Markaz adds no tax
  so there is nothing to be exempt from, and no payment details exist to share.
- **Cut:** the six invented benefits, the comparison table, the six-question FAQ, the three
  testimonials and the business-account sign-up button.
- **Keep, on `/sell`:** the **fee calculator**, which is the one thing on either page with real
  work in it. It implements both shapes of referral fee — marginal, where each band of the price is
  charged at its own rate, and threshold, where one rate is chosen for the whole price — plus the
  closing fee on media, the per-item fee, and the subscription spread across the units you expect to
  sell. It also computes where the two plans cross over.
- **Change:** the page says up front that Markaz has no sellers, and that the schedule is Amazon's
  published one, linked, used as a worked example rather than quoted as Markaz's own terms.
- **Cut:** the seller hero, the registration steps, the seller tools, the FAQ and the "Start a
  Selling Account" button that only registered a shopper. A link to the admin area replaces it,
  because that is how something really gets into this catalogue.

---

## 22. The pages nobody plans: 404, errors, forbidden, loading

**What Amazon's does badly:** the 404 is a dog photo and a search box, the error page apologises in
the passive voice, and both drop you out of the store's design. The clone's were worse in one
specific way: the global error page — the one that replaces the root layout when the layout itself
throws — was hardcoded in Amazon yellow (`#FFD814` on a `#FCD200` border), which is the one page
that *cannot* import the stylesheet and so was the last place the old brand survived.

- **Change:** every one of them is the store's own empty state — icon, a sentence saying what
  happened, and two or three real ways on. No dog.
- **Change:** the error page says what usually causes it (the database taking too long) and that
  trying again often works, because "something went wrong" on its own tells you nothing about
  whether to wait or leave. The digest is printed as a reference rather than hidden.
- **Change:** the **global error page** is rewritten in inline styles in the Markaz palette, since
  it can rely on neither the stylesheet nor the fonts loading — the wordmark is drawn in type, and
  the purple is the token's value written out.
- **Change:** `forbidden()` says the account is fine and simply has not got the admin role, instead
  of "You don't have access", which reads like an accusation.
- **Add:** loading skeletons shaped like the page they stand in for — browse, the product page,
  orders, and Markaz Movies, whose skeleton is dark because its page is, so it does not flash white
  and then go black.
- **Cut:** `/profile/[...section]`, the catch-all that answered every unknown account URL with
  "this section isn't available in this build yet". Every section the account has is in one list
  now; if a path is not in it, it does not exist, and a 404 is the honest answer.
- **Change:** `/placeholder` was the destination for 56 account links with nothing behind them.
  All 56 are now real pages or gone, so nothing in the store points there. The URL stays for old
  bookmarks and says so, with the full list of what the account does hold.

**Removed with this page:** the last of the pre-redesign components — `ProfileShell`,
`accountLinks` (the placeholder link table), `RecommendationCarousel`, `components/Home/productCard`,
`shared/Accordion`, `shared/AddToCartButton` and `lib/localStore`, the per-browser store that four
pages used to keep their state in.

---

## 23. The admin dashboard

The admin area was rebuilt earlier in the project and its layout is good: a collapsing rail, a
drawer on phones, tables that scroll rather than squash, and every figure read live from the
database. **Nothing about its structure was changed here** — this was a rebrand, as planned.

- **Change:** the colours. Every raw Tailwind palette class across `app/admin` and
  `components/admin` became a Markaz token, so the dashboard shares one palette with the store: the
  revenue chart's bars are the accent purple rather than Amazon's `#febd69`, its gridlines and axis
  labels are `line` and `fg-subtle`, the tables are `surface` on `line`, and the rail is the same
  navy as the storefront header.
- **Change:** the wordmark matches the store's — "markaz" with its purple dot, in the display face,
  with "admin" beside it in the UI face so the two are not confused for one name.
- **Change:** headings take the display face, and the browser tab says "… · Markaz admin".
- **Change:** a new product's default colour swatch was `#232f3e`, Amazon's navy. It is the store's
  own ink now.
- **Note:** `components/admin/product/ProductForm.tsx` is the one file left out of `check:tokens`.
  It holds two hex literals that are *values*, not styling — the default swatch and the fallback for
  an `<input type="color">` — and a colour picker has to speak hex.


---

## What it came to

Twenty-three pages, and the same question at each one: what does Amazon's version do badly for
the person using it?

The answer was usually one of three things.

**It sold what it did not have.** Prime's six benefits, five of which did not exist here.
Business pricing, approval workflows and tax exemption on a store with one kind of account.
A pharmacy with fifteen sections of marketing for a dispensary. A seller programme with no
sellers. Four customer testimonials signed with invented names, and three more on the business
page. The answer, every time, was to say what is really there — and where something *could* be
made real, to make it real instead: Markaz Plus now waives delivery at checkout, lists can hold
products, a registry's "bought" count is a record someone left, and a claim code can be redeemed
because the parser finally matches the codes the store prints.

**It filled the space between you and what you came for.** A sponsored product inside your own
orders. Two recommendation carousels under Buy Again. A "featured deals" carousel above the
deals. A second storefront under a grocery page. The furniture of a shop that sells attention
as well as goods. Markaz sells no advertising, so none of it had a reason to be there.

**It recorded things that were not true.** A membership in `localStorage`. Three devices nobody
owned. "50+ bought in past month" for a period the database does not keep. A deal countdown to
a deadline no deal has. Fourteen preference switches where one did anything. A queue of data
requests that were never queued. Those became either real data or an empty space with a sentence
explaining it.

**What was kept, and why.** Amazon gets plenty right, and copying it there was the correct
answer: the navy chrome, department-scoped search, the fee arithmetic on the seller page, the
claim-code scheme, the privacy model on lists, and the idea that a help centre should be a set
of short articles. Those were restyled and left alone.

### Two places the plan was not followed

- **Saved cards** (`PLAN.md` §5, item 8) were to move into MongoDB as `last4` records. They were
  cut instead. Checkout collects no card details, so a wallet of cards nothing can charge is
  exactly the decorative state the rest of this work removes, and it would have contradicted
  checkout's own copy. §9.
- **Rx Saver** was to be explained rather than removed. There is nothing to explain: it would be
  a monthly subscription that charges nothing, covering a dispensing service that does not exist.
  §18.

### The one thing every page shares

If a number is on the screen, it came out of the database. If it was worked out, it was worked
out on the server, once, by a function that something else also calls — so the cart, the checkout
preview and the order cannot disagree. And if the store cannot do a thing, the page that would
have advertised it says so instead.
