# React Engineering Bootcamp — Stage 1: Why React Exists & How the Web Works Internally

## Before We Write a Single Line of React...

Most tutorials skip straight to `npm create vite@latest` and start writing JSX. That's a mistake. To become a real frontend engineer — not just someone who copies components from Stack Overflow — you need to understand why React was built, what problem it solves, and how browsers actually work. Everything we do in React makes sense once you understand the machine it runs on.

---

## 1.1 — How a Browser Renders a Web Page

When a user visits a URL, here's exactly what happens under the hood:

```
User types URL → DNS resolves IP → TCP Handshake → HTTP Request
→ Server responds with HTML → Browser starts parsing
```

Once the HTML arrives, the browser follows the **Critical Rendering Path**:

```
HTML Parsing → DOM Tree
CSS Parsing  → CSSOM Tree
             ↓
        Render Tree (DOM + CSSOM combined)
             ↓
          Layout (calculate position/size of every element)
             ↓
          Paint (fill pixels on screen)
             ↓
        Compositing (layer management for GPU)
```

### What is the DOM?

**DOM** stands for **Document Object Model**. The browser converts HTML into a **tree of JavaScript objects** in memory, where each HTML element becomes a **node**.

```html
<div id="app">
  <h1>Hello World</h1>
  <p>This is a paragraph</p>
</div>
```

Becomes:

```
Document
  └── html
        ├── head
        └── body
              └── div#app
                    ├── h1  → "Hello World"
                    └── p   → "This is a paragraph"
```

Every node is a **live JavaScript object** you can access and mutate:

```javascript
const heading = document.querySelector('h1');
heading.textContent = 'Hello, Changed!';
heading.style.color = 'red';
```

This works. So why not just do this everywhere?

---

## 1.2 — The Problem with Vanilla JavaScript at Scale

Consider a Twitter-like feed with 100 tweets, like buttons, a real-time counter, filters, and search. In vanilla JS:

```javascript
let tweets = [
  { id: 1, text: "Hello world", likes: 0, liked: false },
  { id: 2, text: "React is great", likes: 5, liked: false },
];

function renderTweets(list) {
  const container = document.getElementById('tweet-container');
  container.innerHTML = ''; // Wipe everything

  list.forEach(tweet => {
    const div = document.createElement('div');
    div.className = 'tweet';
    div.innerHTML = `
      <p>${tweet.text}</p>
      <span>${tweet.likes} likes</span>
      <button onclick="handleLike(${tweet.id})">Like</button>
    `;
    container.appendChild(div);
  });
}

function handleLike(id) {
  const tweet = tweets.find(t => t.id === id);
  tweet.likes++;
  tweet.liked = true;
  renderTweets(tweets); // ← Problem is here
}
```

### What's Wrong Here?

Calling `renderTweets()` does `container.innerHTML = ''` — it **destroys and rebuilds the entire DOM** just because one like count changed. This causes:

- **Performance cost** — Browser recalculates layout and repaints ALL 100 tweets, even though only 1 changed.
- **Lost browser state** — Input focus, scroll position, and text selection are destroyed.
- **Complexity explosion** — You must manually track what changed, what depends on what, and what needs to re-render.

This is called **imperative UI programming**. It works for small apps. It becomes an unmaintainable nightmare at scale.

```javascript
// Real vanilla JS code in a production app — actual pain
function updateUserProfile(user) {
  document.getElementById('username').textContent = user.name;
  document.getElementById('header-username').textContent = user.name;
  document.getElementById('sidebar-username').textContent = user.name;
  document.getElementById('notif-username').textContent = user.name;
  // Did I miss anything? I don't know. The app might be broken.
}
```

You're **manually synchronizing data → UI** everywhere. Miss one element? Bug.

---

## 1.3 — The Fundamental Insight Behind React

In 2011, Facebook's engineers faced this exact problem building News Feed and chat. They asked:

> *"What if we didn't think about how to update the UI — what if we just described what the UI should look like for any given data state, and let the system figure out the updates?"*

This shift is **declarative programming**:

```javascript
// IMPERATIVE (old way) — describe HOW to change things
document.getElementById('count').textContent = likes + 1;
document.getElementById('count').style.color = 'red';

// DECLARATIVE (React way) — describe WHAT the UI should look like
function LikeButton({ likes }) {
  return (
    <div>
      <span style={{ color: likes > 0 ? 'red' : 'gray' }}>
        {likes} likes
      </span>
    </div>
  );
}
```

In the declarative model: *"Given this data, this is what the UI should look like."* When data changes, you describe the new UI. **React handles making the minimum necessary changes to the actual DOM.**

This is the **core philosophy of React**.

---

## 1.4 — What is the Virtual DOM?

Directly manipulating the real DOM is expensive — it triggers layout recalculations, repaints, and compositing. React's solution: **the Virtual DOM**.

The Virtual DOM is a **lightweight JavaScript object representation** of what the real DOM should look like — a blueprint stored in memory.

```
Real DOM:                     Virtual DOM (React's internal copy):
(lives in browser)            (lives in JavaScript memory)

<div id="app">                { type: 'div', props: { id: 'app' }, children: [
  <h1>Hello</h1>       →        { type: 'h1', props: {}, children: ['Hello'] },
  <p>World</p>                  { type: 'p',  props: {}, children: ['World'] }
</div>                        ]}
```

Creating and comparing plain JS objects is **extremely fast** — much faster than touching the actual DOM.

### The Reconciliation Process (Diffing Algorithm)

```
Step 1: Initial render
  → React creates Virtual DOM Tree (A)
  → React renders this to the real DOM

Step 2: Data changes (e.g., like count updates)
  → React creates a NEW Virtual DOM Tree (B) from scratch

Step 3: Diffing
  → React compares Tree A vs Tree B
  → Finds only the nodes that changed

Step 4: Reconciliation
  → React updates ONLY those specific real DOM nodes
  → Everything else is untouched
```

### Example — Tweet Like Update

```
Before (Tree A):           After (Tree B):
<div class="tweet">        <div class="tweet">
  <p>Hello world</p>         <p>Hello world</p>        ← same, skip
  <span>0 likes</span>       <span>1 like</span>       ← DIFFERENT, update
  <button>Like</button>      <button>Like</button>      ← same, skip
</div>                     </div>
```

React identifies only the `<span>` text changed and makes **exactly one DOM update**. This is called **minimal reconciliation**.

### Mental Model

```
Your Data (State)
      ↓
React re-runs your component functions
      ↓
Produces a new Virtual DOM tree
      ↓
Diffs with previous Virtual DOM tree
      ↓
Calculates minimum changes needed
      ↓
Applies those changes to the real DOM
      ↓
Browser repaints only what changed
```

---

## 1.5 — Component-Based Architecture

A **component** is a self-contained, reusable unit of UI — like a custom HTML element with its own structure, styling, and behavior.

### Example — Decomposing a Twitter-like Page

```
┌─────────────────────────────────────────┐
│  App                                    │
│  ┌──────────────────────────────────┐   │
│  │  Header                          │   │
│  │  ┌─────────┐  ┌──────────────┐  │   │
│  │  │  Logo   │  │  SearchBar   │  │   │
│  │  └─────────┘  └──────────────┘  │   │
│  └──────────────────────────────────┘   │
│  ┌──────────────────────────────────┐   │
│  │  TweetFeed                       │   │
│  │  ┌────────────────────────────┐  │   │
│  │  │  Tweet                     │  │   │
│  │  │  ┌──────────┐ ┌─────────┐ │  │   │
│  │  │  │  Avatar  │ │ Content │ │  │   │
│  │  │  └──────────┘ └─────────┘ │  │   │
│  │  │  ┌────────────────────────┐ │  │   │
│  │  │  │    LikeButton          │ │  │   │
│  │  │  └────────────────────────┘ │  │   │
│  │  └────────────────────────────┘  │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

Each component:
- Has **one clear responsibility**
- Can be **developed and tested in isolation**
- Can be **reused** anywhere in the app
- Manages its own internal state OR receives data from its parent

Instead of thinking about pages as monolithic HTML files, you think about them as **compositions of small, predictable, reusable pieces**.

---

## 1.6 — Single Page Applications (SPAs)

### Traditional Multi-Page App (MPA)

```
User clicks link
    ↓
Browser makes full HTTP request to server
    ↓
Server responds with a complete new HTML page
    ↓
Browser tears down current page
    ↓
Renders new page from scratch
    ↓
User sees a flash/white screen during transition
```

### Single Page Application (SPA)

```
Initial load: Browser downloads one HTML file + JavaScript bundle
    ↓
JavaScript takes over — React mounts and controls the entire page
    ↓
User "navigates" → JavaScript intercepts, swaps components in memory
    ↓
Fetches only data (JSON) from server, not full HTML pages
    ↓
Updates only the parts of the UI that changed
    ↓
URL changes (via History API) — feels like navigation, no page reload
```

Gmail, Figma, Notion, and Twitter are all SPAs. The page never actually reloads — JavaScript orchestrates everything.

### Trade-offs

| Aspect | Multi-Page App | Single Page App |
|--------|---------------|-----------------|
| Initial load | Fast (small HTML) | Slower (large JS bundle) |
| Navigation | Full reload (slower) | Instant (no reload) |
| SEO | Excellent out of box | Needs extra work (SSR) |
| App feel | Page-by-page | App-like, smooth |
| Complexity | Simpler to start | More complex architecture |

> React is predominantly used for SPAs. Modern meta-frameworks like **Next.js** solve the SEO problem by adding server-side rendering on top.

---

## 1.7 — Mental Model Summary: How React Works End-to-End

```
┌─────────────────────────────────────────────────────────────────┐
│                        YOUR REACT APP                           │
│                                                                 │
│  State (data)  →  Components (functions)  →  JSX (UI blueprint) │
│       ↑                                           │             │
│       │                                           ↓             │
│  User Events                              Virtual DOM Tree      │
│  API Responses                                    │             │
│  Timers etc.                                      ↓             │
│                                              Diffing Engine     │
│                                                   │             │
│                                                   ↓             │
│                                         Minimal DOM Updates     │
│                                                   │             │
│                                                   ↓             │
│                                       Browser paints changes    │
└─────────────────────────────────────────────────────────────────┘
```

### Key Takeaways from Stage 1

- The **DOM** is a tree of JavaScript objects the browser maintains in memory
- Directly manipulating the DOM at scale is **slow and architecturally messy**
- React introduces **declarative UI** — you describe *what* the UI should be, not *how* to change it
- The **Virtual DOM** is a cheap JS object copy of the real DOM used for efficient diffing
- React only updates the **real DOM nodes that actually changed**
- **Components** are reusable, self-contained UI units — the fundamental building block
- **SPAs** load once and use JavaScript to simulate navigation — enabling app-like experiences