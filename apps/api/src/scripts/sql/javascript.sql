-- PrepArena seed: JavaScript Theory + MCQ
-- Problems: 30
-- Generated: 2026-07-05T17:05:49.114Z
-- Apply (local):  npx wrangler d1 execute preParena-db --local  --file=src/scripts/sql/javascript.sql
-- Apply (remote): npx wrangler d1 execute preParena-db --remote --file=src/scripts/sql/javascript.sql
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-theory-001', 'var vs let vs const — Hoisting & TDZ', 'Variables & Scope', 'Hoisting', 'easy', NULL, NULL, 10, 'Variables & Scope', NULL, '["Variables & Scope","javascript"]', 'theory', 'javascript', '
## var vs let vs const

### var
- **Function-scoped** (not block-scoped)
- **Hoisted** to top of function with value `undefined`
- Can be re-declared and re-assigned

```js
console.log(x); // undefined (hoisted)
var x = 5;

if (true) {
  var y = 10; // leaks out of block
}
console.log(y); // 10 ✓
```

### let
- **Block-scoped**
- Hoisted but in **Temporal Dead Zone (TDZ)** — accessing before declaration throws `ReferenceError`
- Cannot be re-declared in the same scope

```js
console.log(a); // ReferenceError: Cannot access ''a'' before initialization
let a = 5;

if (true) {
  let b = 10; // block-scoped
}
console.log(b); // ReferenceError
```

### const
- Block-scoped, TDZ like `let`
- Must be initialized at declaration
- **Cannot be re-assigned** (but object/array contents CAN be mutated)

```js
const obj = { x: 1 };
obj.x = 2;        // ✓ mutation is fine
obj = { x: 2 };   // ✗ TypeError: Assignment to constant variable

const arr = [1, 2];
arr.push(3);      // ✓
arr = [4, 5];     // ✗
```

### Temporal Dead Zone (TDZ)
The period between entering a block scope and the declaration being evaluated. The variable exists but cannot be accessed.

```js
{
  // TDZ starts
  console.log(typeof x); // ReferenceError (not undefined!)
  let x = 5;             // TDZ ends
}
```

### Interview tip
- Use `const` by default
- Use `let` when re-assignment is needed
- Avoid `var` in modern code (except for backward compatibility)
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-theory-002', 'Closures — Scope Chain & Practical Patterns', 'Closures', NULL, 'medium', NULL, NULL, 15, 'Closures', NULL, '["Closures","javascript"]', 'theory', 'javascript', '
## Closures

A **closure** is a function that retains access to its outer (enclosing) scope even after the outer function has returned.

### How it works
```js
function outer() {
  let count = 0; // this variable is "closed over"
  return function inner() {
    count++;
    return count;
  };
}

const increment = outer();
console.log(increment()); // 1
console.log(increment()); // 2
console.log(increment()); // 3
// count is preserved in memory because inner() references it
```

### Scope chain
Every function looks up its own scope, then its parent''s scope, then the parent''s parent — all the way to the global scope.

```js
const x = ''global'';

function outer() {
  const x = ''outer'';
  function inner() {
    const x = ''inner'';
    console.log(x); // ''inner'' — found locally
  }
  function middle() {
    console.log(x); // ''outer'' — not local, goes up
  }
  inner();
  middle();
}
```

### Classic loop closure bug
```js
// Bug: all logs print 3
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}

// Fix 1: use let (block-scoped per iteration)
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100); // 0, 1, 2
}

// Fix 2: IIFE captures value
for (var i = 0; i < 3; i++) {
  (function(j) {
    setTimeout(() => console.log(j), 100); // 0, 1, 2
  })(i);
}
```

### Practical uses
1. **Data privacy / encapsulation**
```js
function createCounter(initial = 0) {
  let count = initial;
  return {
    get: () => count,
    increment: () => ++count,
    reset: () => { count = initial; },
  };
}
```

2. **Memoization**
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
```

3. **Partial application / currying**
```js
const multiply = (a) => (b) => a * b;
const double = multiply(2);
double(5); // 10
```

### Memory consideration
Closures keep referenced variables in memory. Be careful with large objects in long-lived closures — can cause memory leaks.
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-theory-003', 'Prototypal Inheritance & the Prototype Chain', 'Prototypes', NULL, 'medium', NULL, NULL, 15, 'Prototypes', NULL, '["Prototypes","javascript"]', 'theory', 'javascript', '
## Prototypal Inheritance

JavaScript uses **prototype-based inheritance** — every object has a hidden `[[Prototype]]` link to another object.

### The chain
```js
const animal = {
  breathe() { return ''breathing''; }
};

const dog = Object.create(animal);
dog.bark = function() { return ''woof''; };

const myDog = Object.create(dog);
myDog.name = ''Rex'';

// Chain: myDog → dog → animal → Object.prototype → null
myDog.name;     // ''Rex'' (own)
myDog.bark();   // ''woof'' (from dog)
myDog.breathe();// ''breathing'' (from animal)
```

### `__proto__` vs `prototype`
- `__proto__` — the actual link on every **object** to its prototype
- `.prototype` — exists only on **functions**, used when function is called with `new`

```js
function Dog(name) {
  this.name = name;
}
Dog.prototype.bark = function() { return ''woof''; };

const d = new Dog(''Rex'');
d.__proto__ === Dog.prototype; // true
d.__proto__.__proto__ === Object.prototype; // true
```

### ES6 Classes (syntactic sugar)
```js
class Animal {
  constructor(name) { this.name = name; }
  speak() { return `${this.name} makes a sound`; }
}

class Dog extends Animal {
  speak() { return `${this.name} barks`; }
}

const d = new Dog(''Rex'');
d.speak(); // ''Rex barks''
d instanceof Dog;    // true
d instanceof Animal; // true
```

### Object.create, hasOwnProperty
```js
const obj = Object.create({ inherited: true });
obj.own = true;

obj.hasOwnProperty(''own'');       // true
obj.hasOwnProperty(''inherited''); // false
''inherited'' in obj;              // true (checks chain)
```

### Property shadowing
```js
const parent = { x: 1 };
const child = Object.create(parent);
child.x = 2; // shadows parent.x
console.log(child.x);  // 2
console.log(parent.x); // 1 (unchanged)
```

### Interview insight
- ES6 classes compile to prototype-based patterns
- Always use `Object.hasOwn(obj, key)` (modern) over `obj.hasOwnProperty(key)` (can be overridden)
- Avoid mutating `Object.prototype` — breaks all objects
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-theory-004', 'The Event Loop — Call Stack, Microtasks & Macrotasks', 'Async & Event Loop', NULL, 'hard', NULL, NULL, 20, 'Async & Event Loop', NULL, '["Async & Event Loop","javascript"]', 'theory', 'javascript', '
## The JavaScript Event Loop

JavaScript is **single-threaded** but non-blocking thanks to the event loop.

### Components
1. **Call Stack** — executes synchronous code (LIFO)
2. **Heap** — memory for objects
3. **Web APIs** — `setTimeout`, `fetch`, DOM events (run outside JS thread)
4. **Macrotask Queue (Task Queue)** — `setTimeout`, `setInterval`, I/O callbacks
5. **Microtask Queue** — `Promise.then`, `queueMicrotask`, `MutationObserver`

### Execution order
1. Run all synchronous code (empty the call stack)
2. **Drain the entire microtask queue** (including newly added microtasks)
3. Take ONE task from the macrotask queue
4. Render (browser)
5. Repeat

```js
console.log(''1'');

setTimeout(() => console.log(''2''), 0); // macrotask

Promise.resolve().then(() => console.log(''3'')); // microtask
Promise.resolve().then(() => {
  console.log(''4'');
  Promise.resolve().then(() => console.log(''5'')); // added mid-drain
});

console.log(''6'');

// Output: 1, 6, 3, 4, 5, 2
```

### Why microtasks before macrotasks?
Microtasks run after every task and after every piece of synchronous code, ensuring Promise chains complete before the next task starts.

### Tricky example
```js
async function foo() {
  console.log(''A'');
  await Promise.resolve();
  console.log(''B'');
}

console.log(''1'');
foo();
console.log(''2'');
// Output: 1, A, 2, B
// ''A'' runs synchronously in foo(), then foo() suspends at await (schedules microtask)
// ''2'' runs, then microtask fires printing ''B''
```

### setTimeout(fn, 0) is NOT instant
It''s at minimum 4ms in browsers, and it always runs AFTER all microtasks.

### requestAnimationFrame
Runs before the next paint, after microtasks, making it ideal for animations.

```js
// Animation order:
// macrotask → microtasks → rAF callbacks → render → next macrotask
```

### Blocking the event loop
```js
// This blocks for 2 seconds — NO other code runs
const start = Date.now();
while (Date.now() - start < 2000) {} // BAD
```
Use `setTimeout`, `Promise`, or Web Workers for heavy work.
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-theory-005', 'Promises — Deep Dive & Common Pitfalls', 'Async & Event Loop', NULL, 'medium', NULL, NULL, 15, 'Async & Event Loop', NULL, '["Async & Event Loop","javascript"]', 'theory', 'javascript', '
## Promises

A **Promise** represents a value that may be available now, in the future, or never.

### States
- **Pending** → neither fulfilled nor rejected
- **Fulfilled** → operation succeeded (`.then` callbacks run)
- **Rejected** → operation failed (`.catch` callbacks run)
- Once settled, a promise is **immutable**

### Creating promises
```js
const p = new Promise((resolve, reject) => {
  // async work
  setTimeout(() => resolve(42), 1000);
  // or: reject(new Error(''failed''))
});

p.then(val => console.log(val))   // 42
 .catch(err => console.error(err));
```

### Chaining — the key feature
`.then` always returns a NEW promise, enabling chaining:
```js
fetch(''/api/user'')
  .then(res => res.json())           // returns new promise
  .then(user => fetch(`/api/posts/${user.id}`))
  .then(res => res.json())
  .then(posts => console.log(posts))
  .catch(err => console.error(err)); // catches ANY error above
```

### Common pitfall: forgetting to return
```js
// BUG: no return — chain doesn''t wait
.then(user => {
  fetch(''/api/posts''); // Promise ignored!
})
.then(posts => console.log(posts)); // posts = undefined

// Fix:
.then(user => fetch(''/api/posts''))  // return the promise
```

### Promise combinators
```js
// All succeed: resolves with array of results
// Any fails: rejects immediately
Promise.all([p1, p2, p3])

// First to settle (success OR failure) wins
Promise.race([p1, p2, p3])

// Waits for ALL, never rejects — returns { status, value/reason }
Promise.allSettled([p1, p2, p3])

// First to SUCCEED wins; rejects only if ALL fail
Promise.any([p1, p2, p3])
```

### async/await
Syntactic sugar over Promises:
```js
async function loadUser(id) {
  try {
    const res = await fetch(`/api/users/${id}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(''Failed:'', err);
    throw err; // re-throw for caller
  }
}
```

### Parallel vs sequential
```js
// Sequential — 2 seconds total
const a = await fetchA(); // 1s
const b = await fetchB(); // 1s

// Parallel — 1 second total
const [a, b] = await Promise.all([fetchA(), fetchB()]);
```

### Unhandled rejection
Always attach a `.catch` or use try/catch with await. Unhandled rejections crash Node.js processes.
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-theory-006', 'this Keyword — Context Rules & Binding', 'Functions', NULL, 'hard', NULL, NULL, 20, 'Functions', NULL, '["Functions","javascript"]', 'theory', 'javascript', '
## The `this` Keyword

`this` refers to the **execution context** of a function. Its value is determined at **call time**, not definition time (except arrow functions).

### Rules (in priority order)

**1. new binding** — `this` = new object
```js
function Person(name) {
  this.name = name; // this = newly created object
}
const p = new Person(''Alice'');
```

**2. Explicit binding** — call/apply/bind
```js
function greet() { return `Hello, ${this.name}`; }
const obj = { name: ''Bob'' };

greet.call(obj);        // ''Hello, Bob'' — calls immediately
greet.apply(obj, []);   // same, args as array
const bound = greet.bind(obj); // returns new function
bound();                // ''Hello, Bob''
```

**3. Implicit binding** — object method call
```js
const obj = {
  name: ''Charlie'',
  greet() { return this.name; }
};
obj.greet(); // ''Charlie'' — this = obj
```

**4. Default binding** — plain function call
```js
function foo() { return this; }
foo(); // window (browser) or undefined (strict mode)
```

### Arrow functions — NO own `this`
Arrow functions lexically capture `this` from their enclosing scope:
```js
const obj = {
  name: ''Dave'',
  regular() {
    setTimeout(function() {
      console.log(this.name); // undefined (default binding)
    }, 100);
    setTimeout(() => {
      console.log(this.name); // ''Dave'' (arrow uses obj''s this)
    }, 100);
  }
};
```

### Losing `this`
```js
const obj = { name: ''Eve'', greet() { return this.name; } };
const fn = obj.greet;
fn(); // undefined — this is lost on assignment!

// Fix: bind
const fn = obj.greet.bind(obj);

// Fix: arrow in class
class Greeter {
  name = ''Eve'';
  greet = () => this.name; // arrow method — always bound
}
```

### Class methods
```js
class Timer {
  count = 0;
  // Problem: loses this when passed as callback
  increment() { this.count++; }

  // Solution: arrow property method
  increment = () => { this.count++; }; // always bound to instance
}
```
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-theory-007', 'ES6+ Features Every Senior Dev Must Know', 'ES6+ Modern JS', NULL, 'medium', NULL, NULL, 15, 'ES6+ Modern JS', NULL, '["ES6+ Modern JS","javascript"]', 'theory', 'javascript', '
## Essential ES6+ Features

### Destructuring
```js
// Object destructuring
const { name, age, city = ''Unknown'' } = user; // default value
const { name: firstName } = user;              // rename

// Array destructuring
const [first, second, ...rest] = [1, 2, 3, 4];
const [, second] = arr; // skip first

// Nested
const { address: { street } } = user;

// In function params
function draw({ x = 0, y = 0, color = ''red'' } = {}) { }
```

### Spread & Rest
```js
// Spread — expand
const merged = { ...obj1, ...obj2 }; // shallow merge
const copy = [...arr];
Math.max(...[1, 2, 3]);

// Rest — collect
function sum(...nums) { return nums.reduce((a, b) => a + b, 0); }
const { x, ...remaining } = obj; // object rest
```

### Optional chaining & Nullish coalescing
```js
const city = user?.address?.city;         // undefined if any is null/undefined
const name = user?.getName?.();           // safe method call
const el = arr?.[0];                      // safe array access

const port = config.port ?? 3000;         // only uses 3000 if port is null/undefined
const val = '''' ?? ''default'';             // '''' (not falsy check, only null/undefined)
const val = '''' || ''default'';             // ''default'' (falsy check)
```

### Template literals
```js
const msg = `Hello ${name}, you have ${msgs.length} message${msgs.length !== 1 ? ''s'' : ''''}`;

// Tagged templates (advanced)
function highlight(strings, ...values) {
  return strings.reduce((acc, str, i) =>
    acc + str + (values[i] !== undefined ? `<b>${values[i]}</b>` : ''''), '''');
}
highlight`Hello ${name}!`; // ''Hello <b>Alice</b>!''
```

### Generators
```js
function* range(start, end, step = 1) {
  for (let i = start; i < end; i += step) yield i;
}

for (const n of range(0, 10, 2)) console.log(n); // 0, 2, 4, 6, 8

// Infinite sequence
function* fibonacci() {
  let [a, b] = [0, 1];
  while (true) { yield a; [a, b] = [b, a + b]; }
}
```

### Map & Set
```js
// Map — any key type, preserves insertion order
const map = new Map();
map.set({ id: 1 }, ''value''); // object as key
map.size; // 1

// Set — unique values
const unique = [...new Set([1, 1, 2, 3, 2])]; // [1, 2, 3]
```

### WeakMap & WeakRef — for memory-safe patterns
```js
const cache = new WeakMap(); // keys must be objects, GC-able
function process(obj) {
  if (cache.has(obj)) return cache.get(obj);
  const result = expensiveOp(obj);
  cache.set(obj, result);
  return result;
}
```

### Symbol
```js
const id = Symbol(''id''); // unique identifier, not enumerable by default
obj[id] = 42;
Object.keys(obj); // doesn''t include id
```

### Proxy & Reflect
```js
const validator = new Proxy({}, {
  set(target, prop, value) {
    if (prop === ''age'' && typeof value !== ''number'') throw new TypeError();
    target[prop] = value;
    return true;
  }
});
validator.age = 25; // ok
validator.age = ''25''; // TypeError
```
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-theory-008', 'Execution Context, Scope & the Scope Chain', 'Variables & Scope', NULL, 'hard', NULL, NULL, 20, 'Variables & Scope', NULL, '["Variables & Scope","javascript"]', 'theory', 'javascript', '
## Execution Context & Scope

### What is an Execution Context?
Every time JavaScript runs code, it creates an **Execution Context** (EC) with:
1. **Variable Environment** — hoisted vars, function declarations
2. **Scope Chain** — reference to outer environment
3. **`this` binding**

### Types
- **Global EC** — created once, `this` = `window`/`global`
- **Function EC** — created per function call
- **Eval EC** — (avoid)
- **Module EC** — per ES module

### The Call Stack
```js
function c() { console.trace(); }
function b() { c(); }
function a() { b(); }
a();
// Stack: a → b → c (c is on top, executed first)
```

### Lexical vs Dynamic Scope
JavaScript uses **lexical (static) scope** — scope is determined by where code is written, not where it''s called.

```js
let x = ''global'';
function outer() {
  let x = ''outer'';
  function inner() {
    console.log(x); // ''outer'' — lexical, where inner is DEFINED
  }
  return inner;
}
const fn = outer();
fn(); // still ''outer'', not ''global''
```

### IIFE (Immediately Invoked Function Expression)
```js
// Creates isolated scope (pre-let/const era pattern)
(function() {
  var private = ''secret'';
})();
// private is not accessible here

// Modern usage: avoid polluting global with module pattern
const module = (() => {
  let _state = 0;
  return {
    get: () => _state,
    increment: () => _state++,
  };
})();
```

### Hoisting in depth
```js
// Function declarations are FULLY hoisted
greet(); // ''Hello'' — works!
function greet() { console.log(''Hello''); }

// Function expressions are NOT
greet(); // TypeError: greet is not a function
var greet = function() { console.log(''Hello''); };
// (var is hoisted as undefined, calling undefined() → TypeError)
```

### Block scope nuances
```js
{
  let x = 1;
  const y = 2;
  var z = 3; // leaks to function/global scope
}
// x and y not accessible, z is
```
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-theory-009', 'JavaScript Design Patterns', 'Design Patterns', NULL, 'hard', NULL, NULL, 20, 'Design Patterns', NULL, '["Design Patterns","javascript"]', 'theory', 'javascript', '
## JavaScript Design Patterns

### Module Pattern
```js
const UserService = (() => {
  // Private
  const users = [];
  function validate(user) { return user.name && user.email; }

  // Public API
  return {
    add(user) {
      if (!validate(user)) throw new Error(''Invalid user'');
      users.push(user);
    },
    getAll() { return [...users]; } // return copy
  };
})();
```

### Observer / Pub-Sub
```js
class EventEmitter {
  #listeners = new Map();

  on(event, fn) {
    if (!this.#listeners.has(event)) this.#listeners.set(event, []);
    this.#listeners.get(event).push(fn);
    return () => this.off(event, fn); // returns unsubscribe fn
  }

  off(event, fn) {
    const fns = this.#listeners.get(event) ?? [];
    this.#listeners.set(event, fns.filter(f => f !== fn));
  }

  emit(event, ...args) {
    (this.#listeners.get(event) ?? []).forEach(fn => fn(...args));
  }
}
```

### Singleton
```js
class Database {
  static #instance = null;
  constructor() {
    if (Database.#instance) return Database.#instance;
    this.connection = this.connect();
    Database.#instance = this;
  }
  static getInstance() {
    return Database.#instance ?? new Database();
  }
}
```

### Factory
```js
function createUser(type) {
  const base = { createdAt: Date.now() };
  const roles = { admin: { permissions: [''read'',''write'',''delete''] },
                  viewer: { permissions: [''read''] } };
  return { ...base, type, ...roles[type] };
}
```

### Decorator (before TC39)
```js
function readonly(target, key, descriptor) {
  descriptor.writable = false;
  return descriptor;
}

function memoize(fn) {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (!cache.has(key)) cache.set(key, fn(...args));
    return cache.get(key);
  };
}
```

### Strategy
```js
const sorters = {
  bubble: arr => { /* bubble sort */ },
  quick:  arr => { /* quick sort  */ },
  merge:  arr => { /* merge sort  */ },
};

function sort(arr, strategy = ''quick'') {
  return sorters[strategy](arr);
}
```

### Command
```js
class Editor {
  constructor() { this.history = []; this.text = ''''; }

  execute(command) {
    this.text = command.execute(this.text);
    this.history.push(command);
  }

  undo() {
    const cmd = this.history.pop();
    if (cmd) this.text = cmd.undo(this.text);
  }
}
```
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-theory-010', 'Memory Management & Performance Optimization', 'Performance', NULL, 'hard', NULL, NULL, 20, 'Performance', NULL, '["Performance","javascript"]', 'theory', 'javascript', '
## Memory Management & Performance

### Garbage Collection
JavaScript uses **mark-and-sweep** GC. Objects are collected when no references point to them.

```js
let obj = { data: new Array(1000000) };
// obj is referenced — not GC''d
obj = null; // reference removed — eligible for GC
```

### Common Memory Leaks

**1. Global variables**
```js
function leak() {
  forgotten = ''I am global''; // no var/let/const!
}
```

**2. Detached DOM nodes**
```js
let elements = [];
function add() {
  const el = document.createElement(''div'');
  elements.push(el); // still referenced even if removed from DOM
  document.body.append(el);
}
```

**3. Forgotten event listeners**
```js
// Leaks if element is removed without removing listener
element.addEventListener(''click'', handler);
// Fix:
element.removeEventListener(''click'', handler);
// Or use AbortController:
const ac = new AbortController();
element.addEventListener(''click'', handler, { signal: ac.signal });
ac.abort(); // removes listener
```

**4. Closure over large objects**
```js
function setup() {
  const hugeData = new Array(1000000);
  return function() {
    // Even if hugeData not used, closure keeps it alive
    return ''done'';
  };
}
```

### Performance Patterns

**Debounce — delay execution**
```js
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
const handleSearch = debounce(search, 300);
```

**Throttle — rate limit**
```js
function throttle(fn, limit) {
  let last = 0;
  return (...args) => {
    const now = Date.now();
    if (now - last >= limit) { last = now; fn(...args); }
  };
}
const handleScroll = throttle(onScroll, 100);
```

**Object pooling — reuse objects**
```js
class Pool {
  #available = [];
  acquire() { return this.#available.pop() ?? this.create(); }
  release(obj) { this.reset(obj); this.#available.push(obj); }
}
```

### Web Workers for CPU tasks
```js
const worker = new Worker(''worker.js'');
worker.postMessage({ task: ''heavyComputation'', data });
worker.onmessage = ({ data }) => console.log(data.result);
```
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-theory-011', 'Array Methods Mastery', 'Arrays & Iterables', NULL, 'easy', NULL, NULL, 10, 'Arrays & Iterables', NULL, '["Arrays & Iterables","javascript"]', 'theory', 'javascript', '
## Array Methods — Complete Guide

### Transformation
```js
// map — transform each element
[1, 2, 3].map(x => x * 2); // [2, 4, 6]

// flatMap — map + flatten 1 level
[''hello'', ''world''].flatMap(w => w.split('''')); // [''h'',''e'',''l'',''l'',''o'',''w'',...]

// filter — keep matching
[1, 2, 3, 4].filter(x => x % 2 === 0); // [2, 4]

// reduce — accumulate to single value
[1, 2, 3, 4].reduce((acc, x) => acc + x, 0); // 10

// reduceRight — right to left
[[1,2],[3,4]].reduceRight((acc, x) => acc.concat(x), []); // [3,4,1,2]
```

### Searching
```js
[1, 2, 3].find(x => x > 1);       // 2 (first match)
[1, 2, 3].findIndex(x => x > 1);  // 1
[1, 2, 3].findLast(x => x < 3);   // 2 (ES2023)
[1, 2, 3].includes(2);             // true
[1, 2, 3].indexOf(2);              // 1 (-1 if not found)
[1, 2, 3].some(x => x > 2);       // true (any match)
[1, 2, 3].every(x => x > 0);      // true (all match)
```

### Mutation
```js
arr.push(4);    // add to end, returns new length
arr.pop();      // remove from end, returns element
arr.unshift(0); // add to start, returns new length
arr.shift();    // remove from start, returns element
arr.splice(1, 2, ''a'', ''b''); // remove 2 at index 1, insert ''a'',''b''
arr.sort((a, b) => a - b);  // sort in place (numeric)
arr.reverse();  // reverse in place
```

### Non-mutating (ES2023+)
```js
arr.toSorted((a, b) => a - b); // sorted copy
arr.toReversed();               // reversed copy
arr.toSpliced(1, 2, ''x'');      // spliced copy
arr.with(1, ''x'');               // copy with arr[1] = ''x''
```

### Creation
```js
Array.from({ length: 5 }, (_, i) => i); // [0, 1, 2, 3, 4]
Array.from(''hello''); // [''h'',''e'',''l'',''l'',''o'']
Array.from(new Set([1,1,2])); // [1, 2]
Array.of(1, 2, 3); // [1, 2, 3]
[...new Array(3)].map((_, i) => i); // [0, 1, 2]
```

### Performance tips
- `arr.length = 0` clears array (faster than `arr = []` for shared refs)
- Avoid `delete arr[i]` (creates holes, affects performance)
- For large sorted arrays, use binary search instead of `.find`
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-theory-012', 'Error Handling Best Practices', 'Error Handling', NULL, 'medium', NULL, NULL, 15, 'Error Handling', NULL, '["Error Handling","javascript"]', 'theory', 'javascript', '
## Error Handling

### Custom Error Types
```js
class AppError extends Error {
  constructor(message, statusCode = 500, code = ''INTERNAL_ERROR'') {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    if (Error.captureStackTrace) Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(field, message) {
    super(message, 400, ''VALIDATION_ERROR'');
    this.field = field;
  }
}

class NotFoundError extends AppError {
  constructor(resource) {
    super(`${resource} not found`, 404, ''NOT_FOUND'');
  }
}
```

### Try/Catch/Finally
```js
async function fetchUser(id) {
  let response;
  try {
    response = await fetch(`/api/users/${id}`);
    if (!response.ok) {
      throw new AppError(`HTTP ${response.status}`, response.status);
    }
    return await response.json();
  } catch (err) {
    if (err instanceof AppError) throw err; // re-throw known errors
    throw new AppError(''Fetch failed'', 503); // wrap unknown
  } finally {
    // Always runs — cleanup, logging, etc.
    logger.log(''fetchUser completed'', { id });
  }
}
```

### Error boundaries pattern
```js
function withErrorHandling(fn) {
  return async (...args) => {
    try {
      return { data: await fn(...args), error: null };
    } catch (err) {
      return { data: null, error: err.message };
    }
  };
}

const safeGetUser = withErrorHandling(getUser);
const { data, error } = await safeGetUser(id);
```

### Async error pitfalls
```js
// Promise rejection must be caught
fetchUser(1).then(data => process(data)); // MISSING .catch — silent failure!

// async IIFE — wrap for top-level
(async () => {
  try {
    const user = await fetchUser(1);
  } catch (err) { /* handle */ }
})();

// Promise.all — catches any rejection
try {
  const [a, b] = await Promise.all([p1, p2]);
} catch (err) { /* err is from first rejection */ }
```

### Never swallow errors
```js
// BAD
try { riskyOp(); } catch {}

// GOOD — at minimum log
try { riskyOp(); } catch (err) {
  console.error(''[riskyOp] failed:'', err);
  throw err; // re-throw if caller needs to know
}
```
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-theory-013', 'Modules — ESM vs CommonJS', 'Modules', NULL, 'medium', NULL, NULL, 15, 'Modules', NULL, '["Modules","javascript"]', 'theory', 'javascript', '
## JavaScript Modules

### ESM (ES Modules) — modern standard
```js
// Named exports
export const PI = 3.14;
export function add(a, b) { return a + b; }
export class User { }

// Default export (one per module)
export default class App { }

// Import
import App, { PI, add } from ''./math.js'';
import * as Math from ''./math.js''; // namespace import
import { add as sum } from ''./math.js''; // alias

// Dynamic import — code splitting
const { default: Chart } = await import(''./chart.js'');
```

### CommonJS (Node.js legacy)
```js
// Export
module.exports = { add, PI };
module.exports.add = add; // individual

// Import
const { add, PI } = require(''./math'');
const math = require(''./math''); // default
```

### Key differences
| Feature | ESM | CJS |
|---|---|---|
| Syntax | `import/export` | `require/module.exports` |
| Loading | Static (async) | Synchronous |
| Tree-shaking | ✅ | ❌ |
| Top-level await | ✅ | ❌ |
| `this` at top level | `undefined` | `module.exports` |
| File extension | `.mjs` or `"type":"module"` | `.cjs` or default |

### Tree-shaking
Bundlers (Webpack, Rollup, Vite) can eliminate unused exports with ESM:
```js
// Only ''add'' is imported, ''subtract'' is dead code and removed
import { add } from ''./math.js'';
```

### Circular imports
```js
// a.js imports b.js, b.js imports a.js
// ESM: works if not needed at init time (live bindings)
// CJS: can get undefined if not yet evaluated
```

### Module patterns in practice
```js
// Barrel file — re-export for clean imports
// components/index.js
export { Button } from ''./Button'';
export { Input } from ''./Input'';

// Usage
import { Button, Input } from ''./components'';
```
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-theory-014', 'Iterators, Generators & for...of', 'ES6+ Modern JS', NULL, 'hard', NULL, NULL, 20, 'ES6+ Modern JS', NULL, '["ES6+ Modern JS","javascript"]', 'theory', 'javascript', '
## Iterators & Generators

### Iterator Protocol
An object is iterable if it has `Symbol.iterator` returning an iterator with `.next()`.

```js
// Custom iterable range
function range(start, end) {
  return {
    [Symbol.iterator]() {
      let current = start;
      return {
        next() {
          return current <= end
            ? { value: current++, done: false }
            : { value: undefined, done: true };
        }
      };
    }
  };
}

for (const n of range(1, 5)) console.log(n); // 1, 2, 3, 4, 5
const arr = [...range(1, 5)]; // [1, 2, 3, 4, 5]
```

### Generator Functions
Generators are pauseable functions that produce sequences lazily:

```js
function* fibonacci() {
  let [a, b] = [0, 1];
  while (true) {
    yield a;           // pause and yield value
    [a, b] = [b, a + b];
  }
}

const fib = fibonacci();
fib.next(); // { value: 0, done: false }
fib.next(); // { value: 1, done: false }

// Take first 10
const first10 = [...take(fibonacci(), 10)];

function* take(iter, n) {
  for (const val of iter) {
    if (n-- === 0) return;
    yield val;
  }
}
```

### Async generators
```js
async function* streamData(url) {
  const res = await fetch(url);
  const reader = res.body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) return;
    yield new TextDecoder().decode(value);
  }
}

for await (const chunk of streamData(''/api/stream'')) {
  process(chunk);
}
```

### Two-way communication with generators
```js
function* calculator() {
  let result = 0;
  while (true) {
    const input = yield result; // yield sends result, receives next input
    result += input;
  }
}

const calc = calculator();
calc.next();    // start, { value: 0 }
calc.next(5);   // { value: 5 }
calc.next(3);   // { value: 8 }
```
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-theory-015', 'Web APIs — Storage, Workers & Performance', 'Browser APIs', NULL, 'medium', NULL, NULL, 15, 'Browser APIs', NULL, '["Browser APIs","javascript"]', 'theory', 'javascript', '
## Browser Web APIs

### Storage
```js
// localStorage — persists after browser close, ~5-10MB, string only
localStorage.setItem(''token'', JSON.stringify({ id: 1 }));
const token = JSON.parse(localStorage.getItem(''token''));
localStorage.removeItem(''token'');
localStorage.clear();

// sessionStorage — cleared when tab closes
sessionStorage.setItem(''draft'', content);

// IndexedDB — large structured data, async
const db = await new Promise((resolve, reject) => {
  const req = indexedDB.open(''myDB'', 1);
  req.onsuccess = () => resolve(req.result);
  req.onerror = () => reject(req.error);
});
```

### Intersection Observer — lazy loading
```js
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      loadContent(entry.target);
      observer.unobserve(entry.target); // stop watching
    }
  });
}, { threshold: 0.1 }); // trigger when 10% visible

document.querySelectorAll(''.lazy'').forEach(el => observer.observe(el));
```

### Mutation Observer
```js
const observer = new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    if (mutation.type === ''childList'') {
      mutation.addedNodes.forEach(node => initComponent(node));
    }
  });
});
observer.observe(document.body, { childList: true, subtree: true });
```

### Fetch API with advanced options
```js
const controller = new AbortController();
setTimeout(() => controller.abort(), 5000); // 5s timeout

const res = await fetch(''/api/data'', {
  method: ''POST'',
  headers: { ''Content-Type'': ''application/json'' },
  body: JSON.stringify(data),
  signal: controller.signal,
  credentials: ''include'', // send cookies
});
```

### Web Workers
```js
// main.js
const worker = new Worker(new URL(''./worker.js'', import.meta.url));
worker.postMessage({ type: ''compute'', data: largeArray });
worker.onmessage = ({ data }) => console.log(''Result:'', data.result);
worker.onerror = (err) => console.error(err);

// worker.js — no DOM access, own scope
self.onmessage = ({ data }) => {
  if (data.type === ''compute'') {
    const result = heavyComputation(data.data);
    self.postMessage({ result });
  }
};
```

### Performance API
```js
performance.mark(''start'');
// ... expensive operation ...
performance.mark(''end'');
performance.measure(''operation'', ''start'', ''end'');

const [measure] = performance.getEntriesByName(''operation'');
console.log(measure.duration); // ms
```
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-mcq-001', 'typeof null', 'Variables & Scope', 'Type System', 'easy', NULL, NULL, 5, 'Variables & Scope', NULL, '["Variables & Scope","javascript","mcq"]', 'mcq', 'javascript', '{"question":"What does `typeof null` return in JavaScript?","options":["null","\"object\"","\"undefined\"","\"null\""],"correct_index":1,"explanation":"`typeof null` returns `\"object\"` — this is a famous JavaScript bug from the original implementation that was never fixed for backward compatibility."}', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-mcq-002', 'Event loop output order', 'Async & Event Loop', 'Event Loop', 'hard', NULL, NULL, 5, 'Async & Event Loop', NULL, '["Async & Event Loop","javascript","mcq"]', 'mcq', 'javascript', '{"question":"What is the output order?\n```js\nconsole.log(\"1\");\nsetTimeout(() => console.log(\"2\"), 0);\nPromise.resolve().then(() => console.log(\"3\"));\nconsole.log(\"4\");\n```","options":["\"1, 2, 3, 4\"","\"1, 4, 3, 2\"","\"1, 4, 2, 3\"","\"1, 3, 2, 4\""],"correct_index":1,"explanation":"Sync code runs first (1, 4). Then microtasks (Promise → 3). Then macrotasks (setTimeout → 2). Microtasks always drain before the next macrotask."}', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-mcq-003', 'Closure in loop', 'Closures', 'Closures', 'medium', NULL, NULL, 5, 'Closures', NULL, '["Closures","javascript","mcq"]', 'mcq', 'javascript', '{"question":"What does this print?\n```js\nfor (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}\n```","options":["\"0, 1, 2\"","\"0, 0, 0\"","\"3, 3, 3\"","\"undefined x3\""],"correct_index":2,"explanation":"`var` is function-scoped, so all three closures reference the same `i`. By the time the timeouts run, the loop has finished and `i` is 3."}', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-mcq-004', 'Array equality', 'Variables & Scope', 'Type System', 'easy', NULL, NULL, 5, 'Variables & Scope', NULL, '["Variables & Scope","javascript","mcq"]', 'mcq', 'javascript', '{"question":"What does `[] == []` return?","options":["true","false","\"[]\"","TypeError"],"correct_index":1,"explanation":"Each `[]` creates a NEW array object. `==` compares object references, not contents. Two different objects are never equal."}', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-mcq-005', 'Promise.all behavior', 'Async & Event Loop', 'Promises', 'medium', NULL, NULL, 5, 'Async & Event Loop', NULL, '["Async & Event Loop","javascript","mcq"]', 'mcq', 'javascript', '{"question":"If one Promise in `Promise.all([p1, p2, p3])` rejects, what happens?","options":["Returns results of the others and undefined for rejected","Waits for all to settle, then returns all results","Immediately rejects with the first rejection reason","Continues and rejects at the end with all errors"],"correct_index":2,"explanation":"`Promise.all` short-circuits on the first rejection — it immediately rejects with that error. Other pending promises continue but their results are ignored. Use `Promise.allSettled` to wait for all."}', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-mcq-006', 'this in arrow function', 'Functions', 'this', 'medium', NULL, NULL, 5, 'Functions', NULL, '["Functions","javascript","mcq"]', 'mcq', 'javascript', '{"question":"What does this log?\n```js\nconst obj = {\n  name: \"Alice\",\n  greet: () => console.log(this.name)\n};\nobj.greet();\n```","options":["\"Alice\"","undefined","TypeError","\"\""],"correct_index":1,"explanation":"Arrow functions do NOT have their own `this`. They inherit `this` from the enclosing lexical scope — which here is the module/global scope, where `this.name` is undefined."}', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-mcq-007', 'Spread vs Rest', 'ES6+ Modern JS', 'Spread/Rest', 'easy', NULL, NULL, 5, 'ES6+ Modern JS', NULL, '["ES6+ Modern JS","javascript","mcq"]', 'mcq', 'javascript', '{"question":"What is the output?\n```js\nfunction sum(...args) {\n  return args.reduce((a, b) => a + b, 0);\n}\nconsole.log(sum(...[1, 2, 3]));\n```","options":["[1, 2, 3]","6","\"1,2,3\"","TypeError"],"correct_index":1,"explanation":"`...[1,2,3]` spreads the array into individual arguments. `...args` collects them as an array. `reduce` then sums them to 6."}', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-mcq-008', 'typeof vs instanceof', 'Type System', NULL, 'medium', NULL, NULL, 5, 'Type System', NULL, '["Type System","javascript","mcq"]', 'mcq', 'javascript', '{"question":"What does `\"hello\" instanceof String` return?","options":["true","false","TypeError","\"string\""],"correct_index":1,"explanation":"`instanceof` checks the prototype chain. `\"hello\"` is a primitive string, NOT a `String` object instance, so it returns `false`. `typeof \"hello\"` returns `\"string\"` (primitive check)."}', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-mcq-009', 'Optional chaining', 'ES6+ Modern JS', NULL, 'easy', NULL, NULL, 5, 'ES6+ Modern JS', NULL, '["ES6+ Modern JS","javascript","mcq"]', 'mcq', 'javascript', '{"question":"What is the value of `x`?\n```js\nconst obj = { a: { b: null } };\nconst x = obj?.a?.b?.c ?? \"default\";\n```","options":["\"default\"","null","undefined","TypeError"],"correct_index":0,"explanation":"`obj?.a?.b` is `null`. `null?.c` is `undefined` (optional chaining on null). `undefined ?? \"default\"` returns `\"default\"` because `??` checks for null/undefined."}', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-mcq-010', 'Object.keys vs for...in', 'Objects', 'Objects', 'medium', NULL, NULL, 5, 'Objects', NULL, '["Objects","javascript","mcq"]', 'mcq', 'javascript', '{"question":"What is the difference between `Object.keys(obj)` and `for...in`?","options":["No difference — both return the same properties","Object.keys returns only own enumerable properties; for...in also iterates inherited enumerable properties","for...in is async; Object.keys is sync","Object.keys includes non-enumerable properties; for...in does not"],"correct_index":1,"explanation":"`Object.keys()` returns only the object''s own enumerable properties as an array. `for...in` iterates ALL enumerable properties including inherited ones from the prototype chain."}', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-mcq-011', 'NaN comparison', 'Type System', NULL, 'easy', NULL, NULL, 5, 'Type System', NULL, '["Type System","javascript","mcq"]', 'mcq', 'javascript', '{"question":"What does `NaN === NaN` return?","options":["true","false","TypeError","undefined"],"correct_index":1,"explanation":"`NaN` is the only value in JavaScript not equal to itself. Use `Number.isNaN(value)` or `Object.is(value, NaN)` to check for NaN."}', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-mcq-012', 'Async/await error handling', 'Async & Event Loop', NULL, 'medium', NULL, NULL, 5, 'Async & Event Loop', NULL, '["Async & Event Loop","javascript","mcq"]', 'mcq', 'javascript', '{"question":"What happens if `await` is used on a rejected Promise without try/catch?","options":["The error is silently ignored","An UnhandledPromiseRejection is thrown","The function returns undefined","The next .then() handles it"],"correct_index":1,"explanation":"Without try/catch, an unhandled async error becomes an UnhandledPromiseRejection. In Node.js this can crash the process. Always wrap await in try/catch or attach .catch() to the async function call."}', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-mcq-013', 'Shallow vs deep clone', 'Objects', NULL, 'medium', NULL, NULL, 5, 'Objects', NULL, '["Objects","javascript","mcq"]', 'mcq', 'javascript', '{"question":"Which of these creates a DEEP clone of an object?","options":["`const copy = { ...original }`","`const copy = Object.assign({}, original)`","`const copy = JSON.parse(JSON.stringify(original))`","`const copy = original`"],"correct_index":2,"explanation":"Spread and `Object.assign` only do shallow copies — nested objects are still shared by reference. `JSON.parse(JSON.stringify(...))` does a deep clone but has limits: no functions, undefined, Date, RegExp, circular refs. Use `structuredClone()` (modern) for proper deep cloning."}', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-mcq-014', 'Generator return value', 'ES6+ Modern JS', NULL, 'hard', NULL, NULL, 5, 'ES6+ Modern JS', NULL, '["ES6+ Modern JS","javascript","mcq"]', 'mcq', 'javascript', '{"question":"What does the following print?\n```js\nfunction* gen() {\n  yield 1;\n  return 2;\n  yield 3;\n}\nconst g = gen();\nconsole.log(g.next());\nconsole.log(g.next());\nconsole.log(g.next());\n```","options":["{ value:1, done:false }, { value:2, done:false }, { value:3, done:false }","{ value:1, done:false }, { value:2, done:true }, { value:undefined, done:true }","{ value:1, done:false }, { value:3, done:false }, { value:undefined, done:true }","{ value:1, done:true }, { value:2, done:true }, { value:3, done:true }"],"correct_index":1,"explanation":"`return` in a generator sets `done: true`. `yield 3` after `return` is unreachable. After a generator is done, subsequent `next()` calls return `{ value: undefined, done: true }`."}', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('js-mcq-015', 'Prototype method vs own method', 'Prototypes', NULL, 'hard', NULL, NULL, 5, 'Prototypes', NULL, '["Prototypes","javascript","mcq"]', 'mcq', 'javascript', '{"question":"What is the output?\n```js\nfunction Animal(name) { this.name = name; }\nAnimal.prototype.speak = function() { return this.name; };\nconst a = new Animal(\"Dog\");\nconst b = new Animal(\"Cat\");\nconsole.log(a.speak === b.speak);\n```","options":["false","true","TypeError","undefined"],"correct_index":1,"explanation":"`speak` is defined on `Animal.prototype` — a single function shared by ALL instances. Both `a.speak` and `b.speak` reference the exact same function object on the prototype, so `===` comparison is `true`. This is more memory-efficient than defining methods in the constructor."}', 'internal');
