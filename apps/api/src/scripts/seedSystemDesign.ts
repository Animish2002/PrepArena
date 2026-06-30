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
    estimatedMinutes: difficulty === 'easy' ? 15 : difficulty === 'medium' ? 20 : 30,
    sheet: topic, problemNumber: null,
    tags: JSON.stringify([topic, 'system-design']),
    questionType: 'theory', subject: 'system-design',
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
    tags: JSON.stringify([topic, 'system-design', 'mcq']),
    questionType: 'mcq', subject: 'system-design',
    content: JSON.stringify({ question, options, correct_index, explanation }),
    contentSource: 'internal',
  }
}

const THEORY: Row[] = [

t('sd-theory-001', 'SOLID Principles — With Real Examples', 'SOLID Principles', 'medium', `
## SOLID Principles

### S — Single Responsibility Principle
A class should have **only one reason to change**.

\`\`\`java
// BAD: UserService does too much
class UserService {
  void saveUser(User user) { /* DB logic */ }
  void sendWelcomeEmail(User user) { /* email logic */ }
  void generateReport(User user) { /* report logic */ }
}

// GOOD: split responsibilities
class UserRepository { void save(User u) { /* DB only */ } }
class EmailService { void sendWelcome(User u) { /* email only */ } }
class ReportService { Report generate(User u) { /* report only */ } }
\`\`\`

### O — Open/Closed Principle
Open for **extension**, closed for **modification**.

\`\`\`java
// BAD: add discount type → modify existing code
double getDiscount(String type, double price) {
  if (type.equals("STUDENT")) return price * 0.9;
  if (type.equals("SENIOR")) return price * 0.8;
  // Adding NEW type means changing this method!
}

// GOOD: extend without modifying
interface DiscountStrategy { double apply(double price); }
class StudentDiscount implements DiscountStrategy { ... }
class SeniorDiscount implements DiscountStrategy { ... }
class NewUserDiscount implements DiscountStrategy { ... } // add without modifying others
\`\`\`

### L — Liskov Substitution Principle
Subclasses must be substitutable for their base class.

\`\`\`java
// VIOLATION: Square breaks Rectangle contract
class Rectangle { setWidth(int w); setHeight(int h); }
class Square extends Rectangle {
  setWidth(int w) { super.setWidth(w); super.setHeight(w); } // breaks LSP!
}

// FIX: separate shapes — don't force inheritance where it doesn't fit
interface Shape { int area(); }
class Rectangle implements Shape { ... }
class Square implements Shape { ... }
\`\`\`

### I — Interface Segregation Principle
Clients should not depend on interfaces they don't use.

\`\`\`java
// BAD: fat interface
interface Worker { void work(); void eat(); void sleep(); }
// Robot is forced to implement eat() and sleep() which don't make sense

// GOOD: split by client need
interface Workable { void work(); }
interface Eatable { void eat(); }
interface Sleepable { void sleep(); }
class Human implements Workable, Eatable, Sleepable { ... }
class Robot implements Workable { ... } // only what's needed
\`\`\`

### D — Dependency Inversion Principle
High-level modules should not depend on low-level modules. Both should depend on **abstractions**.

\`\`\`java
// BAD: high-level depends on low-level
class OrderService {
  private MySQLDatabase db = new MySQLDatabase(); // coupled to MySQL!
}

// GOOD: depend on abstraction
interface Database { void save(Order o); }
class MySQLDatabase implements Database { ... }
class MongoDatabase implements Database { ... }

class OrderService {
  private final Database db; // depends on interface
  OrderService(Database db) { this.db = db; } // injected — easily swappable
}
\`\`\`
`),

t('sd-theory-002', 'Design Patterns — Creational', 'Design Patterns', 'medium', `
## Creational Design Patterns

### Singleton
Ensure only ONE instance exists globally.

\`\`\`java
public class DatabaseConnection {
  private static volatile DatabaseConnection instance;
  private Connection connection;

  private DatabaseConnection() {
    connection = DriverManager.getConnection(DB_URL);
  }

  // Thread-safe double-checked locking
  public static DatabaseConnection getInstance() {
    if (instance == null) {
      synchronized (DatabaseConnection.class) {
        if (instance == null) {
          instance = new DatabaseConnection();
        }
      }
    }
    return instance;
  }
}
\`\`\`
**Use for**: DB connections, config managers, thread pools, caches

### Factory Method
Let subclasses decide which class to instantiate.
\`\`\`java
abstract class NotificationFactory {
  abstract Notification createNotification(); // factory method
  void send(String msg) { createNotification().send(msg); }
}
class EmailFactory extends NotificationFactory {
  Notification createNotification() { return new EmailNotification(); }
}
class SMSFactory extends NotificationFactory {
  Notification createNotification() { return new SMSNotification(); }
}
\`\`\`

### Abstract Factory
Create families of related objects.
\`\`\`java
interface UIFactory { Button createButton(); Dialog createDialog(); }
class WindowsUIFactory implements UIFactory { ... }
class MacUIFactory implements UIFactory { ... }
// Client uses UIFactory — doesn't know it's Windows or Mac
\`\`\`

### Builder
Construct complex objects step by step.
\`\`\`java
User user = new User.Builder("Alice", "alice@example.com")
    .age(25)
    .phone("9876543210")
    .address("Mumbai")
    .role(Role.ADMIN)
    .build();
// No 10-argument constructor, optional fields handled cleanly
\`\`\`

### Prototype
Clone existing objects instead of creating from scratch.
\`\`\`java
abstract class Shape implements Cloneable {
  abstract Shape clone();
}
class Circle extends Shape {
  Circle clone() { return new Circle(this.radius, this.color); }
}
// Useful when object creation is expensive (DB query, API call)
\`\`\`
`),

t('sd-theory-003', 'Design Patterns — Structural', 'Design Patterns', 'medium', `
## Structural Design Patterns

### Adapter
Make incompatible interfaces work together.
\`\`\`java
// Old payment gateway
interface OldPayment { void pay(int amountInPaisa); }

// New interface expected by our system
interface PaymentGateway { void processPayment(double amount); }

// Adapter bridges the gap
class PaymentAdapter implements PaymentGateway {
  private OldPayment oldGateway;
  PaymentAdapter(OldPayment g) { this.oldGateway = g; }

  void processPayment(double amount) {
    oldGateway.pay((int)(amount * 100)); // convert rupees to paisa
  }
}
\`\`\`

### Decorator
Add behavior to objects dynamically without subclassing.
\`\`\`java
interface Coffee { double getCost(); String getDescription(); }

class SimpleCoffee implements Coffee {
  public double getCost() { return 50; }
  public String getDescription() { return "Simple coffee"; }
}

abstract class CoffeeDecorator implements Coffee {
  protected Coffee coffee;
  CoffeeDecorator(Coffee c) { this.coffee = c; }
}

class MilkDecorator extends CoffeeDecorator {
  MilkDecorator(Coffee c) { super(c); }
  public double getCost() { return coffee.getCost() + 20; }
  public String getDescription() { return coffee.getDescription() + ", milk"; }
}

// Usage
Coffee order = new MilkDecorator(new SugarDecorator(new SimpleCoffee()));
// 50 + 10 + 20 = 80, "Simple coffee, sugar, milk"
\`\`\`

### Facade
Simplified interface to a complex subsystem.
\`\`\`java
// Complex subsystem
class Inventory { boolean checkStock(String item) { ... } }
class Payment { boolean charge(double amount) { ... } }
class Shipping { void ship(Order order) { ... } }

// Simple facade
class OrderFacade {
  private Inventory inventory;
  private Payment payment;
  private Shipping shipping;

  boolean placeOrder(String item, double amount) {
    if (!inventory.checkStock(item)) return false;
    if (!payment.charge(amount)) return false;
    shipping.ship(new Order(item));
    return true;
  }
}
// Client only calls placeOrder() — doesn't know internals
\`\`\`

### Proxy
Control access to another object.
\`\`\`java
// Cache proxy for expensive DB operation
class UserServiceProxy implements UserService {
  private UserService realService;
  private Map<String, User> cache = new HashMap<>();

  User getUser(String id) {
    if (!cache.containsKey(id)) {
      cache.put(id, realService.getUser(id)); // fetch from DB
    }
    return cache.get(id); // return from cache
  }
}
\`\`\`

### Composite
Treat individual objects and groups uniformly.
\`\`\`java
interface FileSystemItem { long getSize(); void print(String indent); }
class File implements FileSystemItem { ... }
class Directory implements FileSystemItem {
  List<FileSystemItem> children = new ArrayList<>();
  long getSize() { return children.stream().mapToLong(FileSystemItem::getSize).sum(); }
}
// Directory contains Files and other Directories — uniform interface
\`\`\`
`),

t('sd-theory-004', 'Design Patterns — Behavioral', 'Design Patterns', 'hard', `
## Behavioral Design Patterns

### Observer (Event-Driven)
\`\`\`java
interface Observer { void update(String event, Object data); }
interface Subject {
  void subscribe(Observer o);
  void unsubscribe(Observer o);
  void notify(String event, Object data);
}

class EventBus implements Subject {
  private Map<String, List<Observer>> listeners = new HashMap<>();

  void subscribe(String event, Observer o) {
    listeners.computeIfAbsent(event, k -> new ArrayList<>()).add(o);
  }
  void notify(String event, Object data) {
    listeners.getOrDefault(event, List.of()).forEach(o -> o.update(event, data));
  }
}
// Use: stock price updates, UI events, notifications
\`\`\`

### Strategy
Interchangeable algorithms.
\`\`\`java
interface SortStrategy { void sort(int[] arr); }
class BubbleSort implements SortStrategy { ... }
class QuickSort implements SortStrategy { ... }
class MergeSort implements SortStrategy { ... }

class Sorter {
  private SortStrategy strategy;
  Sorter(SortStrategy s) { this.strategy = s; }
  void sort(int[] arr) { strategy.sort(arr); }
}

// Switch algorithm at runtime
sorter.setStrategy(new QuickSort());
\`\`\`

### Command
Encapsulate requests as objects (enables undo/redo, queuing).
\`\`\`java
interface Command { void execute(); void undo(); }

class TypeTextCommand implements Command {
  private Editor editor; private String text; private int position;
  void execute() { editor.insertAt(position, text); }
  void undo() { editor.deleteAt(position, text.length()); }
}

class CommandHistory {
  private Deque<Command> history = new ArrayDeque<>();
  void execute(Command cmd) { cmd.execute(); history.push(cmd); }
  void undo() { if (!history.isEmpty()) history.pop().undo(); }
}
\`\`\`

### Template Method
Define algorithm skeleton, let subclasses fill in steps.
\`\`\`java
abstract class DataExporter {
  // Template method — defines the algorithm
  final void export() {
    connect();
    extractData();
    transformData(); // optional hook
    writeOutput();
    disconnect();
  }
  abstract void extractData();
  abstract void writeOutput();
  void transformData() {} // optional hook with default
  void connect() { /* common implementation */ }
  void disconnect() { /* common implementation */ }
}

class CSVExporter extends DataExporter {
  void extractData() { /* query DB */ }
  void writeOutput() { /* write CSV */ }
}
\`\`\`

### Chain of Responsibility
Pass request along a chain until one handles it.
\`\`\`java
abstract class Handler {
  protected Handler next;
  Handler setNext(Handler h) { this.next = h; return h; }
  abstract boolean handle(Request req);
}

class AuthHandler extends Handler {
  boolean handle(Request req) {
    if (!isAuthenticated(req)) { reject(req); return false; }
    return next != null && next.handle(req);
  }
}
// auth → rateLimiter → validator → businessLogic
\`\`\`
`),

t('sd-theory-005', 'High-Level Design — Scalability Concepts', 'HLD', 'hard', `
## High-Level System Design

### Horizontal vs Vertical Scaling
**Vertical (Scale Up)**: add CPU/RAM to existing server
- Simple, no code changes
- Hard limit (biggest machine available)
- Single point of failure

**Horizontal (Scale Out)**: add more servers behind a load balancer
- Virtually unlimited scale
- Requires stateless design, distributed coordination
- More complex but preferred at scale

### Load Balancer
Distributes traffic across servers.

**Algorithms:**
- **Round Robin**: requests distributed equally in order
- **Least Connections**: sends to least busy server
- **IP Hash**: same client always → same server (session stickiness)
- **Weighted Round Robin**: more powerful servers get more requests

### Caching Strategies
**Cache-aside (Lazy Loading)**:
\`\`\`
Request → Check Cache
  Hit → Return cached value
  Miss → Fetch from DB → Store in cache → Return
\`\`\`

**Write-through**: write to cache AND DB simultaneously (consistent, more writes)

**Write-behind (Write-back)**: write to cache, async write to DB (fast writes, risk of data loss)

**Cache Eviction**: LRU (Least Recently Used), LFU (Least Frequently Used), FIFO

### Database Strategies
**Replication**: Master-slave (writes → master, reads → slaves)
- Read scalability
- High availability (failover to slave)

**Sharding**: partition data across multiple DBs
- Horizontal data scaling
- Shard key must distribute evenly (user_id, geographic, range-based)
- Cross-shard queries are complex

**CAP Theorem**:
- **C**onsistency: all reads see the latest write
- **A**vailability: every request gets a response
- **P**artition Tolerance: system works despite network failures
- Can only guarantee 2 of 3. Modern distributed systems choose CP or AP.

### Message Queues (Async Communication)
Instead of A calling B directly:
\`\`\`
Producer → Queue (Kafka/RabbitMQ/SQS) → Consumer
\`\`\`

Benefits:
- Decoupling: A and B don't need to be up simultaneously
- Load smoothing: queue absorbs traffic spikes
- Retry: failed messages can be retried
- Ordered processing: Kafka partitions maintain order

### CDN (Content Delivery Network)
- Static assets (images, JS, CSS) served from edge nodes near users
- Reduces latency from 100ms+ to <20ms for static content
- Cache-Control headers determine TTL

### Rate Limiting
- **Token Bucket**: tokens added at fixed rate, consumed per request
- **Leaky Bucket**: requests added to queue, processed at fixed rate
- **Fixed Window**: N requests per time window
- **Sliding Window**: rolling count over last N seconds

Implement at: API Gateway, load balancer, or application level
Use Redis for distributed rate limiting (atomic INCR/EXPIRE)
`),

t('sd-theory-006', 'Designing Scalable APIs — REST, Pagination & Versioning', 'API Design', 'medium', `
## API Design Best Practices

### REST principles
\`\`\`
GET    /api/users          — list users
GET    /api/users/:id      — get user
POST   /api/users          — create user
PUT    /api/users/:id      — replace user
PATCH  /api/users/:id      — partial update
DELETE /api/users/:id      — delete user

GET    /api/users/:id/posts — nested resource
POST   /api/users/:id/posts — create post for user
\`\`\`

**Status codes:**
- 200 OK, 201 Created, 204 No Content
- 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found
- 409 Conflict, 422 Unprocessable Entity
- 429 Too Many Requests, 500 Internal Server Error

### Pagination
**Offset-based**: simple, allows jumping to any page
\`\`\`
GET /api/posts?page=3&limit=20
Response: { data: [...], total: 500, page: 3, limit: 20, totalPages: 25 }
// Problem: items can shift if new data is inserted
\`\`\`

**Cursor-based**: consistent, efficient for large datasets
\`\`\`
GET /api/posts?cursor=eyJpZCI6MTAwfQ==&limit=20
Response: { data: [...], nextCursor: "eyJpZCI6MTIwfQ==", hasMore: true }
// cursor = base64(JSON({ id: lastItemId }))
// DB query: WHERE id > lastItemId LIMIT 20
\`\`\`

### API Versioning
\`\`\`
URL versioning:  /api/v1/users  /api/v2/users
Header:          Accept: application/vnd.api+json;version=2
Query param:     /api/users?version=2
\`\`\`

URL versioning is most common and discoverable.

### Error response format (consistent across API)
\`\`\`json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [
      { "field": "email", "message": "must be a valid email" },
      { "field": "age", "message": "must be at least 18" }
    ]
  }
}
\`\`\`

### Idempotency
Safe to call multiple times with same result:
- GET, PUT, DELETE are idempotent by definition
- POST is NOT — use idempotency keys for payment APIs

\`\`\`
POST /api/payments
Idempotency-Key: client-generated-uuid-1234
// Server stores result → same key → returns same result (no double charge)
\`\`\`

### HATEOAS (optional but good practice)
Include links to related actions in response:
\`\`\`json
{
  "id": "1", "status": "pending",
  "_links": {
    "self": "/api/orders/1",
    "approve": { "href": "/api/orders/1/approve", "method": "POST" },
    "cancel": { "href": "/api/orders/1/cancel", "method": "DELETE" }
  }
}
\`\`\`
`),

t('sd-theory-007', 'Designing a URL Shortener (System Design Interview)', 'Case Studies', 'hard', `
## Design a URL Shortener (like bit.ly)

### Requirements clarification
**Functional:**
- Shorten a long URL → short code (e.g., bit.ly/abc123)
- Redirect short URL → original URL
- Optional: custom aliases, expiration, analytics

**Non-functional:**
- 100M URLs created/day, 10B redirects/day
- Reads >> Writes (100:1 ratio)
- High availability (99.99%)
- Low latency (<100ms for redirects)

### Back-of-envelope estimation
- 100M writes/day = ~1,200 writes/second
- 10B reads/day = ~115,000 reads/second
- 500 bytes/URL × 100M/day × 365 days × 5 years = ~90TB storage

### API design
\`\`\`
POST /api/shorten
  Body: { url: "https://...", alias?: "custom", expires?: "2025-01-01" }
  Response: { shortUrl: "https://sho.rt/abc123", code: "abc123" }

GET /{code}
  Response: 301 Redirect to original URL
  (or 302 for analytics tracking)
\`\`\`

### Short code generation
**Option 1: Random** — generate 6-7 char alphanumeric (62^6 = 56B unique codes)
\`\`\`
code = base62(random 6 bytes)
// Check DB for collision, regenerate if exists
// Collision probability is low but must handle
\`\`\`

**Option 2: Counter + Base62** — use distributed counter (Zookeeper/Redis) → base62 encode
\`\`\`
id = atomicIncrement(counter)  // 1000001
code = toBase62(id)            // "4c92" (unique, no collision)
\`\`\`
Pros: no collisions, deterministic. Cons: sequential (predictable), single point for counter.

### Database design
\`\`\`sql
CREATE TABLE urls (
  code VARCHAR(10) PRIMARY KEY,   -- short code
  original_url TEXT NOT NULL,
  user_id VARCHAR(36),
  created_at TIMESTAMP,
  expires_at TIMESTAMP,
  click_count BIGINT DEFAULT 0
);
-- Index on code (primary key)
-- Consider NoSQL (Redis/Cassandra) for better read performance
\`\`\`

### High-level architecture
\`\`\`
Client
  → CDN (cache popular URLs)
  → Load Balancer
  → API Servers (stateless, horizontally scalable)
  → Redis Cache (TTL = 24h for hot URLs, covers ~20% of traffic)
  → Database (MySQL/PostgreSQL, read replicas)
  → Analytics Queue (Kafka → Analytics Service)
\`\`\`

### Caching strategy
Cache the 20% most popular URLs (cover 80% of traffic — Pareto principle):
- Key: short code → Value: original URL
- TTL: 24 hours (or never-expire for very popular URLs)
- Eviction: LRU

### Redirect: 301 vs 302
- **301 Permanent**: browser caches the redirect — fewer server hits, LESS analytics data
- **302 Temporary**: browser hits our server every time — accurate analytics, more load

Choose based on whether you need click tracking.

### Custom domains
Store \`domain\` + \`code\` as composite key. Each tenant has their own namespace.
`),

t('sd-theory-008', 'Designing a Chat System (Real-time Messaging)', 'Case Studies', 'hard', `
## Design a Real-Time Chat System

### Requirements
**Functional:** 1-1 messaging, group chats (up to 500), online status, message history, read receipts
**Non-functional:** 100M DAU, each user sends 20 messages/day → 2B messages/day, low latency (<500ms delivery)

### Real-time delivery — WebSocket
HTTP is request-response — server can't push to client. Options:
- **Polling**: client asks "any new messages?" every N seconds (wasteful)
- **Long polling**: request stays open until message arrives (better, complex)
- **WebSocket**: persistent bi-directional connection (best for chat)
- **Server-Sent Events**: one-way push (good for notifications)

\`\`\`
Client ← WebSocket → Chat Server
       ↓ message
       → Message Service → DB
       → Fan-out to recipient's WebSocket server
\`\`\`

### Message flow (1-1 chat)
\`\`\`
1. Alice sends message via WebSocket to Chat Server A
2. Chat Server A stores message in DB (Message ID, sender, receiver, content, timestamp)
3. Chat Server A looks up: is Bob online? Which server?
   → Presence Service + User-Server mapping (Redis: Bob → Server B)
4. If Bob is online: Chat Server A → Chat Server B (internal gRPC) → Bob's WebSocket
5. If Bob is offline: push notification (FCM/APNs)
\`\`\`

### Database choice
**Messages**: Cassandra / HBase (write-heavy, time-series, horizontal scale)
\`\`\`
Partition key: (sender_id, receiver_id) or conversation_id
Clustering key: message_id (time-based UUID for ordering)
// Efficient queries: "give me last 50 messages in conversation X"
\`\`\`

**User/conversation metadata**: PostgreSQL (ACID for strong consistency)

### Message ID — ordering problem
Never use auto-increment for distributed systems. Use:
- **Snowflake ID**: 64-bit = timestamp(41) + machine_id(10) + sequence(12)
  - K-sortable by time
  - Unique across all servers without coordination

### Group chat fan-out
\`\`\`
Message → Fan-out Service → Message Queue (Kafka topic per group)
                          → N consumers (one per active member)
// For large groups (1000+): write to queue, members pull when online
// For small groups (<50): push to all immediately
\`\`\`

### Online presence
\`\`\`
Redis: { userId: { status: "online", lastSeen: timestamp, serverId: "srv-3" } }
TTL: 30 seconds (heartbeat every 10s)
// Subscribe to keyspace events to detect offline (key expired)
\`\`\`

### Read receipts
\`\`\`
Client sends: { type: "read", messageId: "xxx", conversationId: "yyy" }
Server updates: messages table → read_at = now
Notifies sender via WebSocket
\`\`\`
`),

t('sd-theory-009', 'Microservices — Patterns & Trade-offs', 'Microservices', 'hard', `
## Microservices Architecture

### Monolith vs Microservices
| Aspect | Monolith | Microservices |
|---|---|---|
| Deployment | Deploy entire app | Deploy individual services |
| Scaling | Scale entire app | Scale individual services |
| Technology | One stack | Each service can use different stack |
| Testing | Simpler | Complex (contract testing needed) |
| Latency | In-process calls | Network calls |
| Team size | Small teams | Large teams (Conway's Law) |
| Data | Shared DB | Each service owns its data |

**When to use microservices**: large teams, different scaling needs per service, need independent deployments, clear domain boundaries

### Service communication patterns

**Synchronous (REST/gRPC)**:
- Service A directly calls Service B
- Simple, immediate response
- Tight coupling — B being down affects A

**Asynchronous (Message Queue)**:
- A publishes event to queue, B consumes when ready
- Loose coupling, resilient
- Eventually consistent

### Saga Pattern (distributed transactions)
Problem: How to maintain consistency across multiple services?

**Choreography-based Saga**:
\`\`\`
OrderService creates order (PENDING)
  → emits OrderCreated event
PaymentService processes payment
  → emits PaymentSuccess or PaymentFailed
InventoryService reserves items
  → emits InventoryReserved or InsufficientStock
OrderService updates status to CONFIRMED or CANCELLED

// If any step fails: compensating transactions (rollback)
\`\`\`

**Orchestration-based Saga**:
- Central orchestrator tells each service what to do
- Easier to reason about, single point of failure

### Circuit Breaker
Prevent cascading failures when a service is down:
\`\`\`
States: CLOSED → OPEN → HALF_OPEN → CLOSED

CLOSED: all requests pass through
OPEN: requests blocked immediately (fail fast)
  → after timeout, move to HALF_OPEN
HALF_OPEN: allow test request
  → success → CLOSED
  → failure → back to OPEN
\`\`\`

### API Gateway
Single entry point for all client requests:
- Route to appropriate microservice
- Authentication / Authorization
- Rate limiting
- Request logging
- SSL termination
- Request/response transformation

### Service Discovery
Services register themselves → clients look up addresses dynamically
- **Client-side** (Eureka): client queries registry, chooses instance
- **Server-side** (AWS ALB): load balancer handles discovery

### Data management
"One database per service" rule — never share databases between services:
- Loose coupling
- Independent schema evolution
- Polyglot persistence (each service uses best DB for its needs)

Share data via:
- Events (eventual consistency)
- API calls (real-time but coupled)
- CQRS + Event Sourcing (for complex data flows)
`),

t('sd-theory-010', 'Database Selection — SQL vs NoSQL Decision Framework', 'Databases', 'hard', `
## Database Selection Guide

### When to choose SQL (PostgreSQL, MySQL)
- ACID transactions required (financial, booking systems)
- Complex queries with JOINs across multiple tables
- Schema is well-defined and unlikely to change
- Data relationships are complex

### When to choose NoSQL
- Need to scale horizontally across many nodes
- Schema is flexible or unknown upfront
- High write throughput needed
- Specific access patterns known upfront

### NoSQL types and use cases

**Document (MongoDB, CouchDB)**:
- Flexible schema, nested documents
- Use for: user profiles, product catalogs, CMS
\`\`\`json
{ "_id": "user123", "name": "Alice", "addresses": [{ "city": "Mumbai" }], "preferences": { ... } }
\`\`\`

**Key-Value (Redis, DynamoDB)**:
- O(1) reads/writes by key
- Use for: caching, sessions, real-time leaderboards, rate limiting
\`\`\`
SET user:123:session { token, expires } EX 3600
GET user:123:session
\`\`\`

**Wide-Column (Cassandra, HBase)**:
- Designed for massive write throughput
- Query by partition key (very fast) + optional clustering key (range)
- Use for: time-series data, IoT, chat messages, activity feeds
\`\`\`
CREATE TABLE messages (
  conversation_id UUID,
  message_id TIMEUUID,
  content TEXT,
  PRIMARY KEY (conversation_id, message_id)
) WITH CLUSTERING ORDER BY (message_id DESC);
\`\`\`

**Graph (Neo4j)**:
- Data modeled as nodes and edges
- Use for: social networks, fraud detection, recommendation engines
\`\`\`cypher
MATCH (u:User {id: "alice"})-[:FRIENDS_WITH]->()-[:FRIENDS_WITH]->(suggested)
WHERE NOT (u)-[:FRIENDS_WITH]->(suggested)
RETURN suggested.name
\`\`\`

**Time-Series (InfluxDB, TimescaleDB)**:
- Optimized for time-ordered data
- Use for: monitoring metrics, sensor data, financial tick data

### Indexing strategies
\`\`\`sql
-- B-Tree index: range queries, equality, ORDER BY
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_orders_date ON orders(created_at DESC);

-- Composite index — order matters!
-- This index helps: WHERE status = ? AND created_at > ?
-- Does NOT help: WHERE created_at > ? (without status)
CREATE INDEX idx_orders ON orders(status, created_at);

-- Partial index — smaller, faster for common queries
CREATE INDEX idx_active_users ON users(email) WHERE is_active = true;

-- Full-text index for search
CREATE INDEX idx_products_search ON products USING gin(to_tsvector('english', name || ' ' || description));
\`\`\`

### Read vs Write optimization
- **Read-heavy**: add indexes, read replicas, Redis cache
- **Write-heavy**: minimize indexes, use LSM tree (Cassandra), async writes, write-behind cache
- **Both heavy**: CQRS — separate read model from write model
`),
]

const MCQS: Row[] = [

mcq('sd-mcq-001', 'CAP Theorem', 'HLD', 'hard',
  'According to CAP theorem, which combination does a traditional relational database (SQL) like PostgreSQL typically prioritize?',
  ['AP (Availability + Partition Tolerance)', 'CA (Consistency + Availability)', 'CP (Consistency + Partition Tolerance)', 'All three — CAP theorem doesn\'t apply to SQL'],
  1,
  'Traditional SQL databases (PostgreSQL, MySQL in non-distributed mode) prioritize Consistency and Availability (CA). They sacrifice Partition Tolerance by typically running on a single node or with synchronous replication. In a true network partition, they prefer to fail rather than serve inconsistent data.'),

mcq('sd-mcq-002', 'Horizontal vs Vertical Scaling', 'HLD', 'easy',
  'Which type of scaling is preferred for stateless web servers and why?',
  [
    'Vertical — because it doesn\'t require code changes',
    'Horizontal — because it can scale indefinitely and provides fault tolerance',
    'Horizontal — because it\'s cheaper per unit of performance',
    'Vertical — because it\'s simpler to manage'
  ],
  1,
  'Horizontal scaling (adding more servers) is preferred for stateless web servers because: (1) it has no theoretical upper limit, (2) losing one server doesn\'t take down the system, (3) you can scale up/down based on demand. Stateless design is key — each request can be handled by any server.'),

mcq('sd-mcq-003', 'Database sharding key', 'Databases', 'hard',
  'You\'re sharding a social media database. Which shard key would lead to a "hot shard" problem?',
  [
    'user_id (random hash)',
    'created_at (time-based)',
    'Geographic region',
    'Random UUID'
  ],
  1,
  'Time-based sharding puts all new data in the "current" shard, creating a hot shard that receives all writes while older shards sit idle. This is called temporal skew. User_id hash, geographic, and UUIDs distribute load more evenly across shards.'),

mcq('sd-mcq-004', 'WebSocket vs Polling', 'Real-time Systems', 'medium',
  'For a real-time collaborative document editor (like Google Docs), which communication protocol is most appropriate?',
  [
    'Short polling every 1 second',
    'Long polling',
    'Server-Sent Events (SSE)',
    'WebSocket'
  ],
  3,
  'WebSocket is bidirectional — both client and server can send data at any time without a new HTTP request. For collaborative editing, clients need to SEND keystrokes and RECEIVE others\' changes simultaneously. SSE is one-way (server → client only). Polling has high latency and server overhead.'),

mcq('sd-mcq-005', 'Cache eviction policies', 'Caching', 'medium',
  'For a social media news feed where recent posts are most accessed, which cache eviction policy is most appropriate?',
  [
    'FIFO (First In, First Out)',
    'LFU (Least Frequently Used)',
    'LRU (Least Recently Used)',
    'Random'
  ],
  2,
  'LRU (Least Recently Used) evicts items that haven\'t been accessed recently — perfect for a news feed where recent content gets the most traffic. As posts age, they naturally get evicted when the cache is full. LFU would keep very old viral posts too long; FIFO ignores access patterns entirely.'),

mcq('sd-mcq-006', 'Message queue use case', 'HLD', 'medium',
  'An e-commerce system needs to send order confirmation emails. The email service is slow (3 seconds). Which pattern prevents the user from waiting 3 seconds for the checkout response?',
  [
    'Make the email service faster',
    'Use a message queue — checkout service enqueues the task, email service processes asynchronously',
    'Call the email service with a 3-second timeout',
    'Skip sending emails'
  ],
  1,
  'Message queues decouple the checkout service from the email service. Checkout enqueues an "order placed" event (takes <1ms) and immediately responds to the user. The email service independently dequeues and processes messages. This also handles email service failures gracefully — failed messages can be retried.'),

mcq('sd-mcq-007', 'SQL vs NoSQL for analytics', 'Databases', 'hard',
  'You\'re designing a system that needs to analyze 1 billion user events per day with queries like "count events by type per hour". Which is most appropriate?',
  [
    'MySQL with proper indexing',
    'MongoDB for flexible schema',
    'Redis for fast reads',
    'Cassandra or ClickHouse — optimized for time-series write throughput and analytics'
  ],
  3,
  'For event analytics at scale, you need a database optimized for high-write throughput (events coming in constantly) and efficient aggregation queries. Cassandra handles massive write throughput. ClickHouse is a columnar analytics DB perfect for aggregation queries. MySQL would be overwhelmed by 11,000 writes/second at this scale.'),

mcq('sd-mcq-008', 'Idempotency key purpose', 'API Design', 'medium',
  'A payment API requires clients to send an Idempotency-Key header. What problem does this solve?',
  [
    'Improves response time',
    'Prevents double charges when a request is retried due to network timeout',
    'Authenticates the client',
    'Enables rate limiting per client'
  ],
  1,
  'Network timeouts leave the client uncertain: did the payment go through? Without idempotency keys, retrying might charge twice. With an idempotency key, the server stores the result mapped to that key. On retry with the same key, it returns the stored result without processing the payment again.'),
]

export const allSystemDesignProblems: Row[] = [...THEORY, ...MCQS]

export async function seedSystemDesign(d1: D1Database): Promise<number> {
  const db = drizzle(d1)
  const BATCH = 20
  let inserted = 0
  for (let i = 0; i < allSystemDesignProblems.length; i += BATCH) {
    const batch = allSystemDesignProblems.slice(i, i + BATCH)
    await db.insert(problems).values(batch).onConflictDoNothing()
    inserted += batch.length
  }
  return inserted
}
