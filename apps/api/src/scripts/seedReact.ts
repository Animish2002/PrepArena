import { drizzle } from 'drizzle-orm/d1'
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
    tags: JSON.stringify([topic, 'react']),
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
    tags: JSON.stringify([topic, 'react', 'mcq']),
    questionType: 'mcq', subject: 'react',
    content: JSON.stringify({ question, options, correct_index, explanation }),
    contentSource: 'internal',
  }
}

const THEORY: Row[] = [

t('react-theory-001', 'React Fundamentals — JSX, Components & Props', 'React Basics', 'easy', `
## React Fundamentals

### What is React?
React is a **declarative, component-based UI library**. Instead of telling the browser HOW to update the DOM, you describe WHAT the UI should look like for a given state — React figures out the minimal DOM updates.

### JSX
JSX is syntactic sugar for \`React.createElement\`:
\`\`\`jsx
// JSX
const el = <div className="box">Hello {name}</div>;

// Compiled to:
const el = React.createElement('div', { className: 'box' }, 'Hello ', name);
\`\`\`

Rules:
- Single root element (or Fragment \`<></>\`)
- Use \`className\` not \`class\`
- Self-close empty elements: \`<img />\`
- JavaScript expressions in \`{}\`

### Components
\`\`\`jsx
// Function component (preferred)
function Greeting({ name, age = 0 }) {
  return <h1>Hello, {name}! You are {age}.</h1>;
}

// Usage
<Greeting name="Alice" age={25} />
\`\`\`

### Props
- Read-only — never mutate props
- Can be any JS value: string, number, object, array, function, JSX
- \`children\` is a special prop for nested content

\`\`\`jsx
function Card({ title, children, onClose }) {
  return (
    <div className="card">
      <div className="card-header">
        <h2>{title}</h2>
        <button onClick={onClose}>×</button>
      </div>
      <div className="card-body">{children}</div>
    </div>
  );
}

// Usage
<Card title="Welcome" onClose={() => setOpen(false)}>
  <p>Content here</p>
</Card>
\`\`\`

### Conditional rendering
\`\`\`jsx
// Ternary
{isLoggedIn ? <Dashboard /> : <Login />}

// Short-circuit (&&)
{hasError && <ErrorBanner message={error} />}

// Early return
function Profile({ user }) {
  if (!user) return null;
  return <div>{user.name}</div>;
}
\`\`\`

### List rendering
\`\`\`jsx
const items = ['Apple', 'Banana', 'Cherry'];
// key MUST be stable, unique among siblings
{items.map((item, i) => (
  <li key={item}>{item}</li>  // use item value, NOT index if list can reorder
))}
\`\`\`
`),

t('react-theory-002', 'useState & useReducer — State Management', 'Hooks', 'medium', `
## useState & useReducer

### useState
\`\`\`jsx
const [count, setCount] = useState(0);

// Update
setCount(count + 1);           // direct
setCount(prev => prev + 1);   // functional update — preferred when new state depends on old

// Object state — always spread (never mutate)
const [user, setUser] = useState({ name: '', email: '' });
setUser(prev => ({ ...prev, name: 'Alice' })); // merge, don't replace
\`\`\`

### useState initialization
\`\`\`jsx
// Lazy initializer — runs only once (not on every render)
const [state, setState] = useState(() => expensiveComputation());
\`\`\`

### Batching (React 18+)
React 18 batches ALL state updates, including those in async functions and event handlers:
\`\`\`jsx
// Both updates are batched into ONE re-render
const handleClick = async () => {
  await fetchData();
  setLoading(false);  // batched
  setData(result);    // batched → single render
};
\`\`\`

### useReducer — for complex state logic
\`\`\`jsx
type Action =
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'reset'; payload: number };

function reducer(state: number, action: Action): number {
  switch (action.type) {
    case 'increment': return state + 1;
    case 'decrement': return state - 1;
    case 'reset':     return action.payload;
    default: return state;
  }
}

function Counter() {
  const [count, dispatch] = useReducer(reducer, 0);

  return (
    <>
      <span>{count}</span>
      <button onClick={() => dispatch({ type: 'increment' })}>+</button>
      <button onClick={() => dispatch({ type: 'decrement' })}>-</button>
      <button onClick={() => dispatch({ type: 'reset', payload: 0 })}>Reset</button>
    </>
  );
}
\`\`\`

### When to use useReducer vs useState
- **useState**: simple, independent values
- **useReducer**: complex state with multiple sub-values; next state depends on previous; multiple update actions

### Immer with useReducer
\`\`\`jsx
import { useImmerReducer } from 'use-immer';

function reducer(draft, action) {
  switch (action.type) {
    case 'updateName':
      draft.user.name = action.payload; // mutate draft directly!
      break;
  }
}
\`\`\`
`),

t('react-theory-003', 'useEffect — Lifecycle, Cleanup & Dependencies', 'Hooks', 'medium', `
## useEffect

### Basic usage
\`\`\`jsx
useEffect(() => {
  // Side effects: fetch data, subscriptions, timers, DOM manipulation
  document.title = \`Count: \${count}\`;

  // Cleanup function (runs before next effect or on unmount)
  return () => {
    document.title = 'App';
  };
}, [count]); // dependency array
\`\`\`

### Dependency array variants
\`\`\`jsx
useEffect(() => { /* runs every render */ });
useEffect(() => { /* runs once on mount */ }, []);
useEffect(() => { /* runs when count changes */ }, [count]);
\`\`\`

### Fetching data correctly
\`\`\`jsx
useEffect(() => {
  let cancelled = false;

  async function fetchUser() {
    try {
      setLoading(true);
      const res = await fetch(\`/api/users/\${userId}\`);
      const data = await res.json();
      if (!cancelled) { // prevent setting state on unmounted component
        setUser(data);
        setLoading(false);
      }
    } catch (err) {
      if (!cancelled) setError(err.message);
    }
  }

  fetchUser();
  return () => { cancelled = true; }; // cleanup
}, [userId]);
\`\`\`

### AbortController pattern
\`\`\`jsx
useEffect(() => {
  const controller = new AbortController();
  fetch('/api/data', { signal: controller.signal })
    .then(r => r.json())
    .then(setData)
    .catch(err => { if (err.name !== 'AbortError') setError(err); });

  return () => controller.abort();
}, []);
\`\`\`

### Subscriptions and event listeners
\`\`\`jsx
useEffect(() => {
  const handler = (e) => setSize({ w: e.target.innerWidth, h: e.target.innerHeight });
  window.addEventListener('resize', handler);
  return () => window.removeEventListener('resize', handler);
}, []);
\`\`\`

### React 18 StrictMode double-invoke
In development, React 18 mounts → unmounts → remounts every component to catch effect cleanup bugs. Always write cleanup functions.

### useEffect alternatives (React 19+)
- Data fetching → use a library (React Query, SWR) or Server Components
- Event handling → use event handlers directly, not effects
- Derived state → compute during render, not in an effect
`),

t('react-theory-004', 'useCallback, useMemo & React.memo', 'Performance', 'medium', `
## Performance Optimization

### The re-render problem
Every time a parent re-renders, ALL child components re-render by default (even if their props haven't changed).

### React.memo — skip re-rendering
\`\`\`jsx
// Only re-renders when props change (shallow comparison)
const ExpensiveChild = React.memo(function ExpensiveChild({ name, onClick }) {
  return <div onClick={onClick}>{name}</div>;
});

// Custom comparison
const Child = React.memo(Component, (prev, next) => {
  return prev.id === next.id; // return true = skip re-render
});
\`\`\`

### useMemo — memoize expensive computations
\`\`\`jsx
// Without useMemo — runs on every render
const sorted = items.sort(compareFn);

// With useMemo — only recalculates when items or compareFn changes
const sorted = useMemo(() => {
  return [...items].sort(compareFn);
}, [items, compareFn]);
\`\`\`

### useCallback — stable function reference
\`\`\`jsx
// Without useCallback — new function on every render → child always re-renders
<ExpensiveChild onClick={() => handleClick(id)} />

// With useCallback — stable reference → React.memo can skip re-render
const handleClick = useCallback((id) => {
  dispatch({ type: 'select', payload: id });
}, [dispatch]); // stable: dispatch from useReducer never changes

<ExpensiveChild onClick={handleClick} />
\`\`\`

### When NOT to memoize
Memoization has a cost — comparison overhead + memory. Don't use it:
- For trivial computations (adding numbers, string interpolation)
- When props always change
- On small component trees

### Real-world example
\`\`\`jsx
function TodoList({ todos, filter }) {
  // Expensive: filtering 10k todos
  const filtered = useMemo(
    () => todos.filter(todo => todo.status === filter),
    [todos, filter]
  );

  // Stable handler for React.memo children
  const handleToggle = useCallback((id) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }, []); // empty deps — uses functional update

  return filtered.map(todo => (
    <TodoItem key={todo.id} todo={todo} onToggle={handleToggle} />
  ));
}
\`\`\`

### Profiler API
\`\`\`jsx
<React.Profiler id="TodoList" onRender={(id, phase, duration) => {
  if (duration > 16) console.warn(\`\${id} took \${duration}ms\`);
}}>
  <TodoList />
</React.Profiler>
\`\`\`
`),

t('react-theory-005', 'useRef — DOM Access, Instance Variables & Imperative Handle', 'Hooks', 'medium', `
## useRef

### Accessing DOM elements
\`\`\`jsx
function TextInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <>
      <input ref={inputRef} type="text" />
      <button onClick={focusInput}>Focus</button>
    </>
  );
}
\`\`\`

### Instance variables (mutable, no re-render)
The key difference from state: **changing a ref does NOT trigger a re-render**.
\`\`\`jsx
function Timer() {
  const [count, setCount] = useState(0);
  const intervalRef = useRef<number>(null);

  const start = () => {
    intervalRef.current = setInterval(() => setCount(c => c + 1), 1000);
  };

  const stop = () => {
    clearInterval(intervalRef.current!);
  };

  return <button onClick={start}>Start</button>;
}
\`\`\`

### Storing previous value
\`\`\`jsx
function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();
  useEffect(() => { ref.current = value; });
  return ref.current; // the value BEFORE this render
}
\`\`\`

### useImperativeHandle — expose imperative API
\`\`\`jsx
// Child exposes specific methods to parent
const FancyInput = forwardRef<{ focus: () => void; clear: () => void }, Props>(
  function FancyInput(props, ref) {
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      clear: () => { if (inputRef.current) inputRef.current.value = ''; }
    }));

    return <input ref={inputRef} />;
  }
);

// Parent
const inputRef = useRef<{ focus: () => void; clear: () => void }>(null);
<FancyInput ref={inputRef} />
<button onClick={() => inputRef.current?.clear()}>Clear</button>
\`\`\`

### Callback refs — run code when ref attaches
\`\`\`jsx
function MeasureElement() {
  const [height, setHeight] = useState(0);

  const measuredRef = useCallback((node: HTMLDivElement | null) => {
    if (node) setHeight(node.getBoundingClientRect().height);
  }, []);

  return <div ref={measuredRef}>Content</div>;
}
\`\`\`
`),

t('react-theory-006', 'Context API & State Management Patterns', 'State Management', 'medium', `
## Context API & State Patterns

### createContext + useContext
\`\`\`jsx
interface ThemeCtx {
  theme: 'light' | 'dark';
  toggle: () => void;
}

const ThemeContext = createContext<ThemeCtx | null>(null);

// Provider
function ThemeProvider({ children }) {
  const [theme, setTheme] = useState<'light'|'dark'>('light');
  const toggle = useCallback(() => setTheme(t => t === 'light' ? 'dark' : 'light'), []);

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook (hides null check)
function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be inside ThemeProvider');
  return ctx;
}

// Consumer
function Button() {
  const { theme, toggle } = useTheme();
  return <button className={theme} onClick={toggle}>Toggle</button>;
}
\`\`\`

### Context performance — avoid re-renders
Context triggers re-render for ALL consumers when value changes.
\`\`\`jsx
// BAD: new object every render
<ThemeContext.Provider value={{ theme, toggle }}> // re-renders everything on any parent render

// FIX: memoize the value
const value = useMemo(() => ({ theme, toggle }), [theme, toggle]);
<ThemeContext.Provider value={value}>

// BETTER: split into separate contexts
const ThemeValueCtx = createContext(theme);      // changes on theme change
const ThemeActionsCtx = createContext({ toggle }); // stable — no re-render for theme changes
\`\`\`

### Context + useReducer pattern (poor man's Redux)
\`\`\`jsx
const StoreContext = createContext(null);
const DispatchContext = createContext(null);

function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <DispatchContext.Provider value={dispatch}>
      <StoreContext.Provider value={state}>
        {children}
      </StoreContext.Provider>
    </DispatchContext.Provider>
  );
}

// Separate hooks so consumers only subscribe to what they need
const useStore = () => useContext(StoreContext);
const useDispatch = () => useContext(DispatchContext);
\`\`\`

### When to use external state management (Zustand, Redux Toolkit)
- State needed by many unrelated components
- Complex update logic with many actions
- DevTools / time-travel debugging needed
- State shared across routes/pages
`),

t('react-theory-007', 'React Fiber & Reconciliation Algorithm', 'React Internals', 'hard', `
## React Fiber & Reconciliation

### The Virtual DOM
React maintains a JavaScript representation of the DOM (VDOM). On each render:
1. Creates new VDOM tree
2. **Diffs** against previous tree (reconciliation)
3. Applies minimal **patches** to the real DOM

### React Fiber (React 16+)
Fiber is a complete rewrite of the reconciliation algorithm. Key capabilities:
- **Incremental rendering** — split render work into chunks
- **Prioritization** — urgent updates (user input) preempt less urgent ones (data fetching)
- **Concurrency** — pause, resume, or abort rendering work
- **Error boundaries** — catch errors in component trees

### How Fiber works
Each component is a "fiber node" — a JavaScript object with:
\`\`\`
{
  type: 'div' | Component,
  key: null | string,
  stateNode: DOM node,
  return: parent fiber,
  child: first child fiber,
  sibling: next sibling fiber,
  alternate: the previous render's fiber (for diffing),
  effectTag: placement | update | deletion,
  // ... state, hooks, etc.
}
\`\`\`

### Two phases
**Render phase** (can be interrupted):
- Creates new fiber tree
- Calculates what changed
- Runs pure: no side effects

**Commit phase** (cannot be interrupted):
- Applies changes to DOM (Placement, Update, Deletion effects)
- Runs useLayoutEffect cleanup + setup
- Then runs useEffect cleanup + setup (async, after paint)

### Reconciliation heuristics
Two elements of different types → replace entire subtree (never try to reuse)
\`\`\`jsx
// Switching type discards all state
{isAdmin ? <AdminPanel /> : <UserPanel />}
// AdminPanel and UserPanel are ALWAYS remounted on toggle

// Keep same type if possible
<Panel variant={isAdmin ? 'admin' : 'user'} />
\`\`\`

### The key prop — identity hint
\`\`\`jsx
// Without key: React compares by position — updates in place
// With key: React tracks identity — can move/add/remove correctly

// WRONG: index as key breaks when list reorders
{items.map((item, i) => <Item key={i} {...item} />)}

// RIGHT: stable unique id
{items.map(item => <Item key={item.id} {...item} />)}
\`\`\`

### Concurrent Mode (React 18)
\`\`\`jsx
// useTransition — mark updates as non-urgent
const [isPending, startTransition] = useTransition();
startTransition(() => {
  setFilteredItems(heavyFilter(items, query)); // can be interrupted
});
// isPending = true while transition is running → show spinner

// useDeferredValue — debounce-like for derived state
const deferred = useDeferredValue(searchQuery);
// deferred lags behind searchQuery — prevents blocking input
\`\`\`
`),

t('react-theory-008', 'Custom Hooks — Patterns & Best Practices', 'Hooks', 'hard', `
## Custom Hooks

### Extracting logic into hooks
Custom hooks are just functions that use other hooks. They enable logic reuse without changing component hierarchy.

### Data fetching hook
\`\`\`typescript
function useFetch<T>(url: string) {
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: string | null;
  }>({ data: null, loading: true, error: null });

  useEffect(() => {
    let cancelled = false;
    setState({ data: null, loading: true, error: null });

    fetch(url)
      .then(r => { if (!r.ok) throw new Error(r.statusText); return r.json() as T; })
      .then(data => { if (!cancelled) setState({ data, loading: false, error: null }); })
      .catch(err => { if (!cancelled) setState({ data: null, loading: false, error: err.message }); });

    return () => { cancelled = true; };
  }, [url]);

  return state;
}

// Usage
const { data: user, loading, error } = useFetch<User>('/api/me');
\`\`\`

### Local storage hook
\`\`\`typescript
function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : initial;
    } catch { return initial; }
  });

  const set = useCallback((val: T | ((prev: T) => T)) => {
    setValue(prev => {
      const next = typeof val === 'function' ? (val as (p: T) => T)(prev) : val;
      localStorage.setItem(key, JSON.stringify(next));
      return next;
    });
  }, [key]);

  return [value, set] as const;
}
\`\`\`

### Debounce hook
\`\`\`typescript
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
\`\`\`

### Click outside hook
\`\`\`typescript
function useClickOutside(ref: RefObject<Element>, handler: () => void) {
  useEffect(() => {
    const listener = (e: MouseEvent) => {
      if (!ref.current || ref.current.contains(e.target as Node)) return;
      handler();
    };
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, [ref, handler]);
}
\`\`\`

### Naming rules
- Must start with \`use\` — eslint-plugin-react-hooks enforces dependency tracking
- Should return values, not JSX
- Can call other hooks (including other custom hooks)

### Anti-patterns in custom hooks
- Don't create hooks that wrap a single useState — just use useState
- Don't put side effects in the return function
- Don't pass hooks as arguments to other hooks
`),

t('react-theory-009', 'React Router v6 — Routing Patterns', 'Routing', 'medium', `
## React Router v6

### Basic setup
\`\`\`jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/users/:id" element={<UserProfile />} />
        <Route path="/users/:id/posts/:postId" element={<Post />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}
\`\`\`

### Nested routes + Outlet
\`\`\`jsx
<Route path="/dashboard" element={<DashboardLayout />}>
  <Route index element={<DashboardHome />} />        {/* /dashboard */}
  <Route path="profile" element={<Profile />} />      {/* /dashboard/profile */}
  <Route path="settings" element={<Settings />} />
</Route>

// DashboardLayout
function DashboardLayout() {
  return (
    <div>
      <Sidebar />
      <Outlet /> {/* renders matched child route */}
    </div>
  );
}
\`\`\`

### URL params and hooks
\`\`\`jsx
// useParams — URL params
const { id, postId } = useParams<{ id: string; postId: string }>();

// useSearchParams — query string
const [searchParams, setSearchParams] = useSearchParams();
const tab = searchParams.get('tab') ?? 'overview';
setSearchParams({ tab: 'settings' });

// useNavigate — programmatic navigation
const navigate = useNavigate();
navigate('/login', { replace: true }); // replace history entry
navigate(-1); // go back
navigate('/dashboard', { state: { from: '/login' } }); // pass state

// useLocation — current location
const { pathname, search, state } = useLocation();
\`\`\`

### Protected routes
\`\`\`jsx
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

// Usage
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />
\`\`\`

### Lazy loading routes
\`\`\`jsx
const Dashboard = lazy(() => import('./pages/Dashboard'));

<Route path="/dashboard" element={
  <Suspense fallback={<Spinner />}>
    <Dashboard />
  </Suspense>
} />
\`\`\`
`),

t('react-theory-010', 'Error Boundaries & Suspense', 'React Internals', 'medium', `
## Error Boundaries & Suspense

### Error Boundaries
Catch JavaScript errors in the component tree. Must be class components (no hooks equivalent yet):

\`\`\`jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log to error service
    logErrorToService(error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? <div>Something went wrong</div>;
    }
    return this.props.children;
  }
}

// Usage
<ErrorBoundary fallback={<ErrorPage />}>
  <App />
</ErrorBoundary>
\`\`\`

### react-error-boundary package
\`\`\`jsx
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div>
      <p>Error: {error.message}</p>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

<ErrorBoundary
  FallbackComponent={ErrorFallback}
  onReset={() => { /* clear error state */ }}
  resetKeys={[userId]} // auto-reset when userId changes
>
  <UserProfile />
</ErrorBoundary>
\`\`\`

### Suspense — declarative loading states
\`\`\`jsx
// Code splitting
const Chart = lazy(() => import('./Chart'));

function Dashboard() {
  return (
    <Suspense fallback={<Skeleton />}>
      <Chart /> {/* Shows Skeleton until Chart loads */}
    </Suspense>
  );
}
\`\`\`

### Suspense for data (React 18 + supported libraries)
\`\`\`jsx
// With React Query / SWR
function UserProfile({ id }) {
  const { data: user } = useSuspenseQuery({
    queryKey: ['user', id],
    queryFn: () => fetchUser(id),
  });

  return <div>{user.name}</div>; // no loading check needed!
}

// In parent
<Suspense fallback={<UserSkeleton />}>
  <UserProfile id={userId} />
</Suspense>
\`\`\`

### Combining both
\`\`\`jsx
<ErrorBoundary fallback={<ErrorState />}>
  <Suspense fallback={<Loading />}>
    <DataDrivenComponent />
  </Suspense>
</ErrorBoundary>
\`\`\`
`),

t('react-theory-011', 'React Query / TanStack Query', 'Data Fetching', 'hard', `
## React Query (TanStack Query)

### Why React Query?
- Automatic caching, deduplication, background refetching
- Loading/error states out of the box
- Optimistic updates, infinite scroll, pagination
- Replaces 90% of useEffect data fetching

### Setup
\`\`\`jsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,   // 5 minutes
      gcTime: 1000 * 60 * 10,      // 10 minutes (formerly cacheTime)
      retry: 2,
      refetchOnWindowFocus: true,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
    </QueryClientProvider>
  );
}
\`\`\`

### useQuery
\`\`\`jsx
function UserProfile({ id }) {
  const { data: user, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ['users', id],  // cache key — must change when data should refresh
    queryFn: () => fetchUser(id),
    enabled: !!id,            // don't run if id is falsy
    staleTime: 30_000,        // consider fresh for 30s
    select: (data) => data.profile, // transform data
  });

  if (isLoading) return <Skeleton />;
  if (isError) return <Error message={error.message} />;
  return <div>{user.name}</div>;
}
\`\`\`

### useMutation
\`\`\`jsx
function UpdateProfile() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data) => api.put('/api/profile', data),
    onMutate: async (newData) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['profile'] });
      const previous = queryClient.getQueryData(['profile']);
      queryClient.setQueryData(['profile'], old => ({ ...old, ...newData }));
      return { previous }; // rollback context
    },
    onError: (err, newData, context) => {
      // Rollback on error
      queryClient.setQueryData(['profile'], context?.previous);
    },
    onSettled: () => {
      // Always refetch after mutation
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  return (
    <button
      onClick={() => mutation.mutate({ name: 'Alice' })}
      disabled={mutation.isPending}
    >
      {mutation.isPending ? 'Saving...' : 'Save'}
    </button>
  );
}
\`\`\`

### Prefetching
\`\`\`jsx
// Prefetch on hover
<Link
  onMouseEnter={() => queryClient.prefetchQuery({
    queryKey: ['user', id],
    queryFn: () => fetchUser(id),
  })}
  to={\`/users/\${id}\`}
>
  View Profile
</Link>
\`\`\`

### Infinite queries
\`\`\`jsx
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['posts'],
  queryFn: ({ pageParam = 1 }) => fetchPosts(pageParam),
  getNextPageParam: (lastPage) => lastPage.nextCursor,
});
\`\`\`
`),

t('react-theory-012', 'React 18 Concurrent Features & Server Components', 'React Internals', 'hard', `
## React 18 Concurrent Features

### createRoot (React 18 entry point)
\`\`\`jsx
// React 17
ReactDOM.render(<App />, document.getElementById('root'));

// React 18 — enables all concurrent features
const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
\`\`\`

### Automatic batching
In React 17, only event handlers were batched. React 18 batches everything:
\`\`\`jsx
// React 18 — single re-render even in setTimeout/fetch callbacks
setTimeout(() => {
  setA(1); // batched
  setB(2); // batched → ONE render
}, 0);
\`\`\`

### useTransition
Mark state updates as "transitions" (non-urgent):
\`\`\`jsx
function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isPending, startTransition] = useTransition();

  function handleChange(e) {
    setQuery(e.target.value); // urgent: update input immediately

    startTransition(() => {
      // non-urgent: can be interrupted by new input
      setResults(heavySearch(e.target.value));
    });
  }

  return (
    <>
      <input value={query} onChange={handleChange} />
      {isPending ? <Spinner /> : <ResultsList results={results} />}
    </>
  );
}
\`\`\`

### useDeferredValue
Like debouncing, but React-managed:
\`\`\`jsx
function ProductList({ searchQuery }) {
  const deferredQuery = useDeferredValue(searchQuery);
  // deferredQuery updates only when React is idle
  // searchQuery updates immediately (so input stays responsive)

  return (
    <Suspense fallback={<Spinner />}>
      <FilteredProducts query={deferredQuery} />
    </Suspense>
  );
}
\`\`\`

### React Server Components (RSC)
Components that run ONLY on the server — no JavaScript sent to client:
\`\`\`jsx
// Server Component (default in Next.js App Router)
async function UserList() {
  const users = await db.query('SELECT * FROM users'); // direct DB access!
  return <ul>{users.map(u => <li key={u.id}>{u.name}</li>)}</ul>;
}

// Client Component — add 'use client' directive
'use client'
function Counter() {
  const [count, setCount] = useState(0); // hooks work
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
\`\`\`

Benefits of RSC:
- Zero client-side JS for data-only components
- Direct backend access (DB, file system, secrets)
- Automatic code splitting
- Streaming with Suspense
`),
]

const MCQS: Row[] = [

mcq('react-mcq-001', 'useState updater function', 'Hooks', 'medium',
  'Why should you use the functional form `setState(prev => prev + 1)` instead of `setState(count + 1)`?',
  [
    'The functional form is faster',
    'The functional form ensures you always update from the latest state, preventing stale closure bugs',
    'setState(count + 1) is deprecated in React 18',
    'Both are identical — no difference'
  ],
  1,
  'When multiple state updates are batched or when the update is triggered from a stale closure (like in a setTimeout), `count + 1` uses a stale value of `count`. The functional form receives the guaranteed latest state as `prev`.'),

mcq('react-mcq-002', 'useEffect dependency array', 'Hooks', 'medium',
  'What happens if you include a function defined in the component body as a useEffect dependency without wrapping it in useCallback?',
  [
    'Nothing — functions are compared by value in React',
    'The effect runs on every render because a new function is created on each render',
    'React throws a warning but ignores it',
    'The function is automatically memoized by React'
  ],
  1,
  'Functions defined in the component body are recreated on every render, which means they are a NEW reference each time. When included as a dependency, useEffect sees a "changed" dependency and runs the effect again — potentially causing an infinite loop.'),

mcq('react-mcq-003', 'Keys in lists', 'React Basics', 'easy',
  'Why should you NOT use the array index as a key for list items that can be reordered or filtered?',
  [
    'Index keys are slower than string keys',
    'React requires keys to be strings',
    'When items reorder, index keys cause React to reuse wrong component instances, corrupting state and causing subtle bugs',
    'Index keys prevent React.memo from working'
  ],
  2,
  'Keys tell React which component instance corresponds to which data. If you have [A,B,C] with keys [0,1,2] and remove A, you get [B,C] with keys [0,1] — React sees key 0 (B) as the same component as key 0 (A) was, reusing its DOM and state incorrectly.'),

mcq('react-mcq-004', 'React.memo and referential equality', 'Performance', 'hard',
  'You have `const Child = React.memo(Component)`. The parent passes `onClick={() => handleClick()}`. Will React.memo prevent re-renders?',
  [
    'Yes — React.memo always prevents re-renders',
    'No — a new arrow function is created on every render, so the prop changes every time',
    'Yes — React detects inline arrow functions and ignores them',
    'No — React.memo only works for primitive props'
  ],
  1,
  '`() => handleClick()` creates a new function reference on every parent render. React.memo does a shallow comparison, so it sees a new `onClick` prop → re-renders. Wrap the callback in useCallback with stable dependencies to fix this.'),

mcq('react-mcq-005', 'Context re-rendering', 'State Management', 'hard',
  'When does a context consumer re-render?',
  [
    'Every time any component in the app re-renders',
    'Only when the Provider component itself re-renders',
    'When the context value changes (by reference for objects)',
    'Only when the consumer\'s own state changes'
  ],
  2,
  'Context consumers re-render whenever the context VALUE changes. For primitive values, this is when the value itself changes. For objects/arrays, it\'s when the reference changes. This is why you should memoize context values with `useMemo` to prevent unnecessary re-renders.'),

mcq('react-mcq-006', 'useLayoutEffect vs useEffect', 'Hooks', 'hard',
  'When should you use `useLayoutEffect` instead of `useEffect`?',
  [
    'When you want the effect to run before the component mounts',
    'When you need to read layout information (like DOM measurements) and synchronously apply updates before the browser paints',
    'When you have expensive operations that should run off the main thread',
    'useLayoutEffect is deprecated — always use useEffect'
  ],
  1,
  '`useLayoutEffect` runs synchronously AFTER DOM mutations but BEFORE the browser paints. Use it when you need to measure DOM (like getBoundingClientRect) and immediately update state/DOM to prevent visual flickering. `useEffect` runs asynchronously after paint.'),

mcq('react-mcq-007', 'React reconciliation type change', 'React Internals', 'hard',
  'What happens when a conditional renders `<AdminPanel />` in one branch and `<UserPanel />` in another, and the condition changes?',
  [
    'React updates AdminPanel\'s props to match UserPanel',
    'React diffs the two components and only updates changed DOM nodes',
    'React unmounts AdminPanel and mounts UserPanel from scratch — all state is lost',
    'React preserves state if the components have the same structure'
  ],
  2,
  'When the component TYPE changes at the same position in the tree, React tears down the entire subtree (unmounting all children) and mounts the new type from scratch. State is completely lost. This is by design — components of different types are assumed to produce fundamentally different trees.'),

mcq('react-mcq-008', 'StrictMode behavior', 'React Internals', 'medium',
  'In React 18 StrictMode (development), components are mounted, then unmounted, then remounted. Why?',
  [
    'To test error boundaries',
    'To verify that effects have proper cleanup functions by simulating real-world unmount/remount scenarios',
    'To improve performance by warming the cache',
    'This is a bug in React 18 that will be fixed'
  ],
  1,
  'React 18 StrictMode double-invokes effects to help find bugs where effects don\'t clean up properly. In production, remounts can happen (e.g., Suspense, Fast Refresh). If your app breaks on remount, you have a cleanup bug.'),

mcq('react-mcq-009', 'Controlled vs uncontrolled inputs', 'React Basics', 'medium',
  'What is the difference between controlled and uncontrolled inputs in React?',
  [
    'Controlled inputs are faster; uncontrolled are for legacy code',
    'In controlled inputs, React state is the single source of truth; in uncontrolled, the DOM manages state accessed via refs',
    'Uncontrolled inputs cannot be validated',
    'Controlled inputs require a form library like Formik'
  ],
  1,
  'Controlled: `<input value={state} onChange={setState} />` — React state drives the input. Uncontrolled: `<input ref={ref} />` — the DOM owns the value, accessed imperatively via `ref.current.value`. Controlled enables real-time validation, conditional logic, and formatted input; uncontrolled is simpler for basic forms.'),

mcq('react-mcq-010', 'useTransition purpose', 'React Internals', 'hard',
  'What problem does `useTransition` solve in React 18?',
  [
    'It replaces setTimeout for deferred updates',
    'It allows marking state updates as non-urgent so urgent updates (user input) can interrupt them, keeping the UI responsive',
    'It automatically optimizes expensive renders using WebWorkers',
    'It prevents state updates from being batched'
  ],
  1,
  '`useTransition` lets you mark some state updates as "transitions" — lower priority. If a high-priority update (like typing in an input) arrives while a transition is running, React pauses the transition and handles the urgent update first. This keeps the UI responsive without debouncing.'),
]

export const allReactProblems: Row[] = [...THEORY, ...MCQS]

export async function seedReact(d1: D1Database): Promise<number> {
  const db = drizzle(d1)
  const BATCH = 20
  let inserted = 0
  for (let i = 0; i < allReactProblems.length; i += BATCH) {
    const batch = allReactProblems.slice(i, i + BATCH)
    await db.insert(problems).values(batch).onConflictDoNothing()
    inserted += batch.length
  }
  return inserted
}
