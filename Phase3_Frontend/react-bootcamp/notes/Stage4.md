# React Engineering Bootcamp — Stage 4: React Hooks — Deep Internals & Mastery

> **Goal of this stage:** Go beyond surface-level hook usage. Understand the *why* behind every hook,
> how React stores and manages hook state internally, when to use each hook, and how to compose
> them into powerful custom hooks. After this stage, hooks should feel logical — not magical.

---

## 4.0 — What Hooks Are and Why They Exist

### The World Before Hooks — Class Components

Before React 16.8 (February 2019), **the only way to use state or lifecycle methods** was through class components. Function components were purely presentational — they could receive props and return JSX, but they had no memory, no side effects, no lifecycle.

Here's what the class component world looked like:

```javascript
// The OLD way — class components
// You will encounter this in legacy codebases — know how to read it
class Counter extends React.Component {
  constructor(props) {
    super(props);                                  // must call super
    this.state = { count: 0 };                    // state initialization
    this.handleClick = this.handleClick.bind(this); // manual 'this' binding
  }

  componentDidMount() {
    // Runs ONCE after first render — "on mount"
    document.title = `Count: ${this.state.count}`;
  }

  componentDidUpdate(prevProps, prevState) {
    // Runs after EVERY update — must manually check what changed
    if (prevState.count !== this.state.count) {
      document.title = `Count: ${this.state.count}`;
    }
  }

  componentWillUnmount() {
    // Runs before component is removed — cleanup
    clearInterval(this.intervalId);
  }

  handleClick() {
    this.setState({ count: this.state.count + 1 });
  }

  render() {
    return (
      <button onClick={this.handleClick}>
        {this.state.count}
      </button>
    );
  }
}
```

### The Four Problems With Class Components

**Problem 1: Logic Fragmentation**

Related code gets split across unrelated lifecycle methods. Consider a component that subscribes to a chat service:

```javascript
class ChatRoom extends React.Component {
  componentDidMount() {
    // Subscribe — setup code is here
    this.subscription = ChatAPI.subscribe(this.props.roomId, this.handleMessage);
    document.title = `Room: ${this.props.roomId}`;
  }

  componentDidUpdate(prevProps) {
    // If roomId changed, unsubscribe old, subscribe new
    // This logic is SPLIT from componentDidMount even though it's related
    if (prevProps.roomId !== this.props.roomId) {
      ChatAPI.unsubscribe(prevProps.roomId, this.handleMessage);
      ChatAPI.subscribe(this.props.roomId, this.handleMessage);
      document.title = `Room: ${this.props.roomId}`;
    }
  }

  componentWillUnmount() {
    // Cleanup is here — physically separated from setup
    ChatAPI.unsubscribe(this.props.roomId, this.handleMessage);
  }
  // Related code spread across 3 different methods
}
```

With `useEffect`, all of this lives in **one place** — setup and cleanup together.

**Problem 2: `this` Binding Confusion**

JavaScript's `this` is one of the most confusing parts of the language. In class components you had to constantly manage it:

```javascript
class Component extends React.Component {
  constructor(props) {
    super(props);
    // Option 1: bind in constructor
    this.handleClick = this.handleClick.bind(this);
  }

  // Option 2: arrow function property (class fields proposal)
  handleClick = () => {
    this.setState({ clicked: true });
  }

  // Option 3: inline arrow function in JSX (new function every render)
  render() {
    return <button onClick={() => this.handleClick()}>Click</button>;
  }
}
```

Function components with hooks have no `this` — this problem simply doesn't exist.

**Problem 3: Hard to Reuse Stateful Logic**

Sharing stateful logic between class components required complex patterns:

```
Higher-Order Components (HOCs):
  → Wrap a component to inject behavior
  → Creates "wrapper hell" — deeply nested components in DevTools
  → Props naming conflicts
  → Hard to follow data flow

Render Props:
  → Pass a function as a prop that returns JSX
  → Also creates deep nesting
  → Callback hell patterns
```

Custom hooks completely solved this — stateful logic is now just a function you import.

**Problem 4: Optimization Difficulties**

Class components don't minify well (class method names can't be shortened). React's internal optimizations (like the Concurrent features in React 18) work fundamentally better with function components.

### What Hooks Are — The Precise Definition

> **Hooks are functions that let you "hook into" React's internal systems from inside a function component.**

```
useState    → hooks into React's state storage system
useEffect   → hooks into React's render lifecycle / commit phase
useRef      → hooks into React's instance storage (persists without re-rendering)
useMemo     → hooks into React's memoization cache
useCallback → hooks into React's function memoization cache
useContext  → hooks into React's context propagation system
useReducer  → hooks into React's state storage with reducer pattern
useId       → hooks into React's stable ID generation
useTransition → hooks into React's concurrent rendering system
```

Every hook is a function call during your component's render. React intercepts these calls and connects them to internal data structures tied to the component instance.

---

## The Rules of Hooks — And Why They Are Absolute

These are not suggestions — they are hard rules. Violating them causes bugs that are extremely hard to track down, and your ESLint react-hooks plugin will flag them.

### Rule 1: Only Call Hooks at the Top Level

```jsx
// ❌ WRONG — hook inside a conditional
function Component({ isLoggedIn }) {
  if (isLoggedIn) {
    const [name, setName] = useState('');   // conditional hook — ILLEGAL
  }
}

// ❌ WRONG — hook inside a loop
function Component({ items }) {
  items.forEach(item => {
    const [selected, setSelected] = useState(false);  // loop hook — ILLEGAL
  });
}

// ❌ WRONG — hook inside a nested function
function Component() {
  function handleSomething() {
    const [value, setValue] = useState('');  // nested function hook — ILLEGAL
  }
}

// ❌ WRONG — hook after an early return
function Component({ user }) {
  if (!user) return null;                  // early return BEFORE hooks — ILLEGAL
  const [count, setCount] = useState(0);
}

// ✅ CORRECT — all hooks at the very top, before any conditions or returns
function Component({ isLoggedIn, user, items }) {
  const [name, setName] = useState('');    // hook 1 — always runs
  const [count, setCount] = useState(0);  // hook 2 — always runs
  const [data, setData] = useState(null); // hook 3 — always runs

  // Conditions and early returns come AFTER all hooks
  if (!user) return null;
  if (!isLoggedIn) return <Login />;

  return <div>{count}</div>;
}
```

**Why this rule exists — React's hook storage mechanism:**

React stores hook values in an **ordered linked list** (called the "fiber's memoized state") attached to each component instance. Every render, React walks this list sequentially and assigns each `useState`, `useEffect`, `useRef` call to the next slot in the list — **by position/index**.

```
Component first render:
  Executes useState('')     → React assigns slot 0 → stores ''
  Executes useState(0)      → React assigns slot 1 → stores 0
  Executes useEffect(...)   → React assigns slot 2 → stores effect

Component re-render:
  Executes useState('')     → React reads slot 0 → returns current value
  Executes useState(0)      → React reads slot 1 → returns current value
  Executes useEffect(...)   → React reads slot 2 → compares deps
```

React matches each hook call to its stored data **entirely by call order**. If you put a hook inside an `if` block, sometimes it runs, sometimes it doesn't. The indices shift, and React reads the wrong state from the wrong slot:

```
BUGGY render (condition is false, hook skipped):
  Executes useState('')     → React reads slot 0 → correct ✅
  [if block is false, useState(0) is SKIPPED]
  Executes useEffect(...)   → React reads slot 1 → WRONG! Gets the number 0 ❌

React now thinks useEffect's data is the number 0 — slot mismatch.
The entire state system corrupts silently.
```

This is why the rule is absolute. React literally cannot function correctly if hooks run conditionally.

### Rule 2: Only Call Hooks From React Functions

Hooks must be called inside:
1. React function components
2. Custom hooks (functions that start with `use`)

```jsx
// ❌ WRONG — hook in a regular JavaScript function
function formatUser(user) {
  const [formattedName, setFormattedName] = useState('');  // ILLEGAL
  return formattedName;
}

// ❌ WRONG — hook outside any function (module level)
const [globalState, setGlobalState] = useState(null);  // ILLEGAL

// ✅ CORRECT — inside a React function component
function UserCard() {
  const [isExpanded, setIsExpanded] = useState(false);  // legal
  return <div />;
}

// ✅ CORRECT — inside a custom hook (starts with 'use')
function useFormField(initialValue) {
  const [value, setValue] = useState(initialValue);     // legal
  return [value, setValue];
}
```

**Why:** Hooks rely on React's internal tracking system which is only active when React is rendering a component. Outside a component render cycle, there's no component instance to attach state to, no queue to push updates to, no scheduler to batch re-renders.

### Enforcing These Rules Automatically

Install the ESLint plugin and it enforces both rules automatically in your editor:

```bash
npm install --save-dev eslint-plugin-react-hooks
```

In your `eslint.config.js`:
```javascript
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  {
    plugins: { 'react-hooks': reactHooks },
    rules: {
      'react-hooks/rules-of-hooks': 'error',   // enforces the two rules
      'react-hooks/exhaustive-deps': 'warn',    // warns about missing deps in useEffect
    }
  }
];
```

The `exhaustive-deps` rule is especially important — it catches the stale closure bug before it burns you.

---

## 4.1 — `useState` — Deep Internals

### The Basics (Quick Recap from Stage 3)

```jsx
const [value, setValue] = useState(initialValue);
// value    → current state (read-only for this render — it's a snapshot)
// setValue → function to update state (triggers re-render)
// initialValue → used ONLY on first render
```

### How React Stores State Internally

Each React component has an internal data structure called a **Fiber** — a JavaScript object that represents one component instance. The Fiber contains a `memoizedState` field which is the head of a linked list of hook states:

```
Component Fiber:
  memoizedState →
    { value: 0, queue: UpdateQueue, next: → }
                                            ↓
                           { value: false, queue: UpdateQueue, next: → }
                                                                         ↓
                                              { value: '', queue: UpdateQueue, next: null }

Each node in this list corresponds to one useState call (in order).
The queue holds pending updates before the next render.
```

When you call `setValue(newValue)`, React:
1. Creates an update object: `{ action: newValue, next: null }`
2. Adds it to the UpdateQueue for that hook's slot
3. Schedules a re-render for this component
4. On re-render, processes the queue to compute the new state value

### Batching — React Groups Multiple State Updates

```jsx
function Form() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState(0);

  function handleSubmit() {
    setName('Alice');
    setEmail('alice@example.com');
    setAge(25);
    // React 18: ALL THREE updates are batched into ONE single re-render
    // React 17 and earlier: would have caused THREE separate re-renders
  }
}
```

**React 18 Automatic Batching** — a significant performance improvement. In React 17, only updates inside React event handlers were batched. Updates inside `setTimeout`, `Promise.then`, or native event listeners caused separate re-renders. React 18 batches ALL updates everywhere:

```javascript
// React 18 — ALL of these batch correctly now
setTimeout(() => {
  setCount(c => c + 1);
  setFlag(f => !f);
  // ONE re-render, not two
}, 1000);

fetch('/api/data').then(() => {
  setData(result);
  setIsLoading(false);
  // ONE re-render, not two
});
```

To opt out of batching for a specific case (rare):
```javascript
import { flushSync } from 'react-dom';

flushSync(() => setCount(c => c + 1));  // forces immediate re-render
flushSync(() => setFlag(f => !f));      // forces another immediate re-render
```

### Lazy Initial State

```jsx
// ❌ WRONG — runs expensiveComputation() on EVERY single render
// Even though the result is only used on the first render
const [data, setData] = useState(expensiveComputation());

// ✅ CORRECT — pass a function, React calls it ONLY on the first render
const [data, setData] = useState(() => expensiveComputation());
```

The function form is called **lazy initialization**. React detects when the initial value is a function and only calls it once — during the component's first mount. On subsequent re-renders, React ignores the initial value entirely.

**Critical use case — reading from localStorage:**

```jsx
function Settings() {
  // ✅ Reads localStorage only once (on mount), not on every re-render
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('theme');
      return saved ? JSON.parse(saved) : 'dark';
    } catch {
      return 'dark';  // fallback if localStorage is unavailable
    }
  });

  function handleThemeChange(newTheme) {
    setTheme(newTheme);
    localStorage.setItem('theme', JSON.stringify(newTheme));
  }

  return (
    <div style={{ padding: '2rem' }}>
      <p style={{ color: '#aaa' }}>Current theme: {theme}</p>
      <button
        onClick={() => handleThemeChange('dark')}
        style={{ padding: '0.5rem 1rem', marginRight: '0.5rem',
                 backgroundColor: theme === 'dark' ? '#646cff' : '#333',
                 color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        Dark
      </button>
      <button
        onClick={() => handleThemeChange('light')}
        style={{ padding: '0.5rem 1rem',
                 backgroundColor: theme === 'light' ? '#646cff' : '#333',
                 color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        Light
      </button>
    </div>
  );
}
```

### When React Skips Re-Rendering (Bail-Out)

If you call a setter with the **same value** as current state, React bails out — it skips the re-render entirely:

```jsx
const [count, setCount] = useState(0);

// These cause NO re-render (same value, React bails out):
setCount(0);             // already 0
setCount(count);         // same reference

// Objects and arrays: bails out only if SAME REFERENCE
const [user, setUser] = useState({ name: 'Alice' });
setUser(user);           // same reference → no re-render
setUser({ name: 'Alice' });  // different reference → RE-RENDERS
                              // even though content is identical
```

React uses `Object.is()` for comparison — same algorithm as `===` but handles `NaN` and `-0` edge cases correctly.

---

## 4.2 — `useEffect` — The Most Important and Most Misunderstood Hook

### What useEffect Actually Does

The name "effect" comes from "side effect" — any interaction with the world outside React's render system:

```
Side effects (things useEffect handles):
  → Fetching data from an API
  → Subscribing to WebSockets or browser events
  → Updating document.title
  → Reading/writing to localStorage
  → Integrating third-party DOM libraries (maps, charts, video players)
  → Setting up timers / intervals
  → Logging analytics events
  → Manually manipulating the DOM (rare in React)
```

The **precise mental model** for useEffect:

> "After React renders this component and updates the DOM, run this code."

useEffect runs **after** the render is committed to the DOM. The user sees the render first, then the effect runs. This is intentional — effects shouldn't block the browser from painting.

### The Three Forms — Dependency Array Controls Everything

```jsx
// Form 1: No dependency array at all
// Runs after EVERY render without exception
useEffect(() => {
  console.log('I run after every single render');
  // Dangerous if it causes state updates — can create infinite loops
});

// Form 2: Empty dependency array []
// Runs ONCE — after the initial render only
// "When this component appears, do this. Don't do it again."
// Equivalent to componentDidMount in class components
useEffect(() => {
  console.log('I run only once, right after mounting');
  // Fetch initial data, set up subscriptions, read from DOM
}, []);

// Form 3: Dependencies in the array
// Runs after initial render, then after any render where
// one or more dependency VALUES have changed (Object.is comparison)
useEffect(() => {
  console.log('count or name changed — I re-ran');
}, [count, name]);

// Reads as: "synchronize with count and name"
// When count or name change → effect re-runs
```

**React's internal decision after each render:**

```
After render completes and DOM updates:
       ↓
Is there a dependency array?
  → No array: ALWAYS run the effect
  → Has array: compare each dep with Object.is(prev, current)
      → Any dep changed? → run the effect
      → All deps same?   → skip the effect
```

### What Goes in the Dependency Array

The rule is simple: **if your effect uses a value from the component scope, it must be in the dependency array.**

```jsx
function SearchComponent({ query, userId }) {
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);

  useEffect(() => {
    // This effect uses: query, userId, page
    // All three must be in the deps array
    fetchResults(query, userId, page).then(setResults);
  }, [query, userId, page]);   // ✅ all dependencies listed

  // ❌ MISSING deps — stale closure bug:
  useEffect(() => {
    fetchResults(query, userId, page).then(setResults);
  }, [query]);  // userId and page are "stale" — effect doesn't re-run when they change
}
```

**What you DON'T need in the dependency array:**

```jsx
// These are STABLE references — React guarantees they never change:
// 1. State setter functions from useState
const [count, setCount] = useState(0);
useEffect(() => {
  setCount(count + 1);  // setCount is stable — omit from deps
}, [count]);            // only 'count' is needed

// 2. dispatch from useReducer — also stable
// 3. Functions defined OUTSIDE the component (module-level)
// 4. Refs (useRef values) — ref.current can change but ref itself is stable
```

### The Cleanup Function — Critical for Preventing Memory Leaks

`useEffect` can optionally return a function. React calls this **cleanup function** in two situations:
1. Before the effect runs again (when a dependency changed)
2. When the component unmounts (is removed from the DOM)

```jsx
useEffect(() => {
  // SETUP — runs after render
  console.log('Effect runs');
  const subscription = someAPI.subscribe(handler);

  // CLEANUP — function returned from useEffect
  return () => {
    console.log('Cleanup runs before next effect or unmount');
    someAPI.unsubscribe(subscription);
  };
}, [dependency]);
```

**Why cleanup matters — memory leak scenario:**

```jsx
// ❌ MEMORY LEAK — no cleanup
function LiveScore({ matchId }) {
  const [score, setScore] = useState(null);

  useEffect(() => {
    const ws = new WebSocket(`wss://scores.api/match/${matchId}`);
    ws.onmessage = (event) => {
      setScore(JSON.parse(event.data));
    };
    // NO cleanup — if component unmounts, the WebSocket stays OPEN
    // Messages keep arriving, setScore gets called on unmounted component
    // React warning: "Can't perform a React state update on an unmounted component"
    // This is a memory leak
  }, [matchId]);
}

// ✅ CORRECT — proper cleanup
function LiveScore({ matchId }) {
  const [score, setScore] = useState(null);

  useEffect(() => {
    const ws = new WebSocket(`wss://scores.api/match/${matchId}`);
    ws.onmessage = (event) => {
      setScore(JSON.parse(event.data));
    };

    // Cleanup: runs when matchId changes OR component unmounts
    return () => {
      ws.close();
    };
  }, [matchId]);
}
```

### The Complete useEffect Lifecycle — Visualized

```
Component first mounts
        ↓
React renders JSX → commits to DOM → browser paints
        ↓
useEffect SETUP runs (async, after paint)
        ─────────────── time passes ───────────────
        ↓
Dependency changes → component re-renders
        ↓
React renders new JSX → commits changes to DOM → browser repaints
        ↓
useEffect CLEANUP runs (from the PREVIOUS effect)
        ↓
useEffect SETUP runs again (with fresh dependencies)
        ─────────────── time passes ───────────────
        ↓
Component unmounts (removed from DOM)
        ↓
useEffect CLEANUP runs one final time
        ↓
Component gone, memory freed
```

**In StrictMode (development only):** React intentionally runs effects twice on mount (setup → cleanup → setup) to help detect missing cleanup functions. This double-run does NOT happen in production.

### Common useEffect Patterns

**Pattern 1: Fetching data on mount or when a prop changes**

```jsx
// src/components/UserProfile.jsx
import { useState, useEffect } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Reset all state when userId changes
    setIsLoading(true);
    setError(null);
    setUser(null);

    // AbortController: cancel the fetch if userId changes before it completes
    // or if the component unmounts before the fetch completes
    const abortController = new AbortController();

    async function fetchUser() {
      try {
        const response = await fetch(
          `https://jsonplaceholder.typicode.com/users/${userId}`,
          { signal: abortController.signal }
        );

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        const data = await response.json();
        setUser(data);
      } catch (err) {
        // AbortError is NOT a real error — it's intentional cancellation
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchUser();

    // Cleanup: if userId changes or component unmounts, cancel the in-flight request
    return () => {
      abortController.abort();
    };
  }, [userId]);  // re-runs whenever userId prop changes

  // Handle all states with early returns (Stage 3 pattern)
  if (isLoading) return (
    <div style={{ color: '#aaa', padding: '1rem' }}>Loading user...</div>
  );
  if (error) return (
    <div style={{ color: '#e74c3c', padding: '1rem' }}>Error: {error}</div>
  );
  if (!user) return null;

  return (
    <div style={{ padding: '1.5rem', backgroundColor: '#1a1a1a',
                  borderRadius: '8px', border: '1px solid #444', maxWidth: '400px' }}>
      <h2 style={{ color: '#fff', marginBottom: '0.5rem' }}>{user.name}</h2>
      <p style={{ color: '#aaa', margin: '0.25rem 0' }}>📧 {user.email}</p>
      <p style={{ color: '#aaa', margin: '0.25rem 0' }}>📞 {user.phone}</p>
      <p style={{ color: '#aaa', margin: '0.25rem 0' }}>🌐 {user.website}</p>
      <p style={{ color: '#aaa', margin: '0.25rem 0' }}>🏢 {user.company?.name}</p>
    </div>
  );
}

export default UserProfile;
```

**Pattern 2: Document title synchronization**

```jsx
function PageWithTitle({ title, children }) {
  useEffect(() => {
    const previousTitle = document.title;        // save current title
    document.title = `${title} | My App`;

    return () => {
      document.title = previousTitle;            // restore on unmount
    };
  }, [title]);

  return <div>{children}</div>;
}

// Usage: <PageWithTitle title="Dashboard"><DashboardContent /></PageWithTitle>
```

**Pattern 3: Event listener with cleanup**

```jsx
// This is a custom hook — the logic is extracted and reusable
function useWindowSize() {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  useEffect(() => {
    function handleResize() {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    }

    window.addEventListener('resize', handleResize);

    // CRITICAL: without this cleanup, every time this component re-renders,
    // ANOTHER event listener is added → memory leak + performance degradation
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);  // [] = set up once on mount, tear down on unmount

  return size;
}

function ResponsiveLayout() {
  const { width } = useWindowSize();

  return (
    <div>
      <p style={{ color: '#aaa' }}>Window width: {width}px</p>
      {width < 768 ? <MobileLayout /> : <DesktopLayout />}
    </div>
  );
}
```

**Pattern 4: Syncing state to localStorage**

```jsx
function useSyncedState(key, initialValue) {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);  // sync whenever key or value changes

  return [value, setValue];
}
```

**Pattern 5: Interval with cleanup**

```jsx
function LiveClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);  // always clean up intervals
  }, []);  // run once — interval handles the updates

  return (
    <p style={{ color: '#fff', fontFamily: 'monospace' }}>
      {time.toLocaleTimeString()}
    </p>
  );
}
```

### The Stale Closure Problem — One of React's Trickiest Bugs

A **stale closure** occurs when a `useEffect` callback captures a variable from the component's render scope, but the dependency array doesn't include that variable. The effect never re-runs, and the captured variable is forever frozen at its initial value.

```jsx
// ❌ STALE CLOSURE BUG
function Timer() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      // 'count' here is captured from the FIRST render — it will ALWAYS be 0
      // The closure closed over count=0 when the effect first ran
      setCount(count + 1);   // always 0 + 1 = 1 → timer is stuck at 1 forever
    }, 1000);

    return () => clearInterval(interval);
  }, []);  // empty deps = runs once = captures count=0 forever

  return <p style={{ color: '#fff', fontSize: '2rem' }}>{count}</p>;
}

// ✅ FIX 1: Use updater function — doesn't need to read count at all
function Timer() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(prev => prev + 1);  // React provides the actual current value
    }, 1000);

    return () => clearInterval(interval);
  }, []);  // no deps needed — updater function handles currency

  return <p style={{ color: '#fff', fontSize: '2rem' }}>{count}</p>;
}

// ✅ FIX 2: Add count to deps — effect re-runs each time count changes
function Timer() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(count + 1);   // count is always fresh — effect re-runs every second
    }, 1000);

    return () => clearInterval(interval);  // clear old interval before setting new one
  }, [count]);  // re-run every time count changes = fresh closure each time

  return <p style={{ color: '#fff', fontSize: '2rem' }}>{count}</p>;
}
```

**How the stale closure happens — visualized:**

```
Render 1: count = 0
  useEffect runs → creates setInterval
  The closure captures: count = 0
  [deps = [], effect won't run again]

Render 2: count = 1 (after first tick)
  useEffect does NOT re-run (empty deps)
  setInterval callback still has: count = 0

Render 3: count = 2?
  Actually NO — count stays 1 because:
  setInterval is still using count = 0
  setCount(0 + 1) = setCount(1) every tick
  Count is permanently stuck at 1
```

**The practical rule:** If you reference a variable inside `useEffect`, it should be in the dependency array. The `react-hooks/exhaustive-deps` ESLint rule enforces this and catches stale closures before they become bugs.

### useEffect vs useLayoutEffect

There is a lesser-used variant called `useLayoutEffect`:

```
useEffect:
  → Runs AFTER the browser paints the screen
  → Async, non-blocking
  → Default choice for 99% of cases

useLayoutEffect:
  → Runs BEFORE the browser paints (synchronously after DOM mutations)
  → Blocking — the browser waits for it before painting
  → Use only when you need to read/set DOM measurements before paint
  → Example: tooltip positioning, scroll restoration, animation setup
```

---

## 4.3 — `useRef` — The Escape Hatch from React's Rendering System

### What useRef Is

`useRef` creates a **mutable container** that:
1. **Persists across renders** — survives re-renders without being reset
2. **Does NOT trigger re-renders when changed** — unlike state
3. Has a single property: `.current`

```jsx
const ref = useRef(initialValue);
// ref is: { current: initialValue }

ref.current = 'new value';  // Mutate freely — no re-render triggered
console.log(ref.current);   // Read freely — always current value
```

**The fundamental contrast:**

```
useState:
  → Changing it → re-render → UI updates
  → Use for: anything the user needs to SEE

useRef:
  → Changing it → NO re-render → UI doesn't update
  → Use for: anything you need to STORE but not SHOW
```

### Use Case 1: Accessing DOM Elements Directly

The most common use of `useRef` — getting a direct handle to a real DOM node:

```jsx
import { useRef, useEffect, useState } from 'react';

function SearchBar() {
  const inputRef = useRef(null);   // null initially — set after first render

  // Auto-focus when component first appears
  useEffect(() => {
    inputRef.current.focus();   // direct DOM API call
  }, []);

  function handleClear() {
    inputRef.current.value = '';
    inputRef.current.focus();
  }

  function handleSelectAll() {
    inputRef.current.select();   // browser built-in DOM method
  }

  return (
    <div style={{ display: 'flex', gap: '0.5rem' }}>
      <input
        ref={inputRef}          // React sets inputRef.current = this DOM node after render
        type="text"
        placeholder="Search..."
        style={{ flex: 1, padding: '0.5rem', backgroundColor: '#333',
                 color: '#fff', border: '1px solid #555', borderRadius: '4px' }}
      />
      <button
        onClick={handleClear}
        style={{ padding: '0.5rem 1rem', backgroundColor: '#444',
                 color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        Clear
      </button>
      <button
        onClick={handleSelectAll}
        style={{ padding: '0.5rem 1rem', backgroundColor: '#444',
                 color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        Select All
      </button>
    </div>
  );
}
```

**How the `ref` prop works:**

When you put `ref={someRef}` on a JSX element, React sets `someRef.current` to the actual DOM node after rendering. React manages this automatically — sets it on mount, updates it if the element changes, and sets it back to `null` when the element unmounts.

**When to access DOM directly (rare in React):**
- Focus management (inputs, modals, menus)
- Scroll control (`element.scrollIntoView()`, `element.scrollTop`)
- Measuring dimensions (`getBoundingClientRect()`)
- Integrating third-party DOM libraries (charts, maps, video players, rich text editors)
- Triggering imperative animations

### Use Case 2: Persisting Values Across Renders Without Triggering Re-Renders

```jsx
import { useState, useRef } from 'react';

function StopWatch() {
  const [time, setTime] = useState(0);          // DISPLAYED — needs to trigger re-render
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef(null);              // NOT displayed — just stored for cleanup

  function handleStart() {
    if (isRunning) return;
    setIsRunning(true);

    // Store the interval ID in a ref
    // If we used useState, calling setInterval would cause extra unnecessary renders
    // The UI never needs to show the interval ID, it just needs to exist for cleanup
    intervalRef.current = setInterval(() => {
      setTime(prev => prev + 10);
    }, 10);
  }

  function handleStop() {
    clearInterval(intervalRef.current);  // use the stored ID
    intervalRef.current = null;
    setIsRunning(false);
  }

  function handleReset() {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    setIsRunning(false);
    setTime(0);
  }

  const minutes = Math.floor(time / 60000);
  const seconds = Math.floor((time % 60000) / 1000);
  const ms = Math.floor((time % 1000) / 10);
  const display = `${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}.${String(ms).padStart(2,'0')}`;

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <div style={{ fontSize: '3rem', fontFamily: 'monospace', color: '#fff',
                    marginBottom: '1.5rem', backgroundColor: '#1a1a1a',
                    padding: '1rem 2rem', borderRadius: '8px',
                    display: 'inline-block', minWidth: '220px' }}>
        {display}
      </div>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <button onClick={handleStart} disabled={isRunning}
          style={{ padding: '0.6rem 1.5rem', backgroundColor: '#27ae60',
                   color: '#fff', border: 'none', borderRadius: '4px',
                   cursor: isRunning ? 'not-allowed' : 'pointer',
                   opacity: isRunning ? 0.5 : 1 }}>
          Start
        </button>
        <button onClick={handleStop} disabled={!isRunning}
          style={{ padding: '0.6rem 1.5rem', backgroundColor: '#e74c3c',
                   color: '#fff', border: 'none', borderRadius: '4px',
                   cursor: !isRunning ? 'not-allowed' : 'pointer',
                   opacity: !isRunning ? 0.5 : 1 }}>
          Stop
        </button>
        <button onClick={handleReset}
          style={{ padding: '0.6rem 1.5rem', backgroundColor: '#444',
                   color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Reset
        </button>
      </div>
    </div>
  );
}

export default StopWatch;
```

### Ref vs State — The Complete Decision Guide

```
Ask: "Does the UI need to show this value?"
  → YES → useState   (changing it shows updated UI)
  → NO  → useRef     (changing it does not update UI)

Common useRef use cases:
  ✓ DOM element references (focus, measure, scroll)
  ✓ Timer/interval IDs (clearInterval needs the ID; user doesn't see it)
  ✓ WebSocket or EventSource instances
  ✓ Third-party library instances (chart.js instances, map instances, player instances)
  ✓ Previous value tracking
  ✓ Tracking if component has mounted yet (isMounted pattern)
  ✓ Tracking render count (debugging)
  ✓ Any mutable value that shouldn't trigger re-renders when changed
```

### Tracking Previous Value — A Powerful Pattern

```jsx
import { useState, useEffect, useRef } from 'react';

// Custom hook: returns the value from the PREVIOUS render
function usePrevious(value) {
  const ref = useRef(undefined);

  // After each render, store the current value
  // This runs AFTER the render, so ref.current is still the PREVIOUS value
  // during this render (returned below), and gets updated AFTER
  useEffect(() => {
    ref.current = value;
  }); // No deps — runs after every render

  return ref.current;  // Returns previous render's value
}

function PriceTracker() {
  const [price, setPrice] = useState(100);
  const prevPrice = usePrevious(price);

  const change = prevPrice !== undefined ? price - prevPrice : 0;
  const isUp = change > 0;

  return (
    <div style={{ padding: '2rem' }}>
      <p style={{ color: '#fff', fontSize: '2rem', margin: 0 }}>
        ${price.toFixed(2)}
        {prevPrice !== undefined && change !== 0 && (
          <span style={{ fontSize: '1rem', marginLeft: '1rem',
                         color: isUp ? '#27ae60' : '#e74c3c' }}>
            {isUp ? '▲' : '▼'} ${Math.abs(change).toFixed(2)}
          </span>
        )}
      </p>
      <p style={{ color: '#555', fontSize: '0.9rem' }}>
        Previous: {prevPrice !== undefined ? `$${prevPrice.toFixed(2)}` : 'N/A'}
      </p>
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <button onClick={() => setPrice(p => p + Math.random() * 10)}
          style={{ padding: '0.5rem 1rem', backgroundColor: '#27ae60',
                   color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Price Up
        </button>
        <button onClick={() => setPrice(p => Math.max(0, p - Math.random() * 10))}
          style={{ padding: '0.5rem 1rem', backgroundColor: '#e74c3c',
                   color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Price Down
        </button>
      </div>
    </div>
  );
}
```

---

## 4.4 — `useMemo` — Caching Expensive Computations

### What useMemo Does

`useMemo` memoizes the **result of a computation**. It runs the function and caches the return value. On subsequent renders, if the dependencies haven't changed, it returns the cached result without re-running the function.

```jsx
const memoizedValue = useMemo(() => computeExpensiveValue(a, b), [a, b]);
//                                  ↑ function that returns a value  ↑ deps
```

**Without useMemo:**
```
Every render → expensiveComputation() runs → result returned
Even if inputs (a, b) haven't changed → still recalculates
```

**With useMemo:**
```
First render → expensiveComputation(a, b) runs → result cached
Re-render, a/b same → returns cached result immediately, function skipped
Re-render, a or b changed → re-runs function, caches new result
```

### When to Use useMemo — The Real Rules

```
USE useMemo when:
  1. The computation is genuinely expensive
     → Filtering/sorting large arrays (1000+ items)
     → Complex mathematical calculations
     → Building large derived data structures
     → Operations that take measurable time (>1ms)

  2. The result is used as a dependency in useEffect or useCallback
     → Without memoization, new object/array reference every render
     → This would cause useEffect/useCallback to re-run every render

  3. The result is passed as props to a React.memo-wrapped component
     → Without memoization, new reference = child re-renders unnecessarily

DO NOT use useMemo for:
  → Simple operations (string concatenation, basic arithmetic)
  → Components that rarely re-render
  → Values that change on almost every render (memoization never helps)
  → "Just in case" optimization — always profile first
```

**The overhead of useMemo itself:**
- Stores the result in memory
- Compares dependencies on every render
- For trivial computations, the overhead of comparison > the computation itself

### Practical Example — Expensive Filtering and Sorting

```jsx
import { useState, useMemo } from 'react';

// Simulate a large dataset — created once at module level
const ALL_PRODUCTS = Array.from({ length: 10000 }, (_, i) => ({
  id: i + 1,
  name: `Product ${i + 1}`,
  price: Math.random() * 1000,
  category: ['Electronics', 'Books', 'Clothing', 'Food'][i % 4],
  rating: Math.random() * 5
}));

function ProductSearch() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [unrelatedCounter, setUnrelatedCounter] = useState(0);

  // Without useMemo: filter+sort runs even when unrelatedCounter changes
  // With useMemo: filter+sort ONLY runs when search, category, or sortBy changes
  const filteredAndSorted = useMemo(() => {
    console.log('Expensive filter/sort running...');

    let result = ALL_PRODUCTS;

    if (category !== 'All') {
      result = result.filter(p => p.category === category);
    }

    if (search.trim()) {
      const query = search.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(query));
    }

    return [...result].sort((a, b) => {
      if (sortBy === 'name')       return a.name.localeCompare(b.name);
      if (sortBy === 'price-asc')  return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating')     return b.rating - a.rating;
      return 0;
    });
  }, [search, category, sortBy]);  // ONLY re-compute when these change

  return (
    <div style={{ padding: '2rem', maxWidth: '700px' }}>
      <h2 style={{ color: '#fff', marginBottom: '1rem' }}>
        Product Search (10,000 items)
      </h2>

      {/* Unrelated state — incrementing this should NOT re-run filter/sort */}
      <div style={{ marginBottom: '1rem' }}>
        <button
          onClick={() => setUnrelatedCounter(c => c + 1)}
          style={{ padding: '0.5rem 1rem', backgroundColor: '#333',
                   color: '#aaa', border: '1px solid #555', borderRadius: '4px',
                   cursor: 'pointer', marginRight: '1rem' }}
        >
          Unrelated action: {unrelatedCounter}
        </button>
        <span style={{ color: '#555', fontSize: '0.85rem' }}>
          (filter/sort should NOT re-run — check console)
        </span>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search products..."
          style={{ flex: 1, minWidth: '200px', padding: '0.5rem',
                   backgroundColor: '#333', color: '#fff',
                   border: '1px solid #555', borderRadius: '4px' }}
        />
        <select value={category} onChange={e => setCategory(e.target.value)}
          style={{ padding: '0.5rem', backgroundColor: '#333',
                   color: '#fff', border: '1px solid #555', borderRadius: '4px' }}>
          {['All','Electronics','Books','Clothing','Food'].map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          style={{ padding: '0.5rem', backgroundColor: '#333',
                   color: '#fff', border: '1px solid #555', borderRadius: '4px' }}>
          <option value="name">Name</option>
          <option value="price-asc">Price ↑</option>
          <option value="price-desc">Price ↓</option>
          <option value="rating">Rating ↓</option>
        </select>
      </div>

      <p style={{ color: '#aaa', marginBottom: '1rem' }}>
        Showing {filteredAndSorted.length.toLocaleString()} of{' '}
        {ALL_PRODUCTS.length.toLocaleString()} products
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {filteredAndSorted.slice(0, 20).map(product => (
          <div key={product.id}
            style={{ display: 'flex', justifyContent: 'space-between',
                     padding: '0.75rem', backgroundColor: '#1a1a1a',
                     borderRadius: '6px', border: '1px solid #333' }}>
            <div>
              <span style={{ color: '#fff' }}>{product.name}</span>
              <span style={{ color: '#646cff', fontSize: '0.85rem', marginLeft: '1rem' }}>
                {product.category}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <span style={{ color: '#27ae60' }}>${product.price.toFixed(2)}</span>
              <span style={{ color: '#f1c40f' }}>★ {product.rating.toFixed(1)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductSearch;
```

---

## 4.5 — `useCallback` — Stabilizing Function References

### The Problem useCallback Solves

Every time a React component renders, every function defined inside it is **recreated** — a brand new function object allocated in memory with a new reference:

```jsx
function Parent() {
  const [count, setCount] = useState(0);

  // On EVERY render of Parent:
  // - handleClick is created fresh → new reference in memory
  // - Even though the function body is identical to last render
  function handleClick() {
    console.log('clicked');
  }

  // Render 1: handleClick → 0xABCD (memory address)
  // Render 2: handleClick → 0xEF01 (different address, same logic)
  // These are NOT equal by reference: 0xABCD !== 0xEF01
}
```

This is usually fine. But it creates problems in two specific cases:

**Problem 1: Memoized child components (React.memo)**

```jsx
// React.memo makes a component skip re-rendering if props are same
const ChildComponent = memo(function Child({ onAction }) {
  console.log('Child rendered');
  return <button onClick={onAction}>Action</button>;
});

function Parent() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');

  // handleSave is recreated every render
  // When 'text' changes → Parent re-renders → handleSave gets new reference
  // → Child receives new onAction prop reference
  // → memo() sees prop changed → Child re-renders
  // → Even though count (which handleSave uses) didn't change
  function handleSave() {
    console.log('Saving count:', count);
  }

  return (
    <div>
      <input onChange={e => setText(e.target.value)} />  {/* causes re-render */}
      <ChildComponent onAction={handleSave} />            {/* re-renders on every keystroke */}
    </div>
  );
}
```

**Problem 2: Function as useEffect dependency**

```jsx
function Component({ userId }) {
  // fetchUser is recreated every render
  // This means useEffect's deps change every render
  // Which means the effect runs on EVERY render
  function fetchUser() {
    return fetch(`/api/users/${userId}`);
  }

  useEffect(() => {
    fetchUser().then(/* ... */);
  }, [fetchUser]);  // fetchUser changes every render → infinite loop
}
```

### How useCallback Solves This

`useCallback` memoizes the function itself — returns the **same function reference** as long as dependencies haven't changed:

```jsx
const stableFunction = useCallback(() => {
  // function body
}, [dependencies]);
// Same reference returned if deps unchanged
// New function created if any dep changes
```

### React.memo + useCallback Working Together

```jsx
import { useState, useCallback, memo } from 'react';

// memo() wraps a component — skips re-render if props are shallowly equal
const ExpensiveChild = memo(function ExpensiveChild({ onAction, label }) {
  console.log(`ExpensiveChild "${label}" rendered`);
  return (
    <button onClick={onAction}
      style={{ padding: '0.5rem 1rem', margin: '0.25rem',
               backgroundColor: '#646cff', color: '#fff',
               border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
      {label}
    </button>
  );
});

function Parent() {
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');

  // ✅ handleSave is stable as long as 'count' doesn't change
  // Typing in the input (changing 'text') won't recreate handleSave
  // → ExpensiveChild doesn't re-render when user types
  const handleSave = useCallback(() => {
    console.log('Saving count:', count);
  }, [count]);  // Only recreate when count changes

  // ✅ handleReset has no dependencies — stable forever (created once)
  const handleReset = useCallback(() => {
    setCount(0);
  }, []);   // setter functions are stable — no deps needed

  return (
    <div style={{ padding: '2rem' }}>
      <p style={{ color: '#aaa', marginBottom: '1rem' }}>Count: {count}</p>

      <div style={{ marginBottom: '1rem' }}>
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Type here (triggers Parent re-render)..."
          style={{ padding: '0.5rem', backgroundColor: '#333', color: '#fff',
                   border: '1px solid #555', borderRadius: '4px', width: '300px' }}
        />
      </div>

      <button onClick={() => setCount(c => c + 1)}
        style={{ padding: '0.5rem 1rem', marginBottom: '1rem',
                 backgroundColor: '#333', color: '#fff',
                 border: '1px solid #555', borderRadius: '4px', cursor: 'pointer' }}>
        Increment Count
      </button>

      {/* These children WON'T re-render when you type — only when count changes */}
      <div>
        <ExpensiveChild onAction={handleSave} label="Save" />
        <ExpensiveChild onAction={handleReset} label="Reset" />
      </div>

      <p style={{ color: '#555', fontSize: '0.85rem', marginTop: '1rem' }}>
        Open console — watch which children re-render when you type vs. increment
      </p>
    </div>
  );
}

export default Parent;
```

### The Golden Rule for useCallback

```
useCallback is ONLY useful when:
  1. Passing the function to a React.memo-wrapped child
     (stable reference = child doesn't re-render unnecessarily)

  2. The function is used as a dependency in useEffect or useMemo
     (stable reference = effect/memo doesn't re-run unnecessarily)

DO NOT use useCallback:
  → On every function "just in case" — it adds overhead without benefit
  → When the child is not wrapped in React.memo
  → When the function changes on every render anyway (its deps change often)
```

### useMemo vs useCallback — The Clear Distinction

```
useMemo:    memoizes the RESULT of calling a function
  → returns: a value (string, number, array, object)
  → use for: expensive computed values

useCallback: memoizes the FUNCTION ITSELF
  → returns: a function reference
  → use for: stable callbacks passed to memo'd components or used as deps

useMemo(() => fn, deps) === useCallback(fn, deps)
// These are equivalent — useCallback is just syntactic sugar for
// useMemo that returns a function
```

---

## 4.6 — `useContext` — Sharing State Without Prop Drilling

### The Problem useContext Solves

As apps grow, data needs to be accessible at many levels of the component tree. Passing it via props through every intermediate level is called **prop drilling**:

```
Without Context — prop drilling:
  App (has 'user' state)
    ↓ passes user prop ↓
    Layout (doesn't need user — just passes it down)
      ↓ passes user prop ↓
      Sidebar (doesn't need user — just passes it down)
        ↓ passes user prop ↓
        UserMenu (FINALLY uses user)

Every intermediate component is polluted with a prop it doesn't use.
With 5+ levels, this becomes unmaintainable.

With Context:
  App (creates ThemeContext with 'user' value)
    Layout (doesn't touch context)
      Sidebar (doesn't touch context)
        UserMenu (reads 'user' DIRECTLY from context — skips all intermediates)
```

### How Context Works — Three Steps

```
Step 1: CREATE  → createContext() defines what data will be shared
Step 2: PROVIDE → <Context.Provider value={...}> makes data available to all descendants
Step 3: CONSUME → useContext(Context) reads the data in any descendant, at any depth
```

### Building a Complete Theme System with useContext

**Step 1: Create the context file**

```jsx
// src/contexts/ThemeContext.jsx
import { createContext, useContext, useState } from 'react';

// createContext(null) — null is the default value used if NO Provider exists above
// In practice, always wrap with Provider — the default is just a safety net
const ThemeContext = createContext(null);

// The Provider component — wraps your app and makes theme available
export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark');

  function toggleTheme() {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }

  // The VALUE object — everything consumers can access
  // Changes to this value trigger re-renders in ALL consumers
  const value = {
    theme,
    toggleTheme,
    isDark: theme === 'dark',
    colors: theme === 'dark'
      ? {
          background: '#242424',
          surface: '#1a1a1a',
          text: '#ffffff',
          textMuted: '#aaaaaa',
          border: '#444444',
          primary: '#646cff'
        }
      : {
          background: '#f5f5f5',
          surface: '#ffffff',
          text: '#213547',
          textMuted: '#666666',
          border: '#dddddd',
          primary: '#646cff'
        }
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook for consuming the context
// ALWAYS do this — never call useContext(ThemeContext) directly in components
// Benefits: 1) adds the null check guard  2) single import instead of two
export function useTheme() {
  const context = useContext(ThemeContext);

  if (context === null) {
    throw new Error('useTheme must be used inside a <ThemeProvider>. ' +
      'Make sure ThemeProvider wraps your component tree.');
  }

  return context;
}
```

**Step 2: Wrap your app in main.jsx**

```jsx
// src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>       {/* All components inside can access theme */}
      <App />
    </ThemeProvider>
  </StrictMode>
);
```

**Step 3: Consume in any descendant**

```jsx
// src/components/ThemedCard.jsx
import { useTheme } from '../contexts/ThemeContext';

function ThemedCard({ title, children }) {
  const { colors } = useTheme();   // ← single import, no prop threading

  return (
    <div style={{
      backgroundColor: colors.surface,
      border: `1px solid ${colors.border}`,
      borderRadius: '8px',
      padding: '1.5rem',
      marginBottom: '1rem',
      transition: 'all 0.3s ease'
    }}>
      {title && (
        <h3 style={{ color: colors.text, marginTop: 0, marginBottom: '1rem' }}>
          {title}
        </h3>
      )}
      <div style={{ color: colors.textMuted }}>
        {children}
      </div>
    </div>
  );
}

export default ThemedCard;
```

```jsx
// src/components/ThemeToggle.jsx
import { useTheme } from '../contexts/ThemeContext';

function ThemeToggle() {
  const { theme, toggleTheme, colors } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      style={{
        padding: '0.5rem 1.25rem',
        backgroundColor: colors.surface,
        color: colors.text,
        border: `1px solid ${colors.border}`,
        borderRadius: '20px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        transition: 'all 0.2s ease'
      }}
    >
      {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
    </button>
  );
}

export default ThemeToggle;
```

```jsx
// src/App.jsx
import { useTheme } from './contexts/ThemeContext';
import ThemedCard from './components/ThemedCard';
import ThemeToggle from './components/ThemeToggle';

function App() {
  const { colors } = useTheme();

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: colors.background,
      transition: 'background-color 0.3s ease',
      padding: '2rem'
    }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ color: colors.text, margin: 0 }}>My App</h1>
          <ThemeToggle />
        </div>

        <ThemedCard title="Welcome">
          <p>This card reads the theme from context automatically.</p>
          <p>No props were threaded through any intermediate components.</p>
        </ThemedCard>

        <ThemedCard title="Features">
          <p>Toggle the theme above — every component updates instantly.</p>
          <p>ThemeToggle and ThemedCard are siblings but share state via Context.</p>
        </ThemedCard>

        <ThemedCard title="Architecture">
          <p>ThemeProvider wraps everything in main.jsx.</p>
          <p>Any component can call useTheme() to access and update the theme.</p>
        </ThemedCard>
      </div>
    </div>
  );
}

export default App;
```

### Context Performance — What to Know

When a Context Provider's `value` changes, **every component that consumes that context re-renders**, regardless of whether the specific part of the value it uses changed.

```jsx
// PROBLEM: Every consumer re-renders when ANY part of value changes
const value = { user, theme, notifications };  // if notifications changes,
                                               // user and theme consumers re-render too

// SOLUTION 1: Split into multiple contexts
const UserContext = createContext(null);
const ThemeContext = createContext(null);
const NotificationContext = createContext(null);
// Each consumer only re-renders when its specific context changes

// SOLUTION 2: Memoize the value object
const value = useMemo(() => ({
  user, theme, notifications
}), [user, theme, notifications]);
// Prevents unnecessary re-renders from new object reference each render
```

### When to Use Context vs Props vs External State Manager

```
LOCAL STATE (useState):
  → Only this component uses it
  → Form inputs, UI toggles, local counters
  → "Does only this component need this?" → yes → useState

PROPS (parent → child passing):
  → Direct parent-child relationship
  → 1-2 levels deep is natural
  → "Can I pass it without threading?" → yes → props

CONTEXT (useContext):
  → Needed by many components at unpredictable depths
  → Global concerns: theme, language/i18n, current user, auth status
  → "Am I drilling props through 3+ levels?" → yes → Context

EXTERNAL STATE MANAGER (Redux Toolkit, Zustand, Jotai):
  → Large team (10+ devs), complex state interactions
  → Frequent high-frequency updates (game state, real-time)
  → Need advanced patterns: optimistic updates, time-travel debugging
  → "Is Context causing performance issues or getting complex?" → yes → external manager
```

---

## 4.7 — Building Custom Hooks — Composing All Hooks Together

### What a Custom Hook Is

A custom hook is a **JavaScript function whose name starts with `use`** that calls other hooks. That's the complete definition. There's no special API — it's just the naming convention that tells React (and the ESLint rules) that this function follows hook rules.

**Why custom hooks are powerful:**
- Extract repeated stateful logic into a single reusable function
- Components become clean — just UI description
- Logic is testable independently from components
- Same behavior, different data — write once, use everywhere

### Custom Hook 1: `useLocalStorage`

```jsx
// src/hooks/useLocalStorage.js
// Drop-in replacement for useState that persists to localStorage.
// Same API: [value, setValue] = useLocalStorage(key, initialValue)

import { useState, useEffect } from 'react';

function useLocalStorage(key, initialValue) {
  // Lazy init: read from localStorage ONCE on mount
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`useLocalStorage: failed to read key "${key}"`, error);
      return initialValue;
    }
  });

  // Sync to localStorage whenever storedValue changes
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.warn(`useLocalStorage: failed to write key "${key}"`, error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
  // Same API as useState — completely interchangeable
}

export default useLocalStorage;

// Usage anywhere in your app:
// const [theme, setTheme] = useLocalStorage('theme', 'dark');
// const [cart, setCart] = useLocalStorage('cart', []);
// const [user, setUser] = useLocalStorage('user', null);
```

### Custom Hook 2: `useFetch`

```jsx
// src/hooks/useFetch.js
// Encapsulates the entire fetch/loading/error pattern.
// Eliminates repeated boilerplate across every data-fetching component.

import { useState, useEffect, useCallback } from 'react';

function useFetch(url) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!url) return;  // null URL = skip (useful for conditional fetching)

    setIsLoading(true);
    setError(null);

    const abortController = new AbortController();

    try {
      const response = await fetch(url, { signal: abortController.signal });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const json = await response.json();
      setData(json);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }

    // Return cleanup function for useEffect
    return () => abortController.abort();
  }, [url]);

  useEffect(() => {
    const cleanup = fetchData();
    // cleanup might be undefined if url was null
    return () => { if (typeof cleanup === 'function') cleanup(); };
  }, [fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData   // expose refetch for manual refresh
  };
}

export default useFetch;

// Usage:
// const { data: users, isLoading, error } = useFetch('https://api.example.com/users');
// const { data: posts, isLoading: postsLoading } = useFetch(userId ? `/api/posts?userId=${userId}` : null);
```

### Using Both Custom Hooks Together

```jsx
// src/pages/UsersPage.jsx
import useFetch from '../hooks/useFetch';
import useLocalStorage from '../hooks/useLocalStorage';

function UsersPage() {
  // Persists selected user across page refreshes
  const [selectedUserId, setSelectedUserId] = useLocalStorage('selectedUser', 1);

  // Fetch all users
  const {
    data: users,
    isLoading: usersLoading,
    error: usersError
  } = useFetch('https://jsonplaceholder.typicode.com/users');

  // Fetch posts for selected user — null URL if no user selected (skips fetch)
  const {
    data: posts,
    isLoading: postsLoading
  } = useFetch(
    selectedUserId
      ? `https://jsonplaceholder.typicode.com/posts?userId=${selectedUserId}`
      : null
  );

  // All the loading/error/empty guards
  if (usersLoading) return (
    <div style={{ padding: '2rem', color: '#aaa' }}>Loading users...</div>
  );
  if (usersError) return (
    <div style={{ padding: '2rem', color: '#e74c3c' }}>Error: {usersError}</div>
  );

  const selectedUser = users?.find(u => u.id === selectedUserId);

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#fff', marginBottom: '1.5rem' }}>Users</h1>

      {/* User selector buttons */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        {users?.map(user => (
          <button
            key={user.id}
            onClick={() => setSelectedUserId(user.id)}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: selectedUserId === user.id ? '#646cff' : '#333',
              color: '#fff',
              border: `1px solid ${selectedUserId === user.id ? '#646cff' : '#555'}`,
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              transition: 'all 0.2s'
            }}
          >
            {user.name.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Posts for selected user */}
      <div>
        <h2 style={{ color: '#fff', marginBottom: '0.5rem' }}>
          Posts by {selectedUser?.name}
        </h2>
        <p style={{ color: '#555', fontSize: '0.8rem', marginBottom: '1rem' }}>
          Selection persists across page refreshes via localStorage
        </p>

        {postsLoading ? (
          <p style={{ color: '#aaa' }}>Loading posts...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {posts?.slice(0, 5).map(post => (
              <div key={post.id}
                style={{ padding: '1rem', backgroundColor: '#1a1a1a',
                         borderRadius: '8px', border: '1px solid #333' }}>
                <h3 style={{ color: '#fff', margin: '0 0 0.5rem',
                             fontSize: '1rem', textTransform: 'capitalize' }}>
                  {post.title}
                </h3>
                <p style={{ color: '#aaa', margin: 0, fontSize: '0.9rem',
                            lineHeight: '1.5' }}>
                  {post.body}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default UsersPage;
```

### Custom Hook 3: `useDebounce`

```jsx
// src/hooks/useDebounce.js
// Returns a debounced version of a value —
// only updates after the value has stopped changing for 'delay' milliseconds.
// Prevents firing expensive operations (API calls, searches) on every keystroke.

import { useState, useEffect } from 'react';

function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set timer to update debounced value after delay
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // If value changes before delay expires, cancel the timer
    // This is what implements the "wait until typing stops" behavior
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;

// Usage:
// const [searchQuery, setSearchQuery] = useState('');
// const debouncedSearch = useDebounce(searchQuery, 500);
//
// useEffect(() => {
//   if (debouncedSearch) fetchSearchResults(debouncedSearch);
// }, [debouncedSearch]);  // Only fires 500ms after user stops typing
```

### Custom Hook 4: `useToggle`

```jsx
// src/hooks/useToggle.js
// Boolean state with a stable toggle function.
// Cleaner than const [open, setOpen] = useState(false)
// when you only ever toggle (never set to specific value).

import { useState, useCallback } from 'react';

function useToggle(initialValue = false) {
  const [value, setValue] = useState(initialValue);

  // useCallback ensures toggle reference is stable
  const toggle = useCallback(() => {
    setValue(prev => !prev);
  }, []);

  // Also expose direct setters for convenience
  const setTrue = useCallback(() => setValue(true), []);
  const setFalse = useCallback(() => setValue(false), []);

  return [value, toggle, { setTrue, setFalse }];
}

export default useToggle;

// Usage:
// const [isOpen, toggleOpen, { setTrue: open, setFalse: close }] = useToggle();
// <button onClick={toggleOpen}>{isOpen ? 'Close' : 'Open'}</button>
// <button onClick={open}>Open Modal</button>
// <button onClick={close}>Close Modal</button>
```

---

## 4.8 — The Complete Hook Decision Tree

```
What do you need?
│
├── Store a value that changes and updates the UI
│   └── useState
│         ├── Value is boolean/flag? → useState(false)
│         ├── Value is object? → useState({}) + spread to update
│         ├── Value is array? → useState([]) + map/filter to update
│         ├── Complex state logic with many cases? → useReducer (see below)
│         └── Initial value is expensive to compute? → useState(() => compute())
│
├── Run code AFTER render (sync with outside world)
│   └── useEffect(() => { ... }, deps)
│         ├── Run ONCE after mount? → useEffect(() => {}, [])
│         ├── Run when specific values change? → useEffect(() => {}, [dep1, dep2])
│         ├── Run after EVERY render? → useEffect(() => {}) (no array)
│         └── Needs cleanup (timer, subscription, listener)?
│               └── return () => { /* cleanup */ }
│
├── Store a value that persists across renders WITHOUT re-rendering
│   └── useRef
│         ├── Need DOM access? → ref={myRef} on JSX, access myRef.current
│         ├── Storing timer/interval ID? → ref.current = setInterval(...)
│         └── Tracking previous value? → update in useEffect after render
│
├── Cache an expensive computed value
│   └── useMemo(() => expensiveCompute(a, b), [a, b])
│         └── Only when: large data transformations, used as dep, or passed to memo'd child
│
├── Stabilize a function reference across renders
│   └── useCallback(() => { fn body }, [deps])
│         └── Only when: passed to React.memo child OR used as useEffect dep
│
├── Share data across many components without prop drilling
│   └── useContext
│         ├── createContext() → define what to share
│         ├── <Context.Provider value={...}> → wrap in main.jsx
│         └── useContext(Context) → consume in any descendant
│               └── Best practice: wrap in custom hook with null guard
│
├── Reuse complex stateful logic across multiple components
│   └── Custom hook (function starting with 'use')
│         ├── Examples: useFetch, useLocalStorage, useDebounce, useToggle
│         └── Can call any combination of built-in hooks
│
└── Complex state with multiple sub-values and many update patterns
    └── useReducer(reducer, initialState)
          ├── reducer: (state, action) => newState
          ├── dispatch({ type: 'INCREMENT' }) to trigger updates
          └── Good for: shopping carts, form state, multi-step processes
```

---

## 4.9 — The Complete Hook Reference Table

```
HOOK          WHAT IT STORES      TRIGGERS RE-RENDER    PERSISTS ACROSS RENDERS   COMMON USE
──────────────────────────────────────────────────────────────────────────────────────────────
useState      any value           YES — on setter call  YES — React manages it    UI state, form data
useRef        any value           NO                    YES — ref.current         DOM refs, timer IDs
useMemo       computed result     NO — reads state      Until deps change         Expensive calculations
useCallback   function reference  NO — reads state      Until deps change         Stable callbacks
useContext    reads from context  YES — on ctx change   N/A                       Global data access
useEffect     no stored value     N/A — side effects    N/A                       API calls, subscriptions
useReducer    state object        YES — on dispatch     YES — React manages it    Complex state logic
```

---

## 4.10 — Stage 4 Exercises

Build these to solidify hook mastery:

**Exercise 1: Debounced Search**

Build a search input that only fires the search operation 500ms after the user stops typing (prevents API hammering on every keystroke).

Hints:
- `useState` for the search input value
- `useRef` for the timer
- `useEffect` to set and clear the debounce timer
- Or use the `useDebounce` custom hook from 4.7

**Exercise 2: `useToggle` Custom Hook**

Create `useToggle(initialValue)` that returns `[value, toggle]`. Use it to build a show/hide password input where the button label changes and the input type toggles between `"text"` and `"password"`.

**Exercise 3: `useCountdown` Custom Hook**

Build `useCountdown(seconds)` that returns `{ timeLeft, isRunning, start, pause, reset }`.

Requirements:
- Counts down from `seconds` to 0
- Stops automatically at 0
- Exposes start, pause, reset controls
- Build a visual countdown timer component using this hook

Hints: `useState` for `timeLeft` and `isRunning`, `useRef` for interval ID, `useEffect` to manage the interval.

**Exercise 4: Multi-Theme Context**

Extend the ThemeContext example to support 3 themes: `dark`, `light`, `ocean` (a teal/blue palette you define).

Requirements:
- Theme selector component that cycles through all three
- At least 3 different components that consume the theme
- Persist the selected theme to localStorage using `useLocalStorage`

**Exercise 5: useFetch With Caching**

Extend the `useFetch` hook to cache responses in a `Map` (stored outside the hook using a module-level variable). If the same URL is requested again, return the cached result immediately without making a new network request.

---

## Stage 4 — Key Takeaways

```
WHAT HOOKS ARE:
✅ Functions that "hook into" React's internal systems from function components
✅ Replaced class components — same power, less complexity
✅ useState/useEffect/useRef are the core three; others build on them

RULES OF HOOKS:
✅ Only call hooks at the top level — never in conditions, loops, or nested functions
✅ Only call hooks from React function components or custom hooks
✅ Violation causes React to read wrong state from wrong linked list slot

useState INTERNALS:
✅ Stored in an ordered linked list on the component's Fiber
✅ React 18 batches all state updates into one re-render automatically
✅ Use lazy initialization for expensive starting values: useState(() => compute())
✅ React skips re-render if new value === old value (Object.is comparison)

useEffect:
✅ Runs AFTER render commits to DOM (non-blocking)
✅ No deps array → every render | [] → once | [deps] → when deps change
✅ Always clean up subscriptions, listeners, timers — return () => cleanup()
✅ Stale closure bug: variable in effect not in deps → frozen at initial value
✅ Fix stale closure: add to deps array, OR use updater function (prev => ...)

useRef:
✅ Persists across renders WITHOUT triggering re-renders
✅ Two uses: DOM element access (ref={myRef}) and storing non-UI values
✅ Rule: "Does UI need to show this?" → yes = useState, no = useRef

useMemo / useCallback:
✅ useMemo: caches a computed VALUE
✅ useCallback: caches a FUNCTION REFERENCE (syntactic sugar over useMemo)
✅ Only useful with React.memo children or as useEffect/useMemo dependencies
✅ Don't over-optimize — profile first, memoize second

useContext:
✅ Three steps: createContext → Provider (wrap app) → useContext (consume)
✅ All consumers re-render when Provider value changes
✅ Always wrap useContext in a custom hook with a null guard
✅ Context for global concerns; props for direct parent-child

Custom hooks:
✅ Function name starting with 'use' that calls other hooks
✅ Extract repeated stateful logic — write once, use everywhere
✅ Same API possibilities as built-in hooks — return anything
✅ Makes components clean: pure UI + hook calls, no logic noise
```

---

## Quick Reference Card

```
STATE:
  const [value, setValue] = useState(initialValue)
  setValue(newValue)
  setValue(prev => prev + 1)                 // updater function (safe)
  useState(() => expensiveCompute())          // lazy initialization

EFFECT:
  useEffect(() => { setup }, [])             // once on mount
  useEffect(() => { setup }, [dep1, dep2])   // when deps change
  useEffect(() => { setup; return cleanup }) // with cleanup

REF:
  const ref = useRef(null)                   // create ref
  ref={ref}                                  // attach to DOM element
  ref.current                                // access stored value
  ref.current = value                        // mutate (no re-render)

MEMO:
  const result = useMemo(() => compute(a, b), [a, b])

CALLBACK:
  const fn = useCallback(() => doSomething(x), [x])

CONTEXT:
  const MyCtx = createContext(null)           // create
  <MyCtx.Provider value={...}>...</MyCtx.Provider>  // provide
  const value = useContext(MyCtx)            // consume

CUSTOM HOOK TEMPLATE:
  function useMyHook(param) {
    const [state, setState] = useState(...)
    useEffect(() => { ... }, [param])
    return { state, setState }
  }
```