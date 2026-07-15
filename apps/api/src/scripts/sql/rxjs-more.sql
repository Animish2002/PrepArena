-- PrepArena seed: RxJS Extended Theory + MCQ
-- Problems: 17
-- Generated: 2026-07-15T16:03:25.626Z
-- Apply (remote): npx wrangler d1 execute preParena-db --remote --file=src/scripts/sql/rxjs-more.sql
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('rxjs-ext-t-001', 'Observable vs Promise — key differences', 'Observables', NULL, 'medium', NULL, NULL, 15, 'Observables', NULL, '["observables","rxjs"]', 'theory', 'rxjs', '
## Observable vs Promise

| Feature | Promise | Observable |
|---------|---------|------------|
| Values | Single | 0 to ∞ |
| Lazy | ❌ executes immediately | ✅ executes on subscribe |
| Cancellable | ❌ | ✅ unsubscribe() |
| Operators | Limited | Rich (map, filter, switchMap…) |
| Multicast | ❌ | Subjects / shareReplay |
| Sync support | ❌ | ✅ (of, from sync) |

### Cold Observables
Execute for EACH subscriber independently:
```ts
const cold$ = new Observable(observer => {
  observer.next(Math.random()); // different value each subscription
  observer.complete();
});

cold$.subscribe(v => console.log(v)); // 0.42
cold$.subscribe(v => console.log(v)); // 0.87 (different execution)
```

### Creating Observables
```ts
// From values
of(1, 2, 3).subscribe(console.log); // 1, 2, 3

// From array
from([1, 2, 3]).subscribe(console.log);

// From Promise
from(fetch(''/api/data'')).pipe(switchMap(r => r.json())).subscribe();

// Timer
interval(1000).subscribe(n => console.log(n)); // 0, 1, 2... every second
timer(2000, 1000).subscribe();                  // starts after 2s, then every 1s

// From events
fromEvent(document, ''click'').subscribe(e => console.log(e.clientX));
```
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('rxjs-ext-t-002', 'flattening operators — mergeMap, switchMap, concatMap, exhaustMap', 'Observables', NULL, 'hard', NULL, NULL, 20, 'Observables', NULL, '["observables","rxjs"]', 'theory', 'rxjs', '
## Flattening Operators

All four map each source value to an inner Observable, but differ in how they handle overlapping inner subscriptions.

### switchMap — cancels previous inner (most common)
```ts
// Search: cancel previous request when user types
this.searchInput.valueChanges.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  switchMap(query => this.api.search(query)) // cancels in-flight request
).subscribe(results => this.results = results);
```

### mergeMap (flatMap) — concurrent, all run in parallel
```ts
// Upload all files concurrently
from(files).pipe(
  mergeMap(file => this.uploadFile(file))
).subscribe(result => this.onFileUploaded(result));
```

### concatMap — sequential, queues
```ts
// Process actions in order
actions$.pipe(
  concatMap(action => this.api.process(action))
).subscribe();
```

### exhaustMap — ignores new values while inner is active
```ts
// Prevent double-submit
submitButton.clicks.pipe(
  exhaustMap(() => this.api.submit(form)) // ignores clicks while submitting
).subscribe();
```

| Operator | Overlap strategy | Use-case |
|----------|-----------------|---------|
| switchMap | Cancel previous | Search, live queries |
| mergeMap | All concurrent | File uploads |
| concatMap | Queue in order | Sequential saves |
| exhaustMap | Ignore new | Login button, submit |
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('rxjs-ext-t-003', 'Pipeable operators — common patterns', 'Observables', NULL, 'medium', NULL, NULL, 15, 'Observables', NULL, '["observables","rxjs"]', 'theory', 'rxjs', '
## Core Pipeable Operators

### Transformation
```ts
source$.pipe(
  map(x => x * 2),                    // transform each value
  scan((acc, x) => acc + x, 0),       // running total (like reduce but streaming)
  buffer(interval(1000)),              // collect values, emit as array each second
  bufferCount(5),                      // emit arrays of 5
)
```

### Filtering
```ts
source$.pipe(
  filter(x => x > 0),
  distinctUntilChanged(),              // skip if same as previous
  debounceTime(300),                   // wait 300ms of silence
  throttleTime(100),                   // max one per 100ms
  take(5),                             // complete after 5 values
  takeUntil(destroy$),                 // complete when destroy$ emits
  takeWhile(x => x < 100),            // complete when condition false
  skip(2),                             // ignore first 2
  first(),                             // take first, complete
  last(),                              // buffer all, emit last on complete
)
```

### Error handling in pipe
```ts
source$.pipe(
  catchError(err => {
    logError(err);
    return of(defaultValue);           // recover with fallback
    // or: return throwError(() => err) // re-throw
    // or: return EMPTY;               // complete without value
  }),
  retry(3),                            // retry source up to 3 times
  retryWhen(errors$ =>                 // conditional retry
    errors$.pipe(delay(1000), take(3))
  ),
)
```

### Utility
```ts
source$.pipe(
  tap(x => console.log(''value:'', x)),  // side effects without altering stream
  finalize(() => cleanup()),           // runs on complete OR error OR unsubscribe
  share(),                             // multicast to multiple subscribers
  shareReplay(1),                      // multicast + cache last 1 value
)
```
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('rxjs-ext-m-001', 'switchMap vs mergeMap', 'Observables', NULL, 'hard', NULL, NULL, 5, 'Observables', NULL, '["observables","rxjs","mcq"]', 'mcq', 'rxjs', '{"question":"A user types in a search box. Each keystroke triggers an API call. Which operator should you use to ensure only the latest query''s result is used?","options":["mergeMap","concatMap","switchMap","exhaustMap"],"correct_index":2,"explanation":"switchMap cancels the previous inner Observable when a new value arrives. This prevents stale results from earlier queries from overwriting newer ones."}', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('rxjs-ext-m-002', 'Observable laziness', 'Observables', NULL, 'easy', NULL, NULL, 5, 'Observables', NULL, '["observables","rxjs","mcq"]', 'mcq', 'rxjs', '{"question":"When does a cold Observable start executing?","options":["When it is created with new Observable()","When subscribe() is called","When the first operator is added via pipe()","On the next event loop tick"],"correct_index":1,"explanation":"Observables are lazy — they do nothing until subscribe() is called. Each subscription starts a fresh, independent execution."}', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('rxjs-ext-t-004', 'Subject types — Subject, BehaviorSubject, ReplaySubject, AsyncSubject', 'Subjects', NULL, 'medium', NULL, NULL, 15, 'Subjects', NULL, '["subjects","rxjs"]', 'theory', 'rxjs', '
## RxJS Subject Types

A Subject is both an Observable and an Observer — you can push values into it AND subscribe to it. Subjects are HOT (multicast).

### Subject
No initial value. Only emits to subscribers active at time of emission.
```ts
const subject = new Subject<number>();
subject.subscribe(v => console.log(''A:'', v));
subject.next(1); // A: 1
subject.next(2); // A: 2
subject.subscribe(v => console.log(''B:'', v)); // subscribes AFTER 2
subject.next(3); // A: 3, B: 3 (B missed 1 and 2)
```

### BehaviorSubject
Has an initial value. New subscribers immediately get the CURRENT value.
```ts
const user$ = new BehaviorSubject<User | null>(null);

// Set value
this.authService.login(credentials).subscribe(user => user$.next(user));

// Read current value synchronously (without subscribing)
const currentUser = user$.getValue();

// Subscribe — get current value immediately
user$.subscribe(user => this.updateUI(user));
```

### ReplaySubject
Replays the last N values to new subscribers.
```ts
const replay$ = new ReplaySubject<string>(3); // buffer size 3
replay$.next(''a''); replay$.next(''b''); replay$.next(''c''); replay$.next(''d'');

replay$.subscribe(console.log); // immediately logs: b, c, d (last 3)
```

### AsyncSubject
Only emits the LAST value, and only on complete.
```ts
const async$ = new AsyncSubject<number>();
async$.next(1); async$.next(2); async$.next(3);
async$.subscribe(console.log);
async$.complete(); // logs: 3 (only the last value)
```

| Subject | Initial | Replay to late | Use-case |
|---------|---------|---------------|---------|
| Subject | ❌ | None | Events |
| BehaviorSubject | ✅ | Current (1) | App state |
| ReplaySubject | ❌ | Last N | Event log |
| AsyncSubject | ❌ | Last on complete | Single async result |
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('rxjs-ext-t-005', 'State management with BehaviorSubject — Angular service store', 'Subjects', NULL, 'medium', NULL, NULL, 15, 'Subjects', NULL, '["subjects","rxjs"]', 'theory', 'rxjs', '
## Service Store Pattern

BehaviorSubject is ideal for simple state stores in Angular services.

```ts
interface TodoState {
  items: Todo[];
  loading: boolean;
  error: string | null;
}

@Injectable({ providedIn: ''root'' })
export class TodoStore {
  private state$ = new BehaviorSubject<TodoState>({
    items: [], loading: false, error: null,
  });

  // Public read-only selectors
  readonly items$  = this.state$.pipe(map(s => s.items), distinctUntilChanged());
  readonly loading$ = this.state$.pipe(map(s => s.loading));
  readonly count$  = this.items$.pipe(map(items => items.length));

  // Private updater
  private update(partial: Partial<TodoState>) {
    this.state$.next({ ...this.state$.getValue(), ...partial });
  }

  // Actions
  load(): void {
    this.update({ loading: true });
    this.http.get<Todo[]>(''/api/todos'').subscribe({
      next: items => this.update({ items, loading: false }),
      error: err  => this.update({ error: err.message, loading: false }),
    });
  }

  add(text: string): void {
    this.http.post<Todo>(''/api/todos'', { text }).subscribe(todo =>
      this.update({ items: [...this.state$.getValue().items, todo] })
    );
  }
}

// Component
@Component({ ... })
export class TodosComponent {
  items$  = inject(TodoStore).items$;
  loading$ = inject(TodoStore).loading$;
}
```
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('rxjs-ext-m-003', 'BehaviorSubject initial value', 'Subjects', NULL, 'easy', NULL, NULL, 5, 'Subjects', NULL, '["subjects","rxjs","mcq"]', 'mcq', 'rxjs', '{"question":"What does a new subscriber to a BehaviorSubject receive immediately?","options":["Nothing — it waits for the next .next() call","The current value (or the initial value)","All values that were ever emitted","The last two values"],"correct_index":1,"explanation":"BehaviorSubject always has a current value and emits it synchronously to every new subscriber. This is its key difference from Subject."}', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('rxjs-ext-t-006', 'catchError, retry, retryWhen — resilient streams', 'Error Handling', NULL, 'hard', NULL, NULL, 20, 'Error Handling', NULL, '["error-handling","rxjs"]', 'theory', 'rxjs', '
## Error Handling in RxJS

### catchError
Catches errors in the pipeline. Must return a new Observable.
```ts
this.api.getData().pipe(
  catchError((err: HttpErrorResponse) => {
    if (err.status === 404) return of(null);           // recover
    if (err.status === 403) {
      this.router.navigate([''/forbidden'']);
      return EMPTY;                                     // terminate silently
    }
    return throwError(() => new Error(err.message));  // re-throw
  })
).subscribe();
```

### retry
Automatically re-subscribes on error (retries from the source):
```ts
this.api.getData().pipe(
  retry(3),        // retry up to 3 times immediately
).subscribe();

// With config (RxJS 7+)
retry({ count: 3, delay: 1000 })  // wait 1s between retries
```

### retryWhen with exponential backoff
```ts
import { retryWhen, delayWhen, timer, scan } from ''rxjs'';

function exponentialBackoff(maxRetries = 4, initialDelay = 1000) {
  return retryWhen(errors =>
    errors.pipe(
      scan((acc, err) => {
        if (acc >= maxRetries) throw err; // stop retrying
        return acc + 1;
      }, 0),
      delayWhen(attempt => timer(initialDelay * Math.pow(2, attempt)))
    )
  );
}

this.api.getData().pipe(exponentialBackoff(3, 500)).subscribe();
// Retries after 500ms, 1000ms, 2000ms, then throws
```
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('rxjs-ext-t-007', 'takeUntil pattern — managing subscriptions and preventing memory leaks', 'Error Handling', NULL, 'medium', NULL, NULL, 15, 'Error Handling', NULL, '["error-handling","rxjs"]', 'theory', 'rxjs', '
## Subscription Management

Failing to unsubscribe from long-lived Observables causes memory leaks.

### takeUntil (most common Angular pattern)
```ts
@Component({ ... })
export class DataComponent implements OnDestroy {
  private destroy$ = new Subject<void>();

  ngOnInit() {
    this.dataService.getLiveUpdates().pipe(
      takeUntil(this.destroy$)              // auto-unsubscribe on destroy
    ).subscribe(data => this.data = data);

    interval(1000).pipe(
      takeUntil(this.destroy$)
    ).subscribe(tick => this.tick = tick);
  }

  ngOnDestroy() {
    this.destroy$.next();  // trigger takeUntil
    this.destroy$.complete();
  }
}
```

### Angular 16+ — takeUntilDestroyed
```ts
import { takeUntilDestroyed } from ''@angular/core/rxjs-interop'';

@Component({ ... })
export class DataComponent {
  private destroyRef = inject(DestroyRef);

  constructor() {
    this.dataService.getLiveUpdates().pipe(
      takeUntilDestroyed(this.destroyRef)   // no need for manual ngOnDestroy
    ).subscribe(data => this.data = data);
  }
}
```

### async pipe (preferred)
The async pipe auto-unsubscribes when the component is destroyed:
```html
{{ data$ | async }}  <!-- no manual subscription needed -->
```

### When you MUST manually subscribe
- Programmatic navigation
- Side effects that aren''t bound to template values
- Subscriptions in services
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('rxjs-ext-m-004', 'catchError return type', 'Error Handling', NULL, 'medium', NULL, NULL, 5, 'Error Handling', NULL, '["error-handling","rxjs","mcq"]', 'mcq', 'rxjs', '{"question":"What must catchError''s callback return?","options":["The original value that caused the error","An Observable (a new stream to continue with)","A Promise","null or undefined to swallow the error"],"correct_index":1,"explanation":"catchError receives the error and must return an Observable. Returning of(fallback) recovers, EMPTY completes, throwError() propagates. You cannot return a plain value."}', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('rxjs-ext-t-008', 'Combining observables — combineLatest, forkJoin, zip, withLatestFrom', 'Combining Streams', NULL, 'hard', NULL, NULL, 20, 'Combining Streams', NULL, '["combining-streams","rxjs"]', 'theory', 'rxjs', '
## Combining Observables

### combineLatest
Emits when ANY source emits, combining the latest value from EACH source. All sources must have emitted at least once.
```ts
combineLatest([
  this.filters$,
  this.sortOrder$,
  this.page$,
]).pipe(
  switchMap(([filters, sort, page]) =>
    this.api.getItems({ filters, sort, page })
  )
).subscribe(items => this.items = items);
```

### forkJoin
Waits for ALL sources to complete, then emits the LAST value from each. Like Promise.all.
```ts
forkJoin({
  user:  this.userService.getCurrentUser(),
  roles: this.authService.getRoles(),
  prefs: this.prefService.getPreferences(),
}).subscribe(({ user, roles, prefs }) => {
  // all three loaded
});
```

### zip
Pairs values by index. Emits each time all sources have produced a new value at the same index.
```ts
zip(letters$, numbers$).subscribe(([letter, number]) => {
  console.log(letter + number); // a1, b2, c3...
});
```

### withLatestFrom
Combines current source value with the latest value from another (that other doesn''t drive emissions):
```ts
saveButton.clicks.pipe(
  withLatestFrom(this.formData$),  // grab latest form state on each click
  switchMap(([_, formData]) => this.api.save(formData))
).subscribe();
```

| Operator | Emits when | Completes |
|----------|-----------|---------|
| combineLatest | Any emits | When all complete |
| forkJoin | All complete | Immediately |
| zip | All have new value | Any completes |
| withLatestFrom | Source emits | With source |
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('rxjs-ext-t-009', 'startWith, pairwise, scan — stateful operators', 'Combining Streams', NULL, 'medium', NULL, NULL, 15, 'Combining Streams', NULL, '["combining-streams","rxjs"]', 'theory', 'rxjs', '
## Stateful Stream Operators

### scan — running accumulator
```ts
// Running total
clicks$.pipe(
  scan((total, _click) => total + 1, 0)
).subscribe(count => this.clickCount = count);

// Collect items into growing array
websocket$.pipe(
  scan((messages, newMsg) => [...messages, newMsg], [] as Message[]),
  map(msgs => msgs.slice(-50)) // keep last 50
).subscribe(messages => this.messages = messages);
```

### pairwise — compare consecutive values
```ts
// Detect increase vs decrease
prices$.pipe(
  pairwise(),
  map(([prev, curr]) => ({ curr, diff: curr - prev, up: curr > prev }))
).subscribe(priceUpdate => this.updateIndicator(priceUpdate));
```

### startWith — emit initial value
```ts
// Ensure immediate emission with default
this.data$.pipe(
  startWith(null) // emit null immediately while loading
).subscribe(data => {
  this.loading = data === null;
  this.data = data;
});
```

### bufferTime / bufferCount — batch processing
```ts
// Batch websocket messages for performance
websocket$.pipe(
  bufferTime(200)              // emit array every 200ms
).subscribe(batch => {
  if (batch.length) this.processBatch(batch);
});
```
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('rxjs-ext-m-005', 'combineLatest behaviour', 'Combining Streams', NULL, 'medium', NULL, NULL, 5, 'Combining Streams', NULL, '["combining-streams","rxjs","mcq"]', 'mcq', 'rxjs', '{"question":"combineLatest([a$, b$]) — when does it emit its first value?","options":["As soon as either a$ or b$ emits","Only after both a$ and b$ have each emitted at least one value","When both a$ and b$ complete","On every emission from a$ only"],"correct_index":1,"explanation":"combineLatest waits until ALL source Observables have emitted at least one value before it emits. After that, it emits whenever ANY source emits."}', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('rxjs-ext-t-010', 'shareReplay — multicasting and caching HTTP requests', 'Real-world Patterns', NULL, 'medium', NULL, NULL, 15, 'Real-world Patterns', NULL, '["real-world-patterns","rxjs"]', 'theory', 'rxjs', '
## shareReplay

### Problem: cold Observables re-execute on each subscription
```ts
// ❌ Every async pipe subscription triggers a new HTTP request!
const user$ = this.http.get<User>(''/api/me'');
// In template:
// {{ (user$ | async)?.name }}  → triggers HTTP
// {{ (user$ | async)?.email }} → triggers HTTP again!
```

### Solution: shareReplay
```ts
// ✅ Cache + multicast
readonly currentUser$ = this.http.get<User>(''/api/me'').pipe(
  shareReplay(1) // replay latest to new subscribers, shared execution
);

// Now all async pipe usages share ONE request
// New subscribers get the cached value immediately
```

### In a service (with reset capability)
```ts
@Injectable({ providedIn: ''root'' })
export class AuthService {
  private user$ = new BehaviorSubject<Observable<User>>(this.loadUser());

  readonly currentUser$ = this.user$.pipe(
    switchMap(user$ => user$),
    shareReplay(1)
  );

  private loadUser() {
    return this.http.get<User>(''/api/me'').pipe(shareReplay(1));
  }

  refresh() {
    this.user$.next(this.loadUser()); // invalidate cache
  }
}
```

### refCount (important!)
`shareReplay({ bufferSize: 1, refCount: true })` — unsubscribes from source when no subscribers remain (prevents memory leaks in long-lived services). `refCount: false` (default) keeps source alive forever.
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('rxjs-ext-t-011', 'RxJS in Angular — unsubscribe strategies comparison', 'Real-world Patterns', NULL, 'medium', NULL, NULL, 15, 'Real-world Patterns', NULL, '["real-world-patterns","rxjs"]', 'theory', 'rxjs', '
## Unsubscribe Strategies

### 1. async pipe (best for template bindings)
```html
<!-- Auto-unsubscribes on component destroy -->
<div *ngIf="user$ | async as user">{{ user.name }}</div>
```

### 2. takeUntilDestroyed (Angular 16+, best for component logic)
```ts
export class MyComponent {
  private destroyRef = inject(DestroyRef);

  ngOnInit() {
    someStream$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(doSomething);
  }
}
```

### 3. takeUntil + Subject (legacy, still widely used)
```ts
private destroy$ = new Subject<void>();

ngOnDestroy() { this.destroy$.next(); this.destroy$.complete(); }
```

### 4. Subscription management (for when you need subscription references)
```ts
private subs = new Subscription();

ngOnInit() {
  this.subs.add(stream1$.subscribe(handler1));
  this.subs.add(stream2$.subscribe(handler2));
}

ngOnDestroy() { this.subs.unsubscribe(); }
```

### What NOT to do
```ts
// ❌ Unsubscribing in ngOnDestroy manually per subscription = error-prone
this.sub1.unsubscribe();
this.sub2.unsubscribe();
// Forgot sub3 = memory leak
```
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('rxjs-ext-m-006', 'shareReplay purpose', 'Real-world Patterns', NULL, 'medium', NULL, NULL, 5, 'Real-world Patterns', NULL, '["real-world-patterns","rxjs","mcq"]', 'mcq', 'rxjs', '{"question":"Why would you use shareReplay(1) on an HTTP request observable?","options":["To make the request retry once on failure","To share a single HTTP execution among multiple subscribers and cache the result","To delay the HTTP request by 1 second","To make the observable hot"],"correct_index":1,"explanation":"shareReplay(1) multicasts the execution (so N subscribers trigger only 1 HTTP request) and caches the latest result so late subscribers get it immediately without a new request."}', 'internal');
