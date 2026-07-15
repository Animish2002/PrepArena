-- PrepArena seed: JavaScript Extended Theory + MCQ
-- Problems: 43
-- Generated: 2026-07-15T16:03:25.624Z
-- Apply (remote): npx wrangler d1 execute preParena-db --remote --file=src/scripts/sql/javascript-more.sql
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-ext-t-001', 'What is a closure and how does it work?', 'Closures', NULL, 'medium', NULL, NULL, 15, 'Closures', NULL, '["closures","javascript"]', 'theory', 'javascript', '
## Closures in JavaScript

A **closure** is a function that **remembers the variables from its outer scope** even after the outer function has finished executing.

### Mechanism
Every function in JS creates a new scope. When a function is defined inside another function, it maintains a reference to the outer scope''s **lexical environment** — this reference is the closure.

```js
function makeCounter(start = 0) {
  let count = start;             // closed-over variable
  return {
    increment: () => ++count,
    decrement: () => --count,
    value:     () => count,
  };
}

const c = makeCounter(10);
c.increment(); // 11
c.increment(); // 12
c.value();     // 12
```

### Why it works
When `makeCounter` returns, `count` would normally be garbage-collected. But because the returned methods **reference** `count`, the JS engine keeps the variable alive.

### Practical uses
| Use-case | Pattern |
|----------|---------|
| Data privacy | Module pattern |
| Partial application | Currying |
| Memoization | Cache in closure |
| Event handlers | Capture loop variable |

### Classic gotcha
```js
// Bug: all callbacks close over the SAME i
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100); // 3 3 3
}

// Fix 1: let (block-scoped, new binding each iteration)
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100); // 0 1 2
}

// Fix 2: IIFE to capture current value
for (var i = 0; i < 3; i++) {
  (function(j) {
    setTimeout(() => console.log(j), 100);
  })(i); // 0 1 2
}
```
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-ext-t-002', 'Module pattern and IIFE — encapsulation with closures', 'Closures', NULL, 'medium', NULL, NULL, 15, 'Closures', NULL, '["closures","javascript"]', 'theory', 'javascript', '
## Module Pattern & IIFE

The **module pattern** uses an IIFE (Immediately Invoked Function Expression) and closure to create private state.

```js
const BankAccount = (function() {
  let _balance = 0;              // private — not accessible outside

  function _validate(amount) {
    if (amount <= 0) throw new Error(''Invalid amount'');
  }

  return {
    deposit(amount) {
      _validate(amount);
      _balance += amount;
      return _balance;
    },
    withdraw(amount) {
      _validate(amount);
      if (amount > _balance) throw new Error(''Insufficient funds'');
      _balance -= amount;
      return _balance;
    },
    get balance() { return _balance; },
  };
})();

BankAccount.deposit(100);   // 100
BankAccount.withdraw(30);   // 70
BankAccount._balance;       // undefined — truly private
```

### Revealing module variant
```js
const Counter = (() => {
  let n = 0;
  const inc = () => ++n;
  const dec = () => --n;
  const val = () => n;
  return { inc, dec, val };   // reveal only public API
})();
```

### Modern alternative
ES modules (import/export) provide native encapsulation — prefer them in new code. The module pattern is mostly historical but still appears in legacy codebases and interview questions.
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-ext-t-003', 'Currying and partial application', 'Closures', NULL, 'hard', NULL, NULL, 20, 'Closures', NULL, '["closures","javascript"]', 'theory', 'javascript', '
## Currying & Partial Application

### Currying
Transforms a function that takes multiple arguments into a chain of functions each taking one argument.

```js
// Normal
const add = (a, b, c) => a + b + c;

// Curried
const curriedAdd = a => b => c => a + b + c;
curriedAdd(1)(2)(3); // 6

// Generic curry utility
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return (...more) => curried(...args, ...more);
  };
}

const add3 = curry((a, b, c) => a + b + c);
add3(1)(2)(3);     // 6
add3(1, 2)(3);     // 6
add3(1)(2, 3);     // 6
```

### Partial application
Fix some arguments, return a function waiting for the rest.

```js
function partial(fn, ...presetArgs) {
  return (...laterArgs) => fn(...presetArgs, ...laterArgs);
}

const multiply = (a, b) => a * b;
const double = partial(multiply, 2);
const triple = partial(multiply, 3);

double(5); // 10
triple(5); // 15
```

### Why it matters
- **Point-free style**: `[1,2,3].map(double)`
- **Configuration reuse**: `const log = partial(console.log, ''[APP]'')`
- **Dependency injection via currying**
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-ext-m-001', 'Closure over loop variable', 'Closures', NULL, 'medium', NULL, NULL, 5, 'Closures', NULL, '["closures","javascript","mcq"]', 'mcq', 'javascript', '{"question":"What does the following code output?\n\n```js\nconst funcs = [];\nfor (var i = 0; i < 3; i++) {\n  funcs.push(() => i);\n}\nconsole.log(funcs[0](), funcs[1](), funcs[2]());\n```","options":["0 1 2","3 3 3","0 0 0","undefined undefined undefined"],"correct_index":1,"explanation":"var is function-scoped, so all three closures share the same `i`. After the loop, i is 3. Use `let` for block-scoped bindings."}', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-ext-m-002', 'Closure identity', 'Closures', NULL, 'easy', NULL, NULL, 5, 'Closures', NULL, '["closures","javascript","mcq"]', 'mcq', 'javascript', '{"question":"Which statement about closures is FALSE?","options":["A closure can access variables in its outer function after the outer function returns","Each closure gets its own copy of the outer variable","Closures are created every time a function is created in JavaScript","Closures keep referenced variables alive in memory"],"correct_index":1,"explanation":"Closures capture a reference to the outer scope''s variable, not a copy. Multiple closures from the same outer scope share the same variable."}', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-ext-t-004', 'Memoization using closures', 'Closures', NULL, 'medium', NULL, NULL, 15, 'Closures', NULL, '["closures","javascript"]', 'theory', 'javascript', '
## Memoization

Memoization caches the results of expensive function calls. Closures provide the cache.

```js
function memoize(fn) {
  const cache = new Map();
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

// Fibonacci without memoization: O(2^n)
// With memoization: O(n)
const fib = memoize(function(n) {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
});

fib(40); // instant after first call
```

### Limitations
- Only pure functions (same input → same output)
- Memory grows with unique inputs — add LRU eviction for production
- `JSON.stringify` key doesn''t handle functions/circular refs — use WeakMap for object keys

### React''s useMemo analogy
```js
const expensive = useMemo(() => compute(dep), [dep]);
```
React''s `useMemo` is memoization of a computation scoped to a component render cycle.
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-ext-t-005', 'Promise states, chaining & error propagation', 'Async & Event Loop', NULL, 'medium', NULL, NULL, 15, 'Async & Event Loop', NULL, '["async-&-event-loop","javascript"]', 'theory', 'javascript', '
## Promises

A Promise represents the eventual result of an async operation. It has three states:

| State | Description |
|-------|-------------|
| **pending** | Initial state |
| **fulfilled** | Completed with a value |
| **rejected** | Failed with a reason |

### Creating promises
```js
const p = new Promise((resolve, reject) => {
  setTimeout(() => resolve(''done''), 1000);
});
```

### Chaining — the key insight
`.then()` returns a NEW promise. You can chain because:
- Returning a value wraps it in `Promise.resolve(value)`
- Returning a promise flattens it (waits for it to settle)
- Throwing propagates to the next `.catch()`

```js
fetch(''/api/user'')
  .then(res => res.json())       // parse body
  .then(user => user.name)       // extract field
  .then(name => console.log(name))
  .catch(err => console.error(err)); // catches ANY error above
```

### Common mistake — breaking the chain
```js
// ❌ Wrong: second .then() is on the ORIGINAL promise
const p = fetch(''/api/user'');
p.then(res => res.json());
p.then(data => console.log(data)); // data is Response, not parsed JSON

// ✅ Correct: chain
fetch(''/api/user'')
  .then(res => res.json())
  .then(data => console.log(data));
```

### Finally
`.finally()` runs regardless of outcome — perfect for cleanup:
```js
showSpinner();
fetchData()
  .then(render)
  .catch(showError)
  .finally(hideSpinner);
```
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-ext-t-006', 'Promise combinators — all, allSettled, race, any', 'Async & Event Loop', NULL, 'medium', NULL, NULL, 15, 'Async & Event Loop', NULL, '["async-&-event-loop","javascript"]', 'theory', 'javascript', '
## Promise Combinators

### Promise.all
Waits for ALL to fulfill. Rejects as soon as ANY rejects (fast-fail).

```js
const [user, posts] = await Promise.all([
  fetchUser(id),
  fetchPosts(id),
]);
// Parallel fetch — much faster than sequential await
```

### Promise.allSettled
Waits for ALL to settle (never rejects). Returns array of `{status, value/reason}`.

```js
const results = await Promise.allSettled([p1, p2, p3]);
const failed = results.filter(r => r.status === ''rejected'');
```

### Promise.race
Settles as soon as the FIRST settles (fulfill or reject).

```js
// Timeout pattern
function withTimeout(promise, ms) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(''Timeout'')), ms)
  );
  return Promise.race([promise, timeout]);
}
```

### Promise.any (ES2021)
Fulfills with the FIRST fulfilled value. Only rejects if ALL reject (AggregateError).

```js
// Try multiple CDN mirrors, use whichever responds first
const asset = await Promise.any([
  fetch(''https://cdn1.example.com/asset''),
  fetch(''https://cdn2.example.com/asset''),
]);
```

| Combinator | Rejects on | Fulfills when |
|------------|-----------|---------------|
| all | First reject | All fulfilled |
| allSettled | Never | All settled |
| race | First reject | First fulfilled |
| any | All reject | First fulfilled |
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-ext-t-007', 'async/await — execution model and error handling', 'Async & Event Loop', NULL, 'medium', NULL, NULL, 15, 'Async & Event Loop', NULL, '["async-&-event-loop","javascript"]', 'theory', 'javascript', '
## async/await

`async/await` is syntactic sugar over Promises — async functions always return a Promise.

### Execution model
```js
async function fetchUser(id) {
  const res = await fetch(`/api/users/${id}`);   // 1. pause
  const user = await res.json();                   // 2. pause
  return user;                                     // 3. resolves promise with user
}
// Equivalent Promise chain:
// fetch(...).then(r => r.json()).then(user => user)
```

### Error handling
```js
// Option 1: try/catch (recommended for async)
async function loadData() {
  try {
    const data = await fetch(''/api/data'').then(r => r.json());
    return data;
  } catch (err) {
    console.error(''Failed:'', err);
    return null;
  }
}

// Option 2: .catch() on the awaited expression
const data = await fetch(''/api/data'').then(r => r.json()).catch(() => null);
```

### Common mistakes
```js
// ❌ Sequential when parallel is possible
const a = await fetchA();
const b = await fetchB(); // B waits for A unnecessarily

// ✅ Parallel
const [a, b] = await Promise.all([fetchA(), fetchB()]);

// ❌ Missing await causes silent bug
async function save(data) {
  db.insert(data); // forgot await — function returns before DB is done
}
```

### Top-level await (ES2022, ESM only)
```js
// In .mjs or <script type="module">
const config = await fetch(''/config.json'').then(r => r.json());
```
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-ext-t-008', 'The Event Loop in depth — microtasks vs macrotasks', 'Async & Event Loop', NULL, 'hard', NULL, NULL, 20, 'Async & Event Loop', NULL, '["async-&-event-loop","javascript"]', 'theory', 'javascript', '
## Event Loop Deep Dive

JavaScript is single-threaded but non-blocking. The event loop allows async operations by processing different task queues in order.

### Queue hierarchy (priority order)
1. **Call stack** — synchronous code runs here
2. **Microtask queue** — Promises (.then/.catch/.finally), queueMicrotask(), MutationObserver
3. **Macrotask queue** — setTimeout, setInterval, setImmediate (Node), I/O callbacks

### Rule: drain ALL microtasks before the next macrotask

```js
console.log(''1'');                          // sync

setTimeout(() => console.log(''2''), 0);    // macrotask

Promise.resolve()
  .then(() => console.log(''3''))           // microtask
  .then(() => console.log(''4''));          // microtask

console.log(''5'');                          // sync

// Output: 1 → 5 → 3 → 4 → 2
```

### Step by step
| Step | Action |
|------|--------|
| 1 | Sync: log 1, schedule timeout, chain promise, log 5 |
| 2 | Call stack empty — check microtasks |
| 3 | Microtask 1: log 3 — schedules another microtask |
| 4 | Microtask 2: log 4 |
| 5 | Microtask queue empty — take next macrotask |
| 6 | Macrotask: log 2 |

### requestAnimationFrame
Falls between macrotasks and paints — fires before the next repaint, after microtasks.

### Starvation
If microtasks keep generating microtasks infinitely, macrotasks (timers, I/O) are starved:
```js
function flood() {
  Promise.resolve().then(flood); // ❌ infinite microtasks — freezes the tab
}
```
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-ext-t-009', 'Generators and async iteration', 'Async & Event Loop', NULL, 'hard', NULL, NULL, 20, 'Async & Event Loop', NULL, '["async-&-event-loop","javascript"]', 'theory', 'javascript', '
## Generators

A generator function (`function*`) can pause and resume execution using `yield`.

```js
function* range(start, end) {
  for (let i = start; i < end; i++) {
    yield i;
  }
}

const gen = range(1, 4);
gen.next(); // {value: 1, done: false}
gen.next(); // {value: 2, done: false}
gen.next(); // {value: 3, done: false}
gen.next(); // {value: undefined, done: true}

// Iterable
[...range(1, 4)]; // [1, 2, 3]
```

### Two-way communication
`yield` is an expression — you can send values back in:
```js
function* accumulator() {
  let total = 0;
  while (true) {
    const value = yield total;  // pauses, returns total, resumes with value
    if (value === null) break;
    total += value;
  }
  return total;
}

const acc = accumulator();
acc.next();    // {value: 0, done: false}  — start
acc.next(10);  // {value: 10, done: false}
acc.next(20);  // {value: 30, done: false}
acc.next(null);// {value: 30, done: true}
```

### Async generators (ES2018)
```js
async function* paginate(url) {
  let cursor = null;
  do {
    const res = await fetch(`${url}?cursor=${cursor}`);
    const { data, nextCursor } = await res.json();
    yield data;
    cursor = nextCursor;
  } while (cursor);
}

for await (const page of paginate(''/api/items'')) {
  console.log(page);
}
```
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-ext-m-003', 'Promise.all behaviour', 'Async & Event Loop', NULL, 'medium', NULL, NULL, 5, 'Async & Event Loop', NULL, '["async-&-event-loop","javascript","mcq"]', 'mcq', 'javascript', '{"question":"What happens when one promise in Promise.all rejects?","options":["It waits for all promises to settle, then throws","It immediately rejects with the first rejection reason","It ignores the rejection and resolves with the other values","It retries the rejected promise once"],"correct_index":1,"explanation":"Promise.all is fail-fast — as soon as any promise rejects, the returned promise rejects immediately. Use Promise.allSettled if you want to wait for all."}', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-ext-m-004', 'async function return value', 'Async & Event Loop', NULL, 'easy', NULL, NULL, 5, 'Async & Event Loop', NULL, '["async-&-event-loop","javascript","mcq"]', 'mcq', 'javascript', '{"question":"What does an async function always return?","options":["A value","A Promise","undefined","A generator"],"correct_index":1,"explanation":"async functions always return a Promise. Even `return 42` becomes `Promise.resolve(42)`."}', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-ext-m-005', 'Microtask vs macrotask order', 'Async & Event Loop', NULL, 'hard', NULL, NULL, 5, 'Async & Event Loop', NULL, '["async-&-event-loop","javascript","mcq"]', 'mcq', 'javascript', '{"question":"What is the output of:\n```js\nsetTimeout(() => console.log(\"A\"), 0);\nPromise.resolve().then(() => console.log(\"B\"));\nconsole.log(\"C\");\n```","options":["C A B","C B A","A B C","B C A"],"correct_index":1,"explanation":"Sync runs first (C), then microtasks (Promise .then → B), then macrotasks (setTimeout → A)."}', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-ext-t-010', 'call, apply, bind — explicit this binding', 'Functions', NULL, 'medium', NULL, NULL, 15, 'Functions', NULL, '["functions","javascript"]', 'theory', 'javascript', '
## call / apply / bind

All three let you set `this` explicitly.

### call
Invokes immediately. Arguments passed individually.
```js
function greet(greeting, punct) {
  return `${greeting}, ${this.name}${punct}`;
}
const user = { name: ''Alice'' };
greet.call(user, ''Hello'', ''!''); // ''Hello, Alice!''
```

### apply
Invokes immediately. Arguments passed as array.
```js
greet.apply(user, [''Hi'', ''?'']); // ''Hi, Alice?''

// Classic: spread array into variadic function (pre-ES6)
Math.max.apply(null, [1, 5, 3]); // 5  (use Math.max(...arr) in modern code)
```

### bind
Returns a NEW function with `this` permanently bound. Does NOT invoke immediately.
```js
const greetAlice = greet.bind(user, ''Hey'');
greetAlice(''.'');  // ''Hey, Alice.''
greetAlice(''!'');  // ''Hey, Alice!''

// React classic pattern (before arrow functions)
class Button extends React.Component {
  constructor(props) {
    super(props);
    this.handleClick = this.handleClick.bind(this);
  }
}
```

### Precedence
`new` > explicit (call/apply/bind) > implicit (obj.method()) > default (window/undefined in strict)
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-ext-t-011', 'Arrow functions vs regular functions — 6 key differences', 'Functions', NULL, 'medium', NULL, NULL, 15, 'Functions', NULL, '["functions","javascript"]', 'theory', 'javascript', '
## Arrow Functions vs Regular Functions

| Feature | Regular Function | Arrow Function |
|---------|-----------------|----------------|
| `this` | Dynamic (caller) | Lexical (outer scope) |
| `arguments` | Available | Not available (use rest `...args`) |
| Constructor | Yes (with `new`) | No — throws TypeError |
| `prototype` | Has it | No |
| Implicit return | No | Yes (single expression) |
| Generator | Yes (`function*`) | No |

### this difference
```js
const obj = {
  name: ''obj'',
  regular() { return this.name; },         // ''obj''
  arrow: () => this?.name,                 // undefined (this = outer context)
};

// Arrow functions capture this from where they are DEFINED, not called
class Timer {
  constructor() { this.seconds = 0; }
  start() {
    setInterval(() => {          // ✅ arrow — this is the Timer instance
      this.seconds++;            //    (regular function would lose this)
    }, 1000);
  }
}
```

### When to use which
- **Arrow**: callbacks, array methods, when you want lexical `this`
- **Regular**: methods on objects/classes, constructors, generators, when you need `arguments` or `new`
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-ext-t-012', 'Function composition and pipe', 'Functions', NULL, 'hard', NULL, NULL, 20, 'Functions', NULL, '["functions","javascript"]', 'theory', 'javascript', '
## Function Composition

**Composition** chains pure functions where the output of one becomes the input of the next.

```js
// compose: right-to-left
const compose = (...fns) => x => fns.reduceRight((acc, fn) => fn(acc), x);

// pipe: left-to-right (easier to read)
const pipe = (...fns) => x => fns.reduce((acc, fn) => fn(acc), x);

const double    = x => x * 2;
const addTen    = x => x + 10;
const square    = x => x ** 2;

const transform = pipe(double, addTen, square);
transform(3);  // square(addTen(double(3))) = square(16) = 256
```

### Real-world example
```js
const processUser = pipe(
  normalizeEmail,    // alice@EXAMPLE.COM → alice@example.com
  trimWhitespace,
  validateRequired,
  sanitizeXSS,
);

users.map(processUser);
```

### Async composition
```js
const pipeAsync = (...fns) => x =>
  fns.reduce((promise, fn) => promise.then(fn), Promise.resolve(x));

const fetchAndProcess = pipeAsync(
  fetchUser,
  enrichWithProfile,
  formatForDisplay,
);
```
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-ext-m-006', 'this in arrow function', 'Functions', NULL, 'medium', NULL, NULL, 5, 'Functions', NULL, '["functions","javascript","mcq"]', 'mcq', 'javascript', '{"question":"What does the following log?\n```js\nconst obj = {\n  val: 42,\n  getVal: () => this.val,\n};\nconsole.log(obj.getVal());\n```","options":["42","undefined","TypeError","null"],"correct_index":1,"explanation":"Arrow functions capture `this` from the enclosing lexical scope. At the top level (or in a module), `this` is `undefined` (strict mode) or `window`. It is NOT the object literal."}', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-ext-m-007', 'bind return value', 'Functions', NULL, 'easy', NULL, NULL, 5, 'Functions', NULL, '["functions","javascript","mcq"]', 'mcq', 'javascript', '{"question":"What does Function.prototype.bind() return?","options":["The result of calling the function","A new function with bound this","undefined","A Promise"],"correct_index":1,"explanation":"bind() returns a NEW function with `this` permanently bound. It does not invoke the function immediately."}', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-ext-t-013', 'Debounce and throttle — controlling function call rate', 'Functions', NULL, 'medium', NULL, NULL, 15, 'Functions', NULL, '["functions","javascript"]', 'theory', 'javascript', '
## Debounce & Throttle

Both limit how often a function fires, but differently.

### Debounce
Fires ONLY after the event stops for a set delay. Good for: search input, resize, form validation.

```js
function debounce(fn, delay) {
  let timer;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

const search = debounce((query) => {
  fetch(`/api/search?q=${query}`);
}, 300);

input.addEventListener(''input'', e => search(e.target.value));
// Only fires 300ms after the user stops typing
```

### Throttle
Fires at most once per interval, regardless of event frequency. Good for: scroll, mousemove, resize.

```js
function throttle(fn, interval) {
  let lastTime = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastTime >= interval) {
      lastTime = now;
      return fn.apply(this, args);
    }
  };
}

const onScroll = throttle(() => updateUI(), 100);
window.addEventListener(''scroll'', onScroll);
// Fires at most every 100ms, not on every pixel
```

| | Debounce | Throttle |
|-|---------|---------|
| Fires | After inactivity | Periodically |
| Last call | ✅ always runs (after delay) | ❌ may be skipped |
| Use when | Input/search | Scroll/resize |
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-ext-t-014', 'Prototype chain — how property lookup works', 'Prototypes & Classes', NULL, 'medium', NULL, NULL, 15, 'Prototypes & Classes', NULL, '["prototypes-&-classes","javascript"]', 'theory', 'javascript', '
## Prototype Chain

Every object in JS has an internal `[[Prototype]]` link (accessible as `__proto__` or via `Object.getPrototypeOf()`). When you access a property, JS walks this chain until it finds it or hits `null`.

```js
const animal = { breathe() { return ''breathing''; } };
const dog    = Object.create(animal);
dog.bark = () => ''woof'';

dog.bark();    // ''woof'' — own property
dog.breathe(); // ''breathing'' — found on animal (prototype)
dog.fly;       // undefined — not found on chain
```

### Visualizing the chain
```
dog --> animal --> Object.prototype --> null
  .bark   .breathe   .toString etc.
```

### Constructor functions & .prototype
```js
function Dog(name) {
  this.name = name;
}
Dog.prototype.bark = function() { return ''woof''; };

const rex = new Dog(''Rex'');
rex.bark();                               // ''woof''
Object.getPrototypeOf(rex) === Dog.prototype; // true
```

### hasOwnProperty vs in
```js
''name'' in rex;                   // true (own)
''bark'' in rex;                   // true (inherited)
rex.hasOwnProperty(''name'');      // true
rex.hasOwnProperty(''bark'');      // false
```
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-ext-t-015', 'ES6 Classes — syntax, inheritance, static, private', 'Prototypes & Classes', NULL, 'medium', NULL, NULL, 15, 'Prototypes & Classes', NULL, '["prototypes-&-classes","javascript"]', 'theory', 'javascript', '
## ES6 Classes

Classes are **syntactic sugar over prototype-based inheritance** — no new mechanism, just cleaner syntax.

```js
class Animal {
  #sound;                          // private field (ES2022)

  constructor(name, sound) {
    this.name = name;
    this.#sound = sound;
  }

  speak() {
    return `${this.name} says ${this.#sound}`;
  }

  static create(name, sound) {    // called on class, not instance
    return new Animal(name, sound);
  }
}

class Dog extends Animal {
  #tricks = [];                    // private with initializer

  constructor(name) {
    super(name, ''woof'');           // must call super before this
  }

  learn(trick) { this.#tricks.push(trick); }
  perform()    { return this.#tricks.join('', ''); }

  speak() {                        // override
    return super.speak() + ''!'';   // call parent
  }
}

const rex = new Dog(''Rex'');
rex.speak();    // ''Rex says woof!''
rex.#sound;     // SyntaxError — private
```

### Key points
- `class` declarations are NOT hoisted like functions (TDZ)
- Class body is always strict mode
- Methods go on `prototype` (shared); instance fields go on `this`
- `#` prefix = truly private (not just convention)
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-ext-t-016', 'Object.create, Object.assign, spread — object manipulation', 'Prototypes & Classes', NULL, 'easy', NULL, NULL, 10, 'Prototypes & Classes', NULL, '["prototypes-&-classes","javascript"]', 'theory', 'javascript', '
## Object Manipulation

### Object.create
Creates an object with a specified prototype.
```js
const proto = { greet() { return `Hi, ${this.name}`; } };
const obj = Object.create(proto);
obj.name = ''Alice'';
obj.greet(); // ''Hi, Alice''

// Object.create(null) — no prototype at all, clean dict
const dict = Object.create(null);
dict.key = ''value'';
// dict has no .toString, .hasOwnProperty, etc.
```

### Object.assign — shallow copy + merge
```js
const defaults = { color: ''red'', size: ''M'' };
const custom   = { size: ''L'', weight: 200 };

const merged = Object.assign({}, defaults, custom);
// { color: ''red'', size: ''L'', weight: 200 }
// Mutates first arg — always pass {} to avoid mutation
```

### Spread (ES2018) — cleaner merge
```js
const merged = { ...defaults, ...custom };

// Deep copy? No — spread is SHALLOW
const a = { x: { y: 1 } };
const b = { ...a };
b.x.y = 99;
a.x.y; // 99 — same nested reference!
```

### Deep clone options
```js
// JSON (loses functions, Dates, undefined, circular refs)
const deep = JSON.parse(JSON.stringify(obj));

// Modern (Chrome 98+, Node 17+)
const deep2 = structuredClone(obj); // handles Date, Map, Set, ArrayBuffer
```
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-ext-m-008', 'instanceof check', 'Prototypes & Classes', NULL, 'medium', NULL, NULL, 5, 'Prototypes & Classes', NULL, '["prototypes-&-classes","javascript","mcq"]', 'mcq', 'javascript', '{"question":"What does `instanceof` check?","options":["Whether the object was created with a specific constructor","Whether the constructor''s prototype is in the object''s prototype chain","Whether the object has all the same properties","The typeof the object"],"correct_index":1,"explanation":"`instanceof` walks the prototype chain checking if `Constructor.prototype` appears anywhere in it. It does NOT check the constructor itself."}', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-ext-m-009', 'Class vs function hoisting', 'Prototypes & Classes', NULL, 'medium', NULL, NULL, 5, 'Prototypes & Classes', NULL, '["prototypes-&-classes","javascript","mcq"]', 'mcq', 'javascript', '{"question":"What happens if you use a class before it is declared?","options":["It works fine — classes are hoisted like functions","ReferenceError — class declarations are in the TDZ","undefined is returned","A SyntaxError at parse time"],"correct_index":1,"explanation":"Class declarations are hoisted but NOT initialized — they are in the Temporal Dead Zone (TDZ), just like `let` and `const`."}', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-ext-t-017', 'Destructuring — arrays, objects, defaults, rename, nested', 'ES6+ Features', NULL, 'easy', NULL, NULL, 10, 'ES6+ Features', NULL, '["es6+-features","javascript"]', 'theory', 'javascript', '
## Destructuring

### Array destructuring
```js
const [a, b, , d] = [1, 2, 3, 4];  // skip index 2
// a=1, b=2, d=4

const [first, ...rest] = [1, 2, 3, 4];
// first=1, rest=[2,3,4]

// Defaults
const [x = 0, y = 0] = [5];
// x=5, y=0

// Swap
let p = 1, q = 2;
[p, q] = [q, p];
```

### Object destructuring
```js
const { name, age, city = ''Unknown'' } = user;

// Rename
const { name: userName, id: userId } = user;

// Nested
const { address: { street, zip } } = user;

// Rest
const { name, ...rest } = user;
// rest = { age, city, ... } (all except name)
```

### In function parameters
```js
function render({ title, body, tags = [], isPublished = false }) {
  // no need to access props.title, props.body etc.
}
```

### Dynamic keys
```js
const key = ''name'';
const { [key]: value } = user;  // computed property destructuring
```
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-ext-t-018', 'Symbols, Iterators & the Iteration Protocol', 'ES6+ Features', NULL, 'hard', NULL, NULL, 20, 'ES6+ Features', NULL, '["es6+-features","javascript"]', 'theory', 'javascript', '
## Symbol & Iteration Protocol

### Symbol
A **unique, immutable primitive** — no two Symbols are ever equal.
```js
const s1 = Symbol(''debug label'');
const s2 = Symbol(''debug label'');
s1 === s2; // false

// Use as object keys to avoid name collisions
const ID = Symbol(''id'');
obj[ID] = 42; // not enumerable in for...in or Object.keys()
```

### Well-known Symbols
| Symbol | Purpose |
|--------|---------|
| `Symbol.iterator` | Make object iterable |
| `Symbol.toPrimitive` | Control type coercion |
| `Symbol.hasInstance` | Override instanceof |
| `Symbol.toStringTag` | Customize Object.prototype.toString |

### Custom iterator
```js
const range = {
  from: 1,
  to: 5,
  [Symbol.iterator]() {           // protocol: return iterator object
    let current = this.from;
    const last = this.to;
    return {
      next() {
        return current <= last
          ? { value: current++, done: false }
          : { value: undefined, done: true };
      },
    };
  },
};

[...range];                // [1, 2, 3, 4, 5]
for (const n of range) {} // works with for...of
```

### Why it matters
Arrays, Strings, Maps, Sets, NodeLists, and generators are all iterable. Anything with `[Symbol.iterator]` works with `for...of`, `[...spread]`, destructuring, and `Promise.all`.
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-ext-t-019', 'WeakMap and WeakSet — use cases and garbage collection', 'ES6+ Features', NULL, 'hard', NULL, NULL, 20, 'ES6+ Features', NULL, '["es6+-features","javascript"]', 'theory', 'javascript', '
## WeakMap & WeakSet

### WeakMap
Keys must be objects. Entries are **weakly held** — if the key has no other references, the entry is garbage-collected.

```js
const cache = new WeakMap();

function processUser(user) {
  if (cache.has(user)) return cache.get(user);
  const result = expensiveComputation(user);
  cache.set(user, result);
  return result;
}

// When user object is GC''d, its cache entry is automatically cleaned up
// No memory leak even if you forget to clear the cache!
```

### Practical: private data per instance
```js
const _private = new WeakMap();

class Widget {
  constructor(el) {
    _private.set(this, { el, clickCount: 0 });
  }
  click() {
    const d = _private.get(this);
    d.clickCount++;
  }
}
// d is truly private — not accessible from outside
```

### WeakSet
Set of weakly-held objects. Useful for tagging objects without preventing GC.
```js
const visited = new WeakSet();

function visit(node) {
  if (visited.has(node)) return;
  visited.add(node);
  // process...
}
```

| | Map | WeakMap |
|-|-----|---------|
| Key types | Any | Objects only |
| Iterable | ✅ | ❌ |
| GC of entries | ❌ | ✅ |
| .size | ✅ | ❌ |
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-ext-t-020', 'Proxy and Reflect — meta-programming', 'ES6+ Features', NULL, 'hard', NULL, NULL, 20, 'ES6+ Features', NULL, '["es6+-features","javascript"]', 'theory', 'javascript', '
## Proxy & Reflect

### Proxy
Wraps an object and intercepts fundamental operations (get, set, has, delete, etc.)

```js
const handler = {
  get(target, prop) {
    console.log(`Reading ${prop}`);
    return Reflect.get(target, prop); // forward to target
  },
  set(target, prop, value) {
    if (typeof value !== ''number'') throw new TypeError(''Numbers only'');
    return Reflect.set(target, prop, value);
  },
};

const data = new Proxy({}, handler);
data.x = 42;     // sets x=42
data.x;          // logs "Reading x", returns 42
data.y = ''hi'';   // throws TypeError
```

### Use cases
- **Validation**: enforce types/ranges on writes
- **Logging / debugging**: trace property access
- **Reactive systems**: Vue 3''s reactivity is built on Proxy
- **Default values**: `get` trap returns default if property is missing
- **Read-only objects**: `set` trap throws on write

### Reflect
Provides the default behavior for each trap — always use `Reflect` in traps instead of direct operations to preserve invariants:
```js
get(target, prop, receiver) {
  // receiver is the proxy itself (needed for correct this in getters)
  return Reflect.get(target, prop, receiver);
}
```
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-ext-m-010', 'Optional chaining', 'ES6+ Features', NULL, 'easy', NULL, NULL, 5, 'ES6+ Features', NULL, '["es6+-features","javascript","mcq"]', 'mcq', 'javascript', '{"question":"What does `user?.address?.city` return if `user` is `null`?","options":["null","undefined","TypeError","\"\""],"correct_index":1,"explanation":"Optional chaining (?.) short-circuits and returns `undefined` (not null) if any part of the chain is null or undefined."}', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-ext-m-011', 'Nullish coalescing', 'ES6+ Features', NULL, 'easy', NULL, NULL, 5, 'ES6+ Features', NULL, '["es6+-features","javascript","mcq"]', 'mcq', 'javascript', '{"question":"What does `0 ?? \"default\"` return?","options":["\"default\"","0","null","undefined"],"correct_index":1,"explanation":"Nullish coalescing (??) only falls back for null/undefined — not for other falsy values like 0, \"\", or false. Contrast with ||: `0 || \"default\"` returns \"default\"."}', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-ext-m-012', 'Spread vs rest', 'ES6+ Features', NULL, 'easy', NULL, NULL, 5, 'ES6+ Features', NULL, '["es6+-features","javascript","mcq"]', 'mcq', 'javascript', '{"question":"In `function f(a, ...b) {}`, what is `b` in `f(1, 2, 3)`?","options":["[2, 3]","2","[1, 2, 3]","undefined"],"correct_index":0,"explanation":"The rest parameter (...b) collects remaining arguments into an array. a=1, b=[2,3]."}', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-ext-t-021', 'Array methods mastery — map, filter, reduce, find, flat', 'Arrays & Collections', NULL, 'easy', NULL, NULL, 10, 'Arrays & Collections', NULL, '["arrays-&-collections","javascript"]', 'theory', 'javascript', '
## Array Methods

### Transforming
```js
// map — transform each element
[1,2,3].map(x => x * 2);              // [2,4,6]

// flatMap — map then flatten one level
[[1,2],[3]].flatMap(x => x);           // [1,2,3]
[1,2,3].flatMap(x => [x, x*10]);       // [1,10, 2,20, 3,30]

// flat — flatten nested arrays
[1,[2,[3]]].flat();                    // [1,2,[3]]
[1,[2,[3]]].flat(Infinity);            // [1,2,3]
```

### Filtering & finding
```js
// filter — keep matching elements
[1,2,3,4].filter(x => x % 2 === 0);   // [2,4]

// find — first match (undefined if none)
[1,5,3].find(x => x > 2);             // 5

// findIndex — index of first match
[1,5,3].findIndex(x => x > 2);        // 1

// some / every
[1,2,3].some(x => x > 2);             // true
[1,2,3].every(x => x > 0);            // true
```

### Reducing
```js
// reduce(callback, initialValue)
const sum = [1,2,3,4].reduce((acc, n) => acc + n, 0);    // 10

// Group by
const grouped = items.reduce((acc, item) => {
  (acc[item.type] ??= []).push(item);
  return acc;
}, {});
```

### Key rule
`map`, `filter`, `reduce`, `flatMap` do NOT mutate the original array. `sort`, `reverse`, `splice`, `push`, `pop` DO mutate.
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-ext-t-022', 'Map and Set — when and why over plain objects/arrays', 'Arrays & Collections', NULL, 'medium', NULL, NULL, 15, 'Arrays & Collections', NULL, '["arrays-&-collections","javascript"]', 'theory', 'javascript', '
## Map & Set

### Map
```js
const map = new Map();

// Any value as key (objects, functions, primitives)
map.set(''name'', ''Alice'');
map.set({ id: 1 }, ''user data'');
map.set(42, ''the answer'');

map.get(''name'');          // ''Alice''
map.has(''name'');          // true
map.size;                 // 3
map.delete(''name'');

// Iteration (preserves insertion order, unlike Object)
for (const [key, value] of map) { ... }
[...map.keys()]
[...map.values()]
[...map.entries()]
```

### Object vs Map
| | Object | Map |
|--|--------|-----|
| Key type | String/Symbol | Any |
| Order | Not guaranteed (in practice, insertion-ordered for string keys in modern JS) | Guaranteed |
| .size | Object.keys().length | .size |
| Prototype | Has inherited keys | No prototype pollution |
| Performance | OK | Better for frequent add/delete |

### Set
Collection of unique values.
```js
const set = new Set([1, 2, 2, 3, 3]);
// {1, 2, 3} — duplicates removed

// Fast deduplication
const unique = [...new Set(arr)];

// O(1) lookup vs O(n) for array
set.has(2); // true
```
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-ext-m-013', 'Array sort stability', 'Arrays & Collections', NULL, 'medium', NULL, NULL, 5, 'Arrays & Collections', NULL, '["arrays-&-collections","javascript","mcq"]', 'mcq', 'javascript', '{"question":"What is the default sort behavior of Array.prototype.sort()?","options":["Sorts numerically ascending","Sorts by Unicode code point as strings, mutates in place","Returns a new sorted array without mutation","Sorts by length"],"correct_index":1,"explanation":"sort() is in-place (mutates) and by default converts elements to strings and compares Unicode code points. `[10, 2, 1].sort()` gives `[1, 10, 2]`. Always provide a comparator for numbers."}', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-ext-m-014', 'Array vs Set lookup', 'Arrays & Collections', NULL, 'easy', NULL, NULL, 5, 'Arrays & Collections', NULL, '["arrays-&-collections","javascript","mcq"]', 'mcq', 'javascript', '{"question":"What is the time complexity of `Set.prototype.has()` vs `Array.prototype.includes()`?","options":["Both O(1)","Set O(1), Array O(n)","Both O(n)","Set O(log n), Array O(n)"],"correct_index":1,"explanation":"Set uses a hash table internally, giving O(1) average lookup. Array.includes() does a linear scan — O(n)."}', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-ext-t-023', 'Error types and custom errors', 'Error Handling', NULL, 'medium', NULL, NULL, 15, 'Error Handling', NULL, '["error-handling","javascript"]', 'theory', 'javascript', '
## Error Types & Custom Errors

### Built-in error types
| Type | When |
|------|------|
| `Error` | Base type |
| `TypeError` | Wrong type (calling non-function, null deref) |
| `ReferenceError` | Accessing undeclared variable |
| `SyntaxError` | Parse-time syntax error |
| `RangeError` | Value out of range (stack overflow, invalid array length) |
| `URIError` | Malformed URI passed to encodeURI |

### Custom errors
```js
class ValidationError extends Error {
  constructor(field, message) {
    super(message);
    this.name = ''ValidationError'';  // important — Error name defaults to ''Error''
    this.field = field;
    // Fix prototype chain (needed for instanceof in transpiled code)
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

class NetworkError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = ''NetworkError'';
    this.statusCode = statusCode;
  }
}

// Usage
try {
  if (!email.includes(''@'')) throw new ValidationError(''email'', ''Invalid email'');
} catch (err) {
  if (err instanceof ValidationError) {
    showFieldError(err.field, err.message);
  } else {
    throw err; // re-throw unexpected errors
  }
}
```
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-ext-t-024', 'ESM vs CommonJS — modules in depth', 'Modules', NULL, 'medium', NULL, NULL, 15, 'Modules', NULL, '["modules","javascript"]', 'theory', 'javascript', '
## ESM vs CommonJS

### CommonJS (Node.js, `.cjs`)
```js
// Export
const util = { add: (a,b) => a+b };
module.exports = util;
// or named:
exports.add = (a,b) => a+b;

// Import
const { add } = require(''./util'');
```

### ESM (modern standard, `.mjs` or `"type":"module"`)
```js
// Named export
export function add(a, b) { return a + b; }
export const PI = 3.14;

// Default export
export default class App { }

// Import
import { add, PI } from ''./util.js'';
import App from ''./App.js'';
import * as util from ''./util.js'';

// Dynamic import (returns Promise)
const { add } = await import(''./util.js'');
```

### Key differences
| | CJS | ESM |
|--|-----|-----|
| Evaluation | Runtime, synchronous | Parse-time static |
| Tree-shaking | ❌ hard | ✅ enables bundler to eliminate dead code |
| Top-level await | ❌ | ✅ |
| this | module.exports | undefined |
| Live bindings | ❌ (copies) | ✅ (live references) |
| Circular deps | Works (with care) | Works (but exported value is undefined until module runs) |
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-ext-m-015', 'import hoisting', 'Modules', NULL, 'medium', NULL, NULL, 5, 'Modules', NULL, '["modules","javascript","mcq"]', 'mcq', 'javascript', '{"question":"Where can `import` statements appear in an ES module?","options":["Anywhere in the file","Only at the top level (not inside if/for/functions)","Inside functions only","Inside class bodies"],"correct_index":1,"explanation":"Static `import` statements must be at the top level of a module — they are hoisted and evaluated before any code runs. Use dynamic `import()` for conditional/lazy loading."}', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-ext-t-025', 'TypeScript — type vs interface, when to use each', 'TypeScript', NULL, 'medium', NULL, NULL, 15, 'TypeScript', NULL, '["typescript","javascript"]', 'theory', 'javascript', '
## type vs interface in TypeScript

Both describe object shapes. The differences are subtle but important.

### interface
```ts
interface User {
  id: number;
  name: string;
}

// Declaration merging — can be extended across files
interface User {
  email: string;  // merges with above
}

// Extending
interface Admin extends User {
  role: ''admin'';
}
```

### type alias
```ts
type User = { id: number; name: string };

// Union types — only type can do this
type Status = ''active'' | ''inactive'' | ''pending'';
type ID = string | number;

// Intersection (combine types)
type AdminUser = User & { role: ''admin'' };

// Mapped types — only type
type Partial<T> = { [K in keyof T]?: T[K] };
type Readonly<T> = { readonly [K in keyof T]: T[K] };
```

### Decision guide
- **interface**: object shapes, especially public APIs & library types (declaration merging is a feature)
- **type**: unions, intersections, tuples, mapped/conditional types, anything that isn''t a pure object shape

> In practice, both work for simple object types — pick one convention and be consistent. Most teams default to `interface` for objects, `type` for everything else.
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-ext-t-026', 'TypeScript generics — constraints, defaults, conditional types', 'TypeScript', NULL, 'hard', NULL, NULL, 20, 'TypeScript', NULL, '["typescript","javascript"]', 'theory', 'javascript', '
## Generics in TypeScript

Generics let you write reusable, type-safe code.

### Basic generics
```ts
function identity<T>(value: T): T {
  return value;
}
identity<string>(''hello''); // type: string
identity(42);              // inferred: number
```

### Constraints (`extends`)
```ts
function getLength<T extends { length: number }>(item: T): number {
  return item.length;
}
getLength(''hello'');      // 5
getLength([1, 2, 3]);    // 3
getLength({ length: 7 });// 7
```

### keyof and lookup types
```ts
function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  return keys.reduce((acc, k) => ({ ...acc, [k]: obj[k] }), {} as Pick<T, K>);
}
```

### Conditional types
```ts
type IsArray<T> = T extends any[] ? ''yes'' : ''no'';
type A = IsArray<string[]>; // ''yes''
type B = IsArray<string>;   // ''no''

// Infer
type UnpackArray<T> = T extends (infer Item)[] ? Item : T;
type X = UnpackArray<string[]>; // string
type Y = UnpackArray<number>;   // number
```

### Utility types (built-in generics)
```ts
Partial<T>            // all fields optional
Required<T>           // all fields required
Readonly<T>           // all fields readonly
Pick<T, K>            // only keys K
Omit<T, K>            // all keys except K
Record<K, V>          // object with keys K and values V
ReturnType<T>         // return type of function T
```
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-ext-m-016', 'TypeScript unknown vs any', 'TypeScript', NULL, 'medium', NULL, NULL, 5, 'TypeScript', NULL, '["typescript","javascript","mcq"]', 'mcq', 'javascript', '{"question":"What is the key difference between `any` and `unknown` in TypeScript?","options":["any is for runtime errors, unknown is for compile errors","unknown requires type narrowing before use; any bypasses all type checks","unknown can only hold primitive values","any is deprecated in TypeScript 5+"],"correct_index":1,"explanation":"`unknown` is the type-safe counterpart of `any`. You cannot call methods or access properties on `unknown` without first narrowing the type (typeof, instanceof, type guard). `any` disables type checking entirely."}', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-ext-m-017', 'TypeScript Partial utility type', 'TypeScript', NULL, 'easy', NULL, NULL, 5, 'TypeScript', NULL, '["typescript","javascript","mcq"]', 'mcq', 'javascript', '{"question":"What does `Partial<User>` produce if `User = { id: number; name: string }`?","options":["{ id?: number; name?: string }","{ id: number | null; name: string | null }","never","{ id: number; name: string } & { id?: never; name?: never }"],"correct_index":0,"explanation":"Partial<T> maps every property of T to optional (adds `?`). It is a built-in mapped type."}', 'internal');
