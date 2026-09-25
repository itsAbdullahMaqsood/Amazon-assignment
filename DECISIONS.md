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
