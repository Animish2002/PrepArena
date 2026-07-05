-- PrepArena seed: RxJS Theory + MCQ
-- Problems: 15
-- Generated: 2026-07-05T17:05:49.115Z
-- Apply (local):  npx wrangler d1 execute preParena-db --local  --file=src/scripts/sql/rxjs.sql
-- Apply (remote): npx wrangler d1 execute preParena-db --remote --file=src/scripts/sql/rxjs.sql
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('rxjs-theory-001', 'RxJS Core Concepts — Observable, Observer & Subscription', 'RxJS Basics', NULL, 'easy', NULL, NULL, 10, 'RxJS Basics', NULL, '["RxJS Basics","rxjs"]', 'theory', 'rxjs', '
## RxJS Core Concepts

### Observable
An Observable is a **lazy push collection** — it does nothing until subscribed to.

```typescript
import { Observable } from ''rxjs'';

// Creating an Observable manually
const obs$ = new Observable<number>(subscriber => {
  subscriber.next(1);
  subscriber.next(2);
  subscriber.next(3);
  subscriber.complete(); // signals end of stream

  // Cleanup logic (runs on unsubscribe/complete/error)
  return () => console.log(''Cleaned up'');
});

// Subscribe
const subscription = obs$.subscribe({
  next: value => console.log(value),
  error: err => console.error(err),
  complete: () => console.log(''Done''),
});

// Unsubscribe
subscription.unsubscribe();
```

### Cold vs Hot Observables
**Cold** — each subscriber gets its own independent execution (HTTP calls, timers):
```typescript
// Each subscriber triggers a NEW HTTP request
const users$ = this.http.get<User[]>(''/api/users'');
users$.subscribe(a => ...); // request 1
users$.subscribe(b => ...); // request 2 (separate!)
```

**Hot** — shared execution, subscribers observe the same stream (DOM events, WebSocket):
```typescript
// All subscribers see the same click events
const clicks$ = fromEvent(document, ''click'');
```

### Creation operators
```typescript
import { of, from, fromEvent, interval, timer, EMPTY, NEVER, throwError } from ''rxjs'';

of(1, 2, 3)           // emits 1, 2, 3 then completes
from([1, 2, 3])       // from array/iterable/Promise
fromEvent(el, ''click'') // DOM events
interval(1000)         // 0, 1, 2, ... every 1 second
timer(2000, 1000)      // wait 2s, then 0, 1, 2, ... every 1s
EMPTY                  // completes immediately
NEVER                  // never emits, never completes
throwError(() => new Error(''oops'')) // immediately errors
```

### Subjects (both Observable and Observer)
```typescript
// Subject — multicast, no initial value
const subject = new Subject<string>();
subject.subscribe(a => ...); // subscriber 1
subject.subscribe(b => ...); // subscriber 2
subject.next(''hello'');       // both subscribers receive ''hello''

// BehaviorSubject — holds current value
const name$ = new BehaviorSubject(''Alice'');
name$.subscribe(n => console.log(n)); // immediately receives ''Alice''
name$.next(''Bob'');                     // then ''Bob''
name$.getValue();                      // synchronous read

// ReplaySubject — replays N last emissions
const replay$ = new ReplaySubject<number>(3); // last 3
replay$.next(1); replay$.next(2); replay$.next(3); replay$.next(4);
replay$.subscribe(n => console.log(n)); // receives 2, 3, 4

// AsyncSubject — emits only the LAST value, on complete
const async$ = new AsyncSubject<number>();
async$.next(1); async$.next(2); async$.next(3);
async$.complete();
async$.subscribe(n => console.log(n)); // only 3
```
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('rxjs-theory-002', 'Transformation Operators — map, switchMap, mergeMap, concatMap, exhaustMap', 'Operators', NULL, 'hard', NULL, NULL, 20, 'Operators', NULL, '["Operators","rxjs"]', 'theory', 'rxjs', '
## Flattening Operators — The Most Important RxJS Concept

These operators handle "higher-order Observables" — Observables that emit Observables.

### switchMap — cancel previous, start new
```typescript
// USE FOR: search, navigation, HTTP requests where only latest matters
searchInput$.pipe(
  debounceTime(300),
  switchMap(query => this.http.get(`/search?q=${query}`))
  // If new query arrives before response, cancels previous request
).subscribe(results => this.results = results);
```

### mergeMap (flatMap) — run all concurrently
```typescript
// USE FOR: parallel operations where all results matter (file uploads)
fileUploads$.pipe(
  mergeMap(file => this.uploadService.upload(file)) // all run in parallel
).subscribe(uploadedFile => this.addToList(uploadedFile));

// With concurrency limit
mergeMap(file => upload(file), 3) // max 3 concurrent
```

### concatMap — queue, run one at a time
```typescript
// USE FOR: ordered operations, saving a queue of items
clicks$.pipe(
  concatMap(click => this.http.post(''/api/action'', click))
  // Queues requests — each waits for previous to complete
  // ORDER IS PRESERVED
).subscribe();
```

### exhaustMap — ignore new while previous runs
```typescript
// USE FOR: form submit, login button (prevent double-submit)
submitBtn$.pipe(
  exhaustMap(() => this.http.post(''/api/submit'', this.form.value))
  // While request is pending, all new clicks are IGNORED
).subscribe();
```

### Comparison table
| Operator | New arrives while previous running | Order |
|---|---|---|
| switchMap | Cancel previous, start new | Latest only |
| mergeMap | Run both concurrently | Any order |
| concatMap | Queue new, wait for previous | Preserved |
| exhaustMap | Ignore new | First |

### map, mapTo, pluck
```typescript
// map — transform each value
users$.pipe(map(users => users.filter(u => u.active)))

// from array to specific field
events$.pipe(map(e => e.target.value)) // equivalent of old pluck
```

### scan — accumulate like reduce
```typescript
// Shopping cart: accumulate items
addItem$.pipe(
  scan((cart, item) => [...cart, item], [])
).subscribe(cart => this.cart = cart);

// Running total
clicks$.pipe(
  scan(count => count + 1, 0)
).subscribe(count => console.log(''Clicked'', count, ''times''));
```
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('rxjs-theory-003', 'Filtering & Combination Operators', 'Operators', NULL, 'medium', NULL, NULL, 15, 'Operators', NULL, '["Operators","rxjs"]', 'theory', 'rxjs', '
## Filtering & Combination Operators

### Filtering operators
```typescript
// filter — pass through conditionally
numbers$.pipe(filter(n => n % 2 === 0)) // only even

// take/skip
source$.pipe(take(3))        // complete after 3 emissions
source$.pipe(skip(2))        // skip first 2
source$.pipe(takeWhile(n => n < 10))  // complete when condition false
source$.pipe(skipWhile(n => n < 10)) // skip until condition false
source$.pipe(takeLast(2))    // emit last 2 values on complete
source$.pipe(last())         // emit only last value on complete
source$.pipe(first())        // emit only first value then complete

// takeUntil — complete when notifier emits (critical for cleanup)
source$.pipe(
  takeUntil(this.destroy$) // complete when destroy$ emits
)

// distinctUntilChanged — skip consecutive duplicates
source$.pipe(
  distinctUntilChanged()
  // or with comparator:
  distinctUntilChanged((a, b) => a.id === b.id)
)

// debounceTime / throttleTime
input$.pipe(debounceTime(300))   // wait 300ms of silence
scroll$.pipe(throttleTime(100))  // emit at most every 100ms

// debounce — dynamic window
source$.pipe(debounce(() => interval(300)))
```

### Combination operators
```typescript
// combineLatest — emit when ANY source emits, with latest from each
// Starts emitting only when ALL sources have emitted at least once
combineLatest([user$, settings$, theme$]).pipe(
  map(([user, settings, theme]) => ({ user, settings, theme }))
).subscribe(combined => this.render(combined));

// withLatestFrom — combine with latest from another WITHOUT triggering
// Primary observable drives emission
clicks$.pipe(
  withLatestFrom(this.user$),
  map(([click, user]) => ({ click, user }))
)

// zip — pair values by index (strict synchronization)
zip([a$, b$]).subscribe(([a, b]) => ...) // waits for both to emit before pairing

// forkJoin — like Promise.all, waits for ALL to COMPLETE
forkJoin({
  user: this.http.get<User>(''/api/me''),
  config: this.http.get<Config>(''/api/config''),
}).subscribe(({ user, config }) => this.init(user, config));

// merge — merge multiple observables
merge(click$, keydown$, touchstart$).subscribe(event => handle(event));

// race — first one to emit wins, others unsubscribed
race([source1$, source2$, source3$]).subscribe(first => ...)
```

### startWith, endWith
```typescript
// Emit initial value before source
data$.pipe(startWith([])) // useful for initial state

// Example: loading state pattern
this.http.get(''/api/data'').pipe(
  map(data => ({ status: ''success'', data })),
  startWith({ status: ''loading'', data: null }),
  catchError(err => of({ status: ''error'', data: null, err }))
)
```
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('rxjs-theory-004', 'Error Handling in RxJS', 'Error Handling', NULL, 'hard', NULL, NULL, 20, 'Error Handling', NULL, '["Error Handling","rxjs"]', 'theory', 'rxjs', '
## RxJS Error Handling

### The fundamental problem
When an Observable errors, it **terminates** — no more emissions.

```typescript
// Without error handling — stream dies on error
this.http.get(''/api/data'').subscribe({
  next: data => ...,
  error: err => console.error(err) // stream is now dead
});
```

### catchError — recover from errors
```typescript
this.http.get<User[]>(''/api/users'').pipe(
  catchError(err => {
    // Must return an Observable!
    if (err.status === 404) return of([]);      // return empty
    if (err.status === 503) return EMPTY;       // complete silently
    return throwError(() => new Error(''Failed'')); // re-throw
  })
)
```

### retry & retryWhen
```typescript
// Simple retry
this.http.get(''/api/data'').pipe(
  retry(3) // retry up to 3 times on error
)

// Exponential backoff
this.http.get(''/api/data'').pipe(
  retry({
    count: 5,
    delay: (error, retryCount) =>
      timer(Math.pow(2, retryCount) * 1000) // 2s, 4s, 8s, 16s, 32s
  })
)
```

### retryWhen (older API)
```typescript
source$.pipe(
  retryWhen(errors =>
    errors.pipe(
      delayWhen((_, index) => timer(index * 1000)),
      take(3) // only retry 3 times
    )
  )
)
```

### finalize — always runs (like finally)
```typescript
this.http.get(''/api/data'').pipe(
  tap(() => this.loading = true),
  finalize(() => this.loading = false) // runs on complete OR error
)
```

### Error-safe patterns
```typescript
// Pattern: loading/success/error state
interface LoadState<T> {
  status: ''idle'' | ''loading'' | ''success'' | ''error'';
  data: T | null;
  error: string | null;
}

const users$ = this.http.get<User[]>(''/api/users'').pipe(
  map(data => ({ status: ''success'' as const, data, error: null })),
  catchError(err => of({ status: ''error'' as const, data: null, error: err.message })),
  startWith({ status: ''loading'' as const, data: null, error: null })
);
```
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('rxjs-theory-005', 'Subjects Deep Dive & Multicasting', 'Subjects', NULL, 'hard', NULL, NULL, 20, 'Subjects', NULL, '["Subjects","rxjs"]', 'theory', 'rxjs', '
## Subjects & Multicasting

### Subject internals
A Subject is both an Observable and an Observer — it maintains a list of subscribers and multicasts emissions to all of them.

```typescript
// Manual multicast
const subject = new Subject<Event>();

// 3 subscribers to the same subject
const s1 = subject.subscribe(e => updateUI(e));
const s2 = subject.subscribe(e => logEvent(e));
const s3 = subject.subscribe(e => analytics.track(e));

// All 3 receive this emission
subject.next(clickEvent);
```

### share operator — automate multicasting
```typescript
// Without share: each subscriber triggers separate HTTP request (cold)
const users$ = this.http.get<User[]>(''/api/users'');

// With share: single HTTP request, multiple subscribers
const sharedUsers$ = this.http.get<User[]>(''/api/users'').pipe(
  share() // completes when all unsubscribe, then restarts on new subscribe
);

sharedUsers$.subscribe(a => ...); // one request for both
sharedUsers$.subscribe(b => ...);
```

### shareReplay — replay to late subscribers
```typescript
// Cache latest value and replay to new subscribers
const config$ = this.http.get<Config>(''/api/config'').pipe(
  shareReplay({ bufferSize: 1, refCount: true })
  // bufferSize: 1 = cache 1 emission
  // refCount: true = reset cache when all unsubscribe
);

// Subscribe immediately
config$.subscribe(config => this.config = config);

// Subscribe 5 seconds later — still gets cached value without re-fetching
setTimeout(() => config$.subscribe(config => ...), 5000);
```

### BehaviorSubject as state store
```typescript
@Injectable({ providedIn: ''root'' })
class UserStore {
  private readonly _user$ = new BehaviorSubject<User | null>(null);

  // Expose as Observable — prevent external .next() calls
  readonly user$ = this._user$.asObservable();
  readonly isLoggedIn$ = this.user$.pipe(map(u => !!u));
  readonly name$ = this.user$.pipe(map(u => u?.name ?? ''Guest''));

  setUser(user: User) { this._user$.next(user); }
  clearUser() { this._user$.next(null); }
  getSnapshot() { return this._user$.getValue(); }
}
```

### connectable (publish/connect)
```typescript
// Manually control when multicast starts
const multicast$ = connectable(source$, { connector: () => new Subject() });

// Subscribe before connecting
multicast$.subscribe(a => ...);
multicast$.subscribe(b => ...);

// Start the source (now both subscribers receive emissions)
const connection = multicast$.connect();
// Later: connection.unsubscribe() to stop
```
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('rxjs-theory-006', 'Schedulers & Custom Operators', 'Advanced RxJS', NULL, 'hard', NULL, NULL, 20, 'Advanced RxJS', NULL, '["Advanced RxJS","rxjs"]', 'theory', 'rxjs', '
## Schedulers & Custom Operators

### Schedulers — control execution context
```typescript
import { asyncScheduler, animationFrameScheduler, queueScheduler } from ''rxjs'';
import { observeOn, subscribeOn } from ''rxjs/operators'';

// asyncScheduler — setTimeout
of(1, 2, 3).pipe(
  observeOn(asyncScheduler) // callbacks run asynchronously
)

// animationFrameScheduler — requestAnimationFrame (smooth animations)
interval(0, animationFrameScheduler).pipe(
  map(() => performance.now())
).subscribe(time => updateAnimation(time));

// queueScheduler — synchronous, current tick queue
```

### Writing custom operators
An operator is just a function that takes an Observable and returns an Observable:

```typescript
// Custom operator: retry with exponential backoff
function retryWithBackoff<T>(maxAttempts = 3, baseMs = 1000) {
  return (source: Observable<T>): Observable<T> =>
    source.pipe(
      retryWhen(errors =>
        errors.pipe(
          scan((count, err) => {
            if (count >= maxAttempts) throw err;
            return count + 1;
          }, 0),
          delayWhen(count => timer(baseMs * Math.pow(2, count)))
        )
      )
    );
}

// Usage
this.http.get(''/api/data'').pipe(
  retryWithBackoff(3, 500)
)
```

```typescript
// Custom operator: log emissions with label
function debug<T>(label: string) {
  return (source: Observable<T>): Observable<T> =>
    source.pipe(
      tap({
        next: v => console.log(`[${label}] Next:`, v),
        error: e => console.error(`[${label}] Error:`, e),
        complete: () => console.log(`[${label}] Complete`),
      })
    );
}

// Custom operator: cache with TTL
function cacheFor<T>(ms: number) {
  let cache: T | null = null;
  let expiry = 0;
  return (source: Observable<T>): Observable<T> =>
    defer(() => {
      if (cache !== null && Date.now() < expiry) return of(cache);
      return source.pipe(
        tap(val => { cache = val; expiry = Date.now() + ms; })
      );
    });
}
```

### Higher-order mapping — when to use each
```typescript
// Marble diagram notation:
// source: -a--b--c-->
// inner:  -A-->  -B-->  -C-->

// switchMap: when c arrives, cancel A and B, start C
// -A--B--C--> only C values

// mergeMap: run all concurrently
// -A--B--C--> values from A, B, C interleaved

// concatMap: queue — C waits for B, B waits for A
// -A------B------C-->

// exhaustMap: while A is running, ignore B and C
// -A-->
```
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('rxjs-theory-007', 'RxJS Patterns in Real Applications', 'Patterns', NULL, 'hard', NULL, NULL, 20, 'Patterns', NULL, '["Patterns","rxjs"]', 'theory', 'rxjs', '
## RxJS Real-World Patterns

### Search with debounce + cancellation
```typescript
class SearchComponent {
  searchControl = new FormControl('''');

  results$ = this.searchControl.valueChanges.pipe(
    startWith(''''),
    debounceTime(300),
    distinctUntilChanged(),
    filter(q => q !== null && q.length >= 2), // minimum 2 chars
    switchMap(q =>
      this.searchService.search(q).pipe(
        catchError(() => of([]))
      )
    ),
    shareReplay(1)
  );
}
```

### Polling with refresh
```typescript
// Poll every 30s, or immediately when refresh$ emits
const refresh$ = new Subject<void>();

const data$ = merge(
  interval(30_000).pipe(startWith(0)), // poll immediately then every 30s
  refresh$
).pipe(
  switchMap(() => this.http.get<Data>(''/api/data'')),
  shareReplay(1)
);
```

### Optimistic updates
```typescript
class TodoService {
  private todos$ = new BehaviorSubject<Todo[]>([]);

  toggleTodo(id: string) {
    const current = this.todos$.getValue();
    const optimistic = current.map(t => t.id === id ? { ...t, done: !t.done } : t);
    this.todos$.next(optimistic); // update UI immediately

    return this.http.patch(`/api/todos/${id}`, { done: !current.find(t => t.id === id)!.done }).pipe(
      catchError(err => {
        this.todos$.next(current); // rollback on error
        return throwError(() => err);
      })
    );
  }
}
```

### WebSocket management
```typescript
function createWebSocketObservable(url: string) {
  return new Observable<MessageEvent>(subscriber => {
    const ws = new WebSocket(url);
    ws.onopen = () => console.log(''Connected'');
    ws.onmessage = msg => subscriber.next(msg);
    ws.onerror = err => subscriber.error(err);
    ws.onclose = () => subscriber.complete();
    return () => ws.close();
  }).pipe(
    retry({ delay: (_, count) => timer(Math.min(30_000, 1000 * Math.pow(2, count))) }),
    share()
  );
}
```

### takeUntil destroy pattern (Angular)
```typescript
class MyComponent implements OnDestroy {
  private destroy$ = new Subject<void>();

  ngOnInit() {
    // All subscriptions auto-cancel on destroy
    interval(1000).pipe(
      takeUntil(this.destroy$)
    ).subscribe(tick => this.tick = tick);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### State machine with scan
```typescript
type State = ''idle'' | ''loading'' | ''success'' | ''error'';
type Event = { type: ''FETCH'' } | { type: ''SUCCESS''; data: any } | { type: ''ERROR''; error: Error };

function stateMachine(state: State, event: Event): State {
  switch (`${state}:${event.type}`) {
    case ''idle:FETCH'': return ''loading'';
    case ''loading:SUCCESS'': return ''success'';
    case ''loading:ERROR'': return ''error'';
    case ''error:FETCH'': return ''loading'';
    default: return state;
  }
}

events$.pipe(
  scan(stateMachine, ''idle'' as State)
).subscribe(state => this.state = state);
```
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('rxjs-mcq-001', 'Cold vs Hot observable', 'RxJS Basics', NULL, 'medium', NULL, NULL, 5, 'RxJS Basics', NULL, '["RxJS Basics","rxjs","mcq"]', 'mcq', 'rxjs', '{"question":"Which of the following is a HOT observable?","options":["`of(1, 2, 3)`","`this.http.get(\"/api/data\")`","`fromEvent(document, \"click\")`","`new Observable(subscriber => subscriber.next(1))`"],"correct_index":2,"explanation":"`fromEvent` is hot — DOM events happen independently of subscribers. All subscribers share the same stream of events. `of`, `http.get`, and `new Observable` are cold — each subscriber gets its own independent execution."}', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('rxjs-mcq-002', 'switchMap cancellation', 'Operators', NULL, 'hard', NULL, NULL, 5, 'Operators', NULL, '["Operators","rxjs","mcq"]', 'mcq', 'rxjs', '{"question":"You use `switchMap` to make an HTTP request on each keypress. What happens when the user presses a key while the previous request is still pending?","options":["Both requests complete and results are merged","The new request waits in a queue until the previous completes","The previous request is cancelled (unsubscribed) and a new one starts","The new keypress is ignored until the previous request completes"],"correct_index":2,"explanation":"`switchMap` \"switches\" to the new inner Observable by unsubscribing from the previous one. For HTTP requests (which are Observables), Angular''s HttpClient cancels the in-flight request via AbortController when unsubscribed. This prevents race conditions in search inputs."}', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('rxjs-mcq-003', 'BehaviorSubject initial value', 'Subjects', NULL, 'easy', NULL, NULL, 5, 'Subjects', NULL, '["Subjects","rxjs","mcq"]', 'mcq', 'rxjs', '{"question":"What does a new subscriber receive immediately upon subscribing to a `BehaviorSubject(\"initial\")`?","options":["Nothing — it waits for the next emission","\"initial\"","An error because no value was emitted yet","undefined"],"correct_index":1,"explanation":"BehaviorSubject requires an initial value and ALWAYS emits the current value to new subscribers immediately upon subscription. This is its key difference from plain Subject (which only emits future values)."}', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('rxjs-mcq-004', 'shareReplay purpose', 'Subjects', NULL, 'hard', NULL, NULL, 5, 'Subjects', NULL, '["Subjects","rxjs","mcq"]', 'mcq', 'rxjs', '{"question":"You have `const data$ = http.get(\"/api/config\").pipe(shareReplay(1))`. Two components subscribe. How many HTTP requests are made?","options":["2 — one per subscriber","1 — the response is cached and replayed to the second subscriber","0 — shareReplay prevents requests","Depends on subscription timing"],"correct_index":1,"explanation":"`shareReplay(1)` multicasts the source and caches the last 1 emission. The first subscriber triggers one HTTP request. The second subscriber immediately receives the cached response without a new request. This is the standard pattern for caching configuration/reference data."}', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('rxjs-mcq-005', 'combineLatest vs withLatestFrom', 'Operators', NULL, 'hard', NULL, NULL, 5, 'Operators', NULL, '["Operators","rxjs","mcq"]', 'mcq', 'rxjs', '{"question":"What is the key difference between `combineLatest([a$, b$])` and `a$.pipe(withLatestFrom(b$))`?","options":["No difference — they produce the same result","combineLatest emits when EITHER source emits; withLatestFrom only emits when the primary (a$) emits","withLatestFrom waits for both sources to complete","combineLatest requires all sources to emit at the same time"],"correct_index":1,"explanation":"`combineLatest` emits whenever ANY source emits (requires all to have emitted at least once). `withLatestFrom` only emits when the PRIMARY observable (a$) emits — b$ is sampled but doesn''t trigger emissions. Use withLatestFrom when clicks should trigger an action using the current state of another observable."}', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('rxjs-mcq-006', 'takeUntil vs unsubscribe', 'Operators', NULL, 'medium', NULL, NULL, 5, 'Operators', NULL, '["Operators","rxjs","mcq"]', 'mcq', 'rxjs', '{"question":"Why is `takeUntil(this.destroy$)` preferred over manually calling `subscription.unsubscribe()` in Angular?","options":["takeUntil is faster than unsubscribe","takeUntil also cancels inner observables from switchMap/mergeMap; single point of cleanup for multiple subscriptions","unsubscribe does not work with HTTP observables","takeUntil is required for OnPush change detection"],"correct_index":1,"explanation":"`takeUntil` completes the observable chain cleanly — it also completes any inner Observables created by flattening operators. With multiple subscriptions, one `destroy$.next()` completes all of them. Manual unsubscribe requires tracking every subscription individually and doesn''t propagate completion through the pipeline."}', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('rxjs-mcq-007', 'tap operator purpose', 'Operators', NULL, 'easy', NULL, NULL, 5, 'Operators', NULL, '["Operators","rxjs","mcq"]', 'mcq', 'rxjs', '{"question":"What is the purpose of the `tap` operator?","options":["Transform values in the stream","Perform side effects (logging, debugging) without modifying the stream","Filter values from the stream","Combine multiple observables"],"correct_index":1,"explanation":"`tap` (formerly `do`) performs side effects for each emission WITHOUT modifying the values that pass through. It''s transparent — values flow through unchanged. Common uses: logging, debugging, setting loading state, analytics. Never use tap to transform values — use map instead."}', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('rxjs-mcq-008', 'forkJoin behavior on error', 'Operators', NULL, 'hard', NULL, NULL, 5, 'Operators', NULL, '["Operators","rxjs","mcq"]', 'mcq', 'rxjs', '{"question":"You have `forkJoin([requestA$, requestB$, requestC$])`. If requestB$ errors, what happens?","options":["Returns results from A and C, and null for B","Waits for A and C to complete, then emits the error","Immediately errors — A and C are cancelled","Retries requestB$ automatically"],"correct_index":2,"explanation":"`forkJoin` errors immediately if ANY source errors, similar to `Promise.all`. The other observables are cancelled (unsubscribed). If you want to handle errors per-source, use `catchError` on each individual observable before passing to forkJoin."}', 'internal');
