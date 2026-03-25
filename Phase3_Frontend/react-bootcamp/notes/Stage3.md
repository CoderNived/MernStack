# React Engineering Bootcamp — Stage 3: Core React Concepts

> **Goal of this stage:** Master the four foundational pillars of React — JSX, Components, Props, and State.
> Everything you will ever build in React is a composition of these four ideas.
> Every advanced concept (hooks, context, routing, data fetching) builds directly on top of them.
> Learn these deeply, not just syntactically.

---

## 3.1 — JSX: What It Really Is

### The Wrong Mental Model (And Why It Breaks)

Most beginners think JSX is "HTML inside JavaScript." This model works for the first week. Then it breaks — and you don't understand why:

- Why does `class` need to be `className`?
- Why can't I use `if` statements directly inside JSX?
- Why must there be one root element?
- Why do some things need `{}` and others don't?

The reason these rules seem arbitrary is because the mental model is wrong. Here is the accurate one:

> **JSX is a syntax extension to JavaScript that gets compiled into plain JavaScript function calls before your code ever runs in the browser.**

Browsers cannot read JSX. Babel (the compiler Vite uses under the hood via `@vitejs/plugin-react`) transforms every JSX expression into `React.createElement()` calls during the build step. JSX is purely a developer convenience — syntactic sugar over function calls.

### The Compilation Step

When you write:

```jsx
const element = <h1 className="title">Hello World</h1>;
```

Babel transforms it into:

```javascript
const element = React.createElement(
  "h1",                    // type: string for HTML elements, function for components
  { className: "title" },  // props: object of attributes/properties
  "Hello World"            // children: content inside the element
);
```

`React.createElement()` returns a **plain JavaScript object** — this is the Virtual DOM node we discussed in Stage 1:

```javascript
// What actually lives in memory after createElement runs:
{
  $$typeof: Symbol(react.element),   // internal React identifier
  type: "h1",
  key: null,
  ref: null,
  props: {
    className: "title",
    children: "Hello World"
  },
  _owner: null,
  _store: {}
}
```

This object is just **data** — a description of what should exist in the UI. React reads these objects later during the reconciliation phase and decides what DOM operations are needed. The actual DOM is never touched during JSX evaluation.

### Tracing a Complex Example

```jsx
// What you write:
function Card() {
  return (
    <div className="card">
      <h2>Title</h2>
      <p>Some text</p>
    </div>
  );
}
```

```javascript
// What Babel compiles it to — EXACTLY:
function Card() {
  return React.createElement(
    "div",
    { className: "card" },
    React.createElement("h2", null, "Title"),      // child 1
    React.createElement("p",  null, "Some text")   // child 2
  );
}
```

You can see it's **nested function calls producing nested objects**. That's the Virtual DOM tree. The nesting in JSX maps directly to nesting of `createElement` calls. Once you see this, every JSX rule becomes obvious — not arbitrary.

> **Modern React note:** Since React 17, you no longer need `import React from 'react'` at the top of every file. The new JSX transform automatically imports the JSX runtime functions. But understanding that JSX = function calls is still essential.

---

## JSX Rules — Every Rule Explained With the Reason Why

### Rule 1: Must Return One Root Element

```jsx
// ❌ WRONG — two root elements side by side
function Component() {
  return (
    <h1>Title</h1>
    <p>Text</p>
  );
}
```

**Why this fails:** `React.createElement` is a function that returns **one value**. A JavaScript function can only return one thing. Two sibling root elements would require two separate return values — which is syntactically impossible.

```javascript
// What the broken code would compile to (impossible JS):
return React.createElement("h1", null, "Title")
       React.createElement("p", null, "Text")   // ← syntax error
```

**Three fixes:**

```jsx
// Fix 1: Wrap in a div (adds an extra DOM node — sometimes fine, sometimes not)
function Component() {
  return (
    <div>
      <h1>Title</h1>
      <p>Text</p>
    </div>
  );
}

// Fix 2: React Fragment — groups elements WITHOUT adding a real DOM node
function Component() {
  return (
    <React.Fragment>
      <h1>Title</h1>
      <p>Text</p>
    </React.Fragment>
  );
}

// Fix 3: Fragment shorthand syntax (most common in practice)
function Component() {
  return (
    <>
      <h1>Title</h1>
      <p>Text</p>
    </>
  );
}
```

**When to use Fragment vs div:**
- Use `<>...</>` when you don't want an extra DOM node — for example, in table rows (`<tr>` children must be `<td>`, not a wrapping `<div>`)
- Use `<React.Fragment key={...}>` when you need to pass a `key` prop (shorthand doesn't accept props)
- Use a `<div>` when you actually need a container for styling purposes

---

### Rule 2: Use `className` Not `class`

```jsx
// ❌ WRONG
<div class="container">

// ✅ CORRECT
<div className="container">
```

**Why:** `class` is a **reserved keyword in JavaScript** (used for ES6 class definitions). Since JSX compiles directly to JavaScript, using `class` as an attribute name would be a syntax conflict. React uses `className`, then converts it to the standard HTML `class` attribute when writing to the real DOM.

Similarly, `for` (used in HTML `<label for="input-id">`) becomes `htmlFor` in JSX because `for` is also a reserved JavaScript keyword (used in `for` loops).

```jsx
// HTML                         JSX equivalent
<label for="email">          → <label htmlFor="email">
<div class="container">      → <div className="container">
<input readonly>             → <input readOnly />
<input maxlength="100">      → <input maxLength={100} />
<input tabindex="1">         → <input tabIndex={1} />
<div contenteditable>        → <div contentEditable>
```

---

### Rule 3: JavaScript Expressions Go Inside `{}`

The `{}` syntax is an **escape hatch** that says: "exit JSX mode, evaluate this as a JavaScript expression, use the result here."

```jsx
const name = "Alice";
const age = 25;
const isAdmin = true;
const items = ['apple', 'banana', 'cherry'];

function Profile() {
  return (
    <div>
      <h1>{name}</h1>                                    {/* variable */}
      <p>Age: {age}</p>                                  {/* number */}
      <p>Born: {2024 - age}</p>                         {/* arithmetic */}
      <p>{age >= 18 ? "Adult" : "Minor"}</p>            {/* ternary */}
      <p>{name.toUpperCase()}</p>                        {/* method call */}
      <p>{isAdmin ? "Admin" : "Regular User"}</p>        {/* conditional */}
      <p>Items: {items.join(', ')}</p>                   {/* array method */}
      <p>{`Hello, ${name}! You are ${age} years old.`}</p>  {/* template literal */}
    </div>
  );
}
```

**What CAN go inside `{}`:** Any JavaScript **expression** — something that evaluates to a value:
- Variables: `{name}`
- Arithmetic: `{price * quantity}`
- Ternaries: `{condition ? a : b}`
- Function calls: `{formatDate(date)}`
- Array methods: `{items.map(...)}`
- Logical operators: `{isLoggedIn && <Dashboard />}`
- Template literals: `` {`Hello ${name}`} ``

**What CANNOT go inside `{}`:** JavaScript **statements** — things that don't produce a value:
```jsx
// ❌ These are statements — not allowed directly in JSX
{ if (condition) { ... } }
{ for (let i = 0; i < 10; i++) { ... } }
{ while (running) { ... } }
{ const x = 5; }    // variable declaration is a statement
```

**The workaround:** Move logic outside JSX, or use expressions:
```jsx
// ✅ Move the if/else logic above the return
function Component({ isLoggedIn }) {
  let content;
  if (isLoggedIn) {
    content = <Dashboard />;
  } else {
    content = <LoginPage />;
  }
  return <div>{content}</div>;
}

// ✅ Or use ternary inside JSX
function Component({ isLoggedIn }) {
  return (
    <div>
      {isLoggedIn ? <Dashboard /> : <LoginPage />}
    </div>
  );
}
```

---

### Rule 4: Self-Closing Tags Must Be Closed

```jsx
// ❌ WRONG — valid HTML but invalid JSX
<img src="photo.jpg">
<input type="text">
<br>
<hr>
<link rel="stylesheet" href="style.css">

// ✅ CORRECT — JSX requires explicit closing
<img src="photo.jpg" />
<input type="text" />
<br />
<hr />
<link rel="stylesheet" href="style.css" />
```

**Why:** JSX is based on XML syntax rules, which are stricter than HTML5. In HTML5, void elements (elements with no content) don't need closing tags. In JSX/XML, every tag must be explicitly closed. The self-closing `/>`  syntax is the JSX way to close a tag without a separate closing tag.

This also applies to your custom components:
```jsx
// ❌ WRONG
<UserCard>

// ✅ CORRECT (if no children)
<UserCard />

// ✅ CORRECT (if has children)
<UserCard>
  <p>Content</p>
</UserCard>
```

---

### Rule 5: All Attributes Are camelCase

JSX attribute names follow JavaScript naming conventions (camelCase), not HTML conventions (lowercase):

```
HTML attribute     → JSX attribute
─────────────────────────────────────
class              → className
for                → htmlFor
onclick            → onClick
onchange           → onChange
onsubmit           → onSubmit
onkeydown          → onKeyDown
onmouseenter       → onMouseEnter
tabindex           → tabIndex
readonly           → readOnly
maxlength          → maxLength
minlength          → minLength
contenteditable    → contentEditable
spellcheck         → spellCheck
autofocus          → autoFocus
autocomplete       → autoComplete
enctype            → encType
crossorigin        → crossOrigin
```

**Exception:** `data-*` and `aria-*` attributes keep their hyphenated form because they're not JavaScript identifiers:

```jsx
<div
  data-testid="user-card"         // ✅ hyphenated, fine
  aria-label="Close dialog"       // ✅ hyphenated, fine
  aria-expanded={isOpen}          // ✅ hyphenated, fine
  className="card"                // ✅ camelCase
/>
```

---

### Inline Styles in JSX

In HTML, `style` is a string: `style="color: red; font-size: 16px"`.

In JSX, `style` is a **JavaScript object** with camelCase properties:

```jsx
// HTML:
<div style="color: red; background-color: blue; font-size: 16px;">

// JSX:
<div style={{ color: 'red', backgroundColor: 'blue', fontSize: '16px' }}>
```

The double `{{}}` looks odd at first:
- The outer `{}` = JSX expression container (escape to JavaScript)
- The inner `{}` = a JavaScript object literal

```jsx
// You can also store styles in a variable:
const cardStyle = {
  border: '1px solid #444',
  borderRadius: '8px',
  padding: '1.5rem',
  backgroundColor: '#1a1a1a'
};

function Card() {
  return <div style={cardStyle}>Content</div>;
}
```

**When to use inline styles vs className:**
- Inline styles: for dynamic values that depend on JavaScript variables (e.g., `{ width: `${progress}%` }`)
- CSS classes: for static, reusable styling (almost always preferable)
- In production: use CSS Modules, Tailwind CSS, or a component library — inline styles have no media queries, no pseudo-selectors, no reuse

---

### JSX is an Expression, Not a Statement

Because JSX compiles to function calls (which are expressions), JSX itself is an expression. This means you can:

```jsx
// Assign JSX to a variable
const heading = <h1>Hello</h1>;

// Use JSX as a function argument
console.log(<h1>test</h1>);   // logs the React element object

// Return JSX from a ternary
const element = isLoggedIn ? <Dashboard /> : <Login />;

// Store JSX in an array
const items = [<li key="a">A</li>, <li key="b">B</li>];
```

This flexibility is important — you'll use it constantly in conditional rendering and list rendering.

---

## 3.2 — React Components: The Deep Truth

### What a Component Really Is

A React component is, at its core, **a function that takes data in and returns a description of UI**:

```
Input:  props  (data passed from parent — plain JS object)
Output: JSX    (description of what to render — plain JS objects)
```

That's the complete definition. Everything else — hooks, state, effects, context — are tools that extend this fundamental idea without changing it.

```jsx
// The simplest possible component — pure, stateless, reusable
function Greeting() {
  return <h1>Hello, world!</h1>;
}

// A component with input data
function PersonalGreeting({ name }) {
  return <h1>Hello, {name}!</h1>;
}

// Usage
<Greeting />
<PersonalGreeting name="Alice" />
```

### The Two Absolute Rules of Components

**Rule 1: Component names MUST start with a capital letter**

```jsx
// ❌ WRONG — lowercase name
function greeting() {
  return <h1>Hello</h1>;
}
<greeting />    // React renders a literal <greeting> HTML tag — not your function

// ✅ CORRECT — capital letter
function Greeting() {
  return <h1>Hello</h1>;
}
<Greeting />    // React calls your Greeting function
```

**Why this rule exists:** When Babel compiles JSX, it distinguishes between HTML elements and custom components using the case of the name:

```javascript
// Lowercase → passed as a string → native HTML element
React.createElement("greeting", null)   // creates a <greeting> DOM element

// Capitalized → passed as a variable reference → your component function
React.createElement(Greeting, null)     // calls the Greeting function
```

React uses the string `"greeting"` to create a DOM element, and uses the variable `Greeting` to call your function. This single rule is why the case matters — it's not stylistic, it's functional.

**Rule 2: Components must be pure functions with respect to props**

Given the same props, a component must always return the same JSX. This is called **referential transparency** or **purity**.

```jsx
// ✅ Pure — same input always produces same output
function UserBadge({ name, isAdmin }) {
  return (
    <span className={isAdmin ? 'badge-admin' : 'badge-user'}>
      {name}
    </span>
  );
}

// ❌ Impure — output depends on something other than props
function CurrentTime() {
  return <p>{new Date().toLocaleTimeString()}</p>;
  // Same props (none) = different output every second
  // This is a side effect — handled with useEffect (Stage 4)
}

// ❌ Impure — mutates external state
let renderCount = 0;
function Counter() {
  renderCount++;   // mutating something outside the function = side effect
  return <p>Rendered {renderCount} times</p>;
}
```

Side effects (API calls, timers, subscriptions, DOM manipulation) must be handled with `useEffect`, not during render. We cover this deeply in Stage 4.

### How React Calls Your Components (Inversion of Control)

When React encounters `<Greeting />`, here's what happens internally:

```javascript
// React does approximately this:
const output = Greeting(props);   // 1. calls your function with current props
// output = { type: 'h1', props: { children: 'Hello, world!' }, ... }

// React then:
// 2. Takes that Virtual DOM object
// 3. Compares it to the previous render (diffing algorithm)
// 4. Computes minimum real DOM changes
// 5. Applies changes to actual DOM
```

**Key insight:** You write the function. React decides when to call it. This is called **Inversion of Control** — React owns the rendering lifecycle, not you. This is why you should never call component functions directly:

```jsx
// ❌ WRONG — calling it yourself bypasses React's entire system
const element = Greeting();        // React doesn't know about this render

// ✅ CORRECT — let React call it via JSX
const element = <Greeting />;     // React manages the lifecycle
```

This distinction matters because React needs to track renders for state management, effects, and the reconciler to work correctly.

### Component File Structure and Naming Conventions

```
Professional conventions:
├── One component per file (almost always)
├── File name matches component name: UserCard.jsx → function UserCard()
├── Components in src/components/ (reusable) or src/pages/ (route-level)
├── Use PascalCase for both file and component name
└── Always use named default export: export default UserCard;
```

```jsx
// src/components/UserCard.jsx
// File structure for a real component:

// 1. Imports at top
import { useState } from 'react';
import './UserCard.css';  // or CSS module

// 2. Component function
function UserCard({ name, role, email, avatarUrl }) {
  // 3. Hooks (if any) — must be at top of function body
  const [isExpanded, setIsExpanded] = useState(false);

  // 4. Derived values / computed data
  const initials = name.split(' ').map(n => n[0]).join('');

  // 5. Event handlers
  function handleToggle() {
    setIsExpanded(prev => !prev);
  }

  // 6. The return — what to render
  return (
    <div className="user-card">
      <h2>{name}</h2>
    </div>
  );
}

// 7. Default export at the bottom
export default UserCard;
```

### Building Your First Real Component

```jsx
// src/components/UserCard.jsx

function UserCard() {
  return (
    <div style={{
      border: '1px solid #444',
      borderRadius: '8px',
      padding: '1.5rem',
      maxWidth: '300px',
      backgroundColor: '#1a1a1a'
    }}>
      <img
        src="https://i.pravatar.cc/80"
        alt="User avatar"
        style={{ borderRadius: '50%', width: '80px', height: '80px' }}
      />
      <h2 style={{ marginTop: '1rem', color: '#fff' }}>Alice Johnson</h2>
      <p style={{ color: '#aaa' }}>Frontend Engineer</p>
      <p style={{ color: '#aaa', fontSize: '0.9rem' }}>alice@example.com</p>
    </div>
  );
}

export default UserCard;
```

**Using it in App.jsx:**

```jsx
import UserCard from './components/UserCard';
import './styles/global.css';

function App() {
  return (
    <div style={{ padding: '2rem' }}>
      <UserCard />
      <UserCard />    {/* Reusable — renders twice */}
      <UserCard />    {/* Renders three times */}
    </div>
  );
}

export default App;
```

This renders the same hardcoded card three times. The data is baked in. This is the exact problem that **props** solve.

---

## 3.3 — Props: The Component Communication System

### What Props Are

**Props** (short for "properties") are the mechanism for passing data from a **parent component** to a **child component**. They are the primary way components communicate and share data.

Think of a component as a function — props are its arguments:

```
Parent Component
       │
       │  passes data as props
       ↓
Child Component(props)
       │
       │  uses props to render dynamic, data-driven content
       ↓
Different output for different inputs
```

### Passing Props to a Component

Props are passed as attributes, exactly like HTML attributes — but they can hold any JavaScript value:

```jsx
function App() {
  return (
    <div style={{ padding: '2rem' }}>
      {/* String props (quotes or curly braces) */}
      <UserCard
        name="Alice Johnson"
        role="Frontend Engineer"
        email="alice@example.com"
        avatarUrl="https://i.pravatar.cc/80?img=1"
      />

      {/* Different data = different rendered output */}
      <UserCard
        name="Bob Smith"
        role="Backend Engineer"
        email="bob@example.com"
        avatarUrl="https://i.pravatar.cc/80?img=2"
      />
    </div>
  );
}
```

**All the types of values you can pass as props:**

```jsx
<Component
  stringProp="hello"                    // string — quotes or {}
  numberProp={42}                       // number — always {}
  booleanPropTrue={true}                // boolean — always {}
  booleanShorthand                      // shorthand for booleanShorthand={true}
  booleanPropFalse={false}             // boolean false
  arrayProp={[1, 2, 3]}                // array — always {}
  objectProp={{ key: 'value' }}         // object — always {}
  functionProp={() => console.log('!')} // function — always {}
  nullProp={null}                       // null — explicitly passes nothing
  undefinedProp={undefined}             // same as not passing the prop
  jsxProp={<span>Hello</span>}          // JSX element — always {}
  variableProp={someVariable}           // from a variable
/>
```

### Receiving Props — Three Styles

**Style 1: The `props` object (beginner style)**

```jsx
function UserCard(props) {
  // props is a plain JavaScript object:
  // { name: "Alice", role: "Engineer", email: "alice@...", avatarUrl: "..." }

  return (
    <div style={{ border: '1px solid #444', borderRadius: '8px',
                  padding: '1.5rem', maxWidth: '300px', backgroundColor: '#1a1a1a' }}>
      <img
        src={props.avatarUrl}
        alt={`${props.name}'s avatar`}
        style={{ borderRadius: '50%', width: '80px', height: '80px' }}
      />
      <h2 style={{ marginTop: '1rem', color: '#fff' }}>{props.name}</h2>
      <p style={{ color: '#aaa' }}>{props.role}</p>
      <p style={{ color: '#aaa', fontSize: '0.9rem' }}>{props.email}</p>
    </div>
  );
}
```

**Style 2: Destructured in parameter (professional standard)**

```jsx
// Destructure directly in the function signature
function UserCard({ name, role, email, avatarUrl }) {
  return (
    <div style={{ border: '1px solid #444', borderRadius: '8px',
                  padding: '1.5rem', maxWidth: '300px', backgroundColor: '#1a1a1a',
                  marginBottom: '1rem' }}>
      <img
        src={avatarUrl}
        alt={`${name}'s avatar`}
        style={{ borderRadius: '50%', width: '80px', height: '80px' }}
      />
      <h2 style={{ marginTop: '1rem', color: '#fff' }}>{name}</h2>
      <p style={{ color: '#aaa' }}>{role}</p>
      <p style={{ color: '#aaa', fontSize: '0.9rem' }}>{email}</p>
    </div>
  );
}
```

This is cleaner, immediately self-documents what data the component needs, and is the standard in professional React codebases.

**Style 3: Destructure inside function body**

```jsx
function UserCard(props) {
  const { name, role, email, avatarUrl } = props;
  // rest of component...
}
```

Less common — use this when you need access to the full `props` object for some reason (e.g., spreading it onto a DOM element).

### Default Props

If a prop isn't passed, its value will be `undefined`. Handle this with JavaScript default parameter values:

```jsx
function UserCard({
  name = "Anonymous User",
  role = "No role specified",
  email = "No email provided",
  avatarUrl = "https://i.pravatar.cc/80"
}) {
  return (
    <div>
      <h2>{name}</h2>
      <p>{role}</p>
      <p>{email}</p>
      {/* If parent doesn't pass avatarUrl, the default placeholder is used */}
    </div>
  );
}

// Using it without all props — defaults kick in
<UserCard name="Alice" />    // role, email, avatarUrl use defaults
<UserCard />                 // all defaults used
```

This is safer than checking for undefined inline and makes the component's interface self-documenting.

### The `children` Prop — React's Built-In Slot System

React automatically provides a special prop called `children` — it contains **whatever is placed between the opening and closing tags** of your component.

```jsx
// A reusable Card container component
function Card({ children, title }) {
  return (
    <div style={{
      border: '1px solid #444',
      borderRadius: '8px',
      padding: '1.5rem',
      backgroundColor: '#1a1a1a',
      marginBottom: '1rem'
    }}>
      {title && (
        <h2 style={{ color: '#fff', marginBottom: '1rem' }}>{title}</h2>
      )}
      {children}    {/* Renders whatever was placed between <Card> and </Card> */}
    </div>
  );
}

// Usage — anything between the tags becomes children
function App() {
  return (
    <div style={{ padding: '2rem' }}>

      {/* Simple text content as children */}
      <Card title="User Profile">
        <p style={{ color: '#aaa' }}>Alice Johnson</p>
        <p style={{ color: '#aaa' }}>alice@example.com</p>
      </Card>

      {/* Multiple components as children */}
      <Card title="Statistics">
        <p style={{ color: '#aaa' }}>Posts: 42</p>
        <p style={{ color: '#aaa' }}>Followers: 1,024</p>
      </Card>

      {/* No title prop — the h2 doesn't render */}
      <Card>
        <p style={{ color: '#aaa' }}>Content without a title</p>
      </Card>

      {/* Complex nested components as children */}
      <Card title="Actions">
        <button style={{ marginRight: '0.5rem' }}>Edit</button>
        <button>Delete</button>
      </Card>

    </div>
  );
}
```

**Why `children` is powerful:**

The `Card` component doesn't know or care what's inside it. It just provides the visual wrapper (border, padding, background, optional title). The parent decides what content goes inside. This pattern is called the **Container/Presentational** pattern — also known as **composition** — and it's fundamental to React architecture.

`children` can be:
- A string: `<Tooltip>Hover me</Tooltip>`
- A single element: `<Modal><LoginForm /></Modal>`
- Multiple elements: `<Layout><Header /><Main /><Footer /></Layout>`
- An array (when using `.map()`)
- A function (advanced pattern called "render props")
- `null` or `undefined` (if nothing is passed between the tags)

### Prop Drilling — A Problem to Be Aware Of

As your component tree grows deep, you may need to pass data through many intermediate components that don't use it — they just pass it along:

```
App (has user data)
  ↓ passes user prop
  Header (receives user, just passes it down)
    ↓ passes user prop
    NavBar (receives user, just passes it down)
      ↓ passes user prop
      UserAvatar (finally uses user data)
```

This is called **prop drilling** — the data "drills" through layers that don't need it. It works but becomes messy with 3+ levels. Solutions: **React Context** (Stage 8), or state management libraries (Stage 9).

### The Iron Law of Props — Never Mutate Them

Props are **read-only**. A component is a pure function — it should never modify its inputs. This is not a suggestion; it's a rule that, if violated, causes unpredictable behavior and breaks React's ability to track changes.

```jsx
// ❌ NEVER DO THIS — mutating a prop
function UserCard({ user }) {
  user.name = user.name.toUpperCase();    // mutating the prop object
  return <h2>{user.name}</h2>;
}

// ❌ ALSO WRONG
function UserCard({ name }) {
  name = name.toUpperCase();    // reassigning a prop variable
  return <h2>{name}</h2>;
}

// ✅ CORRECT — create a derived value without touching the prop
function UserCard({ name }) {
  const displayName = name.toUpperCase();    // new variable, prop unchanged
  return <h2>{displayName}</h2>;
}

// ✅ CORRECT — create a new object instead of mutating
function UserCard({ user }) {
  const displayUser = { ...user, name: user.name.toUpperCase() };  // new object
  return <h2>{displayUser.name}</h2>;
}
```

**Why this matters:** React's entire change detection system relies on detecting when data changes. If you mutate an object in place (same reference, different contents), React can't detect the change and won't re-render. Additionally, mutating props from a child changes the parent's data unpredictably, making bugs nearly impossible to trace.

**Data in React flows one direction: parent → child.** This unidirectional data flow is what makes React apps predictable and debuggable. If a child needs to update the parent's data, it does so by calling a **function prop** passed from the parent (covered in the next section).

### Lifting State Up — How Children Communicate Back to Parents

Since props only flow down, how does a child tell the parent something happened? Via **function props** (callbacks):

```jsx
// Parent owns the data and the logic
function App() {
  const [selectedUser, setSelectedUser] = useState(null);

  // This function is defined here, but called by the child
  function handleUserSelect(user) {
    setSelectedUser(user);
  }

  return (
    <div>
      {/* Pass the function as a prop */}
      <UserList users={users} onUserSelect={handleUserSelect} />
      {selectedUser && <UserDetail user={selectedUser} />}
    </div>
  );
}

// Child receives and calls the function prop — never owns the data
function UserList({ users, onUserSelect }) {
  return (
    <ul>
      {users.map(user => (
        <li key={user.id} onClick={() => onUserSelect(user)}>
          {user.name}
        </li>
      ))}
    </ul>
  );
}
```

The child calls `onUserSelect(user)` — which is actually `handleUserSelect` in the parent. The parent's state updates. React re-renders both parent and children with the new data. This is the correct pattern for child-to-parent communication.

---

## 3.4 — State: Making Components Dynamic

### What State Is

**Props** = data that comes from outside a component.
**State** = data that lives **inside** a component and can change over time.

When state changes, React automatically re-renders the component. This re-rendering is the **reactive loop** that makes React apps live and interactive.

```
State changes (via a setter function)
       ↓
React schedules a re-render for this component
       ↓
React calls your component function again with the same props
       ↓
Component returns new JSX based on new state values
       ↓
React diffs new Virtual DOM vs previous Virtual DOM
       ↓
React applies minimum DOM changes
       ↓
User sees the update
```

### `useState` — The State Hook

```jsx
import { useState } from 'react';

// Syntax:
const [stateValue, setterFunction] = useState(initialValue);
//     ↑               ↑                       ↑
//  current value   function to         starting value
//  (read-only      change state        (only used on first render)
//   this render)   (triggers re-render)
```

`useState` is a **Hook** — a special function that "hooks into" React's internal state system. Rules for hooks are covered in detail in Stage 4. For now: `useState` returns an array of exactly two elements, which you immediately destructure.

Naming convention: always `[thing, setThing]` — this is universal in the React community.

**The initial value:** The argument to `useState(initialValue)` is used **only once** — when the component first mounts. On subsequent renders, React uses the stored state value, not the initial value. The initial value can be:

```jsx
useState(0)             // number
useState('')            // string
useState(false)         // boolean
useState(null)          // null (data not yet loaded)
useState([])            // empty array
useState({})            // empty object
useState({ name: '', email: '' })  // object with structure

// Expensive initial value? Use lazy initialization:
useState(() => computeExpensiveValue())  // function only called once
```

### Your First Stateful Component — Counter

```jsx
// src/components/Counter.jsx
import { useState } from 'react';

function Counter() {
  // Declare a state variable 'count', initially 0
  // React remembers this value between renders
  const [count, setCount] = useState(0);

  function handleIncrement() {
    setCount(count + 1);
    // React schedules a re-render
    // On the next render, 'count' will be 1
  }

  function handleDecrement() {
    setCount(count - 1);
  }

  function handleReset() {
    setCount(0);
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1rem',
      padding: '2rem',
      border: '1px solid #444',
      borderRadius: '8px',
      maxWidth: '200px'
    }}>
      <h2 style={{ fontSize: '3rem', color: '#fff', margin: 0 }}>{count}</h2>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          onClick={handleDecrement}
          style={{ padding: '0.5rem 1rem', backgroundColor: '#c0392b',
                   color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >−</button>
        <button
          onClick={handleReset}
          style={{ padding: '0.5rem 1rem', backgroundColor: '#555',
                   color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >Reset</button>
        <button
          onClick={handleIncrement}
          style={{ padding: '0.5rem 1rem', backgroundColor: '#27ae60',
                   color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >+</button>
      </div>
    </div>
  );
}

export default Counter;
```

### The Critical Mental Model: State is a Snapshot Per Render

This is one of the most important concepts in React, and it trips up even experienced developers.

**Each render has its own snapshot of state.** When your component function runs, `count` is frozen at whatever value it had when that render started. Calling `setCount` does NOT change `count` in the current render — it schedules the next render to have a new value.

```jsx
function Counter() {
  const [count, setCount] = useState(0);

  function handleBuggyTripleIncrement() {
    // BUG: This does NOT add 3 to count
    setCount(count + 1);   // queues: "set count to 0 + 1 = 1"
    setCount(count + 1);   // queues: "set count to 0 + 1 = 1" (count is STILL 0!)
    setCount(count + 1);   // queues: "set count to 0 + 1 = 1" (count is STILL 0!)
    // count is 0 throughout this entire function call — it's a snapshot
    // React batches these and applies the last one: count becomes 1, not 3
  }

  function handleCorrectTripleIncrement() {
    // CORRECT: Use the updater function form
    setCount(prev => prev + 1);   // React queues: (0) => 0 + 1 = 1
    setCount(prev => prev + 1);   // React queues: (1) => 1 + 1 = 2
    setCount(prev => prev + 1);   // React queues: (2) => 2 + 1 = 3
    // React processes these sequentially — count becomes 3 ✅
  }

  return (
    <div>
      <p style={{ color: '#fff' }}>{count}</p>
      <button onClick={handleBuggyTripleIncrement}>+3 (buggy)</button>
      <button onClick={handleCorrectTripleIncrement}>+3 (correct)</button>
    </div>
  );
}
```

**The updater function pattern:** `setCount(prev => prev + 1)` receives the most recent state value (guaranteed to be current) as its argument, not the stale snapshot. Use this pattern whenever:
- New state depends on old state
- You're setting state multiple times in one handler
- State might be updated by multiple async operations

**React batches state updates:** In React 18, multiple `setState` calls within the same event handler are batched into a single re-render. This is an optimization — instead of re-rendering 3 times for 3 `setState` calls, React renders once with the final state.

### State With Objects

When state is an object, the rules are stricter:

**Never mutate state directly** — React uses **reference equality** (`===`) to detect state changes. If you mutate the same object (same reference), React sees the same reference before and after, concludes nothing changed, and skips the re-render. Always create a **new object**.

```jsx
function UserForm() {
  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });

  function handleFirstNameChange(event) {
    // ❌ WRONG — mutating state directly
    user.firstName = event.target.value;   // same reference, React won't re-render
    setUser(user);                         // React sees same object → no re-render → bug

    // ✅ CORRECT — spread into a new object
    setUser({
      ...user,                             // copy all existing properties
      firstName: event.target.value        // override only this one
    });
  }

  // Cleaner: one generic handler for all fields
  function handleChange(field, value) {
    setUser(prev => ({
      ...prev,
      [field]: value     // computed property name
    }));
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '400px' }}>
      <h2 style={{ color: '#fff', marginBottom: '1rem' }}>User Form</h2>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ color: '#aaa', display: 'block', marginBottom: '0.25rem' }}>
          First Name
        </label>
        <input
          type="text"
          value={user.firstName}
          onChange={e => handleChange('firstName', e.target.value)}
          style={{ width: '100%', padding: '0.5rem', borderRadius: '4px',
                   backgroundColor: '#333', color: '#fff', border: '1px solid #555' }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ color: '#aaa', display: 'block', marginBottom: '0.25rem' }}>
          Last Name
        </label>
        <input
          type="text"
          value={user.lastName}
          onChange={e => handleChange('lastName', e.target.value)}
          style={{ width: '100%', padding: '0.5rem', borderRadius: '4px',
                   backgroundColor: '#333', color: '#fff', border: '1px solid #555' }}
        />
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ color: '#aaa', display: 'block', marginBottom: '0.25rem' }}>
          Email
        </label>
        <input
          type="email"
          value={user.email}
          onChange={e => handleChange('email', e.target.value)}
          style={{ width: '100%', padding: '0.5rem', borderRadius: '4px',
                   backgroundColor: '#333', color: '#fff', border: '1px solid #555' }}
        />
      </div>

      {/* Live preview — derives from state, always in sync */}
      <div style={{ marginTop: '1.5rem', padding: '1rem',
                    backgroundColor: '#1a1a1a', borderRadius: '8px',
                    border: '1px solid #333' }}>
        <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>Preview:</h3>
        <p style={{ color: '#aaa' }}>
          Name: {user.firstName} {user.lastName}
        </p>
        <p style={{ color: '#aaa' }}>Email: {user.email}</p>
      </div>
    </div>
  );
}

export default UserForm;
```

**Deep nesting with state objects:** The spread operator only does a **shallow copy**. For nested objects, you need to spread at each level:

```jsx
const [settings, setSettings] = useState({
  theme: 'dark',
  notifications: {
    email: true,
    sms: false
  }
});

// ❌ WRONG — only top-level is copied, inner object is still mutated
setSettings({ ...settings, notifications: { email: false } });
// (sms property is now missing)

// ✅ CORRECT — spread at every nested level
setSettings({
  ...settings,
  notifications: {
    ...settings.notifications,
    email: false
  }
});
```

For deeply nested state, consider using `useReducer` (Stage 4) or a library like Immer.

### State With Arrays

Arrays follow the same no-mutation rule. Use immutable array operations:

```jsx
function TodoList() {
  const [todos, setTodos] = useState([
    { id: 1, text: 'Learn React', done: false },
    { id: 2, text: 'Build a project', done: false }
  ]);
  const [inputValue, setInputValue] = useState('');

  // ADD — spread existing, append new item
  function handleAddTodo() {
    if (!inputValue.trim()) return;
    setTodos(prev => [
      ...prev,
      {
        id: Date.now(),         // simple unique ID (use UUID in production)
        text: inputValue.trim(),
        done: false
      }
    ]);
    setInputValue('');
  }

  // UPDATE — map returns a new array, modify only the matching item
  function handleToggleTodo(id) {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id
          ? { ...todo, done: !todo.done }   // new object for changed item
          : todo                             // same reference for unchanged items
      )
    );
  }

  // DELETE — filter returns a new array excluding the item
  function handleDeleteTodo(id) {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  }

  // REORDER — create new array with items in new order
  function handleMoveUp(id) {
    setTodos(prev => {
      const index = prev.findIndex(t => t.id === id);
      if (index === 0) return prev;   // already at top
      const newTodos = [...prev];
      [newTodos[index - 1], newTodos[index]] = [newTodos[index], newTodos[index - 1]];
      return newTodos;
    });
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '400px' }}>
      <h2 style={{ color: '#fff', marginBottom: '1rem' }}>Todo List</h2>

      {/* Add input */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAddTodo()}
          placeholder="Add a todo..."
          style={{ flex: 1, padding: '0.5rem', borderRadius: '4px',
                   backgroundColor: '#333', color: '#fff', border: '1px solid #555' }}
        />
        <button
          onClick={handleAddTodo}
          style={{ padding: '0.5rem 1rem', borderRadius: '4px',
                   backgroundColor: '#646cff', color: '#fff',
                   border: 'none', cursor: 'pointer' }}
        >
          Add
        </button>
      </div>

      {/* Todo items */}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {todos.map(todo => (
          <li
            key={todo.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.75rem',
              marginBottom: '0.5rem',
              backgroundColor: '#1a1a1a',
              borderRadius: '6px',
              border: '1px solid #333'
            }}
          >
            <span
              onClick={() => handleToggleTodo(todo.id)}
              style={{
                color: todo.done ? '#555' : '#fff',
                textDecoration: todo.done ? 'line-through' : 'none',
                cursor: 'pointer',
                flex: 1
              }}
            >
              {todo.text}
            </span>
            <button
              onClick={() => handleDeleteTodo(todo.id)}
              style={{ marginLeft: '0.5rem', padding: '0.25rem 0.5rem',
                       backgroundColor: '#c0392b', color: '#fff',
                       border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
              ×
            </button>
          </li>
        ))}
      </ul>

      <p style={{ color: '#aaa', marginTop: '1rem', fontSize: '0.9rem' }}>
        {todos.filter(t => !t.done).length} of {todos.length} remaining
      </p>
    </div>
  );
}

export default TodoList;
```

**Array operations cheat sheet for React state:**

```
Operation      ❌ Mutating (never use)    ✅ Immutable (always use)
─────────────────────────────────────────────────────────────────
Add item       arr.push(item)             [...arr, item]
Prepend        arr.unshift(item)          [item, ...arr]
Remove item    arr.splice(i, 1)           arr.filter(x => x.id !== id)
Update item    arr[i].prop = val          arr.map(x => x.id===id ? {...x,prop:val} : x)
Sort           arr.sort()                 [...arr].sort()
Reverse        arr.reverse()              [...arr].reverse()
Insert at i    arr.splice(i, 0, item)     [...arr.slice(0,i), item, ...arr.slice(i)]
```

### Multiple State Variables vs One State Object

Should you use multiple `useState` calls or one big state object?

```jsx
// Option A: Multiple state variables (usually preferred)
const [name, setName] = useState('');
const [age, setAge] = useState(0);
const [isActive, setIsActive] = useState(false);

// Option B: Single state object
const [formState, setFormState] = useState({ name: '', age: 0, isActive: false });
```

**Guideline:**
- Group state that always changes together (e.g., `x` and `y` coordinates of a point)
- Separate state that changes independently (e.g., `name` vs `isLoading`)
- For complex forms with many related fields, an object makes sense
- For simple flags and individual values, separate `useState` calls are cleaner

---

## 3.5 — Event Handling

### How React Events Work

React uses **Synthetic Events** — wrapper objects around native browser events. Advantages:
- Cross-browser consistency (normalizes Safari, Firefox, Chrome differences)
- Same event API regardless of browser
- Automatic cleanup (no memory leaks)
- Event delegation (React attaches one listener at the root, not one per element)

The synthetic event object has the same API as native browser events — `.target`, `.preventDefault()`, `.stopPropagation()`, etc. You rarely need to think about the synthetic vs native distinction.

### The Three Event Handler Patterns

```jsx
// Pattern 1: Inline arrow function — fine for simple one-liners
<button onClick={() => console.log('clicked')}>Click</button>
<button onClick={() => setCount(count + 1)}>Increment</button>

// Pattern 2: Named handler — preferred for any real logic
function handleClick() {
  console.log('clicked');
  doSomethingComplex();
}
<button onClick={handleClick}>Click</button>

// Pattern 3: Named handler that needs the event object
function handleChange(event) {
  console.log(event.target.value);     // the input's current value
  console.log(event.target.type);      // "text", "checkbox", "select-one", etc.
  console.log(event.target.checked);   // for checkboxes
}
<input onChange={handleChange} />

// Pattern 4: Handler that needs both extra data AND the event
function handleDelete(id, event) {
  event.stopPropagation();    // stop click from bubbling to parent elements
  event.preventDefault();    // stop default browser behavior
  deleteItem(id);
}
<button onClick={(e) => handleDelete(item.id, e)}>Delete</button>
```

### The Classic Beginner Mistake: Calling vs Referencing

This is the most common React mistake beginners make:

```jsx
// ❌ WRONG — the () means "call this function right now, during render"
// handleClick() executes immediately when component renders
// onClick gets the RETURN VALUE of handleClick (undefined)
// Clicking the button does nothing
<button onClick={handleClick()}>Click</button>

// ✅ CORRECT — passing a reference to the function
// React stores this reference and calls it when the button is clicked
<button onClick={handleClick}>Click</button>

// ❌ WRONG — calling with arguments executes during render
<button onClick={handleDelete(item.id)}>Delete</button>

// ✅ CORRECT — wrap in arrow function to defer execution + pass arguments
<button onClick={() => handleDelete(item.id)}>Delete</button>

// WHY: onClick expects a function value, not undefined.
// onClick={handleClick}   → stores the function reference ✅
// onClick={handleClick()} → stores undefined (the return value) ❌
```

### Important: `e.preventDefault()`

Always call `e.preventDefault()` when handling form submissions to prevent the browser's default behavior (which is to reload the page):

```jsx
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit(e) {
    e.preventDefault();    // ← CRITICAL: prevents page reload
    console.log('Form submitted:', { email, password });
    // Here you'd call an API
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Password"
      />
      <button type="submit">Log In</button>
    </form>
  );
}
```

Without `e.preventDefault()`, submitting a form causes a full page reload — losing all React state.

### Complete Event Type Reference

```jsx
function EventShowcase() {
  return (
    <div style={{ padding: '2rem' }}>

      {/* ─── Mouse Events ─── */}
      <button
        onClick={e => console.log('Clicked at', e.clientX, e.clientY)}
        onDoubleClick={() => console.log('Double clicked')}
        onMouseEnter={() => console.log('Mouse entered')}
        onMouseLeave={() => console.log('Mouse left')}
        onMouseDown={() => console.log('Mouse button pressed')}
        onMouseUp={() => console.log('Mouse button released')}
        onContextMenu={e => { e.preventDefault(); console.log('Right clicked'); }}
        style={{ display: 'block', marginBottom: '1rem', padding: '0.5rem 1rem',
                 backgroundColor: '#646cff', color: '#fff', border: 'none',
                 borderRadius: '4px', cursor: 'pointer' }}
      >
        Hover or Click Me
      </button>

      {/* ─── Keyboard Events ─── */}
      <input
        type="text"
        onKeyDown={e => {
          if (e.key === 'Enter')   console.log('Enter pressed');
          if (e.key === 'Escape')  console.log('Escape pressed');
          if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            console.log('Ctrl+S pressed');
          }
          console.log('Key:', e.key, 'Code:', e.code);
        }}
        onKeyUp={e => console.log('Key released:', e.key)}
        placeholder="Type here..."
        style={{ display: 'block', padding: '0.5rem', marginBottom: '1rem',
                 backgroundColor: '#333', color: '#fff',
                 border: '1px solid #555', borderRadius: '4px' }}
      />

      {/* ─── Input / Form Events ─── */}
      <input
        type="text"
        onChange={e => console.log('Value changed to:', e.target.value)}
        onFocus={() => console.log('Input focused')}
        onBlur={() => console.log('Input lost focus')}
        placeholder="Input events..."
        style={{ display: 'block', padding: '0.5rem', marginBottom: '1rem',
                 backgroundColor: '#333', color: '#fff',
                 border: '1px solid #555', borderRadius: '4px' }}
      />

      {/* ─── Checkbox ─── */}
      <label style={{ display: 'flex', alignItems: 'center',
                      gap: '0.5rem', color: '#aaa', marginBottom: '1rem' }}>
        <input
          type="checkbox"
          onChange={e => console.log('Checked:', e.target.checked)}
        />
        Checkbox
      </label>

      {/* ─── Select ─── */}
      <select
        onChange={e => console.log('Selected:', e.target.value)}
        style={{ display: 'block', padding: '0.5rem', marginBottom: '1rem',
                 backgroundColor: '#333', color: '#fff',
                 border: '1px solid #555', borderRadius: '4px' }}
      >
        <option value="react">React</option>
        <option value="vue">Vue</option>
        <option value="svelte">Svelte</option>
      </select>

      {/* ─── Form Submit ─── */}
      <form
        onSubmit={e => {
          e.preventDefault();
          console.log('Form submitted');
        }}
      >
        <input
          type="text"
          placeholder="Form input"
          style={{ padding: '0.5rem', marginRight: '0.5rem', backgroundColor: '#333',
                   color: '#fff', border: '1px solid #555', borderRadius: '4px' }}
        />
        <button
          type="submit"
          style={{ padding: '0.5rem 1rem', backgroundColor: '#27ae60',
                   color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Submit
        </button>
      </form>

    </div>
  );
}
```

### Event Bubbling and `stopPropagation`

Events bubble up the DOM tree — a click on a child fires click handlers on the child, then parent, then grandparent, etc.

```jsx
function BubblingExample() {
  return (
    <div
      onClick={() => console.log('Parent clicked')}
      style={{ padding: '2rem', backgroundColor: '#1a1a1a', borderRadius: '8px' }}
    >
      <button
        onClick={e => {
          e.stopPropagation();    // prevents 'Parent clicked' from firing
          console.log('Button clicked');
        }}
        style={{ padding: '0.5rem 1rem', backgroundColor: '#646cff',
                 color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        Click me (stops bubbling)
      </button>
    </div>
  );
}
```

Use `stopPropagation` when a nested element has a click handler that would conflict with its parent's click handler — for example, a "Delete" button inside a clickable card.

---

## 3.6 — Conditional Rendering

React lets you conditionally include or exclude UI elements using standard JavaScript. There's no special template syntax — just JavaScript patterns.

### Pattern 1: Ternary Operator — When You Have Two Alternatives

Use ternary when you want to render **one thing OR another**:

```jsx
function AuthStatus({ isLoggedIn, username }) {
  return (
    <div style={{ padding: '1rem' }}>
      {isLoggedIn
        ? (
          <div style={{ color: '#27ae60' }}>
            <p>Welcome back, {username}!</p>
            <button>Log Out</button>
          </div>
        )
        : (
          <div style={{ color: '#e74c3c' }}>
            <p>Please log in to continue.</p>
            <button>Log In</button>
          </div>
        )
      }
    </div>
  );
}
```

For simple single-element ternaries, keep it inline:
```jsx
<p style={{ color: isOnline ? 'green' : 'gray' }}>
  {isOnline ? 'Online' : 'Offline'}
</p>
```

For complex multi-line alternatives, extract to variables before the return:
```jsx
function Dashboard({ user, isLoading }) {
  const content = isLoading
    ? <Spinner />
    : <UserProfile user={user} />;

  return <div className="dashboard">{content}</div>;
}
```

### Pattern 2: `&&` Short-Circuit — Render Something or Nothing

Use `&&` when you want to render something **or nothing**:

```jsx
function Notification({ hasMessage, message, unreadCount }) {
  return (
    <div>
      <h1>Dashboard</h1>

      {/* Renders the div only if hasMessage is true */}
      {hasMessage && (
        <div style={{ padding: '1rem', backgroundColor: '#2980b9',
                      color: '#fff', borderRadius: '6px', marginTop: '1rem' }}>
          {message}
        </div>
      )}

      {/* Renders the badge only if unreadCount > 0 */}
      {unreadCount > 0 && (
        <span style={{ backgroundColor: '#e74c3c', color: '#fff',
                       borderRadius: '50%', padding: '2px 6px',
                       fontSize: '0.8rem' }}>
          {unreadCount}
        </span>
      )}
    </div>
  );
}
```

**⚠️ Critical `&&` trap with numbers — one of the most common React bugs:**

```jsx
// ❌ BUG: If count is 0, React renders the literal "0" on screen!
// Why? Because 0 is falsy in JavaScript, BUT it's a valid renderable value in JSX.
// React renders "0" to the DOM when it encounters the number 0.
{count && <p>You have {count} messages</p>}

// This renders: "0" — just the number 0 floating on the page. Not what you want.

// ✅ CORRECT: Force evaluation to a boolean first
{count > 0 && <p>You have {count} messages</p>}
{Boolean(count) && <p>You have {count} messages</p>}
{!!count && <p>You have {count} messages</p>}

// General rule: Only use && with boolean conditions, or add > 0 / .length > 0
{items.length > 0 && <ItemList items={items} />}    // ✅ safe
{items.length && <ItemList items={items} />}         // ❌ renders "0" if empty
```

### Pattern 3: Early Return — For Component-Level Conditions

Use early returns to handle loading, error, and empty states at the **component level**. This is the most professional pattern for handling async data:

```jsx
function UserDashboard({ user, isLoading, error }) {

  // Guard: loading state — return early
  if (isLoading) {
    return (
      <div style={{ color: '#aaa', textAlign: 'center', padding: '3rem' }}>
        <p>Loading user data...</p>
      </div>
    );
  }

  // Guard: error state — return early
  if (error) {
    return (
      <div style={{ color: '#e74c3c', textAlign: 'center', padding: '3rem' }}>
        <h2>Something went wrong</h2>
        <p>{error.message}</p>
        <button onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  // Guard: empty/null state — return early
  if (!user) {
    return (
      <div style={{ color: '#aaa', textAlign: 'center', padding: '3rem' }}>
        <p>No user found.</p>
      </div>
    );
  }

  // Happy path — all preconditions met, render the main content
  // No nesting, no complex ternaries — this is clean and readable
  return (
    <div style={{ padding: '2rem' }}>
      <h1 style={{ color: '#fff' }}>Welcome, {user.name}!</h1>
      <p style={{ color: '#aaa' }}>{user.email}</p>
      <p style={{ color: '#aaa' }}>Member since: {user.joinDate}</p>
    </div>
  );
}
```

**Why early returns are better than nested ternaries for this pattern:**
- Each condition is handled clearly and independently
- The main render logic at the bottom is clean and uncluttered
- Easy to add more guard conditions
- Much more readable than deeply nested ternaries

### Full Interactive Example — Login Toggle

```jsx
// src/components/LoginToggle.jsx
import { useState } from 'react';

function LoginToggle() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState('');

  function handleLogin(e) {
    e.preventDefault();
    if (!inputValue.trim()) {
      setError('Please enter your name');
      return;
    }
    setUsername(inputValue.trim());
    setIsLoggedIn(true);
    setError('');
    setInputValue('');
  }

  function handleLogout() {
    setIsLoggedIn(false);
    setUsername('');
  }

  // Early return for logged-in state
  if (isLoggedIn) {
    return (
      <div style={{ padding: '2rem', maxWidth: '400px' }}>
        <div style={{ padding: '1.5rem', backgroundColor: '#1a1a1a',
                      borderRadius: '8px', border: '1px solid #27ae60' }}>
          <h2 style={{ color: '#27ae60', marginBottom: '0.5rem' }}>
            ✓ Logged In
          </h2>
          <p style={{ color: '#fff', marginBottom: '1rem' }}>
            Welcome, <strong>{username}</strong>!
          </p>
          <button
            onClick={handleLogout}
            style={{ padding: '0.5rem 1rem', backgroundColor: '#e74c3c',
                     color: '#fff', border: 'none', borderRadius: '4px',
                     cursor: 'pointer' }}
          >
            Log Out
          </button>
        </div>
      </div>
    );
  }

  // Default: logged-out state
  return (
    <div style={{ padding: '2rem', maxWidth: '400px' }}>
      <div style={{ padding: '1.5rem', backgroundColor: '#1a1a1a',
                    borderRadius: '8px', border: '1px solid #444' }}>
        <h2 style={{ color: '#fff', marginBottom: '1.5rem' }}>Log In</h2>
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              value={inputValue}
              onChange={e => {
                setInputValue(e.target.value);
                if (error) setError('');    // clear error as user types
              }}
              placeholder="Enter your name"
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px',
                       backgroundColor: '#333', color: '#fff',
                       border: `1px solid ${error ? '#e74c3c' : '#555'}`,
                       boxSizing: 'border-box' }}
            />
            {error && (
              <p style={{ color: '#e74c3c', fontSize: '0.8rem',
                          marginTop: '0.25rem' }}>
                {error}
              </p>
            )}
          </div>
          <button
            type="submit"
            style={{ width: '100%', padding: '0.6rem', backgroundColor: '#646cff',
                     color: '#fff', border: 'none', borderRadius: '4px',
                     cursor: 'pointer', fontWeight: 'bold' }}
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  );
}

export default LoginToggle;
```

### When to Use Which Pattern

```
Use ternary (a ? b : c) when:
  → You always render something, just one of two options
  → Example: "Show Dashboard OR Login page"

Use && when:
  → You render something or nothing at all
  → Example: "Show notification badge only if unread > 0"
  → Always use boolean: count > 0 &&, not count &&

Use early return when:
  → The entire component output changes based on a condition
  → Loading/error/empty states at the component level
  → Removing deeply nested ternaries for clarity
```

---

## 3.7 — Lists and Keys

### Rendering Lists with `.map()`

Rendering arrays of data into lists of JSX elements is one of the most common React operations. JavaScript's `.map()` method transforms each array item into a JSX element:

```jsx
const fruits = ['Apple', 'Banana', 'Cherry', 'Date'];
const numbers = [1, 2, 3, 4, 5];

function FruitList() {
  return (
    <ul>
      {fruits.map(fruit => (
        <li key={fruit}>{fruit}</li>
      ))}
    </ul>
  );
}

// With index (only for static lists — see keys section below)
function NumberList() {
  return (
    <ol>
      {numbers.map((num, index) => (
        <li key={index}>Item {num}</li>
      ))}
    </ol>
  );
}
```

### The `key` Prop — Why It's Non-Negotiable

The `key` prop is **required** when rendering lists. Without it, React shows a warning AND your app may have subtle, hard-to-debug bugs.

**Why keys exist:** React's diffing algorithm needs a way to identify which item in a list is which across re-renders. Without keys, React can only compare items by their **position in the array** — first element maps to first, second to second, etc.

This breaks when items are added, removed, or reordered:

```
WITHOUT keys — positional comparison:

State before:   ['Alice', 'Bob', 'Carol']
  → Renders: <li>Alice</li>, <li>Bob</li>, <li>Carol</li>

User deletes 'Alice':
State after:    ['Bob', 'Carol']
  → Renders: <li>Bob</li>, <li>Carol</li>

React compares by position:
  position 0: 'Alice' → 'Bob'     → UPDATES text (wrong — should delete Alice)
  position 1: 'Bob' → 'Carol'     → UPDATES text (wrong — should keep Bob/Carol)
  position 2: 'Carol' → nothing   → DELETES node (wrong — Carol didn't go away)

Result: React does 3 DOM operations instead of 1, and if items have state
(e.g., expanded/collapsed), that state is now associated with the wrong items.

WITH keys — identity comparison:

React sees key="alice" disappeared → delete that DOM node (1 operation, correct ✅)
React sees key="bob" and key="carol" unchanged → leave them alone
```

**Key rules:**

```jsx
// ✅ BEST: Use unique, stable IDs from your data (database IDs, UUIDs)
{users.map(user => (
  <UserCard key={user.id} user={user} />
))}

// ✅ GOOD: Use a stable unique string property
{countries.map(country => (
  <option key={country.code} value={country.code}>
    {country.name}
  </option>
))}

// ✅ OK for static lists that never change order/content
// (weekdays, months, hardcoded menu items)
{['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, i) => (
  <li key={i}>{day}</li>
))}

// ❌ NEVER use index for dynamic lists (can be added/removed/reordered)
{dynamicItems.map((item, index) => (
  <li key={index}>{item.text}</li>  // ← index changes when items are reordered!
))}
```

**Why index as key causes bugs for dynamic lists:**

If item at index 0 has `key={0}` and is removed, the item that was at index 1 now gets `key={0}`. React thinks it's the same item and reuses the DOM node — but it may have stale component state (unchecked checkboxes, entered text, animations) from the previous item. This produces ghost state bugs.

**Keys must be unique among siblings** (not globally unique — same key can be reused in different lists):

```jsx
{/* ✅ Fine — same IDs in different lists */}
<ul>
  {activeUsers.map(u => <li key={u.id}>{u.name}</li>)}
</ul>
<ul>
  {inactiveUsers.map(u => <li key={u.id}>{u.name}</li>)}
</ul>
```

**Keys are not passed as props to children:**

```jsx
// ❌ Can't access key inside the component — it's for React's use only
function UserCard({ key, user }) { ... }   // key will be undefined

// ✅ If you need the ID inside the component, pass it separately
{users.map(user => (
  <UserCard key={user.id} id={user.id} user={user} />
))}
```

### Real-World List Rendering — Product Catalog

**`src/components/ProductCard.jsx`:**

```jsx
function ProductCard({ product, onAddToCart }) {
  return (
    <div style={{
      border: '1px solid #444',
      borderRadius: '8px',
      padding: '1.25rem',
      backgroundColor: '#1a1a1a',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    }}>
      <h3 style={{ color: '#fff', margin: 0 }}>{product.name}</h3>
      <p style={{ color: '#aaa', margin: 0, fontSize: '0.9rem' }}>
        {product.description}
      </p>
      <div style={{ display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', marginTop: 'auto' }}>
        <span style={{ color: '#646cff', fontWeight: 'bold', fontSize: '1.1rem' }}>
          ${product.price.toFixed(2)}
        </span>
        <button
          onClick={() => onAddToCart(product)}
          disabled={!product.inStock}
          style={{
            padding: '0.4rem 0.8rem',
            backgroundColor: product.inStock ? '#646cff' : '#555',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: product.inStock ? 'pointer' : 'not-allowed',
            opacity: product.inStock ? 1 : 0.6
          }}
        >
          {product.inStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
      {!product.inStock && (
        <span style={{ color: '#e74c3c', fontSize: '0.8rem' }}>
          Currently unavailable
        </span>
      )}
    </div>
  );
}

export default ProductCard;
```

**`src/pages/HomePage.jsx`:**

```jsx
import { useState } from 'react';
import ProductCard from '../components/ProductCard';

// Static data — in a real app this comes from an API (Stage 7)
const PRODUCTS = [
  { id: 1, name: 'React Handbook',
    description: 'Complete guide to modern React development.',
    price: 29.99, inStock: true },
  { id: 2, name: 'JavaScript Deep Dive',
    description: 'Master advanced JavaScript patterns.',
    price: 34.99, inStock: true },
  { id: 3, name: 'CSS Mastery',
    description: 'Professional CSS techniques and tricks.',
    price: 24.99, inStock: false },
  { id: 4, name: 'Node.js Essentials',
    description: 'Backend development with Node.js.',
    price: 31.99, inStock: true },
];

function HomePage() {
  const [cart, setCart] = useState([]);
  const [filterInStock, setFilterInStock] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  function handleAddToCart(product) {
    if (!product.inStock) return;
    setCart(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        // Increment quantity if already in cart
        return prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  }

  function handleRemoveFromCart(productId) {
    setCart(prev => prev.filter(item => item.id !== productId));
  }

  // Derived state — computed from current state, no extra useState needed
  const filteredProducts = PRODUCTS
    .filter(p => !filterInStock || p.inStock)
    .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>

      {/* ─── Header ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', marginBottom: '1.5rem',
                    flexWrap: 'wrap', gap: '1rem' }}>
        <h1 style={{ color: '#fff', margin: 0 }}>Product Catalog</h1>
        <span style={{ color: '#aaa' }}>
          🛒 {totalItems} {totalItems === 1 ? 'item' : 'items'}
        </span>
      </div>

      {/* ─── Filters ─── */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem',
                    flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search products..."
          style={{ flex: 1, minWidth: '200px', padding: '0.5rem',
                   backgroundColor: '#333', color: '#fff',
                   border: '1px solid #555', borderRadius: '4px' }}
        />
        <label style={{ color: '#aaa', display: 'flex',
                        alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={filterInStock}
            onChange={e => setFilterInStock(e.target.checked)}
          />
          In Stock Only
        </label>
      </div>

      {/* ─── Product Grid ─── */}
      {filteredProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#aaa' }}>
          <p>No products match your search.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={handleAddToCart}
            />
          ))}
        </div>
      )}

      {/* ─── Cart Summary (conditional rendering) ─── */}
      {cart.length > 0 && (
        <div style={{ padding: '1.5rem', backgroundColor: '#1a1a1a',
                      borderRadius: '8px', border: '1px solid #444' }}>
          <h2 style={{ color: '#fff', marginBottom: '1rem' }}>Cart</h2>
          {cart.map(item => (
            <div key={item.id}
              style={{ display: 'flex', justifyContent: 'space-between',
                       alignItems: 'center', color: '#aaa', marginBottom: '0.5rem' }}>
              <span>{item.name} × {item.quantity}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
                <button
                  onClick={() => handleRemoveFromCart(item.id)}
                  style={{ padding: '0.2rem 0.5rem', backgroundColor: 'transparent',
                           color: '#e74c3c', border: '1px solid #e74c3c',
                           borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          <div style={{ borderTop: '1px solid #444', marginTop: '1rem',
                        paddingTop: '1rem', display: 'flex',
                        justifyContent: 'space-between' }}>
            <strong style={{ color: '#fff' }}>Total</strong>
            <strong style={{ color: '#646cff' }}>
              ${totalPrice.toFixed(2)}
            </strong>
          </div>
        </div>
      )}

    </div>
  );
}

export default HomePage;
```

**Concepts demonstrated in this example:**
- `useState` with arrays (cart management)
- Multiple state variables
- Derived/computed values (no extra state needed for `filteredProducts`, `totalItems`, `totalPrice`)
- Function props (`onAddToCart` passed down to `ProductCard`)
- Conditional rendering (`{cart.length > 0 && ...}`, empty state)
- List rendering with `.map()` and `key`
- Event handling (`onChange`, `onClick`)
- Updater function pattern (`setCart(prev => ...)`)

---

## 3.8 — How React Re-Renders: The Complete Picture

Understanding exactly when and why React re-renders is essential for both debugging and performance optimization.

### What Triggers a Re-Render

```
React re-renders a component when:
├── 1. Its own state changes (via a setter from useState)
├── 2. Its parent component re-renders (even if props didn't change)
└── 3. A context it subscribes to changes (covered in Stage 8)

React does NOT re-render when:
├── A sibling component re-renders
├── State is set to the exact same value (same reference or same primitive)
├── Props technically didn't change (but parent still re-renders — child re-renders too)
└── Variables outside the component change (they're not tracked by React)
```

### The Re-Render Cascade

By default, when a parent re-renders, **all its children re-render too** — even if their props didn't change:

```
App state changes → App re-renders
  ↓  always re-renders when parent does
  ├── Header        → re-renders (even if its props didn't change)
  ├── ProductList   → re-renders
  │     ↓
  │   ProductCard (×4) → re-renders (each one)
  └── Footer        → re-renders (even if it shows static content)
```

**Is this a problem?** For most apps: no. Virtual DOM diffing is fast, and React batches updates. Re-rendering doesn't mean the real DOM changes — React only commits actual DOM changes when the diffing algorithm finds differences. For apps with hundreds/thousands of components or expensive render functions, this becomes a concern. Solutions:
- `React.memo` — skips re-render if props are the same (Stage 4)
- `useMemo` — memoizes expensive computed values (Stage 4)
- `useCallback` — memoizes event handler functions (Stage 4)

### What Actually Happens During Re-Render

```
1. React calls your component function again
   (React.createElement internally)

2. Your function runs top-to-bottom:
   → useState calls return current state values (not initial)
   → Derived values are recomputed
   → The return statement produces new JSX

3. React creates a new Virtual DOM tree from the returned JSX

4. React diffs this new tree against the previous render's tree

5. React calculates the minimum set of real DOM operations needed

6. React applies those changes in the "commit phase"
   → Update DOM node text/attributes
   → Add/remove DOM nodes
   → Run useEffect cleanups and setups (Stage 4)

7. Browser repaints only the changed pixels
```

### Controlled vs Uncontrolled Components

**Controlled component:** React state is the single source of truth for the input's value. Every keystroke goes through React state.

```jsx
// CONTROLLED — React owns the value
function ControlledInput() {
  const [value, setValue] = useState('');

  return (
    <input
      value={value}               // React controls the displayed value
      onChange={e => setValue(e.target.value)}   // React updates state on each keystroke
      placeholder="Controlled input"
    />
  );
}
// The input ALWAYS shows whatever is in React state.
// If you don't update state onChange, the input won't change — React "locks" it.
```

**Uncontrolled component:** The DOM manages its own state. You read the value using a ref when needed.

```jsx
// UNCONTROLLED — DOM owns the value
import { useRef } from 'react';

function UncontrolledInput() {
  const inputRef = useRef(null);

  function handleSubmit() {
    console.log(inputRef.current.value);   // read directly from DOM
  }

  return (
    <>
      <input ref={inputRef} defaultValue="initial value" />
      <button onClick={handleSubmit}>Get Value</button>
    </>
  );
}
```

**Which to use:** Almost always use **controlled components** in React. They:
- Allow React to validate/transform input as the user types
- Allow programmatic reset (just set state to `''`)
- Enable showing live derived data based on input value
- Are consistent with React's declarative model

Uncontrolled components are useful for file inputs (which can't be controlled) and when integrating with non-React DOM libraries.

---

## 3.9 — Mini Exercises

Build these yourself to solidify understanding. Each targets specific concepts:

**Exercise 1: Temperature Converter**
- Two inputs: Celsius and Fahrenheit
- Changing either input automatically updates the other
- Concepts: controlled inputs, state, derived/computed values

**Exercise 2: Character Counter**
- A `<textarea>` with a live character count below it
- Count turns red when over 280 characters
- Shows "X characters remaining" (or "X over limit")
- Concepts: `onChange`, conditional styling with ternary, template literals

**Exercise 3: Accordion Component**
- List of 5 questions with expandable answers
- Click a question to toggle its answer open/closed
- Only one question can be open at a time
- Concepts: array state or single activeId state, lists with `.map()`, keys, conditional rendering, event handling

**Exercise 4: Star Rating Component**
- 5 clickable stars (★)
- Hovering highlights stars up to the hovered position (preview)
- Clicking sets the permanent rating
- Display the selected rating as text below: "You rated: 4/5"
- Reset button clears the rating
- Concepts: `useState` for `rating` and `hoverRating`, `onMouseEnter`, `onMouseLeave`, `onClick`, conditional styling, rendering with `.map()` over `[1,2,3,4,5]`

**Exercise 5: Shopping Cart**
- List of 5 hardcoded products (name, price)
- "Add to Cart" button on each
- Sidebar showing cart items, quantities, and total
- "Remove" button per cart item
- Concepts: state with arrays, updater function, `.map()`, `.filter()`, `.reduce()`, conditional rendering, lifting state

---

## Stage 3 — Key Takeaways

```
JSX:
✅ JSX compiles to React.createElement() calls — it's not HTML, it's JavaScript
✅ Rules exist because of the compilation: one root (one return value),
   className (reserved word), {} for JS expressions (escape hatch)
✅ Inline styles use objects with camelCase properties, not strings

Components:
✅ Components are functions: (props) → JSX
✅ Capital letter required — lowercase = native HTML tag in React
✅ Components must be pure: same props = same output, no side effects during render
✅ React calls your components, not you — inversion of control

Props:
✅ Props flow one way: parent → child
✅ Props are read-only — never mutate them
✅ Use destructuring in the parameter for cleaner code
✅ Use default values for optional props
✅ children prop = content between opening and closing tags
✅ Pass functions as props for child-to-parent communication (lifting state up)

State:
✅ useState returns [value, setter] — calling setter triggers re-render
✅ State is a snapshot — count is frozen for the duration of one render
✅ Use updater function (prev => ...) when new state depends on previous state
✅ Never mutate state — always return new objects/arrays (spread operator)
✅ React detects changes by reference — mutating in place = React doesn't re-render

Events:
✅ Pass a function reference, not a call: onClick={handler} not onClick={handler()}
✅ Wrap in arrow function to pass arguments: onClick={() => handler(id)}
✅ e.preventDefault() on form onSubmit prevents page reload
✅ e.stopPropagation() prevents event from bubbling to parent handlers

Conditional Rendering:
✅ Ternary: a ? b : c — when you render one thing or another
✅ &&: condition && <Element /> — render something or nothing
✅ Never use: count && (renders "0" when count is 0) — use count > 0 &&
✅ Early return: best for loading/error/empty states at component level

Lists and Keys:
✅ Use .map() to transform arrays into JSX arrays
✅ Every list item needs a unique, stable key prop
✅ Use IDs from data as keys — never use array index for dynamic lists
✅ Keys tell React which item is which when the list changes
✅ key is not a prop — the component can't access it (pass id separately if needed)

Re-renders:
✅ State change → component re-renders
✅ Parent re-renders → all children re-render (even without prop changes)
✅ Re-render ≠ DOM update — React only touches DOM nodes that actually changed
✅ Use controlled components for form inputs — React owns the value
```

---

## Quick Reference Card

```
CREATING STATE:
  const [value, setValue] = useState(initialValue)

UPDATING STATE (simple):
  setValue(newValue)

UPDATING STATE (depends on previous):
  setValue(prev => prev + 1)

UPDATING OBJECT STATE:
  setState(prev => ({ ...prev, field: newValue }))

UPDATING ARRAY STATE — add:
  setState(prev => [...prev, newItem])

UPDATING ARRAY STATE — remove:
  setState(prev => prev.filter(item => item.id !== id))

UPDATING ARRAY STATE — update:
  setState(prev => prev.map(item => item.id === id ? { ...item, field: val } : item))

PASSING PROPS:
  <Component name="Alice" age={25} onAction={handleAction} />

RECEIVING PROPS:
  function Component({ name, age, onAction }) { ... }

DEFAULT PROPS:
  function Component({ name = 'Anonymous', age = 0 }) { ... }

CHILDREN PROP:
  function Card({ children }) { return <div>{children}</div>; }
  <Card><p>Content</p></Card>

CONDITIONAL — ternary:
  {condition ? <ComponentA /> : <ComponentB />}

CONDITIONAL — render or nothing:
  {count > 0 && <Badge count={count} />}

CONDITIONAL — early return:
  if (isLoading) return <Spinner />;
  if (error) return <ErrorMessage error={error} />;

LIST RENDERING:
  {items.map(item => <Component key={item.id} item={item} />)}

EVENT HANDLER — no args:
  <button onClick={handleClick}>

EVENT HANDLER — with args:
  <button onClick={() => handleDelete(item.id)}>

FORM SUBMIT:
  <form onSubmit={e => { e.preventDefault(); handleSubmit(); }}>

CONTROLLED INPUT:
  <input value={value} onChange={e => setValue(e.target.value)} />
```