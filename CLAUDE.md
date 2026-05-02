# The Valley of AI — Project Brief

A crowdsourced archive of AI company billboards colonizing Bay Area highways and streets. Spotted, photographed, rated, and archived for posterity.

**Domain:** thevalleyofai.com
**Status:** Prototype built — ready for proper rebuild
**Owner:** Liam (MIS major, building this as a PM portfolio project)

---

## TL;DR — What this is

A satirical-but-informed website that catalogs every AI company billboard around the Bay Area. Users can browse a gallery, see them on a map, and submit ones they spot themselves. Each billboard is rated on four meters (Buzzword Density, Boomer Confusion, Would Actually Try, Memorability).

Think: museum gallery meets Reddit-bait meets Bay Area cultural commentary.

---

## Why this exists (cultural context)

The Bay Area is in the middle of an unprecedented AI advertising boom:

- Billboard rental revenue in SF grew **30% between 2023 and 2025**
- There are **170 billboards along Highway 101** alone (SF, San Mateo, Santa Clara counties)
- The SF Chronicle catalogued every billboard in the city and found **50% advertise AI products**
- One digital billboard near SFO costs **$7,000/week** for an 8-second spot every 64 seconds
- The cultural moment kicked off with **Artisan AI's "Stop Hiring Humans"** campaign in 2024 — a typo-laden billboard ("Stop Hirring Humans") that generated tens of millions of impressions, thousands of death threats, and over $2M in new ARR for Artisan

The locals are tired of it. Journalists are writing about it. Nobody has built the searchable, crowdsourced archive yet.

---

## Target audience

**Primary**
- Bay Area locals frustrated with the AI billboard takeover
- Tech workers who get the in-jokes
- SF Reddit and Twitter culture

**Secondary**
- Journalists covering AI culture (KQED, NPR, SF Standard, Mission Local — all have already written about this)
- Marketers studying outdoor advertising
- Out-of-towners trying to decode SF

---

## Existing landscape (what already exists)

| Project | Type | Format |
|---|---|---|
| Aaron Parecki's blog posts | Personal photo dumps | Blog, not searchable |
| Bill Dybas — "Ads of San Francisco" | Instagram + X | Social posts |
| Wendy Liu — Bay Area Current | Editorial column | Long-form analysis |
| SF Chronicle | One-time investigation | Article |
| SF Standard | "AI billboard cheat sheet" | Article (Feb 2026) |
| NPR / KQED | Audio + reporting | Interviews |

**The gap:** Nobody has built a structured, searchable, crowdsourced, mapped, rated, ongoing archive. That's the opportunity.

---

## Brand & Design System

### Name & Voice
- **Name:** The Valley of AI
- **Voice:** Satirical but informed. Smart, not mean. Curated like a museum, not snarky like a Twitter account.
- **Tone reference:** Think *The New Yorker* doing a piece on B2B SaaS billboards.

### Colors
```
--black: #0b0f1a       /* Deep navy background */
--off-white: #f5f0e8   /* Warm cream text */
--acid: #e8491d        /* International Orange (Golden Gate Bridge) */
--dim: #141928         /* Card backgrounds */
--muted: #2a3352       /* Borders and dividers */
--text-muted: #8a96b0  /* Secondary text */
--card-bg: #0f1420     /* Card body */

/* Meter colors */
--meter-neg: #e8491d      /* Buzzword Density - orange/red */
--meter-comedy: #f59e0b   /* Boomer Confusion - amber */
--meter-pos: #34d399      /* Would Actually Try - green */
--meter-mem: #818cf8      /* Memorability - purple */
```

### Typography
- **Headlines:** Cormorant Garamond (serif, dramatic, museum-feeling)
- **Body:** DM Sans (clean, readable)
- **Data/UI labels:** DM Mono (technical, ironic)

### Aesthetic principles
1. Dark navy background — feels like the Bay at night
2. Orange accent — Golden Gate Bridge, immediately SF
3. Generous whitespace — gallery, not a feed
4. Subtle animations — fade-ups on scroll, hover lifts
5. Italic emphasis on key words ("of *AI*", "Why does this *exist?*")

---

## Design Philosophy (CRITICAL — read before writing any code)

The fastest way to make this site fail is to let it look "AI-generated." That means avoiding the visual language of every other auto-generated landing page on the internet. Specifically:

### Things to NEVER do
- ❌ **Never use these fonts:** Inter, Roboto, Arial, Space Grotesk, system fonts. They're the visual fingerprint of generic AI output.
- ❌ **Never use purple gradients on white backgrounds.** This is the #1 most overused AI-generated design choice.
- ❌ **Never use generic stock layouts** — three feature cards in a row with icons, hero with floating screenshot, "Trusted by these logos" carousel. All dead on arrival.
- ❌ **Never use cookie-cutter shadcn defaults without customization.** The components are fine; the defaults give it away.
- ❌ **Never let the design be "pleasant but forgettable."** That's worse than ugly.

### The aesthetic commitment
**Pick:** Editorial / museum gallery with satirical undertone
**Reference points:** *The New Yorker* digital, MoMA exhibition pages, Pitchfork Best New Music section, Are.na profile pages
**The opposite of:** Stripe-style clean, Linear-style clean, Vercel-style clean, every B2B SaaS landing page from 2020-2025

This site should feel like a curated museum exhibit *about* the AI billboard phenomenon — not another AI startup's website. The irony is the point.

### Five execution principles

**1. Bold typography that has a point of view**
- Cormorant Garamond is the soul of the site. Use it big and italic for emotional moments.
- DM Mono is the deadpan technical label voice. Always uppercase, always letter-spaced, always small.
- DM Sans handles body text — it's a workhorse, not a star.
- The contrast between serif italic ("Why does this *exist?*") and tiny mono labels ("INFESTATION MAP") creates the editorial voice.

**2. Color commitment, not balance**
- The site is 80% deep navy (#0b0f1a), 15% cream text, 5% orange accents.
- The orange is rare and sharp — like a Golden Gate Bridge sighting through fog.
- Don't dilute it. No "lighter orange" variants, no orange backgrounds, no orange buttons everywhere.
- The four meter colors (orange/amber/green/purple) only appear inside meter bars. Never elsewhere.

**3. One orchestrated moment, not scattered effects**
- The page load animation is the single highest-impact moment. Stagger the reveal:
  - Logo fades in (0ms)
  - Title fades up (200ms delay)
  - Subtitle fades up (400ms)
  - Stats count up from 0 (600ms, 1200ms duration)
  - Cards fade up as they scroll into view (one-by-one, 80ms stagger)
- Don't add hover micro-interactions to everything. The page load is the show.

**4. Spatial composition that breaks the grid**
- Cards on a grid — but the hero text is asymmetric (huge serif, narrow column).
- Map section is full-width — it dominates because billboards dominate.
- Leaderboard panels are tight 2x2 grid that breaks visual flow before About.
- The footer is 3-column with right-aligned italic quote — gives the page a closing chord.
- White space is generous between sections (120px+) — this is a gallery, not a feed.

**5. Atmospheric depth, not flat color blocks**
- Cards have a 1px navy-on-navy border + subtle inner glow on hover.
- The hero has a faint Golden Gate Bridge SVG line drawing in the background, very low opacity.
- Map tiles are CartoDB Dark Matter — they have texture, not just dark color.
- Photo cards have a subtle gradient overlay so the location badge stays readable.
- Scroll behavior: a thin orange progress bar at the very top tracks reading position.

### The "would I screenshot this?" test
Every section should pass this test: **would someone screenshot this and post it to Twitter?** If the answer is no, the design isn't done yet. The hero, the cards, the map, and the leaderboard all need to be screenshot-worthy individually.

### Differentiation: what people will remember
The one thing someone will remember after visiting this site:

> *"The one with the four meters that rate Buzzword Density and Boomer Confusion — and the giant italic 'Why does this exist?' question."*

Everything else serves that hook. If a design choice doesn't make the meters or the editorial voice stronger, cut it.

---

## Site Structure

### Sections (in order top to bottom)
1. **Hero** — Title, sub, 4 stats (Billboards Archived, Companies, Avg Buzzword Score, Est. Monthly Spend)
2. **Filter bar** — All / LLMs / Infrastructure / Agents / Dev Tools / SF Streets / Hwy 101 / Hwy 280 / Oakland
3. **Gallery** — Card grid, 3 cols on desktop, 1 col mobile
4. **Map section** — Leaflet map with pins + sidebar list
5. **Leaderboard** — 4 panels (top 3 by each meter)
6. **About** — "Why does this exist?" + project history
7. **Submit form** — Submit a billboard
8. **Footer** — 3-column layout (logo + tagline, nav, quote)

### Navigation
- Sticky top nav: Logo (left), section links (center), "Spot One →" CTA (right)
- Filter bar sticks below nav when scrolling gallery

---

## Card Design

Each billboard card has:

```
┌─────────────────────────────────┐
│  [PHOTO]              [LOCATION]│  ← Image with location badge top-right
│                       [📸 REAL] │  ← Real photo badge top-left if applicable
├─────────────────────────────────┤
│  Company Name                   │  ← Cormorant Garamond, 22px
│  LOCATION · DATE SPOTTED        │  ← DM Mono, 10px, muted
│                                 │
│  | "Tagline" — editorial note   │  ← Italic, orange left border
│                                 │
│  ┌───────────┬───────────┐     │
│  │ Buzzword  │ Boomer    │     │  ← 2x2 meter grid
│  │ ████░ 8.5 │ ████░ 9.0 │     │
│  ├───────────┼───────────┤     │
│  │ Try       │ Memory    │     │
│  │ ███░░ 4.0 │ ████░ 7.5 │     │
│  └───────────┴───────────┘     │
│                                 │
│  Times spotted        ▲ Spot    │  ← Footer with vote button
│                       289 spots │
└─────────────────────────────────┘
```

Click anywhere on card → opens modal with full details and larger meters.

---

## Initial Billboard Data

Use this as the seed data for the rebuild:

| Company | Location | Tagline | Buzzword | Boomer | Try | Memory | Spots |
|---|---|---|---|---|---|---|---|
| Anthropic | Hwy 101 N · Millbrae | "AI for the long-term benefit of humanity" | 6.0 | 5.0 | 6.5 | 7.0 | 142 |
| Scale AI | Harrison St · SoMa, SF | "The enterprise AI platform" | 8.5 | 9.0 | 4.0 | 6.0 | 289 |
| NVIDIA | Hwy 280 N · Redwood City | "Powering the AI revolution" | 4.5 | 3.0 | 7.5 | 8.5 | 97 |
| Mistral AI | Market St · Civic Center, SF | "La liberté, l'intelligence." | 9.2 | 9.8 | 3.5 | 9.0 | 334 |
| Perplexity | Hwy 101 S · Near SFO | "Ask anything" | 7.8 | 7.0 | 6.0 | 7.5 | 201 |
| Cohere | I-880 · Oakland | "Enterprise AI for the real world" | 7.0 | 9.5 | 3.0 | 4.5 | 156 |
| Framer | SoMa · SF | "Hey designers, it's your time to ship" | 3.5 | 4.0 | 8.0 | 8.5 | 88 |
| Mux | SoMa · SF | "Video API for the Internet" | 5.0 | 8.5 | 5.5 | 7.0 | 64 |

Editorial notes (these go below the tagline as commentary):
- **Anthropic:** "Spotted above a Salesforce ad. The irony is not lost."
- **Scale AI:** "Adjacent to a payday loan shop on Harrison. Peak SoMa."
- **NVIDIA:** "They are not wrong. That's what makes it unsettling."
- **Mistral AI:** "In French. On Market Street. Facing a Walgreens."
- **Perplexity:** "Directly next to a Google billboard. The audacity."
- **Cohere:** "Who commutes on 880 deciding to buy enterprise AI."
- **Framer:** "Spotted right next to an AI agent ad. The juxtaposition is doing heavy lifting."
- **Mux:** "Hot pink on a cloudless SF sky. Bold color choice, zero buzzwords. Respect."

---

## The Four Meters

### 1. Buzzword Density (negative — orange/red)
How many meaningless tech words per sentence. "Disrupting the future of AI-native enterprise infrastructure" = 10/10.

### 2. Boomer Confusion Index (comedy — amber)
Would your grandma understand what this product does? "Powering the AI revolution" = low. "La liberté, l'intelligence" in French = 9.8/10.

### 3. Would Actually Try (positive — green)
Based on the billboard alone, would you sign up for this product? Solid pitches score high.

### 4. Memorability (positive — purple)
Would you remember this billboard an hour later? Bold visual choices and clear messaging score high.

---

## Map Section

### Specs
- **Library:** Leaflet.js 1.9.4
- **Tiles:** CartoDB Dark Matter (`https://{s}.basemaps.cartocdn.com/dark_matter/{z}/{x}/{y}{r}.png`)
  - Critical: do NOT use OpenStreetMap with a CSS filter — tiles fail to load on production
- **Center:** `[37.75, -122.28]` (Bay Area center)
- **Zoom:** 10 (shows from SF down to San Mateo)
- **Scroll wheel zoom:** disabled (so users don't accidentally zoom while scrolling page)
- **Custom markers:** SVG pins in three colors
  - `#e8491d` (orange) = confirmed
  - `#f59e0b` (amber) = on Hwy 101
  - `#ef4444` (red) = high density area
- **Sidebar:** Right side, 260px wide, lists all sightings with mini buzzword bar
- **Popup:** Custom dark theme, shows company + location + tagline + buzzword score
- **Mobile:** Hide sidebar, full-width map

### Map data (mapPins array)
```js
[
  { company: 'Anthropic', lat: 37.600, lng: -122.386, ... },
  { company: 'Scale AI', lat: 37.778, lng: -122.402, ... },
  { company: 'NVIDIA', lat: 37.485, lng: -122.236, ... },
  { company: 'Mistral AI', lat: 37.779, lng: -122.419, ... },
  { company: 'Perplexity', lat: 37.621, lng: -122.379, ... },
  { company: 'Cohere', lat: 37.804, lng: -122.272, ... },
]
```

---

## Submission Form

### Critical decision: USE AIRTABLE, NOT NETLIFY FORMS

**Why:** Netlify Forms requires their build system to detect the form. Drag-and-drop deploys skip that step. Plus Netlify Forms doesn't handle photo uploads on the free tier.

**Airtable solves both** — handles photos up to 1GB total storage, gives a beautiful form, and creates a real database for managing submissions.

### Setup
1. Create Airtable base "Valley of AI Submissions"
2. Table fields:
   - Company Name (text)
   - Location (text)
   - Highway/Street (single select)
   - Tagline (text)
   - Category (single select)
   - Notes (long text)
   - Photo (attachment)
   - Status (single select: Pending/Approved/Rejected)
   - Date Submitted (created time)
3. Create a Form view → share publicly → embed in site

### Form fields (in order)
- Company Name
- Location
- Tagline / Copy
- Category dropdown
- Highway/Street dropdown
- Notes (optional)
- Photo upload

**Do NOT include:** Buzzword Density, Boomer Confusion, etc. — these are curator-set, not user-submitted.

---

## Tech Stack

### Recommended
- **Framework:** Vite + vanilla JS (or React if preferred — both work)
- **Styling:** Plain CSS with custom properties (no Tailwind, keeps it lean)
- **Map:** Leaflet 1.9.4
- **Submissions:** Airtable form embed or Airtable API
- **Hosting:** Netlify (connect via GitHub for proper deploys)
- **Domain:** Namecheap → point to Netlify
- **Analytics:** Plausible or Google Analytics 4

### File structure (suggested)
```
thevalleyofai/
├── src/
│   ├── index.html
│   ├── styles/
│   │   ├── main.css
│   │   ├── cards.css
│   │   ├── map.css
│   │   └── form.css
│   ├── scripts/
│   │   ├── main.js
│   │   ├── map.js
│   │   ├── modal.js
│   │   ├── leaderboard.js
│   │   └── filter.js
│   └── data/
│       └── billboards.json
├── public/
│   └── images/
│       └── billboards/  (real photos go here)
├── netlify.toml
├── package.json
└── README.md
```

### Critical lessons learned (avoid these)
1. **Never embed photos as base64 in the HTML** — file gets huge, downloads truncate. Host them in `/public/images/` and reference by URL.
2. **Don't use OSM tiles with CSS filter inversion** — breaks on production. Use CartoDB Dark Matter natively.
3. **Don't try Netlify Forms with drag-and-drop deploys** — they don't get registered. Use Airtable.
4. **Always set `pointer-events: none` on card image children** — otherwise clicks don't reach the card's onclick handler.
5. **Add a safety check in openModal:** `if (!b) return;` — prevents crashes when array indices mismatch.
6. **Map needs `min-height` set explicitly** — otherwise Leaflet renders 0px tall.

---

## Phases

### Phase 1: Build (current → 1 week)
- Rebuild in VS Code with Claude Code
- Get all sections working locally
- Connect Airtable form
- Deploy to Netlify via GitHub

### Phase 2: Content (1–2 weeks)
- Drive 101, 280, BART, SoMa, Market St
- Take 20–30 real billboard photos
- Add to Airtable / hardcode into site
- Replace placeholder photos in cards

### Phase 3: Polish (3–5 days)
- Mobile testing on actual phone
- Add Google Analytics
- Set up favicon, OG image, meta tags
- Test submission flow end-to-end

### Phase 4: Launch (1 day)
- Buy thevalleyofai.com domain
- Connect to Netlify
- Post to r/sanfrancisco
- Wait 24 hours, post to r/bayarea + r/artificial
- Day 3: LinkedIn case study post
- Week 2: r/startups, r/mildlyinfuriating

### Phase 5: Iterate (ongoing)
- Approve submissions in Airtable
- Add new cards weekly
- Track traffic, write up case study
- Pitch SF Standard / Mission Local once 50+ submissions

---

## Outreach List (pre-launch)

These people are already invested in this niche — DM them with a preview link before going public:

- **Aaron Parecki** (aaronparecki.com) — Director of Identity Standards at Okta, IndieWebCamp founder, photographs 101 billboards on his Lyft rides
- **Bill Dybas** (Ads of San Francisco on Instagram/X) — Software engineer chronicling SF tech ads
- **Wendy Liu** (Bay Area Current, "B2B Slop" column) — Author of *Abolish Silicon Valley*

DM template: *"Hey, I'm a fan of [their project]. I built a structured archive of Bay Area AI billboards inspired by what you've been doing — would love your feedback before posting publicly. [link]"*

---

## Launch Copy (Reddit)

### r/sanfrancisco title
"I've been cataloguing every AI billboard taking over Bay Area highways and rating them by buzzword density"

### Post body
> So I noticed a few months ago that pretty much every billboard on 101 between SFO and SF is now an AI startup. Wanted to actually count and document them, so I built a site for it.
>
> It's called The Valley of AI. Each billboard gets a Buzzword Density score, a Boomer Confusion Index, and ratings for Memorability and Would Actually Try. There's a map showing where they all are.
>
> A few findings so far:
> - Mistral AI put up a French billboard on Market Street facing a Walgreens (9.2 buzzword, 9.8 boomer confusion)
> - Cohere has billboards on I-880 in Oakland (would actually try: 3.0/10, who is buying enterprise AI on the way to Oakland)
> - The "Stop Hiring Humans" Artisan AI campaign basically started this whole era in 2024
>
> [thevalleyofai.com]
>
> If you spot a new one anywhere in the Bay, there's a submit form with photo upload.

---

## PM Resume Framing

> **The Valley of AI** — thevalleyofai.com
> A crowdsourced archive of AI company billboards across the Bay Area
> - Identified gap in fragmented documentation of a cultural phenomenon (50%+ of SF billboards are now AI ads)
> - Conducted user research with 10+ Bay Area locals on what makes AI advertising memorable vs alienating
> - Designed and shipped MVP using vanilla JS, Leaflet, and Airtable; deployed via Netlify
> - Drove [X] unique visitors in first 2 weeks via targeted Reddit posts; received [Y] crowdsourced submissions
> - Iterated on rating system based on user feedback (added Memorability and Would Actually Try after testing)

---

## What success looks like

**Minimum viable success:**
- Site live at thevalleyofai.com
- 30+ real billboards in the archive
- 100+ unique visitors from Reddit launch
- 10+ user submissions

**Real success:**
- 5,000+ visitors in launch week
- Featured in SF Standard or Mission Local
- 50+ user submissions
- Aaron Parecki or Bill Dybas reposts it

**Long tail success:**
- Becomes the canonical reference when someone wants to talk about this era
- Used as example in PM/design portfolio interviews
- Cited in a journalism piece about AI advertising

---

## Open questions for the rebuild

These need decisions before/during the Claude Code rebuild:

1. **React or vanilla?** Vanilla is simpler and the prototype works. React is overkill for this scope but enables easier component reuse if it grows.
2. **Static JSON or Airtable as source of truth?** Easiest is to hardcode billboards in a JSON file and update via PRs. More dynamic is to fetch from Airtable on page load.
3. **Should "Spot" votes persist?** Currently they reset on page refresh. Could use localStorage or Airtable to make them persistent.
4. **Photo hosting?** Cloudinary (free 25GB), Imgur (free, less reliable), or just `/public/images/` in the repo.
5. **Should the form require email?** No email = lower friction. With email = ability to credit submitters.

---

## Reference assets

- **Prototype HTML file:** This is what was built in chat — has all the design decisions baked in. Use as visual reference for the rebuild.
- **Color palette:** See "Brand & Design System" above
- **Editorial voice samples:** See "Editorial notes" in the billboard data table

---

## Final thought

This project's value compounds over time. Every billboard that comes down — and they cycle every 2–4 weeks — only exists in your archive. In two years, this becomes a historical document of what 2025–2026 SF looked like. That's the long-term play.

Ship the v1 fast, get it indexed by Google, and let the archive grow from there.
