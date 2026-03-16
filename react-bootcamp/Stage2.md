# React Engineering Bootcamp — Stage 2: Development Environment Setup

> **Goal of this stage:** Get your machine ready to build React apps professionally.
> Understand *every* tool in your environment — not just how to use them, but *why* they exist.

---

## 2.1 — Understanding Node.js (Why You Need It for React)

### The Confusing Part

React runs **in the browser**. Browsers don't have Node.js. So why do you need Node.js installed on your computer to build React apps?

The answer: **Node.js is not needed to *run* React. It's needed to *build* React apps during development.**

These are two completely different things:

```
DEVELOPMENT TIME (your machine):        RUNTIME (user's browser):
─────────────────────────────────       ─────────────────────────
Node.js IS required here                Node.js is NOT present here
Transforms JSX → plain JavaScript       Receives final HTML + CSS + JS
Bundles 200+ files into a few           Runs the output directly
Runs a local dev server                 No build tools needed at all
Handles imports, optimizations          Just a browser with a JS engine
```

### What Node.js Actually Powers in Your React Workflow

```
Node.js enables on your machine:
├── npm / npx        → install and run packages (React, Vite, etc.)
├── Vite dev server  → local HTTP server with hot module replacement
├── JSX compiler     → converts JSX → plain JavaScript browsers understand
├── Bundler          → combines hundreds of files into optimized output
├── Build tools      → minification, tree-shaking, code splitting
└── Linters/Formatters → ESLint, Prettier code quality tools
```

> **Mental model:** Think of Node.js as the **workshop** where you build and assemble a product. The final product (HTML + CSS + plain JS) is shipped to users. They never see the workshop — they only receive the finished output.

### What Node.js Is (Brief Background)

Node.js is a **JavaScript runtime built on Chrome's V8 engine** that lets you run JavaScript outside the browser — directly on your computer or a server. Before Node.js (2009), JavaScript could only run inside browsers. Node.js changed that, enabling JavaScript to be used for build tools, servers, scripts, and CLIs. The entire modern frontend toolchain (Vite, Webpack, ESLint, Babel, etc.) is built on Node.js.

### Installing Node.js

Go to [nodejs.org](https://nodejs.org) and download the **LTS version**.

**LTS = Long Term Support.** This means:
- It's stable and thoroughly tested
- It receives security patches for years
- It's the version companies use in production
- Avoid the "Current" version for projects — it has the latest features but less stability

After installation, verify it worked by opening your terminal:

```bash
node --version
# Should output something like: v20.11.0

npm --version
# Should output something like: 10.2.4
```

If these commands work, Node.js and npm are both installed correctly. npm is bundled with Node.js automatically — you don't install them separately.

### Windows-Specific Note

On Windows, if you get `'node' is not recognized as an internal or external command`, it means Node.js wasn't added to your system PATH during installation. Fix: re-run the Node.js installer and make sure the "Add to PATH" option is checked. Alternatively, use **nvm-windows** (Node Version Manager for Windows) which handles this automatically.

---

## 2.2 — npm, npx, and Package Managers — Deep Explanation

### What is npm?

**npm** stands for **Node Package Manager**. Despite the name, it is actually **two separate things**:

**1. The Registry** — A massive public database of open-source JavaScript packages hosted at [npmjs.com](https://npmjs.com). As of 2024, it contains over **2 million packages**. Any developer in the world can publish a package here, and any developer can download it for free.

**2. The CLI Tool** — A command-line program (`npm`) that ships with Node.js. You use it to:
- Install packages from the registry into your project
- Remove packages
- Run scripts defined in `package.json`
- Publish your own packages
- Manage project metadata

### How npm install Works Internally

```bash
npm install axios
```

When you run this, npm does the following:

```
1. Reads your package.json to understand your project
      ↓
2. Contacts the npm registry (registry.npmjs.org)
      ↓
3. Downloads axios and ALL of its dependencies
   (axios might depend on 5 packages, each depending on 3 more...)
      ↓
4. Places everything into node_modules/ folder
      ↓
5. Updates package.json (adds axios to dependencies)
      ↓
6. Updates package-lock.json (records exact versions)
```

### What is package.json?

Every Node/React project has a `package.json` file at the root. It is the **manifest — the identity card and instruction manual** of your project. It tells npm (and anyone working on the project) everything it needs to know.

```json
{
  "name": "my-react-app",
  "version": "1.0.0",
  "description": "A React application",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext js,jsx"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "eslint": "^8.0.0"
  }
}
```

**Breaking down each section:**

- `"name"` — The name of your project. Used if you ever publish it as a package.
- `"version"` — Follows **semantic versioning** (MAJOR.MINOR.PATCH). `1.0.0` is a stable release.
- `"scripts"` — Shortcuts you can run with `npm run <name>`. These are just terminal commands with aliases:
  - `npm run dev` → runs `vite` (starts dev server)
  - `npm run build` → runs `vite build` (creates production bundle)
  - `npm run preview` → runs `vite preview` (previews production build locally)
- `"dependencies"` — Packages required to **run** your app in production
- `"devDependencies"` — Packages only needed **during development**

### `dependencies` vs `devDependencies` — Critical Distinction

This is a concept many beginners get confused about. Here's the clear mental model:

```
dependencies:
  → Packages your app needs to RUN in production
  → Code that gets shipped to the user's browser
  → Examples: react, react-dom, axios, react-router-dom
  → Install with: npm install <package>

devDependencies:
  → Packages needed only DURING DEVELOPMENT on your machine
  → NEVER shipped to users — only used in the build process
  → Examples: vite, eslint, prettier, typescript, jest
  → Install with: npm install --save-dev <package>  (or -D flag)
```

**Why does this matter?** When you deploy to production, only `dependencies` are installed on the server. `devDependencies` are skipped, keeping the server lean. In a frontend React app with Vite, this distinction matters less for the final bundle (Vite handles what gets bundled), but it's an important professional practice and it matters greatly in Node.js backend projects.

### Version Numbers and the `^` Symbol

You'll see versions written like `"react": "^18.2.0"`. The `^` (caret) is important:

```
"react": "18.2.0"    → EXACT — only install exactly 18.2.0
"react": "^18.2.0"   → COMPATIBLE — install 18.x.x (any minor/patch)
"react": "~18.2.0"   → PATCH ONLY — install 18.2.x (any patch)
"react": "*"         → ANY — install latest (dangerous, avoid)
```

The `^` is the npm default. It allows non-breaking updates (minor + patch) but not major version changes (which may have breaking API changes).

### What is npx?

`npx` is a tool that ships with npm (since npm v5.2). It lets you **run a package's executable without permanently installing it**.

```bash
# npm install: downloads package, saves it to node_modules permanently
npm install -g create-react-app   # installs globally on your machine
create-react-app my-app           # then run it

# npx: downloads temporarily, runs it once, then cleans up
npx create-react-app my-app       # does both steps in one command
```

**Why use npx?**
- No global installs cluttering your system
- Always runs the latest version (no stale globally-installed tools)
- Keeps your global npm environment clean

`npm create vite@latest` is equivalent to `npx create-vite@latest` — it runs Vite's scaffolding tool once without a permanent install. The `@latest` suffix ensures you always get the most recent version of the tool.

### node_modules — What It Really Is

```bash
node_modules/
├── react/              ← React itself (~300KB of source)
├── react-dom/          ← React's browser renderer (~1MB)
├── vite/               ← Dev server + bundler (~10MB)
├── esbuild/            ← Vite's fast JS transformer
├── rollup/             ← Vite's production bundler
└── ... 200+ more folders
```

This folder can easily be **200–500MB**. Here's why it's so large:

```
You install: react (1 package)
  react depends on: loose-envify (1 package)
    loose-envify depends on: js-tokens (1 package)

You install: vite (1 package)
  vite depends on: esbuild, rollup, postcss, connect...
    each of those has their own dependencies...
      and those have more dependencies...
```

This chain is called the **dependency tree**. In a modern JavaScript project, installing just a handful of packages can pull in hundreds of transitive dependencies.

> **Critical rule:** **Never commit `node_modules` to Git.** It is always listed in `.gitignore`. It can be hundreds of MB, changes constantly, and can always be regenerated from `package.json`. Anyone who clones your repo simply runs `npm install` to regenerate the entire `node_modules` folder from scratch.

### Alternative Package Managers

npm is the default, but you may encounter these alternatives in the wild:

```
yarn    → Created by Facebook, faster than older npm, similar syntax
pnpm    → More efficient disk usage (uses symlinks), fastest installs
bun     → Newest, written in Zig, extremely fast, also a JS runtime
```

For this bootcamp, we use npm. In professional settings, pnpm is increasingly common for large monorepos. They all read `package.json` — the ecosystem is compatible.

---

## 2.3 — Creating Your First React Project with Vite

### Why Vite and Not Create React App (CRA)?

For years, **Create React App (CRA)** was the official way to start a React project. It is now effectively **deprecated** — the React team no longer recommends it, and it receives no meaningful updates. Here's why Vite replaced it:

```
Create React App (old):          Vite (modern):
─────────────────────────        ──────────────────────────
Uses Webpack (old bundler)       Uses native ES Modules + Rollup
Cold start: 30-60 seconds        Cold start: < 300ms
HMR: slow (rebuilds bundle)      HMR: instant (updates single module)
Config: deeply buried/ejected    Config: simple vite.config.js
Bundle size: larger              Bundle size: highly optimized
No longer maintained             Actively developed
```

### How Vite Works Differently (Important Concept)

**Webpack (old way):** Before serving your app, Webpack reads ALL your source files, processes them, and **bundles everything into one or a few JavaScript files**. As your app grows, this initial bundle step takes longer — 30–60 seconds for large apps.

**Vite (new way):** During development, Vite does **no bundling at all**. Instead, it leverages native **ES Modules** — a feature built into modern browsers that lets them understand `import/export` directly. Vite just transforms individual files as the browser requests them. Result: instant startup regardless of app size.

```
Webpack dev server startup:
  Read all files → bundle everything → serve bundle → browser loads
  (Time: proportional to app size — can be 60+ seconds)

Vite dev server startup:
  Start server immediately → browser requests file → Vite transforms that
  one file → browser requests next file → Vite transforms it → ...
  (Time: always < 1 second, regardless of app size)
```

Only when you run `npm run build` for production does Vite bundle everything using Rollup for maximum optimization.

### Step-by-Step Project Creation

Open PowerShell (Windows) or Terminal (Mac/Linux) and navigate to where you want your project:

```bash
cd "D:\MERN Stack"
```

Then run:

```bash
npm create vite@latest
```

You'll see an interactive prompt. Answer as follows:

```
✔ Project name: … react-bootcamp
✔ Select a framework: › React
✔ Select a variant: › JavaScript
```

> **Why JavaScript and not TypeScript?**
> In a real production app, you'd choose TypeScript — it adds static typing, catches bugs at compile time, and is the industry standard. But TypeScript adds cognitive overhead when you're learning React fundamentals. We use JavaScript to learn React's core concepts cleanly. TypeScript patterns will be addressed as we go.

After the scaffolding completes, run these three commands in order:

```bash
cd react-bootcamp    # step into the generated project folder
npm install          # reads package.json, downloads all dependencies
npm run dev          # starts the Vite development server
```

You'll see output like:

```
  VITE v5.0.0  ready in 342 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Open `http://localhost:5173` in your browser. You'll see the default Vite + React starter page. **Your React development environment is live.**

### Common Setup Errors and Fixes

```
Error: ENOENT: no such file or directory, open 'package.json'
Fix: You're in the wrong directory. Run: cd react-bootcamp first.
     Or Vite created a nested folder — check if react-bootcamp/react-bootcamp/ exists.

Error: 'npm' is not recognized
Fix: Node.js isn't installed or not in PATH. Re-install Node.js LTS.

Error: Port 5173 already in use
Fix: Another dev server is running. Either stop it, or Vite will auto-pick the next port.

Error: node_modules/.vite permission denied (Mac/Linux)
Fix: Run: rm -rf node_modules && npm install
```

---

## 2.4 — Anatomy of the Generated Project — Every File Explained

When Vite scaffolds your project, here's the full structure:

```bash
react-bootcamp/
├── node_modules/          ← all installed packages (never touch manually)
├── public/                ← static assets served as-is (no processing)
│   └── vite.svg           ← Vite logo (used in default App.jsx)
├── src/                   ← ALL your application code lives here
│   ├── assets/            ← images/files imported by your components
│   │   └── react.svg
│   ├── App.css            ← styles scoped to App component
│   ├── App.jsx            ← root component of your application
│   ├── index.css          ← global styles applied to entire page
│   └── main.jsx           ← entry point — where React mounts to DOM
├── .gitignore             ← tells Git which files/folders to ignore
├── eslint.config.js       ← ESLint configuration (code quality rules)
├── index.html             ← the ONE HTML file in your entire SPA
├── package.json           ← project manifest and dependency list
├── package-lock.json      ← exact dependency version lock file
└── vite.config.js         ← Vite bundler/dev server configuration
```

**Key distinction — `public/` vs `src/assets/`:**

```
public/
  → Files served DIRECTLY as-is, without any processing
  → Referenced by absolute URL: <img src="/vite.svg" />
  → Good for: favicons, robots.txt, manifest.json
  → Vite does NOT import, process, or fingerprint these

src/assets/
  → Files IMPORTED by your JavaScript/JSX components
  → import logo from './assets/logo.svg'
  → Vite processes, optimizes, and fingerprints these
  → Good for: images, fonts, SVGs used inside components
```

---

### `index.html` — The Entry Point of the Entire Application

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite + React</title>
  </head>
  <body>
    <div id="root"></div>                                      <!-- Line A -->
    <script type="module" src="/src/main.jsx"></script>        <!-- Line B -->
  </body>
</html>
```

This is the **only HTML file** in your entire application. That's the "single page" in **Single Page Application**.

**Line A: `<div id="root"></div>`**

This is an empty container div. When you first open the page, it contains nothing. React's job is to **inject your entire UI inside this div**. Once React mounts, this `<div id="root">` becomes the parent of your entire component tree.

If you open browser DevTools and inspect the DOM after React loads, you'll see this div is now filled with all your rendered components. The id `"root"` is just a convention — you could name it anything, as long as `main.jsx` uses the same id in `document.getElementById()`.

**Line B: `<script type="module" src="/src/main.jsx">`**

This `<script>` tag does two important things:
1. It loads `main.jsx` — the file that bootstraps React
2. `type="module"` tells the browser to treat this as a **native ES Module**

The `type="module"` attribute is what enables `import`/`export` syntax directly in the browser without any bundling during development. This is the foundation of how Vite's ultra-fast dev server works — it just serves files as modules and lets the browser handle the import graph.

**Why is `index.html` at the project root (not in `src/`)?**

Unlike most build tools that hide the HTML template, Vite treats `index.html` as the **actual entry point** of the build process. Vite starts from `index.html`, finds the `<script type="module">` tag, and follows the import chain from there. Having it at root means Vite can locate it immediately.

---

### `src/main.jsx` — Where React Connects to the Browser (The Bootstrap File)

```jsx
import { StrictMode } from 'react'           // Line 1
import { createRoot } from 'react-dom/client' // Line 2
import './index.css'                          // Line 3
import App from './App.jsx'                  // Line 4

createRoot(document.getElementById('root')).render(  // Line 5
  <StrictMode>                                        // Line 6
    <App />                                           // Line 7
  </StrictMode>,                                      // Line 8
)
```

This is the **ignition switch** of your application — the first JavaScript that runs when your app loads. You typically only touch this file when doing app-wide setup (adding providers, global state, theming). Let's go through every single line:

---

**Line 1: `import { StrictMode } from 'react'`**

`StrictMode` is a special wrapper component from React. It's a development tool — it activates **additional warnings and safety checks** to help you find bugs early. It has **zero impact on your production build** — React automatically removes all StrictMode behavior when building for production.

What StrictMode does:
- **Runs your render functions twice** — intentionally calls your component functions twice to detect "impure" renders. If your component produces different output on two identical calls, something is wrong.
- **Runs effects twice** — runs `useEffect` setup and cleanup twice on mount to help detect missing cleanup code.
- **Warns about deprecated React APIs** — flags any usage of APIs that will be removed in future React versions.
- **Warns about common mistakes** — unexpected side effects, missing keys in lists, etc.

The double-rendering in development can be confusing at first (e.g., `console.log` inside a component fires twice). This is expected and intentional — don't remove StrictMode because of it.

---

**Line 2: `import { createRoot } from 'react-dom/client'`**

Notice we import from `react-dom`, **not** from `react`. This split is architectural:

```
react package:
  → The core React library
  → Component model, hooks system, reconciler (diffing algorithm)
  → Platform-agnostic — knows nothing about browsers, DOM, or native

react-dom package:
  → The bridge between React's virtual world and the browser's real DOM
  → Knows how to translate React's virtual DOM into actual DOM operations
  → Browser-specific

react-native package:
  → The bridge between React and iOS/Android native UI APIs
  → Same React core, different renderer
```

This separation is why React can target multiple platforms with the same component code. The `react` package is shared; only the renderer changes.

`createRoot` is the **React 18 API** for mounting an application. The older API was `ReactDOM.render()` (deprecated). `createRoot` enables React 18's **concurrent features** — the ability to pause, interrupt, and resume rendering work for better performance.

---

**Line 3: `import './index.css'`**

Importing a CSS file inside a JavaScript file looks strange if you come from traditional web development. This is a **Vite feature** — when Vite's bundler processes your code and sees a CSS import in a JS file, it automatically:
1. Processes the CSS
2. Injects a `<style>` tag into the HTML page at runtime
3. During HMR, swaps the styles instantly without a reload

`index.css` is the place for **global styles** — things that apply to the whole page: CSS resets, base typography, body background, root-level CSS variables.

---

**Line 4: `import App from './App.jsx'`**

Imports the root `App` component. This is a **default import** (no curly braces), which means `App.jsx` exports one primary thing using `export default`. We'll talk more about named vs default exports in Stage 3.

The `.jsx` extension is explicit here. Vite supports omitting it in imports, but it's good practice to keep it explicit for clarity.

---

**Lines 5–8: `createRoot(...).render(...)`**

```jsx
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

This is two operations chained:

**`createRoot(document.getElementById('root'))`**
- `document.getElementById('root')` — standard browser JavaScript — finds the `<div id="root">` in `index.html`
- `createRoot(...)` — hands that DOM node over to React. React now owns and controls this div. Anything rendered here is managed by React's reconciler.

**`.render(<StrictMode><App /></StrictMode>)`**
- This is the actual rendering — React takes your JSX tree and builds the initial Virtual DOM, then commits it to the real DOM inside the `#root` div.
- After this line executes, your UI is visible on the page.
- From this point forward, React's event system and reconciler handle all updates.

---

### `src/App.jsx` — Your Root Component

```jsx
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>Edit <code>src/App.jsx</code> and save to test HMR</p>
      </div>
    </>
  )
}

export default App
```

We'll dissect JSX and hooks in Stage 3, but notice these key things now:

- `App` is just a **plain JavaScript function** that returns something that looks like HTML — that's JSX (covered deeply in Stage 3)
- `useState(0)` is a **hook** — it gives this component a piece of state (`count`) and a function to update it (`setCount`)
- `className` is used instead of `class` — because `class` is a reserved word in JavaScript
- `export default App` at the bottom — this is how `main.jsx` can import it
- The `<>...</>` wrapper is a **React Fragment** — lets you return multiple elements without adding an extra DOM node

---

### `vite.config.js` — The Build System Configuration

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

Vite's configuration lives here. It's intentionally minimal — Vite has smart defaults for most things. The `@vitejs/plugin-react` plugin does two critical things:

**1. Babel Transform (JSX compilation)**
Your browser doesn't understand JSX syntax (`<div className="app">`). The plugin uses Babel to transform every `.jsx` file into plain JavaScript that browsers can execute:
```jsx
// What you write (JSX):
return <h1 className="title">Hello</h1>

// What Babel transforms it into (plain JS):
return React.createElement("h1", { className: "title" }, "Hello")
```

**2. React Fast Refresh (HMR)**
Enables instant hot module replacement specifically designed for React components. When you save a React component file, only that component re-renders in the browser. Your application state (`useState` values) is preserved — the page never fully reloads.

**Common additions to `vite.config.js` in real projects:**
```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,         // change dev server port
    open: true,         // auto-open browser on dev start
  },
  resolve: {
    alias: {
      '@': '/src',      // lets you import from '@/components/...' instead of '../../components/...'
    }
  }
})
```

---

### `package-lock.json` — Why It Exists

```json
{
  "name": "react-bootcamp",
  "version": "1.0.0",
  "lockfileVersion": 3,
  "packages": {
    "node_modules/react": {
      "version": "18.2.0",
      "resolved": "https://registry.npmjs.org/react/-/react-18.2.0.tgz",
      "integrity": "sha512-..."
    }
  }
}
```

Here's the problem it solves:

- `package.json` says `"react": "^18.2.0"` — which means "any 18.x.x version"
- If you run `npm install` today, you might get `18.2.0`
- If your teammate runs `npm install` in 3 months, a newer `18.3.0` might exist and they'd get that instead
- `18.2.0` and `18.3.0` may behave differently → **"works on my machine" bugs**

`package-lock.json` records the **exact version of every single package** (including nested dependencies) that was installed. This creates a **reproducible install** — anyone running `npm install` on the same lock file gets byte-for-byte identical packages.

```
package.json      → human-managed, approximate versions ("what we want")
package-lock.json → machine-generated, exact versions ("what we have")
```

> **Always commit `package-lock.json` to Git.** Never edit it manually — it's maintained by npm automatically.

---

### `.gitignore` — What Gets Excluded from Version Control

```
node_modules/          ← huge, regeneratable from package.json
dist/                  ← build output, regeneratable
.env                   ← environment variables (secrets!)
.env.local
*.log
.DS_Store              ← Mac OS metadata (useless to others)
```

The most important: `node_modules/` (too large, always regeneratable) and `.env` files (may contain API keys, passwords — never commit these).

---

### `eslint.config.js` — Code Quality Rules

ESLint is a **static analysis tool** that reads your code and flags problems before you run it:
- Unused variables
- Missing dependencies in React hooks
- Unreachable code
- Common React mistakes

In a professional setup, ESLint runs automatically in your editor (VS Code ESLint extension) and as part of your CI pipeline. For now, just know it's there and it helps you write better code.

---

## 2.5 — Restructuring Into a Professional Folder Architecture

The default Vite structure is intentionally minimal. In a real application with 50+ files, you need a **deliberate, scalable folder structure**. Let's set it up now.

Delete everything inside `src/` and recreate it with this architecture:

```bash
src/
├── assets/           ← images, fonts, SVGs, static media files
│   └── logo.svg
│
├── components/       ← reusable UI building blocks (used across multiple pages)
│   └── ui/           ← generic, design-system-level elements
│       └── .gitkeep  ← empty file to preserve folder in Git
│
├── pages/            ← one component per URL route
│   └── HomePage.jsx
│
├── hooks/            ← custom React hooks (reusable stateful logic)
│   └── .gitkeep
│
├── services/         ← all external communication (APIs, databases)
│   └── .gitkeep
│
├── utils/            ← pure utility/helper functions (no React)
│   └── .gitkeep
│
├── contexts/         ← React Context API definitions
│   └── .gitkeep
│
├── styles/           ← global CSS, CSS variables, themes
│   └── global.css
│
├── App.jsx           ← root component — will hold routing as app grows
└── main.jsx          ← entry point — mounts React to the DOM
```

> **What is `.gitkeep`?** Git doesn't track empty folders. If you want to commit an empty folder's structure to your repository (so teammates get the same architecture), you add a blank file called `.gitkeep` inside it. It has no code — it's just a placeholder.

### Detailed Folder Responsibilities

| Folder | Responsibility | What goes here | What does NOT go here |
|--------|---------------|----------------|----------------------|
| `components/` | Reusable UI pieces used across 2+ pages | `Navbar.jsx`, `Card.jsx`, `Button.jsx` | Page-specific, one-off components |
| `components/ui/` | Generic design-system elements | `Input.jsx`, `Modal.jsx`, `Spinner.jsx`, `Badge.jsx` | Components with business logic |
| `pages/` | Top-level route components — one per URL | `HomePage.jsx`, `LoginPage.jsx`, `DashboardPage.jsx` | Reusable UI, business logic |
| `hooks/` | Custom hooks — reusable stateful logic | `useAuth.js`, `useFetch.js`, `useLocalStorage.js` | Non-hook utility functions |
| `services/` | All API/external communication | `api.js`, `authService.js`, `userService.js` | UI code, React components |
| `utils/` | Pure functions, no React dependency | `formatDate.js`, `validateEmail.js`, `parseJSON.js` | Anything using hooks or JSX |
| `contexts/` | React Context providers and consumers | `AuthContext.jsx`, `ThemeContext.jsx` | Non-context state management |
| `styles/` | Global CSS, design tokens, themes | `global.css`, `variables.css`, `typography.css` | Component-scoped styles |

### Why This Structure Matters

**In a 3-file app:** Organization doesn't matter. Drop everything in `src/`.

**In a 50-file app:** Without structure, you waste time asking:
- "Where does this API call go?"
- "Where is the login component?"
- "Is this a reusable component or a page?"

With this structure, **every file has an obvious home**. New team members can navigate your codebase on day one. This structure enforces **separation of concerns** — each folder has exactly one type of responsibility, making the codebase predictable and maintainable.

---

## 2.6 — Setting Up the Files

Now let's create the actual files for our restructured project.

### `src/styles/global.css`

```css
/* ============================================
   CSS Reset — Remove browser default styles
   ============================================ */
*, *::before, *::after {
  box-sizing: border-box;   /* padding/border included in width calculations */
  margin: 0;                /* remove default margins */
  padding: 0;               /* remove default padding */
}

/* ============================================
   Design Tokens — CSS Custom Properties
   Define your design system in one place.
   Change a variable here, it updates everywhere.
   ============================================ */
:root {
  /* Colors */
  --color-primary: #646cff;
  --color-primary-hover: #535bf2;
  --color-background: #242424;
  --color-surface: #1a1a1a;       /* slightly lighter than background — for cards */
  --color-text: rgba(255, 255, 255, 0.87);
  --color-text-muted: rgba(255, 255, 255, 0.5);
  --color-border: rgba(255, 255, 255, 0.1);

  /* Typography */
  --font-size-base: 16px;
  --font-size-sm: 0.875rem;    /* 14px */
  --font-size-lg: 1.125rem;    /* 18px */
  --font-size-xl: 1.5rem;      /* 24px */
  --font-family: Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-bold: 700;

  /* Spacing scale */
  --spacing-xs: 0.25rem;   /* 4px */
  --spacing-sm: 0.5rem;    /* 8px */
  --spacing-md: 1rem;      /* 16px */
  --spacing-lg: 1.5rem;    /* 24px */
  --spacing-xl: 2rem;      /* 32px */
  --spacing-2xl: 3rem;     /* 48px */

  /* Border radius */
  --border-radius-sm: 4px;
  --border-radius: 8px;
  --border-radius-lg: 12px;
  --border-radius-full: 9999px;  /* pill shape */

  /* Transitions */
  --transition-fast: 150ms ease;
  --transition-base: 250ms ease;
}

/* ============================================
   Base Styles
   ============================================ */
body {
  font-family: var(--font-family);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-normal);
  color: var(--color-text);
  background-color: var(--color-background);
  line-height: 1.5;
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;  /* smoother fonts on Mac */
  -moz-osx-font-smoothing: grayscale;
}

#root {
  min-height: 100vh;
}

/* Remove default list styles */
ul, ol {
  list-style: none;
}

/* Make images responsive by default */
img {
  max-width: 100%;
  display: block;
}

/* Remove default button styles */
button {
  cursor: pointer;
  border: none;
  background: none;
  font-family: inherit;
}

/* Remove default anchor underlines */
a {
  color: inherit;
  text-decoration: none;
}
```

**Why CSS variables (Custom Properties)?**

CSS variables let you define your **design system in one centralized place**. Benefits:
- Change `--color-primary` once → every component that references it updates automatically
- Components stay decoupled — they use tokens, not hard-coded values
- Enables easy theme switching (light/dark mode) by swapping variable values
- This is exactly how professional design systems (Material UI, Chakra UI, etc.) work internally

---

### `src/pages/HomePage.jsx`

```jsx
// pages/HomePage.jsx
//
// Responsibility: The main landing page of the application.
// This component represents what users see at the "/" route.
// As the app grows, this will contain page-level layout and
// composition of multiple smaller components.

function HomePage() {
  return (
    <main>
      <h1>Welcome to React Bootcamp</h1>
      <p>We are building something great.</p>
    </main>
  );
}

export default HomePage;
```

This is deliberately minimal right now. As we progress through the bootcamp, this page will grow into something real. Notice `export default HomePage` — this is how other files can import this component.

---

### `src/App.jsx` — Cleaned Up and Restructured

```jsx
// App.jsx
//
// Responsibility: The root component of the application.
// This is the top of our component tree.
// As the app grows, this file will contain:
//   - React Router setup (mapping URLs to page components)
//   - Global providers (auth, theme, etc.)
//   - App-level layout wrappers
//
// For now, it directly renders our single page.

import HomePage from './pages/HomePage';
import './styles/global.css';

function App() {
  return (
    <div className="app">
      <HomePage />
    </div>
  );
}

export default App;
```

---

### `src/main.jsx` — The Bootstrap (Unchanged)

```jsx
// main.jsx
//
// Responsibility: The entry point. This file runs first.
// It connects React to the browser DOM and mounts the app.
// You typically only modify this file when:
//   - Adding global providers (Redux store, React Query client, etc.)
//   - Adding error boundaries at the root level
//   - Setting up i18n or theme providers

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

// Find the <div id="root"> in index.html
// Hand control of that DOM node to React
// Render our entire application inside it
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

---

## 2.7 — Understanding Hot Module Replacement (HMR)

### What Is HMR?

Make a change in `HomePage.jsx` while `npm run dev` is running. The browser reflects the change **in under 100ms without a full page reload**. Your `useState` values are preserved — the component just re-renders with the new code. This is **Hot Module Replacement**.

### How HMR Works Under the Hood

```
You save HomePage.jsx
        ↓
Vite's file system watcher detects the change (using OS-level file events)
        ↓
Vite recompiles only that specific module (not the whole app)
        ↓
Vite sends the updated module to the browser via WebSocket connection
(Vite maintains a persistent WebSocket to your browser during dev)
        ↓
React Fast Refresh receives the update
        ↓
Fast Refresh re-runs the changed component function
        ↓
React reconciles the new output with the existing DOM
        ↓
Only the changed component re-renders — state is preserved
        ↓
You see the visual change in under 100ms
```

### HMR vs Full Page Reload vs No HMR

```
No dev server (old way):
  Save file → manually refresh browser → lose all app state → start over

Webpack HMR (old):
  Save file → rebuild entire bundle (10–60s) → inject → state sometimes lost

Vite HMR (now):
  Save file → recompile that one file → inject via WebSocket → state preserved
  Time: < 100ms regardless of app size
```

For complex UIs with forms, multi-step state, and navigation — this is transformative for developer experience. You can be 5 steps deep in a user flow, tweak a style, and instantly see it without losing your place.

### When HMR Doesn't Preserve State

HMR state preservation works for **component state** (`useState`, `useReducer`). It does NOT preserve:
- State stored in `context` when the context file itself changes
- State in files that are not React components (utils, services)
- When you change the **structure** of a component significantly (React Fast Refresh does a full remount)

In those cases, you'll see a full component remount — state resets. This is expected and correct behavior.

---

## 2.8 — The Complete Mental Model for Your Dev Environment

### During Development (`npm run dev`)

```
Your Editor (VS Code)
        │
        │   You write JSX + modern JavaScript
        ↓
Vite Dev Server (http://localhost:5173)
        │
        ├── File Watcher
        │     → Watches src/ for changes
        │     → Triggers HMR on save
        │
        ├── Babel Transform (via @vitejs/plugin-react)
        │     → JSX → plain JavaScript
        │     → Modern JS → browser-compatible JS
        │
        ├── Native ES Module Server
        │     → No bundling — serves files individually
        │     → Browser requests main.jsx → Vite serves it
        │     → Browser sees import App from './App.jsx'
        │     → Browser requests App.jsx → Vite serves it
        │     → (continues for every import in your tree)
        │
        └── WebSocket Server
              → Maintains live connection to browser
              → Pushes HMR updates instantly
                        │
                        ↓
                React runs in browser
                        │
                        ↓
                Mounts components into <div id="root">
                        │
                        ↓
                User sees and interacts with your app
```

### Building for Production (`npm run build`)

```
npm run build → Vite's production pipeline starts
        │
        ├── Rollup bundler processes entire app
        │
        ├── All JSX transformed to plain JS (Babel)
        │
        ├── All imports resolved and bundled together
        │
        ├── Tree-shaking
        │     → Removes unused code
        │     → If you import a function but never use it, it's gone
        │
        ├── Minification
        │     → Variable names shortened (a, b, c instead of userProfile)
        │     → Whitespace and comments removed
        │     → String literals compressed
        │
        ├── Code splitting (automatic)
        │     → Large apps split into multiple chunk files
        │     → Users download only the code they need for current route
        │
        └── Asset fingerprinting
              → Output files named with content hashes: index-a1b2c3.js
              → Hash changes only when content changes
              → Enables aggressive browser caching (old files cached forever,
                new files have new hashes so cache is busted automatically)
                        │
                        ↓
              dist/ folder created:
              ├── index.html          ← entry point
              ├── assets/
              │   ├── index-a1b2c3.js  ← your entire app, minified
              │   └── index-d4e5f6.css ← all CSS
              └── (any public/ assets copied here)
```

> The `dist/` folder is what you upload to a hosting service (Netlify, Vercel, AWS S3, etc.). It's **pure HTML, CSS, and JavaScript** — no Node.js server required to serve it. Any static file host works.

### Deploying vs Serving

```
Development: npm run dev
  → Vite's Node.js server serves your app
  → Source maps enabled (can see original code in DevTools)
  → No minification (readable code)
  → HMR active

Production: npm run build → deploy dist/
  → Any static file server works (Nginx, Netlify, S3, GitHub Pages)
  → No Node.js needed at runtime
  → Minified and optimized
  → Source maps optional (you can generate them for error tracking)
```

---

## 2.9 — VS Code Setup for React Development

These extensions will significantly improve your development experience:

```
Essential:
├── ESLint                    → shows linting errors inline as you type
├── Prettier - Code Formatter → auto-formats your code on save
└── ES7+ React/Redux Snippets → type "rafce" + Tab = full component boilerplate

Highly Recommended:
├── Auto Import               → auto-adds import statements when you use a component
├── Path Intellisense         → autocomplete for file paths in imports
├── GitLens                   → enhanced Git integration
└── Error Lens                → shows error messages inline on the same line
```

**Recommended VS Code settings for React (`.vscode/settings.json`):**

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.tabSize": 2,
  "emmet.includeLanguages": {
    "javascript": "javascriptreact"
  }
}
```

`editor.formatOnSave: true` + Prettier = your code is automatically formatted every time you save. This eliminates all style debates in teams and keeps your code consistent.

---

## 2.10 — Stage 2 Checklist

Before moving to Stage 3 (JSX and Components), verify every item:

```
✅ Node.js LTS installed — node --version returns a version number
✅ npm installed — npm --version returns a version number
✅ Created a Vite + React project with npm create vite@latest
✅ npm install ran successfully — node_modules/ folder exists
✅ npm run dev starts the server — localhost:5173 shows the app
✅ Can explain what every file in the generated project does
✅ Professional folder structure (components, pages, hooks, services, etc.) created
✅ global.css with CSS variables is set up
✅ Editing a file updates the browser instantly via HMR
✅ Understand the difference between dependencies and devDependencies
✅ Know what node_modules is and why we never commit it to Git
✅ Know what package-lock.json is and why we DO commit it to Git
✅ Understand the difference between npm run dev (development) and npm run build (production)
✅ Know the difference between public/ and src/assets/
✅ VS Code extensions installed (ESLint, Prettier, React Snippets)
```

---

## Quick Reference Card

```
COMMANDS:
  npm create vite@latest     → scaffold a new project
  npm install                → install all dependencies from package.json
  npm install <pkg>          → add a new dependency
  npm install -D <pkg>       → add a new devDependency
  npm run dev                → start development server
  npm run build              → create production build in dist/
  npm run preview            → locally preview production build

KEY FILES:
  index.html       → SPA entry point, contains <div id="root">
  src/main.jsx     → React bootstrap, mounts App into #root
  src/App.jsx      → Root component, top of component tree
  vite.config.js   → Build tool configuration
  package.json     → Project manifest, dependency list
  package-lock.json → Exact version lock — always commit this

FOLDER RULES:
  components/  → reusable across pages
  pages/       → one per URL route
  hooks/       → custom React hooks
  services/    → API calls only
  utils/       → pure functions, no React
  contexts/    → React Context providers
  styles/      → global CSS and design tokens
  public/      → static files served as-is (no processing)
  src/assets/  → images/files imported by components (processed by Vite)
```