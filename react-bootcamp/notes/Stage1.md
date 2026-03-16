# React Engineering Bootcamp — Stage 1: Why React Exists & How the Web Works Internally

> **Goal of this stage:** Build the mental foundation that makes every React concept make sense.
> Before writing a single line of React, understand the machine it runs on — the browser — and the exact
> problems React was engineered to solve. Without this foundation, React feels like magic.
> With it, React feels inevitable.

---

## Before We Write a Single Line of React...

Most tutorials skip straight to `npm create vite@latest` and start writing JSX. That's a mistake.

To become a **real frontend engineer** — not just someone who copies components from Stack Overflow — you need to understand:
- Why React was built in the first place
- What specific problem it solves
- How browsers actually work under the hood
- Why the solutions React uses are clever and necessary

Everything in React makes sense once you understand the machine it runs on. Let's build that foundation now.

---

## 1.1 — How a Browser Renders a Web Page

### The Full Journey: URL to Pixels

When a user types a URL and hits Enter, an enormous chain of events occurs before they see anything on screen. Here's the complete picture:

```
User types URL in browser
        ↓
DNS Resolution
  → Browser asks a DNS server: "What IP address is google.com?"
  → DNS responds: "It's 142.250.80.46"
  → (DNS is like a phone book for the internet)
        ↓
TCP Handshake (3-way)
  → Browser: "SYN" (I want to connect)
  → Server:  "SYN-ACK" (I accept, are you ready?)
  → Browser: "ACK" (Ready, let's go)
  → Secure connection established
        ↓
TLS Handshake (for HTTPS)
  → Certificate verification
  → Encryption keys exchanged
  → All data will now be encrypted in transit
        ↓
HTTP GET Request sent to server
  → "GET /index.html HTTP/1.1"
  → Headers: browser type, accepted formats, cookies, etc.
        ↓
Server processes request
  → Could be static file serving, or dynamic generation
  → Responds with HTML, status code 200
        ↓
Browser receives HTML bytes
  → Starts parsing immediately — doesn't wait for full download
  → This is called "streaming parsing"
```

### The Critical Rendering Path

Once HTML starts arriving, the browser executes the **Critical Rendering Path** — a specific sequence of steps to convert raw bytes into visible pixels:

```
Step 1: HTML Parsing → DOM Tree
  → Browser reads HTML bytes character by character
  → Builds a tree of objects representing the document structure
  → When it encounters <script> tags, parsing may pause (more on this below)
  → When it encounters <link rel="stylesheet">, it fetches CSS

Step 2: CSS Parsing → CSSOM Tree
  → Browser parses all CSS (inline, embedded, external stylesheets)
  → Builds the CSSOM (CSS Object Model) — a tree of style rules
  → This is separate from the DOM tree

Step 3: DOM + CSSOM → Render Tree
  → The two trees are combined into the Render Tree
  → Only visible elements are included (display:none elements excluded)
  → Each node in the Render Tree knows its content AND its styles

Step 4: Layout (also called "Reflow")
  → Browser calculates the exact position and size of every element
  → Takes into account: viewport size, CSS box model, floats, flex, grid
  → Outputs: x/y coordinates and dimensions for every visible element
  → This is computationally expensive

Step 5: Paint
  → Browser fills in actual pixels based on Layout results
  → Creates paint records: "draw this rectangle at x,y in color #fff"
  → Handles text, colors, images, borders, shadows
  → Multiple paint layers may be created

Step 6: Compositing
  → Multiple painted layers combined in the correct order
  → GPU-accelerated: uses graphics card for performance
  → Handles: opacity, transforms, z-index stacking
  → Final result: what you see on screen
```

**Why does this matter for React?**
Because any time you change the DOM — add, remove, or modify elements — the browser may need to redo parts of this process. Layout recalculation (Step 4) is especially expensive. This is exactly why naive JavaScript that rebuilds the DOM constantly is slow, and why React's approach of minimizing DOM changes is so valuable.

### What Triggers Layout Recalculation (Reflow)?

These DOM operations force the browser to recalculate layout — they are expensive:

```javascript
// Reading these properties forces layout recalculation:
element.offsetWidth
element.offsetHeight
element.getBoundingClientRect()
element.scrollTop
window.getComputedStyle(element)

// Modifying these forces layout for affected elements:
element.style.width = '200px'
element.style.margin = '10px'
document.body.appendChild(newElement)
element.className = 'new-class'
```

**"Layout thrashing"** occurs when you repeatedly read then write layout properties in a loop — forcing the browser to recalculate layout on every iteration. This is one of the most common performance pitfalls in vanilla JavaScript apps.

---

### What is the DOM?

**DOM = Document Object Model**

When the browser parses your HTML, it does NOT store the HTML as text in memory. It converts it into a **tree of live JavaScript objects**. Each HTML element, text node, and attribute becomes a **node** in this tree.

Given this HTML:

```html
<div id="app">
  <h1>Hello World</h1>
  <p>This is a paragraph</p>
</div>
```

The browser creates this object tree in memory:

```
Document (root object)
  └── <html>
        ├── <head>
        │     └── (meta, title, link tags...)
        └── <body>
              └── <div id="app">              ← Element Node
                    ├── <h1>                  ← Element Node
                    │     └── "Hello World"   ← Text Node
                    └── <p>                   ← Element Node
                          └── "This is..."    ← Text Node
```

**Key properties of DOM nodes:**

Each node is a real JavaScript object with properties and methods. For example, an element node has:

```
nodeName         → "DIV", "H1", "P", etc.
nodeType         → 1 (Element), 3 (Text), 8 (Comment), etc.
parentNode       → reference to parent node
childNodes       → NodeList of children
firstChild       → first child node
textContent      → text content of element and descendants
innerHTML        → HTML markup inside element
style            → inline CSS styles object
classList        → class names as a DOMTokenList
attributes       → element's attributes
addEventListener → attach event listeners
getBoundingClientRect → get size and position
```

**The DOM is "live"** — meaning it's not a snapshot. When you change a DOM node, that change is immediately reflected in the browser. The DOM is the bridge between your JavaScript code and what users see.

### Accessing and Mutating the DOM Directly

Every node in the DOM tree is a live JavaScript object that you can access and change:

```javascript
// Selecting elements
const heading = document.querySelector('h1');
const allParagraphs = document.querySelectorAll('p');
const appDiv = document.getElementById('app');

// Reading from the DOM
console.log(heading.textContent);    // "Hello World"
console.log(heading.offsetHeight);   // height in pixels

// Mutating the DOM
heading.textContent = 'Hello, Changed!';
heading.style.color = 'red';
heading.classList.add('active');

// Creating and adding new elements
const newParagraph = document.createElement('p');
newParagraph.textContent = 'I was created by JavaScript';
document.body.appendChild(newParagraph);

// Removing elements
const oldElement = document.getElementById('old');
oldElement.parentNode.removeChild(oldElement);
// or: oldElement.remove();
```

This works. The DOM APIs are powerful. So why isn't this enough for building modern web apps?

---

## 1.2 — The Problem with Vanilla JavaScript at Scale

### A Realistic Example

Let's say you're building a Twitter-like feed. You have:
- A list of 100 tweets
- A like button on each tweet
- A real-time counter showing total likes
- A filter to show only liked tweets
- A search bar that filters tweets as you type
- A header showing your username
- A sidebar with related accounts

In vanilla JavaScript, a typical approach looks like this:

```javascript
// This is the old way — and it gets ugly fast

let tweets = [
  { id: 1, text: "Hello world", likes: 0, liked: false },
  { id: 2, text: "React is great", likes: 5, liked: false },
  // ... 98 more
];

function renderTweets(list) {
  const container = document.getElementById('tweet-container');
  container.innerHTML = ''; // ← WIPE EVERYTHING

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

  renderTweets(tweets); // ← RE-RENDER EVERYTHING because 1 thing changed
}
```

### What Exactly Goes Wrong Here

**Problem 1: Nuclear Option Rendering**

`container.innerHTML = ''` is the nuclear option — it obliterates and rebuilds the **entire** 100-tweet list every time a single like count changes. The browser must:
- Destroy 100 tweet DOM subtrees (each with multiple child elements)
- Create 100 new div elements
- Create 200+ child elements (paragraph, span, button per tweet)
- Recalculate layout for all of them
- Repaint the entire section

All of this because **one number changed**.

**Problem 2: Lost Browser State**

Destroying and recreating DOM nodes loses **all browser-managed state**:

```
Before re-render:
  - User was typing in a reply box → text is gone
  - User had scrolled to tweet #47 → scroll jumps back to top
  - A dropdown menu was open → it closes
  - Text was selected → selection lost
  - An input had focus → focus lost, keyboard may disappear on mobile
```

These are real UX bugs. You might not even realize they're happening until a user reports them.

**Problem 3: Performance Death by a Thousand Cuts**

Each DOM operation has a cost. Layout thrashing occurs when you repeatedly trigger layout recalculation. With 100 tweets being recreated on every like:

```
Like tweet #1 → full re-render (100 DOM creates + layout + paint)
Like tweet #2 → full re-render (100 DOM creates + layout + paint)
Filter to "liked" → full re-render
Type one character in search → full re-render
Type second character → full re-render
...
```

On a modern machine this might feel okay. On a low-end Android phone or slow laptop, this causes visible jank (dropped frames, lag).

**Problem 4: Complexity Explosion as App Grows**

As a real app grows, the manual synchronization problem explodes. Here's what a real medium-sized app looks like:

```javascript
// Real vanilla JS code in a production app — actual pain
function updateUserProfile(user) {
  // Update the profile page
  document.getElementById('username').textContent = user.name;
  document.getElementById('avatar').src = user.avatar;
  document.getElementById('bio').textContent = user.bio;
  document.getElementById('follower-count').textContent = user.followers;

  // But the header ALSO shows the username
  document.getElementById('header-username').textContent = user.name;

  // And the sidebar
  document.getElementById('sidebar-username').textContent = user.name;
  document.getElementById('sidebar-avatar').src = user.avatar;

  // And the notification panel
  document.getElementById('notif-username').textContent = user.name;

  // And the tweet compose box
  document.getElementById('compose-avatar').src = user.avatar;

  // Did I miss anything? I genuinely don't know.
  // There's no way to be sure without auditing the entire codebase.
}
```

**You are manually synchronizing data → UI everywhere.** The bugs this produces:
- Miss one element → it shows stale data → user sees inconsistency
- Add a new UI element that shows the username → must remember to add it to every function that updates the user
- Another developer updates the user object but doesn't know about all these DOM queries → silent bugs
- Rename an element's id in HTML → break every JavaScript reference to it → no warning, just broken

### The Core Problem: Imperative UI Programming

This style of code is called **imperative programming** — you describe the exact *how*:

```
"Find this element."
"Change its text to this."
"Find this other element."
"Change its color."
"Find the container."
"Clear it."
"Build new elements."
"Attach event listeners."
"Append them."
```

You're micromanaging the DOM. You're a construction foreman who has to tell every worker exactly what to move, nail, and paint — and keep track of everything manually.

This is fine for a 3-page brochure website. It becomes an **unmaintainable nightmare** once you have:
- Multiple components showing the same data
- Data that changes over time (real-time updates, API responses)
- Complex interdependencies (changing X should update Y and Z)
- A team of developers working on the same codebase

### What This Was Like In Practice (Pre-React)

Before React, large apps used frameworks like **Backbone.js**, **AngularJS (v1)**, **Knockout.js**, or just raw jQuery. They all had different approaches to the same problem, but none of them solved it cleanly:

```
jQuery approach (early 2010s):
  → Global state scattered everywhere
  → "Callback hell" — deeply nested callbacks
  → No structure — every project organized differently
  → DOM manipulation everywhere, inconsistent patterns

Backbone.js:
  → Models + Views + Events
  → Still required manual DOM updates in Views
  → Better structure but still lots of manual wiring

AngularJS (v1):
  → Two-way data binding (change input → state updates → DOM updates)
  → "Digest cycle" — periodic checking if anything changed
  → Complex, hard to debug, slow for large trees
  → Unpredictable when to re-render
```

Facebook was running one of the most complex UIs in the world (News Feed + Chat + Notifications + Ads), and they were hitting all of these problems simultaneously. Something fundamentally different was needed.

---

## 1.3 — The Fundamental Insight Behind React

### The Problem Facebook Faced (2011–2013)

In 2011, Facebook's engineers were building the News Feed — a dynamic, real-time stream of updates. Simultaneously, they had Chat (real-time messages), Notifications (badge counts), and the Timeline. These components all shared state and had to stay in sync.

The manual DOM synchronization approach was producing constant bugs:

```
Bug example (real type that happened):
  → User receives a new chat message
  → Chat badge count updates to "3"
  → But the chat window itself didn't update (the developer forgot that DOM node)
  → User sees "3 unread" but the chat is empty
  → This is a data/UI sync bug — extremely common in imperative UIs
```

Facebook engineer **Jordan Walke** asked a fundamentally different question:

> *"What if we didn't think about how to update the UI at all?
> What if we just described what the UI should look like for any given data state,
> and let the system figure out what needs to change?"*

### Declarative vs Imperative — The Core Shift

This is the most important conceptual shift in understanding React:

**Imperative (old way) — you describe HOW to change things:**

```javascript
// You micromanage every DOM operation
function handleLikeClick(id) {
  // Step 1: Find the data
  const tweet = tweets.find(t => t.id === id);

  // Step 2: Update the data
  tweet.likes++;

  // Step 3: Find the specific DOM element
  const likeCountEl = document.querySelector(`[data-id="${id}"] .like-count`);

  // Step 4: Update THAT specific element
  likeCountEl.textContent = tweet.likes + ' likes';

  // Step 5: Update the button's appearance
  const likeButton = document.querySelector(`[data-id="${id}"] .like-btn`);
  likeButton.classList.add('liked');

  // Step 6: Update the total counter somewhere else on the page
  const totalCounter = document.getElementById('total-likes');
  const total = tweets.reduce((sum, t) => sum + t.likes, 0);
  totalCounter.textContent = total;

  // What else did I forget? Did I miss any element? Unknown.
}
```

**Declarative (React way) — you describe WHAT the UI should look like:**

```jsx
// You describe the desired output for any given data
// React figures out all the DOM operations needed

function Tweet({ tweet, onLike }) {
  return (
    <div className="tweet">
      <p>{tweet.text}</p>
      <span className={tweet.liked ? 'like-count liked' : 'like-count'}>
        {tweet.likes} likes
      </span>
      <button
        onClick={() => onLike(tweet.id)}
        className={tweet.liked ? 'liked' : ''}
      >
        Like
      </button>
    </div>
  );
}
```

With the declarative model:
- You describe: "Given this tweet data, this is what the UI should look like"
- React takes care of: calculating what changed, what DOM operations to perform
- When data changes: you describe the new desired UI, React reconciles
- You never manually touch DOM nodes

**The mental model shift:**

```
IMPERATIVE THINKING:
  "The user clicked Like. I need to:
   1. Find this DOM element
   2. Change its text
   3. Add this class
   4. Find that other element
   5. Update it too..."

DECLARATIVE THINKING:
  "The tweet's like count is now 5 and liked is true.
   What should the UI look like?
   → This span should show '5 likes'
   → This button should have the 'liked' class
   React will figure out the minimum DOM changes needed."
```

### Why Declarative is Superior at Scale

Declarative UI has a fundamentally better scaling curve:

```
Imperative complexity:
  3 components  → manageable
  10 components → getting complex
  30 components → difficult
  100 components → nightmare, bugs everywhere
  (complexity grows exponentially with app size)

Declarative complexity:
  3 components  → simple
  10 components → still simple
  30 components → manageable
  100 components → same mental model, just more components
  (complexity grows linearly — each component is self-contained)
```

This is the core philosophical foundation of React. Everything else — hooks, the Virtual DOM, the reconciler — is in service of making this declarative model work efficiently.

### What React Fundamentally Is

React is a **UI library** (not a framework) that implements the declarative UI model through three core ideas:

```
1. Components
   → UI is composed of reusable, self-contained functions
   → Each function describes what its piece of UI should look like
   → Functions are pure (same input → same output)

2. State
   → Data that can change over time lives in "state"
   → When state changes, React automatically re-renders the relevant components
   → You never manually update the DOM — you update state

3. Reconciliation
   → React compares what the UI "should look like" vs what it currently looks like
   → Calculates the minimum set of DOM operations needed
   → Applies only those changes to the real DOM
```

---

## 1.4 — What is the Virtual DOM?

### The Performance Problem with Naive Declarative Rendering

The declarative model sounds simple: "When data changes, re-describe the UI." But there's a naive implementation that would be terrible:

```javascript
// Naive declarative approach — re-render everything on every change
function onDataChange() {
  document.body.innerHTML = renderEntireApp(state); // Wipe and rebuild everything
}
```

This is actually **worse** than the imperative approach — you're nuking the entire DOM every time anything changes. This would destroy browser state (focus, scroll, text selection), trigger massive layout recalculations, and feel janky.

**The performance constraint React had to solve:**
- Declarative model requires describing the whole UI on every change
- But actually touching the real DOM is expensive
- Therefore: find a way to describe the whole UI cheaply, then only touch the real DOM minimally

React's solution: **the Virtual DOM**.

### What the Virtual DOM Is

The Virtual DOM is a **lightweight JavaScript object representation** of what the real DOM should look like. It lives entirely in JavaScript memory — never in the browser's rendering engine.

Here's what a piece of Virtual DOM looks like:

```javascript
// This is the actual structure React uses internally
// (simplified for clarity)

// The real DOM element:
// <div class="tweet">
//   <p>Hello world</p>
//   <span>5 likes</span>
// </div>

// React's Virtual DOM representation:
{
  type: 'div',
  props: { className: 'tweet' },
  children: [
    {
      type: 'p',
      props: {},
      children: ['Hello world']
    },
    {
      type: 'span',
      props: {},
      children: ['5 likes']
    }
  ]
}
```

This is **just a plain JavaScript object** — no browser APIs, no rendering, no DOM. Creating and manipulating plain JS objects is orders of magnitude faster than touching the real DOM.

**The key insight:**

```
Creating 1000 JS objects:  ~0.1ms   (happens in memory)
Touching 1000 DOM nodes:   ~100ms+  (triggers layout, paint, compositing)

Speed difference: 1000x or more
```

By working with JS objects instead of real DOM nodes until the last possible moment, React can afford to be "wasteful" in its comparisons — comparing entire trees cheaply — then be surgical about the actual DOM updates.

### The Reconciliation Process — Step by Step

When your state changes in a React app, here's exactly what happens:

```
Step 1: State Update Triggered
  → User clicks Like button
  → setLikes(likes + 1) is called
  → React schedules a re-render

Step 2: Component Re-Renders (in memory only)
  → React calls your component function with the new state
  → Your function returns a description of the UI (JSX)
  → JSX is converted to a new Virtual DOM tree (Tree B)
  → This all happens in JavaScript memory — no real DOM touched yet
  → This step is extremely fast

Step 3: Diffing Algorithm
  → React compares Tree A (previous) with Tree B (new)
  → This is called "reconciliation" or "diffing"
  → React traverses both trees simultaneously
  → For each node, it asks: "Is this the same type as before?"
    → Same type, same position: check if props/children changed
    → Different type: destroy old subtree, create new one
    → Missing in new tree: destroy the node
    → New node not in old tree: create it

Step 4: Commit Phase
  → React now has a list of specific DOM operations needed
  → Example: "Update the textContent of this one <span>"
  → React applies ONLY those operations to the real DOM
  → Nothing else is touched

Step 5: Browser Updates
  → Browser's rendering engine detects the minimal DOM change
  → Performs targeted repaint for only the changed area
  → User sees the updated UI
```

### Visualizing the Diff

```
Before click (Tree A):           After click (Tree B):
────────────────────────         ────────────────────────
<div class="tweet">              <div class="tweet">
  <p>Hello world</p>               <p>Hello world</p>        ← SAME → skip
  <span>0 likes</span>             <span>1 like</span>        ← DIFFERENT → update
  <button>Like</button>            <button class="liked">     ← DIFFERENT → update class
</div>                           </div>

React's output:
  → document.querySelector('span').textContent = '1 like'   (1 operation)
  → document.querySelector('button').className = 'liked'     (1 operation)
  → Everything else: untouched
```

This is called **minimal reconciliation** — the minimum number of real DOM operations to go from state A to state B.

### The Diffing Algorithm's Key Rules

React's reconciliation algorithm uses several heuristics to be fast:

**Rule 1: Same type at same position = update in place**
```
Tree A: <div className="card">    Tree B: <div className="card active">
→ React updates the className attribute in place
→ Does NOT destroy and recreate the div
→ All children are preserved and diffed recursively
```

**Rule 2: Different type at same position = destroy and recreate**
```
Tree A: <div className="tweet">   Tree B: <article className="tweet">
→ React destroys the div and all its children
→ Creates a fresh article element
→ This is expensive — avoid changing element types unnecessarily
```

**Rule 3: The `key` prop for lists**
```jsx
// Without keys — React doesn't know which item is which
tweets.map(tweet => <Tweet tweet={tweet} />)

// With keys — React can track items across re-renders
tweets.map(tweet => <Tweet key={tweet.id} tweet={tweet} />)
```

Without `key`, if you add an item to the beginning of a list, React re-renders all items. With `key`, React knows which items are new/moved/removed and handles them surgically. This is why React warns you when you render lists without keys.

### The Full Mental Model

```
Your Data (State)
        ↓
  State changes (user event, API response, timer, etc.)
        ↓
React calls your component function(s) with new state
        ↓
Your functions return JSX — a description of desired UI
        ↓
JSX is converted to a new Virtual DOM tree (cheap JS objects)
        ↓
React diffs new Virtual DOM tree vs previous Virtual DOM tree
        ↓
Reconciler calculates minimum DOM operations needed
        ↓
React applies ONLY those changes to the real DOM
        ↓
Browser repaints only the affected pixels
        ↓
User sees the updated UI
```

### Is the Virtual DOM Always the Fastest Possible Approach?

Honest answer: **No.** Extremely well-written vanilla JavaScript that makes surgical DOM updates can theoretically be faster than React in specific scenarios. The Virtual DOM diffing itself has overhead.

React's value is not "maximum theoretical performance." Its value is:
- **Consistent, predictable performance** at any app complexity level
- **Developer productivity** — you don't have to think about DOM operations
- **Correctness** — React handles the edge cases in diffing that manual code often misses

In 2023–2024, React has been evolving toward a **Signals-based model** (inspired by SolidJS) with the React Compiler, which can generate optimized code that avoids the Virtual DOM overhead in many cases.

---

## 1.5 — Component-Based Architecture

### What is a Component?

A **component** is a **self-contained, reusable unit of UI**. Think of it as a custom HTML element that you define — with its own structure (HTML/JSX), styling (CSS), and behavior (JavaScript).

In React, a component is literally just a **JavaScript function** that:
1. Accepts some input data (called **props**)
2. Returns a description of what UI to render (JSX)

```jsx
// This is a complete React component
function UserAvatar({ username, imageUrl }) {
  return (
    <div className="avatar">
      <img src={imageUrl} alt={username} />
      <span>{username}</span>
    </div>
  );
}

// Use it like a custom HTML element
<UserAvatar username="john_doe" imageUrl="/photos/john.jpg" />
```

### How to Think About Component Decomposition

One of the core skills in React development is knowing how to break a UI into components. The rule of thumb: **one component, one responsibility**.

Here's how you'd decompose a Twitter-like page:

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
│  │  │  ┌────────────────────────┐│  │   │
│  │  │  │    LikeButton          ││  │   │
│  │  │  └────────────────────────┘│  │   │
│  │  └────────────────────────────┘  │   │
│  │  (Tweet repeated for each tweet) │   │
│  └──────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

The component tree for this page:

```
App
├── Header
│   ├── Logo
│   └── SearchBar
└── TweetFeed
    └── Tweet (×100)
        ├── Avatar
        ├── Content
        └── LikeButton
```

### Properties of Well-Designed Components

Each component in a React app should have these characteristics:

**1. Single Responsibility**
A component does one thing and does it well. `LikeButton` manages only the like interaction. `Avatar` only renders user images. If a component is doing too much, split it.

**2. Self-Contained**
A component encapsulates its own logic and presentation. The `Tweet` component doesn't need to know about `Header`. Changes to `Header` don't affect `Tweet`.

**3. Reusable**
The `Avatar` component can be used in:
- Tweet author display
- Comment sections
- User profile pages
- Search results
- Notification items
Write it once, use it everywhere.

**4. Testable in Isolation**
Because a component is just a function (input props → output JSX), you can test it without rendering the entire app. Pass in mock props, assert on the output. No complex test setup needed.

**5. Composable**
Components are like LEGO bricks — you combine simple components to build complex ones:

```jsx
// Small, simple components
function Avatar({ src, alt }) { ... }
function Username({ name }) { ... }
function Timestamp({ date }) { ... }
function LikeButton({ count, onLike }) { ... }

// Compose them into a more complex component
function Tweet({ tweet, onLike }) {
  return (
    <div className="tweet">
      <Avatar src={tweet.author.avatar} alt={tweet.author.name} />
      <div className="tweet-body">
        <Username name={tweet.author.name} />
        <Timestamp date={tweet.createdAt} />
        <p>{tweet.text}</p>
        <LikeButton count={tweet.likes} onLike={() => onLike(tweet.id)} />
      </div>
    </div>
  );
}
```

### Props: The Data Interface Between Components

**Props** (short for properties) are how parent components pass data to child components. They're like HTML attributes, but you can pass any JavaScript value — strings, numbers, objects, arrays, even functions.

```jsx
// Parent passes data down via props
function TweetFeed({ tweets }) {
  return (
    <div className="feed">
      {tweets.map(tweet => (
        <Tweet
          key={tweet.id}
          text={tweet.text}          // string prop
          likes={tweet.likes}        // number prop
          author={tweet.author}      // object prop
          onLike={handleLike}        // function prop
        />
      ))}
    </div>
  );
}

// Child receives props as a single object parameter
function Tweet({ text, likes, author, onLike }) {
  return ( ... );
}
```

**Props flow one way: downward (parent → child).** This is called **unidirectional data flow** and it makes React apps predictable — you always know where data came from.

### State: The Dynamic Data Within a Component

**State** is data that belongs to a component and can change over time. When state changes, React re-renders the component.

```jsx
function LikeButton({ initialCount }) {
  // This component owns this data — it lives here
  const [count, setCount] = useState(initialCount);
  const [isLiked, setIsLiked] = useState(false);

  function handleClick() {
    setCount(count + 1);
    setIsLiked(true);
  }

  return (
    <button onClick={handleClick} className={isLiked ? 'liked' : ''}>
      {count} likes
    </button>
  );
}
```

**Props vs State:**

```
Props:
  → Data passed INTO a component from its parent
  → Read-only — a component cannot modify its own props
  → Comes from outside the component
  → Like function parameters

State:
  → Data that BELONGS TO a component
  → Mutable — the component can change it via setState
  → Lives inside the component
  → Like local variables that persist between renders
```

### Why Component Architecture Changed Frontend Development

Before components, the web was built around **pages** — monolithic HTML files with JavaScript scattered throughout. Adding a "user avatar" meant:
- Copy-pasting HTML in multiple places
- Maintaining multiple copies of the same DOM structure
- Bug fix in one place → need to find and fix all other copies

With components:
- Define `<Avatar />` once → reuse it 100 times
- Fix a bug in `Avatar` → fixed everywhere instantly
- Update the design of `Avatar` → updates everywhere automatically
- Move `Avatar` to a different page → just import and use it

This is why React transformed frontend development. Instead of thinking about **pages**, you think about **a library of reusable UI pieces** that you compose together.

---

## 1.6 — Single Page Applications (SPAs)

### How Traditional Websites Work (Multi-Page Apps)

Traditional websites — and most of the early web — are **multi-page applications (MPAs)**. Every navigation triggers a round-trip to the server:

```
User is on /home
User clicks "Profile" link
        ↓
Browser makes HTTP GET /profile
        ↓
Server processes request
  → Authentication check
  → Database queries
  → Template rendering
        ↓
Server responds with complete HTML for the profile page
        ↓
Browser tears down the current /home page
  → All JavaScript context destroyed
  → All state lost
  → All component instances unmounted
        ↓
Browser parses and renders the new /profile HTML from scratch
        ↓
User sees a white flash / loading spinner during this entire process
        ↓
Profile page appears — feels like a page "reload"
```

This works fine for simple content websites. But for apps that need to feel fast and native, it's a terrible experience. Every click causes a noticeable delay and visual disruption.

### How Single Page Applications Work

A **Single Page Application (SPA)** loads **one HTML file** at startup. After that, JavaScript intercepts all navigation and handles everything:

```
Initial page load:
  Browser requests /
  Server returns one index.html + a JavaScript bundle
  JavaScript downloads and executes
  React mounts and renders the initial UI
  (This first load may be slightly slower — more code to download)
        ↓
User clicks "Profile" link:
  JavaScript intercepts the click
  Prevents the browser's default navigation behavior
  React Router (or similar library) detects the URL change
  React swaps out the current page component for the Profile component
  Profile component fetches its data from an API (returns JSON, not HTML)
  React updates only the parts of the UI that changed
  URL changes to /profile (via the History API)
  No page reload — no white flash
        ↓
User clicks "Back":
  JavaScript intercepts
  React Router swaps back to the previous component
  Previous state may be preserved (no round-trip to server)
  Instant — feels like going back in native app history
```

### The History API — How URLs Change Without Navigation

The browser's **History API** (`window.history`) lets JavaScript change the URL bar without triggering a real navigation:

```javascript
// Change URL to /profile without navigating
window.history.pushState({}, '', '/profile');

// The URL bar shows /profile
// But no HTTP request is made
// No page reload happens
// React detects the URL change and renders the right component

// Go back
window.history.back(); // Triggers 'popstate' event
// React Router listens for this and renders the previous component
```

This is the entire magic behind React Router and SPA navigation — URLs look normal, but they're controlled entirely by JavaScript.

### Why SPAs Feel Like Apps

Gmail, Figma, Notion, Linear, Twitter/X — these feel like desktop applications running in a browser. They're all SPAs. The key experience differences:

```
MPA experience (traditional):
  Every click = white flash + loading spinner
  State lost on navigation (form data cleared)
  Browser back button = full page reload
  Feels: slow, web-page-like

SPA experience (React):
  Every click = instant UI transition
  State preserved during navigation (form data survives)
  Browser back button = instant, state restored
  Feels: fast, app-like, native
```

### The Data Architecture of SPAs

In an MPA, the server renders HTML with data baked in. In an SPA, data comes separately:

```
MPA data flow:
  Browser → GET /profile → Server fetches DB data → Server renders HTML with data → Browser displays

SPA data flow:
  Browser → GET /api/profile → Server returns JSON → Browser renders components with data
  (or using React Query, SWR, etc. for caching)
```

This separation of concerns (UI in JavaScript, data over API) enables:
- The same backend to serve web, mobile, and third-party clients
- Offline functionality (data can be cached locally)
- Real-time updates (WebSocket connection to push data changes)
- Much faster perceived performance (show skeleton UI immediately, fill in data as it arrives)

### SPA Trade-offs — The Full Picture

| Aspect | Multi-Page App | Single Page App |
|--------|---------------|-----------------|
| Initial load time | Fast (server sends small HTML) | Slower (must download JS bundle) |
| Subsequent navigation | Slow (full server round-trip) | Instant (client-side only) |
| SEO (Search Engine Optimization) | Excellent out of the box | Needs extra work (SSR or SSG) |
| App-like feel | Page-by-page, noticeable transitions | Smooth, native app-like |
| Offline capability | Difficult | Possible with Service Workers |
| Server complexity | Server renders everything | Server becomes a pure data API |
| JavaScript dependency | App degrades without JS | App broken without JS |
| Architecture complexity | Simpler to start | More complex — routing, state mgmt |
| Time To Interactive | Fast (small JS) | Slower (must parse large bundle) |

### Solving the SEO Problem — SSR and SSG

The main weakness of SPAs is SEO. Search engine crawlers (and social media link previewers) fetch your page's HTML. If your HTML is just `<div id="root"></div>` with no content, crawlers can't index your content.

Solutions:
- **SSR (Server-Side Rendering)** — React renders on the server, sends HTML with content, then JavaScript "hydrates" it on the client. Framework: **Next.js**
- **SSG (Static Site Generation)** — React renders to HTML at build time (not request time). Ultra-fast, excellent SEO. Framework: **Next.js**, **Gatsby**, **Astro**
- **SPA + prerendering** — Build-time snapshot of rendered pages for crawlers

> React alone (Vite + React) is a pure SPA — no SSR. For production apps that need SEO, **Next.js** is the standard choice. It adds SSR/SSG on top of React. We'll cover this in later stages.

---

## 1.7 — Mental Model Summary: How React Works End-to-End

### The Complete Picture

Before moving to Stage 2, you need this entire flow burned into memory:

```
┌─────────────────────────────────────────────────────────────────────┐
│                          YOUR REACT APP                             │
│                                                                     │
│   State (data)  →  Component Functions  →  JSX (UI description)    │
│        ↑                                          │                 │
│        │                                          ↓                 │
│   Events, APIs,                         Virtual DOM Tree (new)      │
│   Timers, etc.                                    │                 │
│        ↑                                          ↓                 │
│        │                                  Diffing Engine            │
│        │                          (compare new vs previous VDOM)    │
│        │                                          │                 │
│   State Updates                                   ↓                 │
│   (setState calls)                      Minimal DOM Operations      │
│                                         (list of what changed)      │
│                                                   │                 │
│                                                   ↓                 │
│                                         Real DOM updated            │
│                                         (only changed nodes)        │
│                                                   │                 │
│                                                   ↓                 │
│                                         Browser repaints            │
│                                         (only affected pixels)      │
│                                                   │                 │
│                                                   ↓                 │
│                                         User sees changes           │
│                                         User interacts → cycle      │
│                                         repeats                     │
└─────────────────────────────────────────────────────────────────────┘
```

### How Each Stage Connects to the Next

```
Stage 1 (this stage): WHY React exists
  → DOM is expensive to manipulate manually
  → Imperative programming doesn't scale
  → Declarative model + Virtual DOM = efficient, maintainable UIs

Stage 2 (next): HOW to set up the environment
  → Node.js, npm, Vite — the workshop that builds React apps
  → Project structure and configuration

Stage 3: JSX — the syntax for describing UI declaratively
  → How JSX compiles to JavaScript
  → Rules and patterns

Stage 4: Components and Props — the building blocks
  → Writing functions that return UI
  → Passing data between components

Stage 5: State and Hooks — making UIs dynamic
  → useState, useEffect, and more
  → How state triggers re-renders

Stage 6+: Routing, data fetching, global state, performance...
```

---

## Key Takeaways from Stage 1

### The 7 Core Concepts to Know Cold

**1. The DOM is a live JavaScript object tree**
When the browser parses HTML, it creates a tree of JavaScript objects in memory. Every HTML element is a node. You can read and modify these nodes with JavaScript.

**2. Directly manipulating the DOM at scale is slow and messy**
DOM operations trigger layout recalculation, repaints, and compositing — all expensive. Managing manual DOM updates in a complex app leads to bugs, performance issues, and unmaintainable code.

**3. React introduces declarative UI**
Instead of telling the DOM *how* to change step by step, you describe *what* the UI should look like for any given data. React figures out the *how*. This is the philosophical core of everything in React.

**4. The Virtual DOM enables efficient declarative rendering**
React maintains a lightweight JS object copy of the real DOM. When state changes, React builds a new Virtual DOM tree, diffs it against the previous one, and applies only the minimum necessary real DOM changes.

**5. React only updates the real DOM nodes that actually changed**
This "minimal reconciliation" is why React is fast. A single state change updates only the specific DOM nodes affected — not a full page re-render.

**6. Components are self-contained, reusable UI units**
Components are functions that take props (input data) and return JSX (UI description). They compose together to form complex UIs from simple pieces. One responsibility, tested in isolation, reusable everywhere.

**7. SPAs load once; JavaScript simulates all navigation**
React apps download one HTML file + JS bundle. All navigation is handled by JavaScript (React Router + History API). Server only serves data (JSON), not HTML pages. This creates app-like experiences but requires extra work for SEO.

---

## Quick Reference

```
BROWSER RENDERING PATH:
  HTML → DOM Tree
  CSS  → CSSOM Tree
  DOM + CSSOM → Render Tree → Layout → Paint → Compositing

DOM:
  Document Object Model
  Tree of live JS objects representing HTML elements
  Expensive to manipulate (triggers layout + paint)

IMPERATIVE vs DECLARATIVE:
  Imperative: "Do step 1, step 2, step 3 to change the DOM"
  Declarative: "Here's what the UI should look like — React handles the rest"

VIRTUAL DOM:
  Lightweight JS object copy of the real DOM
  Creating/comparing JS objects: extremely fast
  Touching real DOM: expensive
  React diffs Virtual DOMs → applies minimum real DOM changes

RECONCILIATION:
  Process of comparing old and new Virtual DOM trees
  Same type at same position → update props in place
  Different type → destroy and recreate
  Lists need key props for efficient reconciliation

COMPONENTS:
  JavaScript functions: (props) → JSX
  Props = data passed from parent (read-only)
  State = data owned by component (mutable, triggers re-render)
  Compose small components into complex UIs

SPA (Single Page Application):
  One HTML file loaded once
  JavaScript handles all navigation (no full page reloads)
  History API changes URL without navigation
  Data fetched from API (JSON), not server-rendered HTML
  SEO requires SSR (Next.js) or SSG
```