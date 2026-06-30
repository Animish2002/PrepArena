import { drizzle } from 'drizzle-orm/d1'
import { problems } from '../db/schema'

type Row = typeof problems.$inferInsert

function t(
  id: string, title: string, topic: string, difficulty: 'easy'|'medium'|'hard',
  content: string
): Row {
  return {
    id, title, topic, subtopic: null, difficulty,
    platform: null, platformLink: null,
    estimatedMinutes: difficulty === 'easy' ? 10 : difficulty === 'medium' ? 15 : 20,
    sheet: topic, problemNumber: null,
    tags: JSON.stringify([topic, 'angular']),
    questionType: 'theory', subject: 'angular',
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
    tags: JSON.stringify([topic, 'angular', 'mcq']),
    questionType: 'mcq', subject: 'angular',
    content: JSON.stringify({ question, options, correct_index, explanation }),
    contentSource: 'internal',
  }
}

const THEORY: Row[] = [

t('angular-theory-001', 'Angular Architecture — Modules, Components & Services', 'Angular Basics', 'easy', `
## Angular Architecture

### Core building blocks
1. **Modules (NgModule)** — group related functionality
2. **Components** — UI building blocks with template + logic
3. **Services** — business logic, data access (injectable singletons)
4. **Directives** — extend HTML behavior
5. **Pipes** — transform data in templates

### Component anatomy
\`\`\`typescript
@Component({
  selector: 'app-hero',       // how it's used in templates
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush, // performance
})
export class HeroComponent implements OnInit, OnDestroy {
  @Input() hero: Hero;                    // receive data from parent
  @Output() heroSelected = new EventEmitter<Hero>(); // emit to parent

  private subscription: Subscription;

  constructor(private heroService: HeroService) {} // DI

  ngOnInit() {
    this.subscription = this.heroService.heroes$.subscribe(...);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe(); // prevent memory leaks
  }

  selectHero() {
    this.heroSelected.emit(this.hero);
  }
}
\`\`\`

### NgModule (legacy, still common)
\`\`\`typescript
@NgModule({
  declarations: [AppComponent, HeroComponent], // components/pipes/directives
  imports: [BrowserModule, RouterModule, FormsModule],
  providers: [HeroService],                    // services
  exports: [HeroComponent],                    // for other modules
  bootstrap: [AppComponent],
})
export class AppModule {}
\`\`\`

### Standalone components (Angular 14+, preferred)
\`\`\`typescript
@Component({
  standalone: true,
  selector: 'app-hero',
  imports: [CommonModule, RouterModule], // import directly
  template: '...',
})
export class HeroComponent {}
\`\`\`

### Component communication
\`\`\`typescript
// Parent → Child: @Input()
<app-child [data]="parentData" />

// Child → Parent: @Output() EventEmitter
<app-child (dataChanged)="onDataChanged($event)" />

// Unrelated components: Service with Subject/BehaviorSubject
@Injectable({ providedIn: 'root' })
class StateService {
  private state$ = new BehaviorSubject<State>(initial);
  state = this.state$.asObservable();
  setState(s: State) { this.state$.next(s); }
}
\`\`\`
`),

t('angular-theory-002', 'Dependency Injection — Providers & Hierarchical Injectors', 'Dependency Injection', 'hard', `
## Angular Dependency Injection

### How DI works
Angular maintains a tree of **injectors** that mirrors the component tree. When a component requests a dependency, Angular walks up the injector tree until it finds a provider.

### Provider scopes
\`\`\`typescript
// Root scope — single instance for entire app (singleton)
@Injectable({ providedIn: 'root' })
class AuthService {}

// Module scope — single instance per module (lazy loaded modules get their own)
@NgModule({ providers: [LogService] })
class FeatureModule {}

// Component scope — new instance for each component (and its children)
@Component({ providers: [FormService] })
class MyFormComponent {}
\`\`\`

### Injection tokens (non-class dependencies)
\`\`\`typescript
const API_URL = new InjectionToken<string>('API_URL');

// Provide:
{ provide: API_URL, useValue: 'https://api.example.com' }

// Inject:
constructor(@Inject(API_URL) private apiUrl: string) {}

// Modern syntax (Angular 14+):
const apiUrl = inject(API_URL);
\`\`\`

### Provider types
\`\`\`typescript
// useClass — provide alternative implementation (mock for testing)
{ provide: AuthService, useClass: MockAuthService }

// useValue — provide a constant
{ provide: BASE_URL, useValue: environment.apiUrl }

// useFactory — dynamic provider
{ provide: Logger, useFactory: (env: Env) => env.production ? new ProdLogger() : new DevLogger(), deps: [ENV] }

// useExisting — alias
{ provide: NewService, useExisting: OldService }
\`\`\`

### inject() function (Angular 14+)
Can be used outside constructor in functions/hooks:
\`\`\`typescript
@Component({ ... })
class UserComponent {
  // No constructor needed!
  private userService = inject(UserService);
  private router = inject(Router);
}

// In standalone functions (like custom hooks equivalent)
function useCurrentUser() {
  const auth = inject(AuthService);
  return toSignal(auth.currentUser$);
}
\`\`\`

### Multi-providers (extend, not replace)
\`\`\`typescript
const VALIDATORS = new InjectionToken<Validator[]>('VALIDATORS');

// Multiple providers for same token — get an array
{ provide: VALIDATORS, useClass: EmailValidator, multi: true }
{ provide: VALIDATORS, useClass: PhoneValidator, multi: true }

// Inject all validators
constructor(@Inject(VALIDATORS) private validators: Validator[]) {}
\`\`\`
`),

t('angular-theory-003', 'Change Detection — Default vs OnPush', 'Change Detection', 'hard', `
## Angular Change Detection

### How change detection works
After every async event (click, setTimeout, XHR), Angular's Zone.js triggers change detection. Angular walks the component tree checking if bindings have changed.

### Default strategy
Every component is checked on every change detection cycle — safe but slow for large trees.

### OnPush strategy
\`\`\`typescript
@Component({
  selector: 'app-user-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: \`<div>{{ user.name }}</div>\`
})
export class UserCardComponent {
  @Input() user: User; // MUST pass new object reference to trigger
}
\`\`\`

With OnPush, Angular skips re-checking unless:
1. A new **reference** is passed as @Input (object/array must be replaced, not mutated)
2. An **event** fires inside the component
3. An **Observable** subscribed with \`async\` pipe emits
4. \`markForCheck()\` or \`detectChanges()\` is called manually

### Immutability is required with OnPush
\`\`\`typescript
// WRONG: mutating object — OnPush won't detect it
this.user.name = 'Alice'; // same reference → no update!

// RIGHT: create new object
this.user = { ...this.user, name: 'Alice' }; // new reference → detected
\`\`\`

### Manual change detection
\`\`\`typescript
constructor(private cdr: ChangeDetectorRef) {}

// Force check this component + ancestors
markForCheck() { this.cdr.markForCheck(); }

// Manually trigger change detection on THIS component only
detectChanges() { this.cdr.detectChanges(); }

// Detach from change detection tree completely
detach() { this.cdr.detach(); }
reattach() { this.cdr.reattach(); }
\`\`\`

### async pipe — best practice with OnPush
\`\`\`html
<!-- Template -->
<div *ngFor="let user of users$ | async">{{ user.name }}</div>
\`\`\`
\`\`\`typescript
// Component
class UsersComponent {
  users$ = this.userService.getUsers(); // Observable
  // async pipe subscribes/unsubscribes AND calls markForCheck() on emit
}
\`\`\`

### Zone.js and zoneless (Angular 18+)
\`\`\`typescript
// Opt-out of Zone.js for maximum performance
bootstrapApplication(AppComponent, {
  providers: [provideExperimentalZonelessChangeDetection()]
});

// Then use signals for reactivity — Angular knows exactly what changed
class MyComponent {
  count = signal(0);
  double = computed(() => this.count() * 2);
}
\`\`\`
`),

t('angular-theory-004', 'Angular Signals (Angular 16+)', 'Signals', 'hard', `
## Angular Signals

Signals are Angular's reactive primitive — a value that notifies consumers when it changes.

### signal, computed, effect
\`\`\`typescript
import { signal, computed, effect } from '@angular/core';

@Component({
  template: \`
    <p>Count: {{ count() }}</p>
    <p>Double: {{ double() }}</p>
    <button (click)="increment()">+</button>
  \`
})
class CounterComponent {
  count = signal(0);                           // writable signal
  double = computed(() => this.count() * 2);   // derived (auto-tracks dependencies)

  constructor() {
    effect(() => {
      console.log('Count changed:', this.count()); // runs when count changes
    });
  }

  increment() { this.count.update(c => c + 1); }
  // or: this.count.set(5); // direct set
  // or: this.count.update(c => c + 1); // based on previous
}
\`\`\`

### Signal operations
\`\`\`typescript
const items = signal<string[]>([]);

// Replace
items.set(['a', 'b', 'c']);

// Update based on current value
items.update(current => [...current, 'd']);

// Mutate (without replacement — use carefully)
items.mutate(arr => arr.push('e'));
\`\`\`

### toSignal / toObservable — interop with RxJS
\`\`\`typescript
import { toSignal, toObservable } from '@angular/core/rxjs-interop';

@Component({...})
class SearchComponent {
  private searchService = inject(SearchService);

  query = signal('');
  query$ = toObservable(this.query); // signal → Observable

  results$ = this.query$.pipe(
    debounceTime(300),
    switchMap(q => this.searchService.search(q))
  );
  results = toSignal(this.results$, { initialValue: [] }); // Observable → signal
}
\`\`\`

### Input signals (Angular 17.1+)
\`\`\`typescript
class HeroComponent {
  hero = input.required<Hero>();          // required input signal
  color = input('blue');                  // optional with default
  alias = input<string>('', { alias: 'heroColor' }); // with alias

  // Computed from inputs
  displayName = computed(() => this.hero().name.toUpperCase());
}
\`\`\`

### Signal-based queries
\`\`\`typescript
class TableComponent {
  rows = viewChildren(RowComponent);       // signal of all RowComponent children
  header = viewChild.required(HeaderComponent); // required single child
}
\`\`\`

### Benefits over zone-based
- Fine-grained reactivity — only components with changed signals re-render
- No zone.js overhead
- Clear data flow (push vs. poll)
- Better tree-shaking
`),

t('angular-theory-005', 'RxJS in Angular — Patterns & Best Practices', 'RxJS Integration', 'hard', `
## RxJS in Angular

### HttpClient returns Observables
\`\`\`typescript
@Injectable({ providedIn: 'root' })
class UserService {
  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>('/api/users').pipe(
      catchError(err => {
        console.error(err);
        return of([]); // return empty array on error
      })
    );
  }

  createUser(user: Partial<User>): Observable<User> {
    return this.http.post<User>('/api/users', user);
  }
}
\`\`\`

### Combining multiple HTTP calls
\`\`\`typescript
// Parallel — forkJoin (like Promise.all)
forkJoin({
  users: this.http.get<User[]>('/api/users'),
  roles: this.http.get<Role[]>('/api/roles'),
}).subscribe(({ users, roles }) => { /* both complete */ });

// Sequential — switchMap
this.getUser(id).pipe(
  switchMap(user => this.getPosts(user.id))
).subscribe(posts => { /* ... */ });
\`\`\`

### Destroy and unsubscribe patterns
\`\`\`typescript
// Pattern 1: takeUntilDestroyed (Angular 16+) — PREFERRED
class MyComponent {
  private destroyRef = inject(DestroyRef);
  ngOnInit() {
    this.service.data$.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(data => this.data = data);
  }
}

// Pattern 2: async pipe (template) — auto-unsubscribes
// Pattern 3: manual unsubscribe
private subscription = new Subscription();
ngOnInit() { this.subscription.add(obs$.subscribe()); }
ngOnDestroy() { this.subscription.unsubscribe(); }
\`\`\`

### Common patterns in Angular services
\`\`\`typescript
@Injectable({ providedIn: 'root' })
class CartService {
  private items$ = new BehaviorSubject<CartItem[]>([]);

  readonly items = this.items$.asObservable();
  readonly total$ = this.items$.pipe(
    map(items => items.reduce((sum, item) => sum + item.price * item.qty, 0))
  );

  add(item: CartItem) {
    this.items$.next([...this.items$.getValue(), item]);
  }

  remove(id: string) {
    this.items$.next(this.items$.getValue().filter(i => i.id !== id));
  }
}
\`\`\`

### HTTP interceptors
\`\`\`typescript
// Add auth header to every request
@Injectable()
class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) {}

  intercept(req: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.auth.token;
    if (token) {
      req = req.clone({ setHeaders: { Authorization: \`Bearer \${token}\` } });
    }
    return next.handle(req).pipe(
      catchError(err => {
        if (err.status === 401) this.auth.logout();
        return throwError(() => err);
      })
    );
  }
}
\`\`\`
`),

t('angular-theory-006', 'Angular Router — Guards, Resolvers & Lazy Loading', 'Routing', 'medium', `
## Angular Router

### Route configuration
\`\`\`typescript
const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'users/:id', component: UserComponent },
  { path: 'admin', loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES) },
  { path: '**', component: NotFoundComponent },
];
\`\`\`

### Route guards (Angular 15+ functional)
\`\`\`typescript
// Auth guard
export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.isLoggedIn()) return true;
  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

// Usage
{ path: 'dashboard', canActivate: [authGuard], component: DashboardComponent }
\`\`\`

### Resolvers — preload data before navigation
\`\`\`typescript
export const userResolver: ResolveFn<User> = (route) => {
  const userService = inject(UserService);
  return userService.getUser(route.paramMap.get('id')!);
};

// Route
{ path: 'users/:id', resolve: { user: userResolver }, component: UserDetailComponent }

// Component
class UserDetailComponent {
  user = inject(ActivatedRoute).snapshot.data['user'] as User;
}
\`\`\`

### Reading route params
\`\`\`typescript
class UserComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  // Snapshot (for non-reusable routes)
  id = this.route.snapshot.paramMap.get('id')!;

  // Observable (for reusable routes, same component, different params)
  id$ = this.route.paramMap.pipe(map(p => p.get('id')));
  queryParam$ = this.route.queryParamMap.pipe(map(p => p.get('tab')));
}
\`\`\`

### Lazy loading
\`\`\`typescript
// Standalone routes (Angular 15+)
const routes: Routes = [{
  path: 'admin',
  canActivate: [adminGuard],
  loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES)
}];

// admin.routes.ts
export const ADMIN_ROUTES: Routes = [
  { path: '', component: AdminDashboardComponent },
  { path: 'users', component: AdminUsersComponent },
];
\`\`\`

### Router navigation programmatically
\`\`\`typescript
class MyComponent {
  private router = inject(Router);

  navigate() {
    this.router.navigate(['/users', this.userId], {
      queryParams: { tab: 'profile' },
      fragment: 'section1',
    });
  }
}
\`\`\`
`),

t('angular-theory-007', 'Angular Forms — Reactive Forms Deep Dive', 'Forms', 'hard', `
## Angular Reactive Forms

### FormControl, FormGroup, FormArray
\`\`\`typescript
class RegistrationComponent implements OnInit {
  form!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirm: [''],
      address: this.fb.group({
        street: [''],
        city: ['', Validators.required],
      }),
      phones: this.fb.array([this.fb.control('')]),
    }, { validators: passwordMatchValidator });
  }

  get phones() { return this.form.get('phones') as FormArray; }
  addPhone() { this.phones.push(this.fb.control('')); }
}
\`\`\`

### Custom validators
\`\`\`typescript
// Sync validator
function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const pass = group.get('password')?.value;
  const confirm = group.get('confirm')?.value;
  return pass === confirm ? null : { passwordMismatch: true };
}

// Async validator (check username availability)
function uniqueUsernameValidator(userService: UserService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    return userService.checkUsername(control.value).pipe(
      debounceTime(300),
      map(taken => taken ? { usernameTaken: true } : null),
      catchError(() => of(null)),
    );
  };
}
\`\`\`

### Template binding
\`\`\`html
<form [formGroup]="form" (ngSubmit)="onSubmit()">
  <input formControlName="email" />
  <div *ngIf="form.get('email')?.invalid && form.get('email')?.touched">
    <span *ngIf="form.get('email')?.errors?.['required']">Email is required</span>
    <span *ngIf="form.get('email')?.errors?.['email']">Invalid email</span>
  </div>

  <div formGroupName="address">
    <input formControlName="city" />
  </div>

  <div formArrayName="phones">
    <input *ngFor="let p of phones.controls; let i = index" [formControlName]="i" />
  </div>

  <button type="submit" [disabled]="form.invalid || form.pending">Register</button>
</form>
\`\`\`

### Watching form changes
\`\`\`typescript
this.form.valueChanges.pipe(
  debounceTime(300),
  distinctUntilChanged(),
  takeUntilDestroyed(this.destroyRef)
).subscribe(value => this.saveAsDraft(value));

// Watch specific control
this.form.get('country')!.valueChanges.subscribe(country => {
  this.updateStates(country);
});
\`\`\`

### Dynamic forms — add/remove controls
\`\`\`typescript
// Add control at runtime
this.form.addControl('nickname', this.fb.control(''));
this.form.removeControl('nickname');

// Patch vs reset
this.form.patchValue({ name: 'Alice' }); // partial update
this.form.reset({ name: '', email: '' }); // reset to values (marks pristine)
\`\`\`
`),
]

const MCQS: Row[] = [

mcq('angular-mcq-001', 'OnPush and object mutation', 'Change Detection', 'hard',
  'You have a component with `ChangeDetectionStrategy.OnPush`. Its template shows `user.name`. You do `this.user.name = "Alice"` in the component. What happens?',
  [
    'The template updates immediately',
    'The template does not update because the object reference did not change',
    'Angular throws a runtime error',
    'The template updates on the next tick'
  ],
  1,
  'OnPush only checks for changes when the @Input reference changes, an event fires, or an Observable emits. Mutating `this.user.name` keeps the same object reference — Angular doesn\'t detect the change. You must do `this.user = { ...this.user, name: "Alice" }` to trigger change detection.'),

mcq('angular-mcq-002', 'providedIn root vs module', 'Dependency Injection', 'medium',
  'What is the difference between `@Injectable({ providedIn: "root" })` and providing a service in `NgModule.providers`?',
  [
    'No difference — both create a singleton',
    'providedIn root is tree-shakeable; module providers always bundle the service even if unused',
    'Module providers are lazy; providedIn root is eager',
    'providedIn root creates a new instance per component'
  ],
  1,
  'Services with `providedIn: "root"` are tree-shaken — if no component injects them, they\'re not included in the bundle. Services in `NgModule.providers` are always bundled with that module whether they\'re used or not.'),

mcq('angular-mcq-003', 'async pipe benefits', 'RxJS Integration', 'medium',
  'Which of the following is NOT an advantage of using the `async` pipe over manual subscription?',
  [
    'Automatically unsubscribes when the component is destroyed',
    'Triggers change detection with OnPush when the observable emits',
    'Eliminates memory leaks from forgotten unsubscriptions',
    'Runs the observable subscription on a background thread'
  ],
  3,
  'JavaScript is single-threaded — the async pipe does NOT move subscription to a background thread. Its real advantages are: auto-unsubscribe on destroy, auto markForCheck() for OnPush components, and cleaner template code without lifecycle hook boilerplate.'),

mcq('angular-mcq-004', 'ViewChild timing', 'Angular Basics', 'hard',
  'When is a `@ViewChild` reference available?',
  [
    'In the constructor',
    'In ngOnInit',
    'In ngAfterViewInit',
    'In ngOnChanges'
  ],
  2,
  '`@ViewChild` references are populated after the view is initialized. They are `undefined` in the constructor and ngOnInit because Angular hasn\'t rendered the template yet. Access them in `ngAfterViewInit` or later.'),

mcq('angular-mcq-005', 'switchMap vs mergeMap', 'RxJS Integration', 'hard',
  'In an Angular search feature, you have `searchQuery$.pipe(mergeMap(q => searchAPI(q)))`. What problem can this cause?',
  [
    'It will not compile because mergeMap is not compatible with HttpClient',
    'Earlier API responses arriving after later ones can overwrite results with stale data',
    'Only the last response is emitted',
    'mergeMap cancels previous requests automatically'
  ],
  1,
  'mergeMap runs all inner observables concurrently without cancellation. If the user types "app" then "apple", both requests fire. If the "apple" response arrives first and "app" arrives second, the results show stale data. Use `switchMap` for search — it cancels the previous request when a new one arrives.'),

mcq('angular-mcq-006', 'ngOnChanges vs ngOnInit', 'Angular Basics', 'medium',
  'What is the key difference between `ngOnChanges` and `ngOnInit`?',
  [
    'ngOnInit runs before ngOnChanges',
    'ngOnChanges fires every time an @Input changes (including before init); ngOnInit fires once after all inputs are set',
    'ngOnChanges is deprecated in Angular 14+',
    'ngOnInit receives the SimpleChanges object'
  ],
  1,
  '`ngOnChanges` is called before `ngOnInit` AND every time an `@Input` property changes. It receives a `SimpleChanges` object with previous and current values. `ngOnInit` runs once after the first `ngOnChanges`. Use `ngOnChanges` when you need to react to input changes after initialization.'),

mcq('angular-mcq-007', 'Standalone components imports', 'Angular Basics', 'medium',
  'In a standalone component, you want to use `*ngIf` in the template. What do you need to import?',
  [
    'BrowserModule',
    'FormsModule',
    'CommonModule (or NgIf directly)',
    'Nothing — *ngIf is built into Angular templates'
  ],
  2,
  'Standalone components must explicitly import every directive/pipe they use. `*ngIf` comes from `CommonModule` (which includes all common directives) or you can import `NgIf` directly (tree-shakeable). `BrowserModule` provides `CommonModule` but should only be in the root module, not standalone components.'),

mcq('angular-mcq-008', 'Signals vs Observables', 'Signals', 'hard',
  'Which statement best describes Angular Signals vs RxJS Observables?',
  [
    'Signals are lazy; Observables are eager',
    'Signals are synchronous, always hold a current value, and automatically track dependencies; Observables are async streams that require subscription',
    'Signals are only for template bindings; Observables are for services',
    'Signals replace Observables completely in Angular 17+'
  ],
  1,
  'Signals are always synchronous, always have a current value (you can read them with `signal()`), and automatically track which templates/computed values depend on them. Observables represent async streams that may or may not have a current value and require explicit subscription. Both coexist — use signals for state, Observables for async streams.'),
]

export const allAngularProblems: Row[] = [...THEORY, ...MCQS]

export async function seedAngular(d1: D1Database): Promise<number> {
  const db = drizzle(d1)
  const BATCH = 20
  let inserted = 0
  for (let i = 0; i < allAngularProblems.length; i += BATCH) {
    const batch = allAngularProblems.slice(i, i + BATCH)
    await db.insert(problems).values(batch).onConflictDoNothing()
    inserted += batch.length
  }
  return inserted
}
