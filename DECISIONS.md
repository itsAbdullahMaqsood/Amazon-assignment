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
