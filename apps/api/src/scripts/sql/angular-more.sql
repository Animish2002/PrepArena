-- PrepArena seed: Angular Extended Theory + MCQ
-- Problems: 22
-- Generated: 2026-07-15T16:03:25.626Z
-- Apply (remote): npx wrangler d1 execute preParena-db --remote --file=src/scripts/sql/angular-more.sql
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('angular-ext-t-001', 'Angular component lifecycle hooks — complete guide', 'Components & Lifecycle', NULL, 'medium', NULL, NULL, 15, 'Components & Lifecycle', NULL, '["components-&-lifecycle","angular"]', 'theory', 'angular', '
## Angular Lifecycle Hooks

Angular calls lifecycle hooks in this order:

| Hook | When |
|------|------|
| `ngOnChanges` | Before `ngOnInit`, on every input property change |
| `ngOnInit` | Once, after first `ngOnChanges` |
| `ngDoCheck` | Every change detection cycle |
| `ngAfterContentInit` | Once, after content projection (ng-content) |
| `ngAfterContentChecked` | After every check of projected content |
| `ngAfterViewInit` | Once, after component''s view and child views initialized |
| `ngAfterViewChecked` | After every check of view and child views |
| `ngOnDestroy` | Just before component is destroyed |

### Common patterns

```ts
@Component({ selector: ''app-user'', template: ''...'' })
export class UserComponent implements OnInit, OnDestroy {
  @Input() userId!: string;
  private sub = new Subscription();

  ngOnInit(): void {
    this.sub = this.userService.getUser(this.userId)
      .subscribe(user => this.user = user);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe(); // prevent memory leaks
  }
}
```

### ngOnChanges vs ngOnInit
- `ngOnChanges` fires before `ngOnInit` AND whenever inputs change
- `ngOnInit` fires once — safe for initialization logic that depends on inputs

### ngAfterViewInit use-case
DOM is available — safe to use `@ViewChild`:
```ts
@ViewChild(''myChart'') chartRef!: ElementRef;

ngAfterViewInit(): void {
  this.initChart(this.chartRef.nativeElement); // DOM ready here
}
```
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('angular-ext-t-002', '@Input and @Output — component communication', 'Components & Lifecycle', NULL, 'easy', NULL, NULL, 10, 'Components & Lifecycle', NULL, '["components-&-lifecycle","angular"]', 'theory', 'angular', '
## @Input & @Output

### @Input — parent → child
```ts
@Component({
  selector: ''app-user-card'',
  template: ''<h2>{{user.name}}</h2><p>{{user.email}}</p>'',
})
export class UserCardComponent {
  @Input() user!: User;
  @Input({ required: true }) theme: ''light''|''dark'' = ''light'';  // Angular 16+

  // Alias: <app-user-card [userData]="...">
  @Input(''userData'') user!: User;
}
```

### @Output — child → parent (via EventEmitter)
```ts
@Component({ selector: ''app-confirm-dialog'', template: `
  <button (click)="confirm()">Confirm</button>
  <button (click)="cancel()">Cancel</button>
` })
export class ConfirmDialogComponent {
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  confirm() { this.confirmed.emit(); }
  cancel()  { this.cancelled.emit(); }
}
```

### Parent template
```html
<app-confirm-dialog
  (confirmed)="onDelete(item)"
  (cancelled)="closeDialog()"
/>
```

### Two-way binding with @Input/@Output pair
```ts
// Child
@Input() value!: string;
@Output() valueChange = new EventEmitter<string>(); // must be inputName + ''Change''

// Parent (banana-in-a-box syntax)
<app-input [(value)]="myValue" />
// Equivalent to:
<app-input [value]="myValue" (valueChange)="myValue = $event" />
```
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('angular-ext-t-003', 'Content projection — ng-content and named slots', 'Components & Lifecycle', NULL, 'medium', NULL, NULL, 15, 'Components & Lifecycle', NULL, '["components-&-lifecycle","angular"]', 'theory', 'angular', '
## Content Projection

Content projection lets you pass template content from parent to child — similar to React''s `children`.

### Single slot
```ts
@Component({ selector: ''app-card'', template: `
  <div class="card">
    <ng-content></ng-content>
  </div>
` })
export class CardComponent {}

// Usage
<app-card>
  <h2>Title</h2>
  <p>Body text</p>
</app-card>
```

### Named slots (select)
```ts
@Component({ selector: ''app-layout'', template: `
  <header><ng-content select="[slot=header]"></ng-content></header>
  <main><ng-content></ng-content></main>
  <footer><ng-content select="[slot=footer]"></ng-content></footer>
` })
export class LayoutComponent {}

// Usage
<app-layout>
  <nav slot="header">Navigation</nav>
  <article>Main content</article>
  <p slot="footer">Copyright 2024</p>
</app-layout>
```

### @ContentChild / @ContentChildren
Access projected content in the component:
```ts
export class CardComponent implements AfterContentInit {
  @ContentChild(TitleComponent) title!: TitleComponent;
  @ContentChildren(SectionComponent) sections!: QueryList<SectionComponent>;

  ngAfterContentInit() {
    console.log(this.sections.length);
  }
}
```
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('angular-ext-m-001', 'ngOnChanges vs ngOnInit', 'Components & Lifecycle', NULL, 'medium', NULL, NULL, 5, 'Components & Lifecycle', NULL, '["components-&-lifecycle","angular","mcq"]', 'mcq', 'angular', '{"question":"When does ngOnChanges fire?","options":["Once, after ngOnInit","Only when the component is first created","Before ngOnInit and whenever an @Input property changes","After every change detection cycle"],"correct_index":2,"explanation":"ngOnChanges fires before ngOnInit AND every time a bound @Input property changes. It receives a SimpleChanges object with previous and current values."}', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('angular-ext-m-002', 'ViewChild availability', 'Components & Lifecycle', NULL, 'medium', NULL, NULL, 5, 'Components & Lifecycle', NULL, '["components-&-lifecycle","angular","mcq"]', 'mcq', 'angular', '{"question":"In which lifecycle hook is @ViewChild first available?","options":["ngOnInit","ngAfterContentInit","ngAfterViewInit","ngDoCheck"],"correct_index":2,"explanation":"@ViewChild references are populated after the view is initialized, which happens in ngAfterViewInit. Accessing them in ngOnInit will return undefined."}', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('angular-ext-t-004', 'Dependency injection — providers, scopes, and tokens', 'Services & DI', NULL, 'hard', NULL, NULL, 20, 'Services & DI', NULL, '["services-&-di","angular"]', 'theory', 'angular', '
## Dependency Injection in Angular

Angular has a hierarchical DI system. Services are registered in **injectors** at different levels.

### @Injectable and providedIn
```ts
@Injectable({ providedIn: ''root'' }) // single instance for entire app
export class UserService {
  constructor(private http: HttpClient) {}
  getUser(id: string) { return this.http.get<User>(`/api/users/${id}`); }
}
```

### Provider scopes
| `providedIn` | Scope | Created |
|--------------|-------|---------|
| `''root''` | App-wide singleton | Once |
| `''any''` | New instance per lazy-loaded module | Per module |
| Component `providers` array | Per component instance | With component |
| Module `providers` array | Shared in module | Once per module |

### Per-component scope
```ts
@Component({
  providers: [CartService], // new CartService for this component & descendants
})
export class CheckoutComponent {
  constructor(private cart: CartService) {} // gets its own instance
}
```

### Injection tokens (non-class dependencies)
```ts
export const API_URL = new InjectionToken<string>(''API_URL'');

// Register
{ provide: API_URL, useValue: ''https://api.example.com'' }

// Inject
constructor(@Inject(API_URL) private apiUrl: string) {}
```

### Multi-providers
```ts
export const VALIDATORS = new InjectionToken<Validator[]>(''VALIDATORS'');
// Multiple providers contribute to one array
{ provide: VALIDATORS, useClass: EmailValidator, multi: true }
{ provide: VALIDATORS, useClass: PhoneValidator, multi: true }
```
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('angular-ext-t-005', 'HTTP client — requests, interceptors, and error handling', 'Services & DI', NULL, 'medium', NULL, NULL, 15, 'Services & DI', NULL, '["services-&-di","angular"]', 'theory', 'angular', '
## Angular HttpClient

### Setup (Angular 17+)
```ts
// app.config.ts
import { provideHttpClient, withInterceptors } from ''@angular/common/http'';

export const appConfig: ApplicationConfig = {
  providers: [provideHttpClient(withInterceptors([authInterceptor]))]
};
```

### Making requests
```ts
@Injectable({ providedIn: ''root'' })
export class ApiService {
  private http = inject(HttpClient);

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(''/api/users'');
  }

  createUser(data: CreateUserDto): Observable<User> {
    return this.http.post<User>(''/api/users'', data);
  }

  updateUser(id: string, data: Partial<User>): Observable<User> {
    return this.http.patch<User>(`/api/users/${id}`, data);
  }
}
```

### Functional interceptor (Angular 15+)
```ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthService).token();
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;
  return next(authReq).pipe(
    catchError(err => {
      if (err.status === 401) inject(Router).navigate([''/login'']);
      return throwError(() => err);
    })
  );
};
```

### Error handling
```ts
this.http.get(''/api/data'').pipe(
  retry(2),                           // retry twice on failure
  catchError(err => {
    this.toast.error(err.message);
    return EMPTY;                     // or return of(fallbackValue)
  })
).subscribe(data => this.data = data);
```
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('angular-ext-t-006', 'inject() function — modern Angular DI pattern', 'Services & DI', NULL, 'medium', NULL, NULL, 15, 'Services & DI', NULL, '["services-&-di","angular"]', 'theory', 'angular', '
## inject() Function

Angular 14+ introduced the `inject()` function as an alternative to constructor injection.

### Constructor injection (classic)
```ts
@Component({ ... })
export class UserComponent {
  constructor(
    private userService: UserService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}
}
```

### inject() function (modern, preferred in Angular 17+)
```ts
@Component({ ... })
export class UserComponent {
  private userService = inject(UserService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
}
```

### Advantages
- Works in class fields (no constructor boilerplate)
- Works in standalone functions (useful for functional guards/resolvers)
- Enables composable injection utilities (like custom hooks in React)

### Functional utilities with inject()
```ts
// Reusable "custom hook" equivalent
function useCurrentUser(): Signal<User | null> {
  return inject(AuthStore).currentUser;
}

// Functional guard
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isLoggedIn() || router.createUrlTree([''/login'']);
};
```

### Constraint
`inject()` must be called in an **injection context**: constructor, field initializer, or factory function during DI. Not in lifecycle hooks or async callbacks.
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('angular-ext-m-003', 'providedIn root', 'Services & DI', NULL, 'easy', NULL, NULL, 5, 'Services & DI', NULL, '["services-&-di","angular","mcq"]', 'mcq', 'angular', '{"question":"What does `@Injectable({ providedIn: \"root\" })` mean?","options":["The service is available only in the root module","A single instance is created and shared across the entire application","The service is provided at the component level","The service is lazy-loaded with the root route"],"correct_index":1,"explanation":"providedIn: \"root\" registers the service with the root injector — there is exactly one instance shared by all components, services, and modules in the app."}', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('angular-ext-t-007', 'Built-in structural directives — *ngIf, *ngFor, *ngSwitch', 'Directives & Pipes', NULL, 'easy', NULL, NULL, 10, 'Directives & Pipes', NULL, '["directives-&-pipes","angular"]', 'theory', 'angular', '
## Structural Directives

Structural directives change the DOM structure by adding/removing elements.

### *ngIf (Angular 17: @if)
```html
<!-- Classic -->
<div *ngIf="user; else loading">
  <h2>{{user.name}}</h2>
</div>
<ng-template #loading><p>Loading...</p></ng-template>

<!-- Angular 17+ block syntax -->
@if (user) {
  <h2>{{user.name}}</h2>
} @else {
  <p>Loading...</p>
}
```

### *ngFor (Angular 17: @for)
```html
<!-- Classic -->
<li *ngFor="let item of items; trackBy: trackById; let i = index; let last = last">
  {{i}}: {{item.name}} {{last ? ''(last)'' : ''''}}
</li>

<!-- Angular 17+ (trackBy required) -->
@for (item of items; track item.id; let i = $index) {
  <li>{{i}}: {{item.name}}</li>
} @empty {
  <li>No items</li>
}
```

### *ngSwitch (Angular 17: @switch)
```html
@switch (status) {
  @case (''active'')   { <span class="green">Active</span> }
  @case (''inactive'') { <span class="red">Inactive</span> }
  @default           { <span>Unknown</span> }
}
```

### trackBy / track
Critical for performance in large lists — prevents recreating DOM nodes on data refresh:
```ts
trackById(index: number, item: Item) { return item.id; }
```
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('angular-ext-t-008', 'Custom directives — attribute and structural', 'Directives & Pipes', NULL, 'hard', NULL, NULL, 20, 'Directives & Pipes', NULL, '["directives-&-pipes","angular"]', 'theory', 'angular', '
## Custom Directives

### Attribute directive (modifies host element)
```ts
@Directive({ selector: ''[appHighlight]'', standalone: true })
export class HighlightDirective {
  @Input(''appHighlight'') color = ''yellow'';

  private el = inject(ElementRef);
  private renderer = inject(Renderer2);

  @HostListener(''mouseenter'') onEnter() {
    this.renderer.setStyle(this.el.nativeElement, ''background'', this.color);
  }
  @HostListener(''mouseleave'') onLeave() {
    this.renderer.removeStyle(this.el.nativeElement, ''background'');
  }
}

// Usage
<p [appHighlight]="''lightblue''">Hover me</p>
```

### @HostBinding
Bind to host element properties/attributes/classes:
```ts
@Directive({ selector: ''[appDisabled]'' })
export class DisabledDirective {
  @Input() appDisabled = false;
  @HostBinding(''attr.disabled'') get disabled() {
    return this.appDisabled ? '''' : null;
  }
  @HostBinding(''class.disabled'') get cssClass() {
    return this.appDisabled;
  }
}
```

### Structural directive (modifies DOM)
```ts
@Directive({ selector: ''[appRepeat]'' })
export class RepeatDirective {
  @Input() set appRepeat(n: number) {
    this.vcr.clear();
    for (let i = 0; i < n; i++) {
      this.vcr.createEmbeddedView(this.tpl, { $implicit: i });
    }
  }
  constructor(private tpl: TemplateRef<any>, private vcr: ViewContainerRef) {}
}

// <div *appRepeat="3; let i">Item {{i}}</div>
```
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('angular-ext-t-009', 'Custom pipes — pure vs impure', 'Directives & Pipes', NULL, 'medium', NULL, NULL, 15, 'Directives & Pipes', NULL, '["directives-&-pipes","angular"]', 'theory', 'angular', '
## Custom Pipes

Pipes transform displayed values in templates.

### Pure pipe (default — recommended)
Called ONLY when the input reference changes. Memoized between calls.
```ts
@Pipe({ name: ''truncate'', standalone: true, pure: true })
export class TruncatePipe implements PipeTransform {
  transform(value: string, limit = 100, trail = ''…''): string {
    return value.length > limit ? value.slice(0, limit) + trail : value;
  }
}

// Usage
{{ article.body | truncate:200:''...'' }}
```

### Impure pipe (pure: false)
Called on EVERY change detection cycle — can be expensive. Use sparingly.
```ts
@Pipe({ name: ''filter'', pure: false })
export class FilterPipe implements PipeTransform {
  transform(items: any[], query: string): any[] {
    return items.filter(i => i.name.includes(query));
  }
}
// Needed because array mutation doesn''t change the reference
```

### Async pipe (built-in, impure)
Subscribes to Observables/Promises, unwraps the value, and auto-unsubscribes:
```html
<div *ngIf="users$ | async as users">
  <app-user *ngFor="let u of users" [user]="u" />
</div>
```
**Use async pipe instead of subscribing in the component** — eliminates manual unsubscription.
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('angular-ext-m-004', 'Pure vs impure pipe', 'Directives & Pipes', NULL, 'medium', NULL, NULL, 5, 'Directives & Pipes', NULL, '["directives-&-pipes","angular","mcq"]', 'mcq', 'angular', '{"question":"When is a pure pipe''s transform method called?","options":["On every change detection cycle","Only when the input reference or primitive value changes","Only on component initialization","Once per template binding"],"correct_index":1,"explanation":"Pure pipes are memoized — Angular only calls transform() when the input reference changes (or primitive value changes). This makes them efficient but means they won''t detect mutations inside arrays/objects."}', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('angular-ext-t-010', 'Reactive forms — FormGroup, FormControl, FormArray', 'Angular Forms', NULL, 'medium', NULL, NULL, 15, 'Angular Forms', NULL, '["angular-forms","angular"]', 'theory', 'angular', '
## Reactive Forms

Reactive forms create the form model in TypeScript, providing full programmatic control.

### Setup
```ts
@Component({ ... })
export class ProfileForm {
  private fb = inject(FormBuilder);

  form = this.fb.group({
    name:    ['''', [Validators.required, Validators.minLength(2)]],
    email:   ['''', [Validators.required, Validators.email]],
    address: this.fb.group({
      street: [''''],
      city:   ['''', Validators.required],
      zip:    ['''', Validators.pattern(/^d{5}$/)],
    }),
    skills:  this.fb.array([]),
  });

  get skillsArray() { return this.form.get(''skills'') as FormArray; }

  addSkill() {
    this.skillsArray.push(this.fb.control('''', Validators.required));
  }

  submit() {
    if (this.form.invalid) return;
    console.log(this.form.value); // typed!
  }
}
```

### Template binding
```html
<form [formGroup]="form" (ngSubmit)="submit()">
  <input formControlName="name">
  <div *ngIf="form.get(''name'')?.invalid && form.get(''name'')?.touched">
    Name is required
  </div>

  <div formGroupName="address">
    <input formControlName="city">
  </div>

  <div formArrayName="skills">
    <input *ngFor="let ctrl of skillsArray.controls; let i = index"
           [formControlName]="i">
  </div>

  <button type="submit" [disabled]="form.invalid">Save</button>
</form>
```
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('angular-ext-t-011', 'Custom validators — sync and async', 'Angular Forms', NULL, 'hard', NULL, NULL, 20, 'Angular Forms', NULL, '["angular-forms","angular"]', 'theory', 'angular', '
## Custom Validators

### Synchronous validator
```ts
import { AbstractControl, ValidationErrors, ValidatorFn } from ''@angular/forms'';

// Factory function (recommended — allows parameters)
export function forbiddenWords(words: string[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const found = words.find(w =>
      control.value?.toLowerCase().includes(w.toLowerCase())
    );
    return found ? { forbiddenWord: { word: found } } : null;
  };
}

// Usage
name: ['''', [Validators.required, forbiddenWords([''admin'', ''root''])]],
```

### Cross-field validator (on group)
```ts
export function passwordMatch(): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const pass = group.get(''password'')?.value;
    const confirm = group.get(''confirmPassword'')?.value;
    return pass !== confirm ? { passwordMismatch: true } : null;
  };
}

// Applied to group
this.fb.group({
  password: ['''', [Validators.required, Validators.minLength(8)]],
  confirmPassword: [''''],
}, { validators: passwordMatch() })
```

### Async validator (e.g., check username uniqueness)
```ts
export function uniqueUsername(userService: UserService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    return timer(300).pipe(  // debounce
      switchMap(() => userService.checkUsername(control.value)),
      map(exists => exists ? { usernameTaken: true } : null),
      catchError(() => of(null))
    );
  };
}
```
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('angular-ext-m-005', 'Reactive vs template-driven forms', 'Angular Forms', NULL, 'medium', NULL, NULL, 5, 'Angular Forms', NULL, '["angular-forms","angular","mcq"]', 'mcq', 'angular', '{"question":"What is the key advantage of reactive forms over template-driven forms?","options":["They require less code","They work without TypeScript","The model lives in the component class, enabling easier testing and dynamic validation","They automatically handle async validators"],"correct_index":2,"explanation":"In reactive forms, the form model (FormGroup, FormControl) lives in the component class. This makes it testable, allows dynamic form construction, and provides synchronous access to the form''s validity and values."}', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('angular-ext-t-012', 'Angular routing — lazy loading, guards, resolvers', 'Angular Routing', NULL, 'medium', NULL, NULL, 15, 'Angular Routing', NULL, '["angular-routing","angular"]', 'theory', 'angular', '
## Angular Router

### Route configuration
```ts
export const routes: Routes = [
  { path: '''', component: HomeComponent },
  {
    path: ''admin'',
    canActivate: [authGuard],                     // guard
    loadChildren: () =>                            // lazy-loaded module
      import(''./admin/routes'').then(m => m.ADMIN_ROUTES),
  },
  {
    path: ''users/:id'',
    component: UserDetailComponent,
    resolve: { user: userResolver },              // pre-fetch data
    canDeactivate: [unsavedChangesGuard],         // leave guard
  },
  { path: ''**'', redirectTo: ''/'' },               // wildcard
];
```

### Functional guards (Angular 15+)
```ts
export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  return auth.isLoggedIn() || inject(Router).createUrlTree([''/login''], {
    queryParams: { returnUrl: state.url }
  });
};
```

### Functional resolver
```ts
export const userResolver: ResolveFn<User> = (route) => {
  return inject(UserService).getUser(route.paramMap.get(''id'')!);
};
// Data available in component via route.data[''user'']
```

### Router navigation in component
```ts
private router = inject(Router);
private route = inject(ActivatedRoute);

// Imperative navigation
this.router.navigate([''/users'', userId]);
this.router.navigate([''../edit''], { relativeTo: this.route });
this.router.navigateByUrl(''/home?tab=profile#section'');

// Template
<a routerLink="/users/42" routerLinkActive="active">User</a>
```
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('angular-ext-t-013', 'Route parameters — params, query params, data', 'Angular Routing', NULL, 'medium', NULL, NULL, 15, 'Angular Routing', NULL, '["angular-routing","angular"]', 'theory', 'angular', '
## Reading Route Data

### Route params (URL segments)
```ts
// Route: { path: ''users/:id/posts/:postId'' }
export class PostDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);

  ngOnInit() {
    // Snapshot (use for non-reused components)
    const id = this.route.snapshot.paramMap.get(''id'');

    // Observable (use when component IS reused with different params)
    this.route.params.subscribe(params => {
      this.loadPost(params[''id''], params[''postId'']);
    });
  }
}
```

### Query params (?key=value)
```ts
this.route.queryParams.subscribe(params => {
  this.page = Number(params[''page''] ?? 1);
  this.search = params[''q''] ?? '''';
});

// Navigate preserving existing query params
this.router.navigate([], {
  relativeTo: this.route,
  queryParams: { page: 2 },
  queryParamsHandling: ''merge'', // or ''preserve''
});
```

### Static route data
```ts
{ path: ''admin'', component: AdminComponent, data: { title: ''Admin'', roles: [''admin''] } }

// In component
const title = this.route.snapshot.data[''title''];
```

### Resolver data
```ts
// resolver returns User, registered as { user: userResolver }
ngOnInit() {
  this.user = this.route.snapshot.data[''user''] as User;
}
```
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('angular-ext-m-006', 'Lazy loading benefit', 'Angular Routing', NULL, 'easy', NULL, NULL, 5, 'Angular Routing', NULL, '["angular-routing","angular","mcq"]', 'mcq', 'angular', '{"question":"What is the primary benefit of lazy-loading feature modules?","options":["Faster build times","Smaller initial bundle — chunks are loaded on demand","Simpler routing configuration","Enables server-side rendering"],"correct_index":1,"explanation":"Lazy loading splits the app into chunks. Only the main bundle is loaded initially; feature chunks load when the user navigates to that route. This significantly reduces Time to Interactive for large apps."}', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('angular-ext-t-014', 'Change detection — Default vs OnPush strategies', 'Change Detection & Signals', NULL, 'hard', NULL, NULL, 20, 'Change Detection & Signals', NULL, '["change-detection-&-signals","angular"]', 'theory', 'angular', '
## Change Detection Strategies

### Default strategy
Angular checks the ENTIRE component tree on every event, setTimeout, HTTP response, or Promise resolution. Safe but can be slow for large trees.

### OnPush strategy
Angular only checks a component when:
1. An `@Input()` reference changes
2. An event originates from within the component or its children
3. An Observable with async pipe emits
4. You manually trigger: `ChangeDetectorRef.markForCheck()`

```ts
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<h2>{{user.name}}</h2>`,
})
export class UserCardComponent {
  @Input() user!: User; // must pass new object reference to trigger check
}

// ✅ Triggers OnPush (new reference)
this.user = { ...this.user, name: ''New Name'' };

// ❌ Does NOT trigger OnPush (same reference, mutated)
this.user.name = ''New Name'';
```

### Manual control
```ts
private cdr = inject(ChangeDetectorRef);

// Force a check this cycle
this.cdr.markForCheck();

// Detach from change detection entirely (manual control)
this.cdr.detach();
this.cdr.detectChanges(); // run check manually
```

### Rule of thumb
Use `OnPush` by default with immutable data and Observables. Default is fine for small/medium apps.
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('angular-ext-t-015', 'Angular Signals — reactive state without RxJS', 'Change Detection & Signals', NULL, 'hard', NULL, NULL, 20, 'Change Detection & Signals', NULL, '["change-detection-&-signals","angular"]', 'theory', 'angular', '
## Angular Signals (Angular 16+)

Signals are a new reactive primitive — fine-grained reactivity without RxJS overhead.

### signal() — writable reactive value
```ts
import { signal, computed, effect } from ''@angular/core'';

export class CounterComponent {
  count = signal(0);
  doubled = computed(() => this.count() * 2); // auto-tracks dependencies

  increment() { this.count.update(n => n + 1); }
  reset()     { this.count.set(0); }

  constructor() {
    effect(() => {
      console.log(''Count changed:'', this.count()); // runs when count changes
    });
  }
}
```

### In templates
```html
<p>Count: {{ count() }}</p>
<p>Doubled: {{ doubled() }}</p>
<button (click)="increment()">+</button>
```

### Signals vs RxJS
| | Signals | RxJS |
|--|---------|------|
| Complexity | Simple | Powerful |
| Glitch-free | ✅ | Requires care |
| Lazy | ✅ | ✅ (cold) |
| Time-based ops | ❌ | ✅ |
| Async | ✅ (toObservable) | ✅ |

### interop
```ts
// Signal → Observable
import { toObservable } from ''@angular/core/rxjs-interop'';
const count$ = toObservable(this.count);

// Observable → Signal
import { toSignal } from ''@angular/core/rxjs-interop'';
const users = toSignal(this.userService.getUsers(), { initialValue: [] });
```
', 'internal');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('angular-ext-m-007', 'OnPush trigger', 'Change Detection & Signals', NULL, 'hard', NULL, NULL, 5, 'Change Detection & Signals', NULL, '["change-detection-&-signals","angular","mcq"]', 'mcq', 'angular', '{"question":"A component uses OnPush. Its @Input is an array. A parent pushes an item into the array (mutation). Will the child re-render?","options":["Yes — array contents changed","No — the array reference did not change","Yes — OnPush tracks deep changes","Only if the array length changes"],"correct_index":1,"explanation":"OnPush checks INPUT REFERENCE equality. Mutating an array (push, splice) does not change the reference, so Angular skips the child. Always pass a new array: `[...items, newItem]`."}', 'internal');
