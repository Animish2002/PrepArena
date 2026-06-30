-- PrepArena seed: Spring Boot Theory
-- Problems: 54
-- Generated: 2026-06-30T16:42:46.264Z
-- Apply (local):  npx wrangler d1 execute preParena-db --local  --file=src/scripts/sql/spring.sql
-- Apply (remote): npx wrangler d1 execute preParena-db --remote --file=src/scripts/sql/spring.sql
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('spring-theory-001', 'What is the Spring IoC Container?', 'Spring Core', 'IoC', 'easy', NULL, NULL, 5, 'spring-interview', 1, '["IoC","container","ApplicationContext"]', 'theory', 'spring-boot', '## Spring IoC Container

**Inversion of Control** — the framework creates and wires objects instead of application code doing it manually.

The IoC container manages the complete lifecycle of beans (creation, dependency injection, destruction).

**Two main interfaces**:
- `BeanFactory` — basic container; lazy initialization
- `ApplicationContext` — extends BeanFactory; adds events, AOP, i18n, eager singleton init

**Common implementations**:
- `AnnotationConfigApplicationContext` — for Java config
- `ClassPathXmlApplicationContext` — for XML config
- `SpringApplication.run()` — Spring Boot entry point, uses `AnnotationConfigServletWebServerApplicationContext`', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('spring-theory-002', 'What is Dependency Injection (DI) in Spring?', 'Spring Core', 'DI', 'easy', NULL, NULL, 5, 'spring-interview', 2, '["dependency-injection","constructor","setter","field"]', 'theory', 'spring-boot', '## Dependency Injection in Spring

The container injects required dependencies into beans instead of the bean creating them itself.

**Types of injection**:

1. **Constructor injection** (preferred):
```java
@Service
public class OrderService {
  private final PaymentService ps;
  OrderService(PaymentService ps) { this.ps = ps; } // Spring injects
}
```

2. **Setter injection** — optional dependencies
3. **Field injection** (`@Autowired` on field) — convenient but harder to test

**Why constructor injection is preferred**:
- Dependencies are explicit
- Bean is always in a valid state
- Works without Spring (plain Java tests)', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('spring-theory-003', 'What is a Spring Bean?', 'Spring Core', 'Beans', 'easy', NULL, NULL, 5, 'spring-interview', 3, '["bean","component","lifecycle"]', 'theory', 'spring-boot', '## Spring Bean

Any object managed by the Spring IoC container is a **bean**. Beans are created, wired, and destroyed by the container.

**Declaring beans**:
- `@Component`, `@Service`, `@Repository`, `@Controller` — component-scan auto-detection
- `@Bean` on a method inside `@Configuration` class

```java
@Configuration
public class AppConfig {
  @Bean
  public DataSource dataSource() { return new HikariDataSource(config); }
}
```

**Lifecycle callbacks**:
- `@PostConstruct` — runs after DI is complete
- `@PreDestroy` — runs before bean is removed
- Or implement `InitializingBean` / `DisposableBean`', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('spring-theory-004', 'What are the Spring Bean scopes?', 'Spring Core', 'Bean Scopes', 'medium', NULL, NULL, 5, 'spring-interview', 4, '["scope","singleton","prototype","request"]', 'theory', 'spring-boot', '## Bean Scopes

| Scope | Description | Context |
|-------|-------------|--------|
| **singleton** (default) | One shared instance per container | Any |
| **prototype** | New instance per request to container | Any |
| **request** | One instance per HTTP request | Web |
| **session** | One instance per HTTP session | Web |
| **application** | One per ServletContext | Web |
| **websocket** | One per WebSocket | Web |

```java
@Scope("prototype")
@Component
class CartService { ... }
```

**Gotcha**: injecting a prototype bean into a singleton — the prototype is only created once (at singleton init). Use `ObjectProvider` or method injection to get a new prototype each time.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('spring-theory-005', 'What is @Autowired and how does Spring resolve ambiguity?', 'Spring Core', 'DI', 'medium', NULL, NULL, 5, 'spring-interview', 5, '["Autowired","Qualifier","Primary"]', 'theory', 'spring-boot', '## @Autowired & Ambiguity Resolution

`@Autowired` tells Spring to inject a matching bean by type.

**Resolution order**:
1. Match by **type** — if exactly one bean, inject it
2. If multiple candidates — match by **name** (parameter/field name = bean name)
3. `@Qualifier("beanName")` — explicit selection
4. `@Primary` — marks the preferred bean when multiple candidates exist

```java
@Autowired
@Qualifier("postgresDataSource")
DataSource dataSource;
```

**`required = false`** — optional injection; no exception if bean absent:
```java
@Autowired(required = false) CacheService cache;
```

Spring Boot 3: constructor with single arg needs no `@Autowired`.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('spring-theory-006', 'What is the difference between @Component, @Service, @Repository, and @Controller?', 'Spring Core', 'Stereotypes', 'easy', NULL, NULL, 5, 'spring-interview', 6, '["Component","Service","Repository","Controller","stereotypes"]', 'theory', 'spring-boot', '## Spring Stereotype Annotations

All are specializations of `@Component` — all enable component scanning.

| Annotation | Layer | Extra behaviour |
|-----------|-------|----------------|
| `@Component` | Generic | None |
| `@Service` | Business logic | None (semantic only) |
| `@Repository` | Data access | Translates persistence exceptions to Spring''s `DataAccessException` |
| `@Controller` | Web (MVC) | `DispatcherServlet` routing |
| `@RestController` | Web (REST) | = `@Controller` + `@ResponseBody` |

**Best practice**: use the most specific annotation — it improves readability and `@Repository` gives exception translation.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('spring-theory-007', 'What is Spring Boot and how does it differ from Spring Framework?', 'Spring Boot', 'Overview', 'easy', NULL, NULL, 5, 'spring-interview', 7, '["spring-boot","auto-configuration","starter"]', 'theory', 'spring-boot', '## Spring Boot vs Spring Framework

**Spring Framework** — core DI + AOP + MVC; requires significant XML/Java config.

**Spring Boot** adds:
1. **Auto-configuration** — detects classpath and configures beans automatically
2. **Starters** — curated dependency bundles (`spring-boot-starter-web`, `spring-boot-starter-data-jpa`)
3. **Embedded server** — Tomcat/Jetty/Undertow baked in; no WAR deployment needed
4. **Actuator** — production-ready endpoints (/health, /metrics, /env)
5. **Opinionated defaults** — sensible out-of-the-box config

Result: create a production-ready Spring app with minimal boilerplate.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('spring-theory-008', 'How does Spring Boot auto-configuration work?', 'Spring Boot', 'Auto-Configuration', 'medium', NULL, NULL, 5, 'spring-interview', 8, '["auto-configuration","ConditionalOnClass","EnableAutoConfiguration"]', 'theory', 'spring-boot', '## Spring Boot Auto-Configuration

`@SpringBootApplication` includes `@EnableAutoConfiguration` which triggers Spring Boot''s auto-config.

**How**: Spring Boot reads `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports` (Boot 3) or `spring.factories` (Boot 2) — a list of auto-configuration classes.

Each auto-config class is annotated with conditions:
- `@ConditionalOnClass` — only activate if class is on classpath
- `@ConditionalOnMissingBean` — only activate if user hasn''t already defined this bean
- `@ConditionalOnProperty` — activate based on property value

```java
@ConditionalOnClass(DataSource.class)
@ConditionalOnMissingBean(DataSource.class)
class DataSourceAutoConfiguration { ... }
```', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('spring-theory-009', 'What are Spring Boot starters?', 'Spring Boot', 'Starters', 'easy', NULL, NULL, 5, 'spring-interview', 9, '["starters","dependency-management"]', 'theory', 'spring-boot', '## Spring Boot Starters

Convenience dependency descriptors that pull in all necessary libraries for a feature.

**Common starters**:
- `spring-boot-starter-web` — Spring MVC + Tomcat + Jackson
- `spring-boot-starter-data-jpa` — Hibernate + Spring Data JPA
- `spring-boot-starter-security` — Spring Security
- `spring-boot-starter-test` — JUnit 5 + Mockito + AssertJ
- `spring-boot-starter-actuator` — health/metrics endpoints
- `spring-boot-starter-cache` — caching abstraction

**spring-boot-starter-parent**: manages versions of all Spring Boot-compatible libraries. Include as `<parent>` in pom.xml to get version management for free.

Result: add one starter, get a coherent, version-compatible set of deps.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('spring-theory-010', 'What is application.properties vs application.yml in Spring Boot?', 'Spring Boot', 'Configuration', 'easy', NULL, NULL, 5, 'spring-interview', 10, '["properties","yaml","configuration"]', 'theory', 'spring-boot', '## application.properties vs application.yml

Both configure Spring Boot — same properties, different syntax.

`application.properties`:
```properties
server.port=8080
spring.datasource.url=jdbc:mysql://localhost/mydb
spring.datasource.username=root
```

`application.yml`:
```yaml
server:
  port: 8080
spring:
  datasource:
    url: jdbc:mysql://localhost/mydb
    username: root
```

**YAML advantages**: hierarchical structure is clearer for nested properties; supports lists natively.
**Properties advantages**: simpler, no indentation issues.

Both live in `src/main/resources/`. When both exist, `properties` takes precedence (Boot 2.4+: yml takes precedence).', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('spring-theory-011', 'What are Spring Boot profiles?', 'Spring Boot', 'Profiles', 'medium', NULL, NULL, 5, 'spring-interview', 11, '["profiles","environment","conditional"]', 'theory', 'spring-boot', '## Spring Boot Profiles

Profiles allow different configurations for different environments (dev, staging, prod).

**Profile-specific files**: `application-dev.yml`, `application-prod.yml`

**Activate via**:
- `spring.profiles.active=prod` in application.properties
- Env variable: `SPRING_PROFILES_ACTIVE=prod`
- JVM arg: `-Dspring.profiles.active=prod`

```java
@Profile("dev")
@Bean
public DataSource h2DataSource() { ... }

@Profile("prod")
@Bean
public DataSource postgresDataSource() { ... }
```

**Multi-document YAML** (Boot 2.4+):
```yaml
---
spring.config.activate.on-profile: prod
server.port: 443
```', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('spring-theory-012', 'What is Spring Boot Actuator?', 'Spring Boot', 'Actuator', 'easy', NULL, NULL, 5, 'spring-interview', 12, '["actuator","health","metrics","monitoring"]', 'theory', 'spring-boot', '## Spring Boot Actuator

Adds production-ready features: HTTP endpoints for monitoring and management.

**Common endpoints**:
- `/actuator/health` — app and dependency health (DB, disk, Redis)
- `/actuator/info` — app metadata
- `/actuator/metrics` — JVM, HTTP, custom metrics
- `/actuator/env` — environment properties
- `/actuator/beans` — all Spring beans
- `/actuator/mappings` — all @RequestMapping endpoints
- `/actuator/loggers` — view/change log levels at runtime

**Enable/expose**:
```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
```

Integrates with **Micrometer** for Prometheus/Grafana metrics.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('spring-theory-013', 'What is DispatcherServlet in Spring MVC?', 'Spring MVC', 'Architecture', 'medium', NULL, NULL, 5, 'spring-interview', 13, '["DispatcherServlet","front-controller","MVC"]', 'theory', 'spring-boot', '## DispatcherServlet

Spring MVC''s **Front Controller** — single servlet that receives all HTTP requests and delegates to handler methods.

**Request flow**:
1. HTTP request → **DispatcherServlet**
2. Consults **HandlerMapping** → finds controller method
3. **HandlerAdapter** invokes controller method
4. Controller returns **ModelAndView** or body object
5. **ViewResolver** resolves view (or `@ResponseBody` → MessageConverter serializes JSON)
6. Response returned to client

Spring Boot auto-configures DispatcherServlet mapped to `/` by default.

```yaml
spring.mvc.servlet.path=/api  # change mapping if needed
```', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('spring-theory-014', 'What are @RequestMapping and its shorthand annotations?', 'Spring MVC', 'Routing', 'easy', NULL, NULL, 5, 'spring-interview', 14, '["RequestMapping","GetMapping","PostMapping","REST"]', 'theory', 'spring-boot', '## @RequestMapping Shortcuts

`@RequestMapping` maps HTTP methods + paths to controller methods.

**Shorthand annotations**:
- `@GetMapping` — HTTP GET
- `@PostMapping` — HTTP POST
- `@PutMapping` — HTTP PUT
- `@PatchMapping` — HTTP PATCH
- `@DeleteMapping` — HTTP DELETE

```java
@RestController
@RequestMapping("/api/users")
public class UserController {
  @GetMapping("/{id}")           // GET /api/users/{id}
  public User getUser(@PathVariable String id) { ... }

  @PostMapping                   // POST /api/users
  public User createUser(@RequestBody UserRequest req) { ... }

  @DeleteMapping("/{id}")        // DELETE /api/users/{id}
  @ResponseStatus(HttpStatus.NO_CONTENT)
  public void deleteUser(@PathVariable String id) { ... }
}
```', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('spring-theory-015', 'What is the difference between @RequestParam, @PathVariable, and @RequestBody?', 'Spring MVC', 'Parameter Binding', 'easy', NULL, NULL, 5, 'spring-interview', 15, '["RequestParam","PathVariable","RequestBody"]', 'theory', 'spring-boot', '## @RequestParam vs @PathVariable vs @RequestBody

- **`@PathVariable`** — value from URI path segment:
```java
GET /users/42
@GetMapping("/{id}") public User get(@PathVariable Long id) { ... }
```

- **`@RequestParam`** — query parameter or form field:
```java
GET /users?page=2&size=10
public Page<User> list(@RequestParam int page, @RequestParam int size) { ... }
```

- **`@RequestBody`** — deserializes HTTP request body (JSON → Java object):
```java
POST /users  body: {"name":"Alice"}
public User create(@RequestBody @Valid UserRequest req) { ... }
```

Use `@RequestHeader` for header values, `@CookieValue` for cookies.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('spring-theory-016', 'What is @ResponseBody and @RestController?', 'Spring MVC', 'REST', 'easy', NULL, NULL, 5, 'spring-interview', 16, '["ResponseBody","RestController","JSON"]', 'theory', 'spring-boot', '## @ResponseBody & @RestController

**`@ResponseBody`** — tells Spring to serialize the method return value directly into the HTTP response body (using `HttpMessageConverter`, typically Jackson → JSON) instead of looking up a view.

**`@RestController`** = `@Controller` + `@ResponseBody` applied to all methods.

```java
@RestController
public class UserController {
  @GetMapping("/users/{id}")
  public UserDTO getUser(@PathVariable Long id) {
    return service.find(id); // auto-serialized to JSON
  }
}
```

Content negotiation: Spring selects the `HttpMessageConverter` based on `Accept` header. Default: Jackson for JSON, JAXB for XML.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('spring-theory-017', 'What is @ControllerAdvice and @ExceptionHandler?', 'Spring MVC', 'Error Handling', 'medium', NULL, NULL, 5, 'spring-interview', 17, '["ControllerAdvice","ExceptionHandler","error-handling"]', 'theory', 'spring-boot', '## @ControllerAdvice & @ExceptionHandler

**`@ExceptionHandler`** — handles specific exceptions thrown by controller methods.

**`@ControllerAdvice`** (or `@RestControllerAdvice`) — applies exception handlers **globally** to all controllers.

```java
@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(ResourceNotFoundException.class)
  @ResponseStatus(HttpStatus.NOT_FOUND)
  public ErrorResponse handleNotFound(ResourceNotFoundException ex) {
    return new ErrorResponse("NOT_FOUND", ex.getMessage());
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  @ResponseStatus(HttpStatus.BAD_REQUEST)
  public ErrorResponse handleValidation(MethodArgumentNotValidException ex) {
    // extract field errors
  }
}
```', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('spring-theory-018', 'What is Spring Data JPA and how does it simplify data access?', 'Spring Data JPA', 'Overview', 'easy', NULL, NULL, 5, 'spring-interview', 18, '["Spring-Data-JPA","repository","CRUD"]', 'theory', 'spring-boot', '## Spring Data JPA

Provides repository abstraction over JPA (Hibernate), eliminating boilerplate CRUD code.

```java
public interface UserRepository extends JpaRepository<User, Long> {
  Optional<User> findByEmail(String email);
  List<User> findByStatusAndCreatedAtAfter(String status, LocalDateTime date);
}
```

**Magic**: Spring Data parses method names and generates JPQL automatically. No SQL needed for simple queries.

**JpaRepository provides**: `save`, `findById`, `findAll`, `delete`, `count`, `existsById`, paging, sorting.

**Custom queries**:
```java
@Query("SELECT u FROM User u WHERE u.email = :email")
Optional<User> findByEmailCustom(@Param("email") String email);
```', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('spring-theory-019', 'What is the difference between @Entity, @Table, @Column?', 'Spring Data JPA', 'JPA Mapping', 'easy', NULL, NULL, 5, 'spring-interview', 19, '["Entity","Table","Column","JPA"]', 'theory', 'spring-boot', '## JPA Mapping Annotations

```java
@Entity
@Table(name = "users", uniqueConstraints = { @UniqueConstraint(columnNames = "email") })
public class User {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "email_address", nullable = false, length = 255)
  private String email;

  @Column(updatable = false)
  private LocalDateTime createdAt;
}
```

- **`@Entity`** — marks class as JPA entity (mapped to a table)
- **`@Table`** — customize table name, schema, constraints
- **`@Column`** — customize column name, length, nullable, unique
- **`@Id`** — primary key
- **`@GeneratedValue`** — ID generation strategy (IDENTITY, SEQUENCE, AUTO, TABLE)', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('spring-theory-020', 'What is the difference between FetchType.LAZY and FetchType.EAGER?', 'Spring Data JPA', 'Fetch Strategies', 'medium', NULL, NULL, 5, 'spring-interview', 20, '["LAZY","EAGER","fetch","N+1"]', 'theory', 'spring-boot', '## FetchType.LAZY vs EAGER

- **EAGER** — loads associated entities immediately when the parent is loaded (JOIN query or separate query)
- **LAZY** — loads associated entities only when first accessed (proxy; triggers a query on access)

**Defaults**:
- `@OneToMany`, `@ManyToMany` → LAZY
- `@ManyToOne`, `@OneToOne` → EAGER

**N+1 Problem**: loading 100 orders each with LAZY customer → 1 order query + 100 customer queries.
**Fix**: use `@EntityGraph` or JPQL `JOIN FETCH`:
```java
@Query("SELECT o FROM Order o JOIN FETCH o.customer")
List<Order> findAllWithCustomer();
```

**General rule**: prefer LAZY, fetch eagerly only when needed via JOIN FETCH.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('spring-theory-021', 'What is @Transactional in Spring?', 'Spring Data JPA', 'Transactions', 'medium', NULL, NULL, 5, 'spring-interview', 21, '["Transactional","ACID","rollback"]', 'theory', 'spring-boot', '## @Transactional

Demarcates transaction boundaries declaratively — Spring creates a proxy that begins/commits/rolls back a transaction around the method.

```java
@Service
public class TransferService {
  @Transactional
  public void transfer(Long from, Long to, BigDecimal amount) {
    accountRepo.debit(from, amount);
    accountRepo.credit(to, amount);
    // If exception thrown here → both operations rolled back
  }
}
```

**Key attributes**:
- `rollbackFor` — default: unchecked exceptions; add checked if needed
- `propagation` — REQUIRED (default), REQUIRES_NEW, NESTED, SUPPORTS, NOT_SUPPORTED
- `isolation` — READ_COMMITTED, REPEATABLE_READ, SERIALIZABLE
- `readOnly = true` — hint for optimization (no dirty checking)

**Self-invocation pitfall**: calling a `@Transactional` method from within the same bean bypasses the proxy.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('spring-theory-022', 'What are JPA entity relationships and their annotations?', 'Spring Data JPA', 'Relationships', 'medium', NULL, NULL, 5, 'spring-interview', 22, '["OneToMany","ManyToOne","ManyToMany","JPA"]', 'theory', 'spring-boot', '## JPA Relationships

```java
// One user has many orders
@OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
private List<Order> orders;

// Many orders belong to one user
@ManyToOne
@JoinColumn(name = "user_id")
private User user;

// Many-to-many: students and courses
@ManyToMany
@JoinTable(
  name = "student_course",
  joinColumns = @JoinColumn(name = "student_id"),
  inverseJoinColumns = @JoinColumn(name = "course_id"))
private Set<Course> courses;
```

**`mappedBy`** — marks the non-owning (inverse) side.
**`CascadeType.ALL`** — operations on parent cascade to children (PERSIST, MERGE, REMOVE, REFRESH, DETACH).', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('spring-theory-023', 'What is Spring Security and how does it work?', 'Spring Security', 'Overview', 'medium', NULL, NULL, 5, 'spring-interview', 23, '["Spring-Security","authentication","authorization"]', 'theory', 'spring-boot', '## Spring Security

Provides authentication + authorization for Spring applications via a **filter chain**.

**Filter chain**: every HTTP request passes through `SecurityFilterChain`. Key filters:
1. `UsernamePasswordAuthenticationFilter` — handles form login
2. `BearerTokenAuthenticationFilter` — handles JWT Bearer tokens
3. `ExceptionTranslationFilter` — converts auth exceptions to HTTP 401/403
4. `FilterSecurityInterceptor` — checks access rules

**Authentication flow**:
1. Request → filter extracts credentials
2. `AuthenticationManager` → `AuthenticationProvider` → verifies credentials
3. On success: `Authentication` stored in `SecurityContextHolder`
4. Downstream code reads `SecurityContextHolder.getContext().getAuthentication()`', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('spring-theory-024', 'How does JWT authentication work in Spring Security?', 'Spring Security', 'JWT', 'hard', NULL, NULL, 5, 'spring-interview', 24, '["JWT","Bearer","stateless"]', 'theory', 'spring-boot', '## JWT Authentication in Spring Security

**Flow**:
1. Client POSTs credentials → `/auth/login`
2. Server verifies credentials, generates JWT (header.payload.signature)
3. Client stores token and sends as `Authorization: Bearer <token>` on subsequent requests
4. `OncePerRequestFilter` intercepts, validates JWT signature, extracts claims
5. Creates `UsernamePasswordAuthenticationToken`, stores in `SecurityContextHolder`

```java
@Override
protected void doFilterInternal(HttpServletRequest req, ...) {
  String token = extractToken(req);
  if (token != null && jwtUtil.validate(token)) {
    UsernamePasswordAuthenticationToken auth =
      new UsernamePasswordAuthenticationToken(username, null, authorities);
    SecurityContextHolder.getContext().setAuthentication(auth);
  }
  filterChain.doFilter(req, res);
}
```

**JWT is stateless** — no server-side session needed.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('spring-theory-025', 'What is the difference between authentication and authorization?', 'Spring Security', 'Concepts', 'easy', NULL, NULL, 5, 'spring-interview', 25, '["authentication","authorization","security"]', 'theory', 'spring-boot', '## Authentication vs Authorization

**Authentication** — WHO are you? Verifying identity.
- Credentials: username/password, OAuth token, API key, certificate
- Result: `Authentication` object stored in `SecurityContextHolder`

**Authorization** — WHAT can you do? Verifying permissions.
- Based on roles/authorities from the authenticated principal
- Applied at method level (`@PreAuthorize`) or URL level (`requestMatchers`)

```java
http.authorizeHttpRequests(auth -> auth
  .requestMatchers("/public/**").permitAll()
  .requestMatchers("/admin/**").hasRole("ADMIN")
  .anyRequest().authenticated());

@PreAuthorize("hasRole(''MANAGER'') or #userId == authentication.name")
public void updateUser(Long userId) { ... }
```', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('spring-theory-026', 'What are REST principles and HTTP methods?', 'REST API Design', 'Principles', 'easy', NULL, NULL, 5, 'spring-interview', 26, '["REST","HTTP","CRUD","idempotent"]', 'theory', 'spring-boot', '## REST Principles

**REST** (Representational State Transfer) constraints:
1. **Stateless** — each request contains all information; no server-side session
2. **Client-server** — separation of concerns
3. **Cacheable** — responses must indicate cacheability
4. **Layered system** — client unaware of intermediaries
5. **Uniform interface** — resources identified by URIs, HATEOAS

**HTTP Methods**:
| Method | Operation | Idempotent? | Safe? |
|--------|-----------|-------------|-------|
| GET | Read | Yes | Yes |
| POST | Create | No | No |
| PUT | Full update/replace | Yes | No |
| PATCH | Partial update | No | No |
| DELETE | Delete | Yes | No |

**Best practices**: plural nouns in URIs (`/users`, not `/getUser`); use HTTP status codes correctly.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('spring-theory-027', 'What are common HTTP status codes used in REST APIs?', 'REST API Design', 'Status Codes', 'easy', NULL, NULL, 5, 'spring-interview', 27, '["HTTP","status-codes","REST"]', 'theory', 'spring-boot', '## Common HTTP Status Codes

**2xx Success**:
- `200 OK` — successful GET, PUT, PATCH
- `201 Created` — successful POST (include `Location` header)
- `204 No Content` — successful DELETE

**3xx Redirection**:
- `301 Moved Permanently` — resource has new URI
- `304 Not Modified` — cached response still valid

**4xx Client Error**:
- `400 Bad Request` — invalid input/validation
- `401 Unauthorized` — missing/invalid credentials
- `403 Forbidden` — authenticated but not permitted
- `404 Not Found` — resource doesn''t exist
- `409 Conflict` — duplicate/version conflict
- `422 Unprocessable Entity` — semantic validation failure

**5xx Server Error**:
- `500 Internal Server Error` — unexpected server failure
- `503 Service Unavailable` — overloaded/maintenance', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('spring-theory-028', 'What is Spring Boot validation with @Valid and Bean Validation?', 'Spring MVC', 'Validation', 'medium', NULL, NULL, 5, 'spring-interview', 28, '["Valid","Bean-Validation","Hibernate-Validator"]', 'theory', 'spring-boot', '## Bean Validation in Spring Boot

Spring Boot auto-configures Hibernate Validator (JSR-380 implementation).

```java
public class CreateUserRequest {
  @NotBlank(message = "Name is required")
  private String name;

  @Email
  @NotNull
  private String email;

  @Min(18) @Max(120)
  private int age;

  @Pattern(regexp = "[A-Z]{2}\\d{6}")
  private String passportNumber;
}

@PostMapping
public User create(@RequestBody @Valid CreateUserRequest req) { ... }
// Spring catches MethodArgumentNotValidException on validation failure
```

**Common annotations**: `@NotNull`, `@NotBlank`, `@Size`, `@Min`, `@Max`, `@Email`, `@Pattern`, `@Positive`, `@NotEmpty`', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('spring-theory-029', 'What are microservices and how do they differ from a monolith?', 'Microservices', 'Concepts', 'medium', NULL, NULL, 5, 'spring-interview', 29, '["microservices","monolith","architecture"]', 'theory', 'spring-boot', '## Microservices vs Monolith

**Monolith**: single deployable unit containing all features. Simple to develop/test initially; becomes hard to scale and deploy as it grows.

**Microservices**: suite of small, independently deployable services each owning its domain and data.

| Aspect | Monolith | Microservices |
|--------|---------|---------------|
| Deployment | One unit | Per service |
| Scaling | All-or-nothing | Per service |
| Tech stack | Single | Per service (polyglot) |
| Data | Shared DB | Database per service |
| Failure | One crash breaks all | Fault isolated |
| Complexity | Simple infra | Complex (service mesh, distributed tracing) |

**Spring Cloud** provides: service discovery (Eureka), load balancing, circuit breaking (Resilience4j), API gateway, config server.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('spring-theory-030', 'What is the circuit breaker pattern?', 'Microservices', 'Resilience', 'hard', NULL, NULL, 5, 'spring-interview', 30, '["circuit-breaker","resilience","Resilience4j"]', 'theory', 'spring-boot', '## Circuit Breaker Pattern

Prevents cascading failures when a downstream service is unavailable — "fails fast" instead of blocking threads.

**States**:
- **CLOSED** — requests pass through normally; failure count tracked
- **OPEN** — after threshold failures; calls immediately return fallback without hitting downstream
- **HALF-OPEN** — after cooldown; limited calls probe if service recovered

```java
@CircuitBreaker(name = "paymentService", fallbackMethod = "fallbackPayment")
public PaymentResult processPayment(Order order) {
  return paymentClient.charge(order);
}
public PaymentResult fallbackPayment(Order order, Exception ex) {
  return PaymentResult.queued(); // graceful degradation
}
```

**Resilience4j** is the modern Spring Boot circuit breaker library (replaces Hystrix).', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('spring-theory-031', 'What is an API Gateway in microservices?', 'Microservices', 'API Gateway', 'medium', NULL, NULL, 5, 'spring-interview', 31, '["API-gateway","routing","Spring-Cloud-Gateway"]', 'theory', 'spring-boot', '## API Gateway

Single entry point for all client requests — routes to appropriate microservices, handles cross-cutting concerns.

**Responsibilities**:
- **Routing** — forward requests to correct service
- **Authentication/Authorization** — validate JWT before routing
- **Rate limiting** — prevent abuse
- **Load balancing** — distribute among service instances
- **SSL termination**
- **Request/Response transformation**
- **Logging/tracing**

**Spring Cloud Gateway**:
```yaml
spring.cloud.gateway.routes:
  - id: user-service
    uri: lb://USER-SERVICE
    predicates:
      - Path=/api/users/**
    filters:
      - StripPrefix=1
      - name: CircuitBreaker
```', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('spring-theory-032', 'What is Aspect-Oriented Programming (AOP) in Spring?', 'Spring AOP', 'Concepts', 'hard', NULL, NULL, 5, 'spring-interview', 32, '["AOP","aspect","advice","pointcut"]', 'theory', 'spring-boot', '## Spring AOP

Allows modularizing **cross-cutting concerns** (logging, security, transactions) that would otherwise be scattered across many classes.

**Key concepts**:
- **Aspect** — class containing cross-cutting logic (`@Aspect`)
- **Advice** — action taken at a join point: `@Before`, `@After`, `@Around`, `@AfterReturning`, `@AfterThrowing`
- **Pointcut** — expression matching join points (where to apply advice)
- **Join point** — a point in execution (method call in Spring AOP)
- **Weaving** — applying aspects to target objects (Spring: proxy-based, runtime)

```java
@Aspect @Component
public class LoggingAspect {
  @Around("execution(* com.example.service.*.*(..))")
  public Object log(ProceedingJoinPoint pjp) throws Throwable {
    long start = System.currentTimeMillis();
    Object result = pjp.proceed();
    log.info("{} took {}ms", pjp.getSignature(), System.currentTimeMillis()-start);
    return result;
  }
}
```', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('spring-theory-033', 'What is @SpringBootTest and when should you use it?', 'Testing', 'Integration Tests', 'medium', NULL, NULL, 5, 'spring-interview', 33, '["SpringBootTest","integration-test","context"]', 'theory', 'spring-boot', '## @SpringBootTest

Loads the **full Spring application context** for integration tests.

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
class UserControllerIT {
  @Autowired TestRestTemplate restTemplate;
  @LocalServerPort int port;

  @Test
  void createUser_returnsCreated() {
    ResponseEntity<User> res = restTemplate.postForEntity(
      "/api/users", new CreateUserRequest("Alice", "alice@ex.com"), User.class);
    assertThat(res.getStatusCode()).isEqualTo(HttpStatus.CREATED);
  }
}
```

**WebEnvironment options**:
- `RANDOM_PORT` — starts embedded server on random port
- `MOCK` (default) — no real server; use `MockMvc`
- `NONE` — no web layer

**Use when**: verifying full stack; slower than unit tests; use sparingly.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('spring-theory-034', 'What is @WebMvcTest and MockMvc?', 'Testing', 'Web Layer Tests', 'medium', NULL, NULL, 5, 'spring-interview', 34, '["WebMvcTest","MockMvc","slice-test"]', 'theory', 'spring-boot', '## @WebMvcTest & MockMvc

**@WebMvcTest** — loads only the web layer (controllers, filters, security); mocks all service beans.

```java
@WebMvcTest(UserController.class)
class UserControllerTest {
  @Autowired MockMvc mockMvc;
  @MockBean UserService userService;  // mock the dependency

  @Test
  void getUser_returns200() throws Exception {
    when(userService.find(1L)).thenReturn(new User(1L, "Alice"));

    mockMvc.perform(get("/api/users/1"))
      .andExpect(status().isOk())
      .andExpect(jsonPath("$.name").value("Alice"));
  }
}
```

Faster than `@SpringBootTest` — only wires web components. Use for testing controller logic, request mapping, validation, error handling.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('spring-theory-035', 'What is @DataJpaTest?', 'Testing', 'Data Layer Tests', 'medium', NULL, NULL, 5, 'spring-interview', 35, '["DataJpaTest","H2","repository"]', 'theory', 'spring-boot', '## @DataJpaTest

Loads only JPA components (repositories, entities, DataSource) with an **in-memory H2** database by default. Rolls back each test.

```java
@DataJpaTest
class UserRepositoryTest {
  @Autowired UserRepository repo;

  @Test
  void findByEmail_returnsUser() {
    repo.save(new User("Alice", "alice@ex.com"));
    Optional<User> found = repo.findByEmail("alice@ex.com");
    assertThat(found).isPresent();
    assertThat(found.get().getName()).isEqualTo("Alice");
  }
}
```

**Use real DB**: annotate with `@AutoConfigureTestDatabase(replace = NONE)` and configure a Testcontainers PostgreSQL.

**Slice tests** (WebMvcTest, DataJpaTest, etc.) are faster than full SpringBootTest — prefer them for focused unit/integration tests.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('spring-theory-036', 'What is @Value and @ConfigurationProperties in Spring Boot?', 'Spring Boot', 'Configuration', 'medium', NULL, NULL, 5, 'spring-interview', 36, '["Value","ConfigurationProperties","externalized-config"]', 'theory', 'spring-boot', '## @Value vs @ConfigurationProperties

**`@Value`** — inject single property:
```java
@Value("${app.jwt.secret}")
private String jwtSecret;

@Value("${app.max-retries:3}") // with default
private int maxRetries;
```

**`@ConfigurationProperties`** — bind a group of properties to a class (type-safe, IDE-friendly):
```java
@ConfigurationProperties(prefix = "app.mail")
@Component
public class MailProperties {
  private String host;
  private int port = 25;
  // getters/setters or record-style constructor
}
```
```yaml
app.mail.host: smtp.example.com
app.mail.port: 587
```

Prefer `@ConfigurationProperties` for groups of related settings — validates with `@Validated`.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('spring-theory-037', 'What is Spring Boot externalized configuration and its priority order?', 'Spring Boot', 'Configuration', 'medium', NULL, NULL, 5, 'spring-interview', 37, '["externalized-config","priority","environment"]', 'theory', 'spring-boot', '## Externalized Configuration Priority

Spring Boot loads configuration from many sources; **higher number = higher priority** (overrides lower):

1. Default properties (`SpringApplication.setDefaultProperties`)
2. `@PropertySource` annotations on `@Configuration`
3. `application.properties` / `application.yml`
4. Profile-specific: `application-{profile}.yml`
5. OS environment variables
6. Java System properties (`-D`)
7. JNDI
8. `RandomValuePropertySource`
9. Command-line arguments (`--key=value`) — highest in practice

**Practical implication**: you can override any property from application.yml with an environment variable (useful for Docker/K8s secrets without changing code).', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('spring-theory-038', 'What is Spring Cache abstraction?', 'Spring Boot', 'Caching', 'medium', NULL, NULL, 5, 'spring-interview', 38, '["cache","Cacheable","CacheEvict","Redis"]', 'theory', 'spring-boot', '## Spring Cache Abstraction

Declarative caching — add annotations, Spring handles the cache interaction.

```java
@Service
public class ProductService {
  @Cacheable("products")          // cache result; skip method if cached
  public Product findById(Long id) { return repo.findById(id).orElseThrow(); }

  @CacheEvict("products")        // remove from cache on update
  public Product update(Long id, ProductDTO dto) { ... }

  @CachePut("products")          // update cache after method executes
  public Product save(Product p) { return repo.save(p); }
}
```

**Enable**: `@EnableCaching` on `@Configuration`.

**Cache providers**: ConcurrentHashMap (default), Caffeine (in-process, high-performance), Redis (distributed), Hazelcast.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('spring-theory-039', 'What is Spring Boot DevTools?', 'Spring Boot', 'Developer Tools', 'easy', NULL, NULL, 5, 'spring-interview', 39, '["DevTools","hot-reload","LiveReload"]', 'theory', 'spring-boot', '## Spring Boot DevTools

Optional dev-time dependency that improves developer experience:

1. **Automatic restart** — monitors classpath; restarts app when classes change (uses two classloaders — third-party libs don''t reload)
2. **LiveReload** — triggers browser refresh on static resource change (requires browser plugin)
3. **Property overrides** — disables caching (template engine, static resources) in dev mode automatically
4. **Remote DevTools** — update and restart remote apps (use with care)

Add to pom.xml with `<optional>true</optional>` — excluded from production builds automatically.

**Faster than full restart**: IntelliJ + "Build Project" (Ctrl+F9) triggers hot-swap for method body changes.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('spring-theory-040', 'What is Flyway and how is it used in Spring Boot?', 'Spring Data JPA', 'Database Migrations', 'medium', NULL, NULL, 5, 'spring-interview', 40, '["Flyway","migration","schema-versioning"]', 'theory', 'spring-boot', '## Flyway in Spring Boot

Database version control — manages schema changes via versioned SQL scripts.

**Convention**: scripts in `src/main/resources/db/migration/`
- `V1__Create_users_table.sql`
- `V2__Add_email_index.sql`

Flyway runs on startup, applies missing migrations in order, tracks applied versions in `flyway_schema_history` table.

**Spring Boot auto-config**: add `flyway-core` dependency — runs automatically on context startup.

```yaml
spring:
  flyway:
    enabled: true
    locations: classpath:db/migration
    baseline-on-migrate: true # useful for existing DBs
```

**vs Liquibase**: Liquibase uses XML/YAML changesets (more flexible); Flyway uses plain SQL (simpler). Both widely used.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('spring-theory-041', 'What is the difference between @Bean and @Component?', 'Spring Core', 'Beans', 'easy', NULL, NULL, 5, 'spring-interview', 41, '["Bean","Component","configuration"]', 'theory', 'spring-boot', '## @Bean vs @Component

| | @Component | @Bean |
|-|-----------|------|
| Where | On the class | On a method in `@Configuration` class |
| Who creates | Spring via component scan | Method body creates the object |
| When to use | Own classes | Third-party classes you can''t annotate |

```java
// @Component — own class
@Component
class EmailService { ... }

// @Bean — third-party class (ObjectMapper, DataSource)
@Configuration
public class InfraConfig {
  @Bean
  public ObjectMapper objectMapper() {
    return JsonMapper.builder()
      .addModule(new JavaTimeModule())
      .build();
  }
}
```

`@Bean` gives you full programmatic control over instantiation.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('spring-theory-042', 'What is Spring Event system?', 'Spring Core', 'Events', 'medium', NULL, NULL, 5, 'spring-interview', 42, '["ApplicationEvent","EventListener","publish-subscribe"]', 'theory', 'spring-boot', '## Spring Event System

Built-in publish-subscribe mechanism for decoupled communication between beans.

**Publish**:
```java
@Service
public class UserService {
  private final ApplicationEventPublisher publisher;
  void createUser(User u) {
    repo.save(u);
    publisher.publishEvent(new UserCreatedEvent(this, u));
  }
}
```

**Listen**:
```java
@EventListener
public void onUserCreated(UserCreatedEvent event) {
  emailService.sendWelcome(event.getUser());
}
```

**Async**: `@Async @EventListener` — runs handler on a different thread.

**Transactional events**: `@TransactionalEventListener(phase = AFTER_COMMIT)` — only fires if the publishing transaction commits.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('spring-theory-043', 'What is Spring RestTemplate vs WebClient?', 'Spring Boot', 'HTTP Client', 'medium', NULL, NULL, 5, 'spring-interview', 43, '["RestTemplate","WebClient","reactive","HTTP-client"]', 'theory', 'spring-boot', '## RestTemplate vs WebClient

**RestTemplate** (legacy, blocking):
```java
User user = restTemplate.getForObject("https://api.example.com/users/1", User.class);
```

**WebClient** (Spring 5+, reactive, non-blocking):
```java
User user = webClient.get()
  .uri("/users/{id}", 1)
  .retrieve()
  .bodyToMono(User.class)
  .block(); // blocking call (in non-reactive context)
```

**Differences**:
| | RestTemplate | WebClient |
|-|-------------|----------|
| Blocking | Yes | Non-blocking (reactive) |
| Status | Deprecated (Boot 3.2) | Preferred |
| Streaming | No | Yes |
| Error handling | Throws exception | `onStatus` / `onErrorResume` |

**Spring Boot 3**: use `WebClient` or **`RestClient`** (new fluent, blocking client).', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('spring-theory-044', 'What is @Scheduled in Spring Boot?', 'Spring Boot', 'Scheduling', 'easy', NULL, NULL, 5, 'spring-interview', 44, '["Scheduled","cron","fixedRate","fixedDelay"]', 'theory', 'spring-boot', '## @Scheduled

Runs methods on a schedule. Enable with `@EnableScheduling` on `@Configuration`.

```java
@Scheduled(fixedRate = 5000)          // every 5 seconds
public void pollQueue() { ... }

@Scheduled(fixedDelay = 1000)         // 1s after last completion
public void cleanTemp() { ... }

@Scheduled(cron = "0 0 2 * * *")     // 2 AM every day
public void nightlyReport() { ... }

@Scheduled(cron = "0 0 * * * MON-FRI") // every hour on weekdays
public void syncData() { ... }
```

**Cron format**: `second minute hour day-of-month month day-of-week`

**Single-threaded by default** — use `@Async` on the method and configure a `TaskScheduler` bean to run tasks concurrently.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('spring-theory-045', 'What is Spring @Async and how does it work?', 'Spring Boot', 'Async', 'medium', NULL, NULL, 5, 'spring-interview', 45, '["Async","thread-pool","CompletableFuture"]', 'theory', 'spring-boot', '## @Async in Spring

Runs a method asynchronously on a thread pool. Enable with `@EnableAsync`.

```java
@Service
public class NotificationService {
  @Async
  public CompletableFuture<Void> sendEmail(String to) {
    // runs on separate thread
    emailClient.send(to);
    return CompletableFuture.completedFuture(null);
  }
}
```

**Configure thread pool**:
```java
@Bean
public TaskExecutor asyncExecutor() {
  ThreadPoolTaskExecutor ex = new ThreadPoolTaskExecutor();
  ex.setCorePoolSize(4);
  ex.setMaxPoolSize(10);
  ex.setQueueCapacity(100);
  return ex;
}
```

**Pitfalls**: self-invocation bypasses proxy (same class call); void methods can''t propagate exceptions to caller — return `CompletableFuture` instead.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('spring-theory-046', 'What is the difference between CrudRepository, JpaRepository, and PagingAndSortingRepository?', 'Spring Data JPA', 'Repository Hierarchy', 'medium', NULL, NULL, 5, 'spring-interview', 46, '["CrudRepository","JpaRepository","PagingAndSortingRepository"]', 'theory', 'spring-boot', '## Spring Data Repository Hierarchy

```
Repository (marker)
└── CrudRepository<T,ID>
    └── PagingAndSortingRepository<T,ID>
        └── JpaRepository<T,ID>
```

- **`CrudRepository`** — save, findById, findAll, delete, count, existsById
- **`PagingAndSortingRepository`** — adds `findAll(Pageable)`, `findAll(Sort)`
- **`JpaRepository`** — adds `saveAll`, `flush`, `saveAndFlush`, `deleteInBatch`, `getReferenceById`

**Use `JpaRepository`** in Spring Boot JPA projects — it includes everything and uses JPA-specific features.

**Pagination**:
```java
Page<User> page = repo.findAll(PageRequest.of(0, 20, Sort.by("name")));
```', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('spring-theory-047', 'What is N+1 query problem and how to fix it in Spring Data JPA?', 'Spring Data JPA', 'Performance', 'hard', NULL, NULL, 5, 'spring-interview', 47, '["N+1","EntityGraph","JOIN-FETCH","performance"]', 'theory', 'spring-boot', '## N+1 Problem

Loading N entities each with a LAZY association triggers N extra queries.

```java
List<Order> orders = orderRepo.findAll(); // 1 query for orders
for (Order o : orders) {
  o.getCustomer().getName(); // 1 query per order — N queries total!
}
```

**Fixes**:

1. **JOIN FETCH** (JPQL):
```java
@Query("SELECT o FROM Order o JOIN FETCH o.customer")
List<Order> findAllWithCustomer();
```

2. **@EntityGraph**:
```java
@EntityGraph(attributePaths = {"customer", "items"})
List<Order> findAll();
```

3. **Projections** — select only required fields (DTO projection)

4. **Batch fetching**: `@BatchSize(size=50)` — loads 50 associations in one IN query.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('spring-theory-048', 'What is Spring @Cacheable pitfall with self-invocation?', 'Spring Core', 'AOP Proxy', 'hard', NULL, NULL, 5, 'spring-interview', 48, '["Cacheable","self-invocation","AOP","proxy"]', 'theory', 'spring-boot', '## Self-Invocation Pitfall

Spring AOP (`@Cacheable`, `@Transactional`, `@Async`) works via **proxy** — the advice is applied only when calling through the proxy.

When a bean calls its own method directly (self-invocation), the proxy is bypassed:

```java
@Service
public class ProductService {
  @Cacheable("products")
  public Product findById(Long id) { ... }

  public List<Product> findAll(List<Long> ids) {
    return ids.stream()
      .map(id -> this.findById(id)) // BUG: ''this'' bypasses proxy!
      .toList();
  }
}
```

**Fix options**:
1. Move cached method to a different bean (inject it)
2. Inject self: `@Autowired ProductService self;`
3. Use `@Scope(proxyMode = TARGET_CLASS)`
4. Use AspectJ weaving (no proxy limitation)', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('spring-theory-049', 'What is Spring Boot Actuator health indicator?', 'Spring Boot', 'Actuator', 'medium', NULL, NULL, 5, 'spring-interview', 49, '["health","HealthIndicator","liveness","readiness"]', 'theory', 'spring-boot', '## Custom Health Indicators

Spring Boot Actuator''s `/actuator/health` aggregates health from built-in (DB, disk space, Redis) and custom indicators.

```java
@Component
public class PaymentServiceHealthIndicator implements HealthIndicator {
  @Override
  public Health health() {
    try {
      paymentClient.ping();
      return Health.up().withDetail("payment-gateway", "reachable").build();
    } catch (Exception e) {
      return Health.down().withDetail("error", e.getMessage()).build();
    }
  }
}
```

**Kubernetes probes**:
- `/actuator/health/liveness` — is the app alive? (restart if DOWN)
- `/actuator/health/readiness` — ready to serve traffic? (remove from LB if DOWN)', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('spring-theory-050', 'What is the difference between @Controller and @RestController?', 'Spring MVC', 'Controllers', 'easy', NULL, NULL, 5, 'spring-interview', 50, '["Controller","RestController","ResponseBody"]', 'theory', 'spring-boot', '## @Controller vs @RestController

**`@Controller`** — traditional MVC controller; return value is treated as a **view name** (resolved by ViewResolver).

```java
@Controller
public class HomeController {
  @GetMapping("/")
  public String home(Model model) {
    model.addAttribute("user", user);
    return "home"; // resolves to home.html (Thymeleaf)
  }
}
```

**`@RestController`** = `@Controller` + `@ResponseBody`; return value serialized to HTTP body (JSON).

```java
@RestController
public class UserController {
  @GetMapping("/users")
  public List<User> list() { return service.findAll(); } // auto JSON
}
```

Use `@Controller` for server-side rendering (Thymeleaf, JSP). Use `@RestController` for REST APIs.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('spring-theory-051', 'What is Spring @Conditional and how is it used?', 'Spring Core', 'Conditions', 'hard', NULL, NULL, 5, 'spring-interview', 51, '["Conditional","ConditionalOnClass","conditional-bean"]', 'theory', 'spring-boot', '## @Conditional

Activates a bean/configuration only if a specified condition holds at context refresh.

**Built-in conditions**:
- `@ConditionalOnClass(DataSource.class)` — class is on classpath
- `@ConditionalOnMissingBean(CacheManager.class)` — no bean of type defined yet
- `@ConditionalOnProperty("feature.cache.enabled")` — property is set/true
- `@ConditionalOnExpression("#{!environment[''spring.profiles.active''].contains(''test'')}")`
- `@ConditionalOnWebApplication` — is a web app

**Custom condition**:
```java
@Conditional(OnProductionCondition.class)
@Bean
public MetricsService metricsService() { ... }

class OnProductionCondition implements Condition {
  public boolean matches(ConditionContext ctx, AnnotatedTypeMetadata meta) {
    return "prod".equals(ctx.getEnvironment().getProperty("env"));
  }
}
```', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('spring-theory-052', 'What is CORS and how to handle it in Spring Boot?', 'Spring MVC', 'CORS', 'medium', NULL, NULL, 5, 'spring-interview', 52, '["CORS","cross-origin","CrossOrigin"]', 'theory', 'spring-boot', '## CORS in Spring Boot

**CORS** (Cross-Origin Resource Sharing) — browsers block requests from a different origin (domain/port/protocol) unless the server allows it.

**Method 1**: `@CrossOrigin` on controller:
```java
@CrossOrigin(origins = "https://app.example.com")
@RestController
public class UserController { ... }
```

**Method 2**: Global CORS config (preferred):
```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
  @Override
  public void addCorsMappings(CorsRegistry registry) {
    registry.addMapping("/api/**")
      .allowedOrigins("https://app.example.com")
      .allowedMethods("GET","POST","PUT","DELETE")
      .allowCredentials(true)
      .maxAge(3600);
  }
}
```

**With Spring Security**: must configure CORS in security config too (`http.cors()`).', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('spring-theory-053', 'What are Spring Boot starters and how to create a custom one?', 'Spring Boot', 'Custom Starter', 'hard', NULL, NULL, 5, 'spring-interview', 53, '["custom-starter","autoconfiguration","library"]', 'theory', 'spring-boot', '## Custom Spring Boot Starter

A reusable library that auto-configures itself when added to a Spring Boot project.

**Structure**: Two modules:
1. `my-feature-autoconfigure` — auto-config class + conditions
2. `my-feature-spring-boot-starter` — just a POM pulling in autoconfigure + feature dependencies

**Auto-config class**:
```java
@AutoConfiguration
@ConditionalOnClass(MyFeature.class)
@ConditionalOnMissingBean(MyFeature.class)
public class MyFeatureAutoConfiguration {
  @Bean
  public MyFeature myFeature(MyFeatureProperties props) {
    return new MyFeature(props.getApiKey());
  }
}
```

**Register** in `META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports`:
```
com.example.MyFeatureAutoConfiguration
```', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('spring-theory-054', 'What is Spring Boot Metrics and Micrometer?', 'Spring Boot', 'Observability', 'hard', NULL, NULL, 5, 'spring-interview', 54, '["Micrometer","metrics","Prometheus","Grafana"]', 'theory', 'spring-boot', '## Micrometer & Spring Boot Metrics

**Micrometer** — vendor-neutral metrics facade (like SLF4J for metrics). Spring Boot Actuator uses Micrometer.

**Built-in metrics**: JVM heap/GC, CPU, HTTP request duration/count, DB connection pool.

**Custom metrics**:
```java
@Service
public class OrderService {
  private final Counter ordersCreated;
  private final Timer orderProcessingTime;

  OrderService(MeterRegistry registry) {
    ordersCreated = Counter.builder("orders.created").register(registry);
    orderProcessingTime = Timer.builder("order.processing.time").register(registry);
  }

  void createOrder(Order o) {
    orderProcessingTime.record(() -> {
      processOrder(o);
      ordersCreated.increment();
    });
  }
}
```

Expose to **Prometheus** → visualize in **Grafana**.', 'custom');
