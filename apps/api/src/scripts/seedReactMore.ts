import { problems } from '../db/schema'

type Row = typeof problems.$inferInsert

function t(
  id: string, title: string, topic: string, difficulty: 'easy'|'medium'|'hard',
  content: string, subtopic?: string
): Row {
  return {
    id, title, topic, subtopic: subtopic ?? null, difficulty,
    platform: null, platformLink: null,
    estimatedMinutes: difficulty === 'easy' ? 10 : difficulty === 'medium' ? 15 : 20,
    sheet: topic, problemNumber: null,
    tags: JSON.stringify([topic.toLowerCase().replace(/ /g, '-'), 'react']),
    questionType: 'theory', subject: 'react',
    content, contentSource: 'internal',
  }
}

function mcq(
  id: string, title: string, topic: string, difficulty: 'easy'|'medium'|'hard',
  question: string, options: string[], correct_index: number, explanation: string
): Row {
  return {
    id, title, topic, subtopic: null, difficulty,
    platform: null, platformLink: null,
    estimatedMinutes: 5, sheet: topic, problemNumber: null,
    tags: JSON.stringify([topic.toLowerCase().replace(/ /g, '-'), 'react', 'mcq']),
    questionType: 'mcq', subject: 'react',
    content: JSON.stringify({ question, options, correct_index, explanation }),
    contentSource: 'internal',
  }
}

// ─── HOOKS DEEP DIVE (25 questions) ───────────────────────────────────────────

const HOOKS: Row[] = [

t('react-ext-t-001', 'useState — lazy initialization, functional updates, batching', 'React Hooks', 'medium', `
## useState In Depth

### Lazy initialization
Pass a function to \`useState\` to avoid expensive re-computation on every render:
\`\`\`jsx
// ❌ runs on every render
const [data] = useState(JSON.parse(localStorage.getItem('data') ?? '[]'));

// ✅ runs only once
const [data] = useState(() => JSON.parse(localStorage.getItem('data') ?? '[]'));
\`\`\`

### Functional updates
Use when the new state depends on the previous state:
\`\`\`jsx
// ❌ stale closure — may use outdated count
setCount(count + 1);
setCount(count + 1); // both use same stale count!

// ✅ functional update — guaranteed latest value
setCount(prev => prev + 1);
setCount(prev => prev + 1); // count increases by 2 correctly
\`\`\`

### Batching (React 18)
Before React 18, updates inside async callbacks were NOT batched. React 18 introduced **automatic batching** everywhere:
\`\`\`jsx
// React 18: both setters trigger only ONE re-render
setTimeout(() => {
  setCount(c => c + 1);
  setFlag(f => !f);
}, 0);

// To opt out of batching (rare):
import { flushSync } from 'react-dom';
flushSync(() => setCount(c => c + 1));
\`\`\`

### State updates are asynchronous (but not Promise-based)
\`\`\`jsx
const [count, setCount] = useState(0);
const handleClick = () => {
  setCount(1);
  console.log(count); // still 0 — state not updated yet
  // Use useEffect if you need to react to state changes
};
\`\`\`
`),

t('react-ext-t-002', 'useEffect — dependency array rules and cleanup', 'React Hooks', 'medium', `
## useEffect In Depth

### Three dependency array forms
\`\`\`jsx
useEffect(() => { ... });          // runs after EVERY render
useEffect(() => { ... }, []);      // runs ONCE (mount)
useEffect(() => { ... }, [id]);    // runs when id changes
\`\`\`

### Cleanup function
Return a function to clean up subscriptions, timers, and listeners:
\`\`\`jsx
useEffect(() => {
  const controller = new AbortController();

  fetch('/api/data', { signal: controller.signal })
    .then(r => r.json())
    .then(setData)
    .catch(err => {
      if (err.name !== 'AbortError') setError(err);
    });

  return () => controller.abort(); // cleanup on unmount or before next effect
}, [id]);
\`\`\`

### Rules for the dependency array
- Include ALL reactive values used inside the effect (eslint-plugin-react-hooks enforces this)
- Never suppress the lint rule — it hides bugs
- If a value changes too often, move the logic into a \`useCallback\` or \`useReducer\`

### Common mistake — object/function deps
\`\`\`jsx
// ❌ New object every render → effect runs every render
useEffect(() => {
  fetchData(options);
}, [options]); // options = { page } recreated inline

// ✅ Primitives as deps, or useMemo/useCallback for stable refs
const stableOptions = useMemo(() => ({ page }), [page]);
\`\`\`
`),

t('react-ext-t-003', 'useReducer — managing complex state', 'React Hooks', 'medium', `
## useReducer

Better than \`useState\` when:
- Next state depends on previous state in non-trivial ways
- State has multiple sub-values that change together
- Multiple actions lead to different state transitions

\`\`\`jsx
const initialState = { count: 0, loading: false, error: null };

function reducer(state, action) {
  switch (action.type) {
    case 'INCREMENT':
      return { ...state, count: state.count + (action.payload ?? 1) };
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, count: action.payload };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, initialState);

  async function load() {
    dispatch({ type: 'FETCH_START' });
    try {
      const n = await fetchCount();
      dispatch({ type: 'FETCH_SUCCESS', payload: n });
    } catch (err) {
      dispatch({ type: 'FETCH_ERROR', payload: err.message });
    }
  }

  return (
    <>
      {state.loading && <Spinner />}
      {state.error && <Error msg={state.error} />}
      <button onClick={() => dispatch({ type: 'INCREMENT' })}>{state.count}</button>
      <button onClick={load}>Load from server</button>
    </>
  );
}
\`\`\`

### Lazy initialization
\`\`\`jsx
const [state, dispatch] = useReducer(reducer, userId, (id) => ({
  count: 0,
  userId: id,
}));
\`\`\`
`),

t('react-ext-t-004', 'useCallback and useMemo — when they help and when they hurt', 'React Hooks', 'medium', `
## useCallback & useMemo

### useMemo — memoize a computed value
\`\`\`jsx
const expensiveResult = useMemo(() => {
  return items
    .filter(i => i.active)
    .sort((a, b) => a.name.localeCompare(b.name));
}, [items]); // only recomputes when items changes
\`\`\`

### useCallback — memoize a function reference
\`\`\`jsx
const handleSubmit = useCallback(async (values) => {
  await api.submit(values);
}, []); // stable reference — won't trigger child re-renders

// Pass to React.memo child or as dep to useEffect
<Form onSubmit={handleSubmit} />
\`\`\`

### When they HELP
- \`useMemo\`: computationally expensive (>1ms) transformations
- \`useCallback\`: function passed to memoized child or used in useEffect deps

### When they HURT (premature optimization)
\`\`\`jsx
// ❌ Unnecessary — string comparison is trivial
const fullName = useMemo(() => first + ' ' + last, [first, last]);

// ❌ Memoizing a function but the child isn't memo'd — wasted work
const onClick = useCallback(() => setOpen(true), []);
<NonMemoizedChild onClick={onClick} />
\`\`\`

### Rule of thumb
> Profile first. Add \`useMemo\`/\`useCallback\` when you can measure a performance gain, not by default.

\`useCallback(fn, deps)\` = \`useMemo(() => fn, deps)\` — same mechanism, different shape.
`),

t('react-ext-t-005', 'useRef — DOM refs, mutable values, imperative APIs', 'React Hooks', 'medium', `
## useRef

A ref is a mutable container (\`{ current: value }\`) that persists across renders WITHOUT causing re-renders when changed.

### Two main use cases

#### 1. DOM access
\`\`\`jsx
function FocusInput() {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current.focus(); // imperative DOM operation
  }, []);

  return <input ref={inputRef} />;
}
\`\`\`

#### 2. Mutable instance variable (no re-render)
\`\`\`jsx
function Timer() {
  const intervalRef = useRef(null);
  const [count, setCount] = useState(0);

  function start() {
    // Save interval ID without triggering re-render
    intervalRef.current = setInterval(() => {
      setCount(c => c + 1);
    }, 1000);
  }

  function stop() {
    clearInterval(intervalRef.current);
  }

  return (
    <>
      <p>{count}</p>
      <button onClick={start}>Start</button>
      <button onClick={stop}>Stop</button>
    </>
  );
}
\`\`\`

### Capturing previous value
\`\`\`jsx
function usePrevious(value) {
  const ref = useRef();
  useEffect(() => { ref.current = value; });
  return ref.current;
}
\`\`\`

### Key rule
**Don't read or write \`ref.current\` during render** — it bypasses React's rendering contract. Only access refs in event handlers or effects.
`),

t('react-ext-t-006', 'Custom hooks — patterns, naming rules, composition', 'React Hooks', 'hard', `
## Custom Hooks

Custom hooks are regular functions that call other hooks. They extract stateful logic for reuse.

### Rules
1. Name must start with \`use\` (required by eslint-plugin-react-hooks)
2. Can only be called at the top level of a component or another custom hook
3. Can call any other hooks

### Examples

#### useFetch
\`\`\`jsx
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const ctrl = new AbortController();
    setLoading(true);
    fetch(url, { signal: ctrl.signal })
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { if (e.name !== 'AbortError') { setError(e); setLoading(false); } });
    return () => ctrl.abort();
  }, [url]);

  return { data, loading, error };
}

// Usage
const { data: user, loading } = useFetch(\`/api/users/\${id}\`);
\`\`\`

#### useLocalStorage
\`\`\`jsx
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key) ?? JSON.stringify(initialValue)); }
    catch { return initialValue; }
  });

  const set = useCallback(val => {
    setValue(val);
    localStorage.setItem(key, JSON.stringify(val));
  }, [key]);

  return [value, set];
}
\`\`\`

### Why custom hooks beat HOCs and render props
- No wrapper components ("wrapper hell")
- Logic is clearly separated from view
- Composable: \`useAuth\` + \`useFetch\` inside \`useUserProfile\`
`),

mcq('react-ext-m-001', 'useEffect cleanup', 'React Hooks', 'medium',
  'When does the cleanup function returned from useEffect run?',
  [
    'Only when the component unmounts',
    'Before every re-run of the effect and on unmount',
    'Only when a dependency changes',
    'Immediately after the effect runs',
  ], 1,
  'The cleanup function runs before the NEXT effect execution AND on unmount. This prevents stale subscriptions/timers from stacking up.'),

mcq('react-ext-m-002', 'useState vs useRef re-render', 'React Hooks', 'easy',
  'Which of the following does NOT cause a re-render when changed?',
  ['useState setter', 'useReducer dispatch', 'useRef.current assignment', 'useContext value change'],
  2,
  'Mutating ref.current never triggers a re-render. Refs are escape hatches for values that should persist but not drive UI.'),

mcq('react-ext-m-003', 'Rules of hooks', 'React Hooks', 'easy',
  'Which of these hook calls is INVALID?',
  [
    'const [x, setX] = useState(0); // at top of component',
    'if (loading) { const [x] = useState(0); } // inside if',
    'const [x, setX] = useState(() => computeInitial()); // lazy init',
    'function useCustom() { const [x] = useState(0); return x; }',
  ], 1,
  'Hooks must be called at the top level — never inside conditionals, loops, or nested functions. This ensures React can track hook call order across renders.'),

]

// ─── REACT RENDERING (20 questions) ───────────────────────────────────────────

const RENDERING: Row[] = [

t('react-ext-t-007', 'Virtual DOM and reconciliation — how React updates the DOM', 'React Rendering', 'medium', `
## Virtual DOM & Reconciliation

### Virtual DOM
React maintains a lightweight in-memory representation of the actual DOM. When state changes:
1. React creates a new Virtual DOM tree
2. Diffs it against the previous tree (reconciliation)
3. Computes the minimal set of real DOM mutations
4. Applies only those changes (commit phase)

This is faster than naive full DOM replacement, but **not** faster than targeted manual DOM updates. The benefit is **developer ergonomics** — you describe the output, React handles the DOM.

### Reconciliation algorithm (heuristics)
React makes two assumptions for O(n) diffing (instead of O(n³)):
1. **Different types → replace**: If \`<div>\` becomes \`<span>\`, React destroys and recreates
2. **Keys identify list items**: Keys allow React to match old and new list items correctly

### Keys
\`\`\`jsx
// ❌ No keys — React has no way to match items on re-order
{items.map(item => <Item data={item} />)}

// ❌ Index as key — breaks when list is reordered or items are inserted
{items.map((item, i) => <Item key={i} data={item} />)}

// ✅ Stable, unique IDs
{items.map(item => <Item key={item.id} data={item} />)}
\`\`\`

### React Fiber (React 16+)
Fiber is the reconciliation engine. It allows React to:
- **Pause and resume** rendering work
- **Prioritize** urgent updates (user input) over less urgent ones (data loading)
- Enable **Concurrent Mode** features (Suspense, transitions)
`),

t('react-ext-t-008', 'React.memo, PureComponent — preventing unnecessary renders', 'React Rendering', 'medium', `
## Preventing Unnecessary Re-renders

### When does a component re-render?
1. Its own state or reducer dispatches
2. Its parent renders (default behaviour — even with same props!)
3. Context value it consumes changes

### React.memo
Wraps a functional component to memoize its output. Only re-renders if props change (shallow comparison).

\`\`\`jsx
const UserCard = React.memo(function UserCard({ name, age }) {
  return <div>{name} ({age})</div>;
});

// Custom comparison
const UserCard = React.memo(
  function UserCard({ user }) { ... },
  (prev, next) => prev.user.id === next.user.id // only re-render if id changes
);
\`\`\`

### Props must be stable references
\`\`\`jsx
// ❌ new function/object reference every render — memo is useless
<UserCard style={{ color: 'red' }} onClick={() => handleClick(id)} />

// ✅ stable refs
const style = useMemo(() => ({ color: 'red' }), []);
const onClick = useCallback(() => handleClick(id), [id]);
<UserCard style={style} onClick={onClick} />
\`\`\`

### When NOT to use React.memo
- Simple components (comparison cost > render cost)
- Components that almost always re-render anyway
- Props that always change (time, random, inline objects)
`),

t('react-ext-t-009', 'Concurrent React — Suspense, transitions, and startTransition', 'React Rendering', 'hard', `
## Concurrent React

React 18 introduced concurrent rendering: React can **pause, resume, and abandon** renders, enabling better UX.

### useTransition
Mark a state update as non-urgent (can be interrupted):
\`\`\`jsx
function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();

  function handleChange(e) {
    setQuery(e.target.value);             // urgent (input feels instant)
    startTransition(() => {
      setResults(search(e.target.value)); // non-urgent (can lag behind)
    });
  }

  return (
    <>
      <input value={query} onChange={handleChange} />
      {isPending && <Spinner />}
      <Results data={results} />
    </>
  );
}
\`\`\`

### Suspense
Lets you declaratively show a fallback while a component is loading data or code.
\`\`\`jsx
// Code splitting
const LazyChart = React.lazy(() => import('./Chart'));

function Dashboard() {
  return (
    <Suspense fallback={<Skeleton />}>
      <LazyChart />
    </Suspense>
  );
}
\`\`\`

### useDeferredValue
Like debounce but React-aware — defers re-rendering a value without blocking input:
\`\`\`jsx
const deferredQuery = useDeferredValue(query);
// deferredQuery lags behind query; heavy list re-renders don't block typing
<HeavyList filter={deferredQuery} />
\`\`\`
`),

mcq('react-ext-m-004', 'Key purpose', 'React Rendering', 'easy',
  'What is the primary purpose of the `key` prop in React lists?',
  [
    'To give elements a CSS id for styling',
    'To help React identify which items changed, were added, or removed',
    'To improve accessibility by labeling list items',
    'To set the tabIndex of list items',
  ], 1,
  'Keys help React\'s reconciliation algorithm match old and new list items efficiently. Without stable keys, React falls back to index-based matching which breaks on re-ordering.'),

mcq('react-ext-m-005', 'Re-render trigger', 'React Rendering', 'medium',
  'A parent component re-renders. Will a child wrapped in React.memo re-render if it receives the same primitive props?',
  [
    'Yes — React.memo only works for class components',
    'No — React.memo performs a shallow comparison and skips if props are unchanged',
    'Yes — all children always re-render with the parent',
    'No — React automatically skips re-renders for all children',
  ], 1,
  'React.memo does a shallow comparison of props. If all props are the same (primitive equality or same references), the child skips re-rendering.'),

]

// ─── STATE MANAGEMENT (20 questions) ─────────────────────────────────────────

const STATE: Row[] = [

t('react-ext-t-010', 'Context API — performance and common pitfalls', 'State Management', 'medium', `
## Context API In Depth

Context is designed for **global, rarely-changing** data (auth, theme, locale). Using it for frequently-changing state causes performance issues.

### Creating & consuming
\`\`\`jsx
const ThemeContext = createContext('light');

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('light');
  const value = useMemo(() => ({ theme, setTheme }), [theme]); // stable value
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be inside ThemeProvider');
  return ctx;
}
\`\`\`

### Performance problem
Every consumer re-renders when the context value changes. Solutions:
\`\`\`jsx
// 1. Split contexts: separate state from dispatch
const StateCtx  = createContext(null);
const DispatchCtx = createContext(null);

// 2. useMemo to stabilize value object
const value = useMemo(() => ({ user, permissions }), [user, permissions]);

// 3. Don't put high-frequency state in context — use Zustand/Redux
\`\`\`

### Context vs prop drilling vs global state
| | Context | Props | Zustand/Redux |
|--|---------|-------|---------------|
| Re-renders | All consumers | Only passed path | Selective |
| DevTools | ❌ | ❌ | ✅ |
| Best for | Auth/theme/locale | Component-local data | App-wide data |
`),

t('react-ext-t-011', 'Zustand — lightweight state management', 'State Management', 'medium', `
## Zustand

Zustand is a minimal, fast state management library. No providers, no boilerplate.

\`\`\`jsx
import { create } from 'zustand';

const useCartStore = create((set, get) => ({
  items: [],
  total: 0,

  addItem(item) {
    set(state => {
      const items = [...state.items, item];
      return { items, total: items.reduce((s, i) => s + i.price, 0) };
    });
  },

  removeItem(id) {
    set(state => {
      const items = state.items.filter(i => i.id !== id);
      return { items, total: items.reduce((s, i) => s + i.price, 0) };
    });
  },

  // Computed value on demand (not stored in state)
  get itemCount() { return get().items.length; },
}));

// Component — only re-renders when .items changes
function CartBadge() {
  const itemCount = useCartStore(s => s.items.length);
  return <span>{itemCount}</span>;
}

// Select multiple fields (shallow equality)
import { useShallow } from 'zustand/react/shallow';
const { items, total } = useCartStore(useShallow(s => ({ items: s.items, total: s.total })));
\`\`\`

### Why Zustand over Context
- Components only re-render when the **selected slice** changes
- No Provider wrapping
- Works outside React (in async code, event listeners)
- Built-in devtools middleware
`),

mcq('react-ext-m-006', 'Context re-render', 'State Management', 'hard',
  'If a Context value is `{ user, setUser }` and `setUser` is called, which components re-render?',
  [
    'Only components that use `user` from context',
    'All components that consume the context, regardless of which field they use',
    'Only the Provider component',
    'No components — Context updates are lazy',
  ], 1,
  'React Context does not support selective re-rendering. ALL consumers re-render whenever the context value changes (even if they don\'t use the changed part). Split contexts or use Zustand for granular subscriptions.'),

]

// ─── PERFORMANCE (20 questions) ───────────────────────────────────────────────

const PERFORMANCE: Row[] = [

t('react-ext-t-012', 'Code splitting with React.lazy and dynamic import', 'React Performance', 'medium', `
## Code Splitting

Bundle everything together = large initial JS payload = slow first load. Code splitting sends only what the user needs now.

### React.lazy + Suspense
\`\`\`jsx
import { lazy, Suspense } from 'react';

// Each route becomes a separate chunk
const Home      = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Profile   = lazy(() => import('./pages/Profile'));

function App() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        <Route path="/"          element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile"   element={<Profile />} />
      </Routes>
    </Suspense>
  );
}
\`\`\`

### Named export with lazy
\`\`\`jsx
// Module exports: export function Chart() { ... }
const Chart = lazy(() =>
  import('./Chart').then(m => ({ default: m.Chart }))
);
\`\`\`

### Prefetching
\`\`\`jsx
// Prefetch on hover — loads chunk before user clicks
function NavLink({ to, children }) {
  const prefetch = () => import(\`./pages/\${to}\`);
  return (
    <Link to={to} onMouseEnter={prefetch}>{children}</Link>
  );
}
\`\`\`

### Impact
Typical React apps: 40-70% reduction in initial bundle size with route-based code splitting.
`),

t('react-ext-t-013', 'Virtualizing long lists with windowing', 'React Performance', 'hard', `
## List Virtualization

Rendering 10,000 DOM nodes is slow even if they're off-screen. **Virtualization** only renders what's visible.

### Why it matters
- 10,000 \`<div>\` nodes: ~200ms render, ~50MB memory
- Virtualized (shows 20): ~2ms render, ~1MB memory

### react-window (lightweight)
\`\`\`jsx
import { FixedSizeList } from 'react-window';

function VirtualList({ items }) {
  const Row = ({ index, style }) => (
    <div style={style}>  {/* style is REQUIRED — sets position & size */}
      <UserCard user={items[index]} />
    </div>
  );

  return (
    <FixedSizeList
      height={600}
      width="100%"
      itemCount={items.length}
      itemSize={72}   // row height in px
    >
      {Row}
    </FixedSizeList>
  );
}
\`\`\`

### TanStack Virtual (headless, more flexible)
\`\`\`jsx
const rowVirtualizer = useVirtualizer({
  count: items.length,
  getScrollElement: () => parentRef.current,
  estimateSize: () => 72,
});
// Then render only rowVirtualizer.getVirtualItems()
\`\`\`

### When to use
- Lists > 100 items that might be rendered all at once
- Infinite scroll feeds
- Data tables with many rows
`),

mcq('react-ext-m-007', 'React.lazy requirement', 'React Performance', 'easy',
  'What does React.lazy() require the dynamic import to export?',
  [
    'A named export called "default"',
    'A default export',
    'An export called "component"',
    'Any named export',
  ], 1,
  'React.lazy() only works with default exports. The dynamic import must resolve to a module with a default export that is a React component.'),

]

// ─── PATTERNS & ARCHITECTURE (20 questions) ───────────────────────────────────

const PATTERNS: Row[] = [

t('react-ext-t-014', 'Compound components pattern', 'React Patterns', 'hard', `
## Compound Components

Components that work together via shared implicit state — like HTML's \`<select>\` + \`<option>\`.

\`\`\`jsx
// Context for shared state
const AccordionCtx = createContext(null);

function Accordion({ children, defaultOpen = null }) {
  const [openId, setOpenId] = useState(defaultOpen);
  const toggle = useCallback(id => setOpenId(prev => prev === id ? null : id), []);
  return (
    <AccordionCtx.Provider value={{ openId, toggle }}>
      <div className="accordion">{children}</div>
    </AccordionCtx.Provider>
  );
}

function AccordionItem({ id, title, children }) {
  const { openId, toggle } = useContext(AccordionCtx);
  const isOpen = openId === id;
  return (
    <div>
      <button onClick={() => toggle(id)}>{title}</button>
      {isOpen && <div>{children}</div>}
    </div>
  );
}

Accordion.Item = AccordionItem; // namespace it

// Usage — clean, no prop drilling
<Accordion defaultOpen="1">
  <Accordion.Item id="1" title="Section 1">Content 1</Accordion.Item>
  <Accordion.Item id="2" title="Section 2">Content 2</Accordion.Item>
</Accordion>
\`\`\`

### When to use
- Complex UI components with multiple interrelated sub-parts
- When you want to give users layout flexibility (reorder children) while sharing state
- Tab panels, accordions, dialogs, dropdown menus
`),

t('react-ext-t-015', 'Render props vs Higher-Order Components vs Custom Hooks', 'React Patterns', 'hard', `
## Code Reuse Patterns: Evolution

### Render Props
Pass a function as a prop that returns JSX. The component controls WHEN/HOW it renders.
\`\`\`jsx
<DataFetcher url="/api/users" render={({ data, loading }) => (
  loading ? <Spinner /> : <UserList users={data} />
)} />
\`\`\`
**Problem**: nesting ("callback hell"), awkward composition.

### Higher-Order Components (HOC)
A function that takes a component and returns an enhanced component.
\`\`\`jsx
function withAuth(WrappedComponent) {
  return function AuthenticatedComponent(props) {
    const { user } = useAuth();
    if (!user) return <Redirect to="/login" />;
    return <WrappedComponent {...props} user={user} />;
  };
}
const ProtectedDashboard = withAuth(Dashboard);
\`\`\`
**Problem**: prop collisions, obscures component tree in DevTools.

### Custom Hooks (preferred today)
\`\`\`jsx
function useFetch(url) { ... }

function UserList() {
  const { data, loading } = useFetch('/api/users');
  return loading ? <Spinner /> : <List users={data} />;
}
\`\`\`
**Wins**: composable, no wrapper components, TypeScript-friendly, visible in React DevTools.

### When HOCs still make sense
- Class components (can't use hooks)
- Wrapping with a Provider or ErrorBoundary
- Libraries like \`React.memo\`, \`connect()\` (Redux legacy)
`),

t('react-ext-t-016', 'Error boundaries — catching render errors', 'React Patterns', 'medium', `
## Error Boundaries

Error boundaries catch JavaScript errors anywhere in their **child component tree** during render, lifecycle methods, and constructors.

\`\`\`jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    // Update state to show fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log to error tracking service
    logToSentry(error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <h2>Something went wrong.</h2>;
    }
    return this.props.children;
  }
}

// Usage
<ErrorBoundary fallback={<ErrorPage />}>
  <Dashboard />
</ErrorBoundary>
\`\`\`

### react-error-boundary (library)
\`\`\`jsx
import { ErrorBoundary } from 'react-error-boundary';

function FallbackUI({ error, resetErrorBoundary }) {
  return (
    <div>
      <p>Error: {error.message}</p>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

<ErrorBoundary FallbackComponent={FallbackUI} onReset={refetchData}>
  <Dashboard />
</ErrorBoundary>
\`\`\`

### Limitations
- Only class components can BE error boundaries
- Do NOT catch: async errors, event handlers, server-side rendering
- For event handlers, use regular try/catch
`),

mcq('react-ext-m-008', 'Error boundary scope', 'React Patterns', 'medium',
  'Which of these does an Error Boundary NOT catch?',
  [
    'Errors in a child component\'s render method',
    'Errors in a child component\'s lifecycle methods',
    'Errors inside event handlers',
    'Errors in a child component\'s constructor',
  ], 2,
  'Error Boundaries do not catch errors inside event handlers (onClick, onChange, etc.). Use try/catch in those handlers. They also don\'t catch async errors or SSR errors.'),

mcq('react-ext-m-009', 'forwardRef purpose', 'React Patterns', 'medium',
  'What problem does React.forwardRef solve?',
  [
    'It forwards props from parent to grandchild',
    'It allows a parent to access a child\'s DOM node via a ref',
    'It forwards context to deeply nested components',
    'It prevents re-renders from propagating down',
  ], 1,
  'forwardRef allows a parent component to pass a ref through an intermediate component to reach the underlying DOM node or class instance of a child.'),

]

// ─── NEXT.JS & SSR (15 questions) ─────────────────────────────────────────────

const NEXTJS: Row[] = [

t('react-ext-t-017', 'SSR vs SSG vs ISR vs CSR — when to use each', 'Next.js & SSR', 'medium', `
## Rendering Strategies in Next.js

### Client-Side Rendering (CSR)
- JS runs in browser, fetches data after load
- ✅ Interactive, personalised
- ❌ Poor SEO, slow FCP (First Contentful Paint)
- Use for: dashboards, auth-gated pages

### Server-Side Rendering (SSR) — \`getServerSideProps\`
- HTML generated on every request at the server
- ✅ Always fresh data, good SEO
- ❌ Slower TTFB (server must run before response)
\`\`\`js
export async function getServerSideProps(context) {
  const data = await fetchData(context.params.id);
  return { props: { data } };
}
\`\`\`

### Static Site Generation (SSG) — \`getStaticProps\`
- HTML generated at build time
- ✅ Fastest delivery (CDN-cacheable), cheapest
- ❌ Stale data between deployments
\`\`\`js
export async function getStaticProps() {
  const data = await fetchData();
  return { props: { data } };
}
\`\`\`

### Incremental Static Regeneration (ISR)
- SSG + background regeneration on a timer
- ✅ Fast + can refresh without full rebuild
\`\`\`js
return { props: { data }, revalidate: 60 }; // re-generate every 60s
\`\`\`

### App Router (Next.js 13+) defaults
- Server Components: rendered on server, no JS sent to client
- Client Components (\`'use client'\`): hydrated in browser
- **Streaming**: send HTML progressively with Suspense
`),

t('react-ext-t-018', 'Next.js App Router — Server Components vs Client Components', 'Next.js & SSR', 'hard', `
## Server Components vs Client Components

### Server Components (default in App Router)
- Render on the server only — **zero JS sent to client**
- Can directly \`await\` database calls, file reads
- Cannot use: hooks, browser APIs, event handlers

\`\`\`tsx
// app/users/page.tsx — Server Component
async function UsersPage() {
  const users = await db.user.findMany(); // Direct DB access!
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}
\`\`\`

### Client Components
- Add \`'use client'\` directive at top
- Hydrated in the browser — can use hooks, events
\`\`\`tsx
'use client';
function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
\`\`\`

### Composition pattern
Server Components CAN render Client Components but NOT the other way around (without workarounds).

\`\`\`tsx
// ✅ Server wraps Client (common pattern)
async function Page() {
  const data = await fetchData();         // server-side
  return <ClientChart data={data} />;    // data passed as prop
}

// ✅ Pass Server Component as children to Client
function Layout({ children }) {          // 'use client' component
  return <main>{children}</main>;
}
// children is rendered on server, passed as serialized prop
\`\`\`
`),

mcq('react-ext-m-010', 'getStaticProps when runs', 'Next.js & SSR', 'easy',
  'When does `getStaticProps` run in Next.js?',
  [
    'On every user request at runtime',
    'At build time (and on revalidation for ISR)',
    'On the client after hydration',
    'Only in development mode',
  ], 1,
  'getStaticProps runs at build time. For ISR, it also runs in the background after revalidation. In development, it runs on every request for ease of debugging.'),

]

// ─── Export all ───────────────────────────────────────────────────────────────

export const allReactMoreProblems: Row[] = [
  ...HOOKS,
  ...RENDERING,
  ...STATE,
  ...PERFORMANCE,
  ...PATTERNS,
  ...NEXTJS,
]
