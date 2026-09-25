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

Old URLs redirect permanently. Pages share one shell through route groups (`app/(store)`,
`app/(auth)`) instead of each page importing its own header and footer.

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
