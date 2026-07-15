import { problems } from '../db/schema'

type Row = typeof problems.$inferInsert

function t(id: string, title: string, topic: string, difficulty: 'easy'|'medium'|'hard', content: string, subtopic?: string): Row {
  return {
    id, title, topic, subtopic: subtopic ?? null, difficulty,
    platform: null, platformLink: null,
    estimatedMinutes: difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 30,
    sheet: topic, problemNumber: null,
    tags: JSON.stringify([topic.toLowerCase().replace(/ /g, '-'), 'system-design']),
    questionType: 'theory', subject: 'system-design',
    content, contentSource: 'internal',
  }
}

function mcq(id: string, title: string, topic: string, difficulty: 'easy'|'medium'|'hard', question: string, options: string[], correct_index: number, explanation: string): Row {
  return {
    id, title, topic, subtopic: null, difficulty,
    platform: null, platformLink: null,
    estimatedMinutes: 5, sheet: topic, problemNumber: null,
    tags: JSON.stringify([topic.toLowerCase().replace(/ /g, '-'), 'system-design', 'mcq']),
    questionType: 'mcq', subject: 'system-design',
    content: JSON.stringify({ question, options, correct_index, explanation }),
    contentSource: 'internal',
  }
}

// ─── DATABASES & STORAGE (25 questions) ───────────────────────────────────────

const DATABASES: Row[] = [

t('sysdes-ext-t-001', 'SQL vs NoSQL — choosing the right database', 'Databases', 'medium', `
## SQL vs NoSQL

### Relational (SQL)
**Examples**: PostgreSQL, MySQL, SQLite, CockroachDB

- **Schema-on-write**: structure defined upfront
- **ACID transactions**: Atomicity, Consistency, Isolation, Durability
- **Joins**: efficient multi-table queries
- **Vertical scaling** primary; horizontal via read replicas + sharding (complex)

\`\`\`sql
-- Strong consistency guarantee
BEGIN;
  UPDATE accounts SET balance = balance - 100 WHERE id = 1;
  UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT; -- or ROLLBACK if either fails
\`\`\`

**Use when**: financial data, complex queries with joins, data integrity is paramount, relational data model

### Document (NoSQL)
**Examples**: MongoDB, DynamoDB, Firestore

- **Schema-flexible**: each document can differ
- **Nested data**: embed related data to avoid joins
- **Horizontal scale**: native sharding
- **Eventually consistent** by default

**Use when**: rapidly changing schemas, hierarchical/nested data, high write throughput, geographic distribution

### Key-Value
**Examples**: Redis, DynamoDB, Memcached

- O(1) reads and writes
- Limited querying (by key only)
- **Use for**: caching, sessions, real-time leaderboards

### Wide-Column
**Examples**: Cassandra, HBase

- Time-series data, IoT, write-heavy workloads
- Cassandra: partition by time, no single point of failure

### Graph
**Examples**: Neo4j, Amazon Neptune

- Relationships ARE the data
- **Use for**: social networks, fraud detection, recommendation engines

### Decision framework
1. Strict consistency needed? → SQL
2. Flexible schema + scale? → Document
3. Simple key access + speed? → Key-Value
4. Write-heavy time series? → Wide-Column
5. Relationship traversal? → Graph
`),

t('sysdes-ext-t-002', 'Database indexing — B-tree, Hash, Composite, Partial indexes', 'Databases', 'hard', `
## Database Indexing

Indexes trade write performance and storage for read performance.

### B-tree index (default in PostgreSQL/MySQL)
- Balanced tree structure
- Supports: equality, range queries (\`>\`, \`<\`, \`BETWEEN\`), ORDER BY
- O(log n) lookup

\`\`\`sql
CREATE INDEX idx_users_email ON users(email);
-- Good for:
SELECT * FROM users WHERE email = 'alice@example.com'; -- O(log n)
SELECT * FROM orders WHERE created_at BETWEEN '2024-01-01' AND '2024-12-31';
\`\`\`

### Hash index
- O(1) equality lookup
- **Cannot** do range queries
- Good for: exact match caching layers

### Composite (multi-column) index
\`\`\`sql
CREATE INDEX idx_orders_user_date ON orders(user_id, created_at);
-- Efficient for queries that filter by user_id (leftmost prefix rule)
SELECT * FROM orders WHERE user_id = 5 AND created_at > '2024-01-01'; -- ✅
SELECT * FROM orders WHERE created_at > '2024-01-01';                  -- ❌ won't use index
\`\`\`

### Partial index
Index only a subset of rows:
\`\`\`sql
CREATE INDEX idx_active_users ON users(email) WHERE active = true;
-- Much smaller index, faster for active-user queries
\`\`\`

### Index pitfalls
- Too many indexes = slow writes (each INSERT/UPDATE/DELETE must update all indexes)
- Index on low-cardinality column (e.g., boolean) is usually wasteful
- Always EXPLAIN ANALYZE to verify index usage
- Indexes can go unused if casting or functions are applied: \`WHERE LOWER(email) = ...\` won't use an index on \`email\`

### Covering index
An index that contains all columns needed by a query — no table heap access required:
\`\`\`sql
CREATE INDEX idx_covering ON orders(user_id) INCLUDE (total, status);
\`\`\`
`),

t('sysdes-ext-t-003', 'Database replication and sharding', 'Databases', 'hard', `
## Scaling Databases

### Replication
Copy data to multiple nodes for read scaling and availability.

#### Master-Replica (Primary-Secondary)
- All writes → primary
- Reads distributed across replicas
- Replication lag = replicas may be slightly stale
- Failover: promote a replica on primary failure

\`\`\`
Write → [Primary] → async replication → [Replica 1]
                                       → [Replica 2]
Read  → any replica
\`\`\`

#### Multi-Master
- Writes on multiple nodes
- Complex conflict resolution
- Examples: CockroachDB, Galera Cluster

### Sharding (Horizontal Partitioning)
Split data across multiple independent databases. Each shard holds a subset of the data.

#### Range-based sharding
\`users WHERE id < 1M → Shard 1, id 1M–2M → Shard 2\`
- Simple; risk of hot spots (if most users are recent/high IDs)

#### Hash-based sharding
\`shard = hash(user_id) % N\`
- Even distribution; resharding is painful (change N → rebalance all)

#### Directory-based sharding
Lookup table maps entity → shard
- Flexible; lookup service is a single point of failure

### Problems introduced by sharding
- **Cross-shard queries**: expensive (scatter-gather)
- **Cross-shard transactions**: no native ACID
- **Resharding**: complex data migration
- **Hotspots**: celebrity users or popular products on one shard

### Recommendation
Delay sharding as long as possible. Optimize queries, add replicas and caching first.
`),

mcq('sysdes-ext-m-001', 'ACID vs BASE', 'Databases', 'medium',
  'Which consistency model is associated with most NoSQL databases?',
  ['ACID', 'BASE (Basically Available, Soft state, Eventually consistent)', 'SOLID', 'CAP'],
  1,
  'NoSQL databases typically follow BASE: they prioritize availability and partition tolerance over strong consistency. They may return stale data but are eventually consistent.'),

mcq('sysdes-ext-m-002', 'N+1 query problem', 'Databases', 'medium',
  'What is the N+1 query problem?',
  [
    'Running N queries to insert N records',
    'Fetching a list of N items then making 1 additional query per item to fetch related data',
    'Having more than N+1 database connections',
    'Using N indexes where only 1 is needed',
  ], 1,
  'N+1 occurs when you fetch N records then execute 1 additional query per record for related data — total: 1 + N queries. Fix with JOIN, eager loading (include/preload), or DataLoader batching.'),

]

// ─── CACHING (20 questions) ───────────────────────────────────────────────────

const CACHING: Row[] = [

t('sysdes-ext-t-004', 'Caching strategies — cache-aside, write-through, write-behind, read-through', 'Caching', 'hard', `
## Caching Strategies

### Cache-Aside (Lazy Loading) — most common
Application code manages the cache explicitly.

\`\`\`
1. App checks cache for key
2. HIT → return cached value (fast path)
3. MISS → fetch from DB, store in cache, return value
\`\`\`

\`\`\`js
async function getUser(id) {
  const cached = await redis.get(\`user:\${id}\`);
  if (cached) return JSON.parse(cached);

  const user = await db.findUser(id);
  await redis.setex(\`user:\${id}\`, 3600, JSON.stringify(user)); // TTL: 1h
  return user;
}
\`\`\`

**Pros**: Only caches what's actually requested; resilient to cache failures
**Cons**: First request is always slow (cold start); potential for stale data

### Write-Through
Write to cache AND DB synchronously on every write.
- **Pros**: Cache always fresh
- **Cons**: Write latency increased; cache may fill with rarely-read data

### Write-Behind (Write-Back)
Write to cache immediately, async flush to DB.
- **Pros**: Very fast writes
- **Cons**: Risk of data loss if cache fails before flush

### Read-Through
Cache sits in front of DB; application only talks to cache; cache fetches from DB on miss.
- Simpler application code; cache provider handles DB interaction

### Cache Invalidation
The hard problem. Strategies:
- **TTL-based**: expire after N seconds (simple, may return stale)
- **Write invalidation**: delete cache key on update
- **Event-driven**: publish invalidation events on writes
`),

t('sysdes-ext-t-005', 'Redis deep dive — data structures and use cases', 'Caching', 'medium', `
## Redis Data Structures & Use Cases

Redis is an in-memory data structure store — not just a key-value cache.

### String
\`\`\`bash
SET counter 0
INCR counter          # atomic increment (no race condition)
SET session:abc123 '{"userId":1}' EX 3600  # TTL in seconds
SETNX lock:resource 1  # set only if not exists (distributed lock)
\`\`\`

### Hash — user/session data
\`\`\`bash
HSET user:1 name "Alice" email "alice@example.com" age 30
HGET user:1 name        # "Alice"
HGETALL user:1          # all fields
HINCRBY user:1 points 10
\`\`\`

### List — queues, feeds
\`\`\`bash
LPUSH queue task1 task2   # push left
BRPOP queue 30            # blocking pop right (consumer waits 30s)
LRANGE feed:userId 0 9    # last 10 items (pagination)
\`\`\`

### Sorted Set — leaderboards, rate limiting
\`\`\`bash
ZADD leaderboard 1540 "alice" 1200 "bob"
ZREVRANGE leaderboard 0 9 WITHSCORES  # top 10
ZRANK leaderboard alice               # rank of alice
ZINCRBY leaderboard 100 alice         # update score
\`\`\`

### Set — unique tags, relationships
\`\`\`bash
SADD user:1:follows 2 3 4
SINTER user:1:follows user:2:follows  # mutual follows
\`\`\`

### Pub/Sub — real-time events
\`\`\`bash
SUBSCRIBE notifications:user:42
PUBLISH notifications:user:42 '{"type":"message","from":"Bob"}'
\`\`\`
`),

mcq('sysdes-ext-m-003', 'Cache eviction policy', 'Caching', 'medium',
  'Which Redis eviction policy removes the Least Recently Used item when memory is full?',
  ['allkeys-lfu', 'allkeys-lru', 'volatile-ttl', 'noeviction'],
  1,
  'allkeys-lru evicts the least recently used key from all keys. allkeys-lfu evicts the least frequently used. volatile-ttl evicts the key with the nearest TTL. noeviction returns errors when memory is full.'),

]

// ─── MESSAGE QUEUES (20 questions) ────────────────────────────────────────────

const MESSAGE_QUEUES: Row[] = [

t('sysdes-ext-t-006', 'Message queues — when and why, Kafka vs RabbitMQ', 'Message Queues', 'hard', `
## Message Queues

### Why use a message queue?
- **Decoupling**: producer doesn't need to know about consumers
- **Load levelling**: absorb traffic spikes (queue buffers bursts)
- **Async processing**: respond immediately, process in background
- **Reliability**: messages aren't lost if consumer is down
- **Fan-out**: one event → multiple consumers

### Kafka — distributed log
- Messages are **persisted** to disk (retention period configurable)
- **Consumer groups**: multiple consumers share a topic's partitions
- **Offset tracking**: consumers control what they've read — can replay
- **Throughput**: millions of messages/second
- **Use cases**: event streaming, audit logs, data pipelines, CDC

\`\`\`
Producer → [Partition 0 | Partition 1 | Partition 2] → Consumer Group A
                                                      → Consumer Group B
\`\`\`

### RabbitMQ — traditional message broker
- AMQP protocol; **push-based**
- Messages are deleted after consumption (unless configured otherwise)
- **Exchanges & bindings**: flexible routing (fanout, direct, topic, headers)
- **Use cases**: task queues, RPC, complex routing, transient messages

### Kafka vs RabbitMQ

| | Kafka | RabbitMQ |
|--|-------|---------|
| Message retention | Persistent (days/weeks) | Deleted after ACK |
| Consumer model | Pull (consumer controls) | Push (broker controls) |
| Throughput | Very high | High |
| Message ordering | Per partition | Per queue |
| Replay | ✅ | ❌ |
| Routing | Topic/partition | Exchange/binding |
| Best for | Event streaming, analytics | Task queues, RPC |
`),

t('sysdes-ext-t-007', 'Exactly-once, at-least-once, at-most-once delivery semantics', 'Message Queues', 'hard', `
## Message Delivery Semantics

### At-most-once
Send message, don't wait for ACK. Message may be lost if failure occurs.
- **Use case**: fire-and-forget analytics events where occasional loss is acceptable
- **Implementation**: produce without confirmation; consumer auto-acks before processing

### At-least-once
Retry until ACK received. Message may be delivered multiple times.
- **Default for most systems (Kafka, SQS standard)**
- **Requires idempotent consumers** to handle duplicates:
  \`\`\`js
  // Idempotent: use conditional upsert
  await db.upsert({ id: event.id, data: event.data },
    { onConflict: 'id', merge: false }); // if exists, skip
  \`\`\`

### Exactly-once
Delivered exactly once. The "holy grail" — complex and expensive.
- **Kafka**: producer idempotence (sequence numbers) + transactions
- **SQS FIFO**: exactly-once processing within deduplication window (5 min)
- **Limitation**: true exactly-once between distributed systems requires 2PC (slow)

### Practical recommendation
Design consumers to be **idempotent**, then use **at-least-once** delivery:
- Process based on a unique event ID stored in DB
- Skip if already processed (check before write)
- Result: effectively exactly-once without distributed transaction overhead
`),

mcq('sysdes-ext-m-004', 'Kafka partition', 'Message Queues', 'medium',
  'Why does Kafka use partitions?',
  [
    'To encrypt messages',
    'To enable parallel consumption and horizontal scaling',
    'To compress messages',
    'To enable message expiry',
  ], 1,
  'Partitions allow a topic to be split across multiple brokers and consumed by multiple consumers in parallel (one consumer per partition in a consumer group). More partitions = higher throughput.'),

]

// ─── API DESIGN (20 questions) ────────────────────────────────────────────────

const API_DESIGN: Row[] = [

t('sysdes-ext-t-008', 'REST API design principles and best practices', 'API Design', 'medium', `
## REST API Design

### Resource-oriented URLs
\`\`\`
# Nouns, not verbs
GET    /users          # list users
GET    /users/42       # get user 42
POST   /users          # create user
PUT    /users/42       # replace user 42
PATCH  /users/42       # partial update
DELETE /users/42       # delete user

# Nested resources
GET    /users/42/orders         # user's orders
GET    /users/42/orders/7       # specific order
POST   /users/42/orders         # create order for user
\`\`\`

### HTTP Status Codes
| Code | Meaning |
|------|---------|
| 200 OK | Success (GET, PUT, PATCH) |
| 201 Created | Resource created (POST) |
| 204 No Content | Success, no body (DELETE) |
| 400 Bad Request | Invalid input |
| 401 Unauthorized | Not authenticated |
| 403 Forbidden | Authenticated but not authorized |
| 404 Not Found | Resource doesn't exist |
| 409 Conflict | Duplicate / state conflict |
| 422 Unprocessable | Validation errors |
| 429 Too Many Requests | Rate limited |
| 500 Internal Error | Server bug |

### Versioning
\`\`\`
# URI versioning (most common)
/api/v1/users
/api/v2/users

# Header versioning
Accept: application/vnd.myapi.v2+json

# Query param
/api/users?version=2
\`\`\`

### Pagination
\`\`\`json
GET /users?limit=20&cursor=eyJpZCI6MTAwfQ==

{
  "data": [...],
  "meta": { "total": 1000, "nextCursor": "eyJpZCI6MTIwfQ==" }
}
\`\`\`
Cursor-based > offset-based for large datasets (no "skipping" problem).
`),

t('sysdes-ext-t-009', 'Rate limiting — algorithms and implementation', 'API Design', 'hard', `
## Rate Limiting

Protect APIs from abuse, ensure fair usage, prevent DDoS.

### Token Bucket
Most popular algorithm. A bucket holds N tokens; tokens refill at rate R/second. Each request consumes 1 token. Burst allowed up to bucket size.

\`\`\`js
// Redis implementation
async function rateLimitCheck(userId, limit, windowSecs) {
  const key = \`rl:\${userId}\`;
  const current = await redis.incr(key);
  if (current === 1) await redis.expire(key, windowSecs);
  return current <= limit;
}
\`\`\`

### Sliding Window Counter
More accurate than fixed window. Maintains a moving window of N seconds.

### Fixed Window Counter
Simplest. Count resets at window boundary — burst possible at boundary.

### Leaky Bucket
Process requests at a fixed rate; excess queued or dropped. Smooth output rate.

### Implementation with Redis
\`\`\`js
// Token bucket with Redis
const script = \`
  local tokens = redis.call('GET', KEYS[1])
  tokens = tonumber(tokens) or tonumber(ARGV[1])
  if tokens < 1 then return 0 end
  redis.call('SET', KEYS[1], tokens - 1, 'EX', ARGV[2])
  return 1
\`;

// Headers to return
'X-RateLimit-Limit: 100'
'X-RateLimit-Remaining: 45'
'X-RateLimit-Reset: 1701388800'
'Retry-After: 60'  // on 429
\`\`\`

### Rate limiting scopes
- By IP (unauthenticated)
- By API key / user
- By endpoint (e.g., login: 5/min, search: 100/min)
- By tenant (enterprise plans)
`),

mcq('sysdes-ext-m-005', 'Idempotency', 'API Design', 'medium',
  'Which HTTP methods are idempotent?',
  [
    'GET, POST, PUT',
    'GET, PUT, DELETE (but not POST)',
    'POST, PATCH, DELETE',
    'All HTTP methods are idempotent',
  ], 1,
  'GET, PUT, DELETE are idempotent — calling them N times has the same effect as calling once. POST is NOT idempotent (each call may create a new resource). PATCH is technically not guaranteed idempotent.'),

]

// ─── MICROSERVICES (20 questions) ─────────────────────────────────────────────

const MICROSERVICES: Row[] = [

t('sysdes-ext-t-010', 'Microservices vs monolith — tradeoffs', 'Microservices', 'medium', `
## Microservices vs Monolith

### Monolith
Single deployable unit. All modules in one codebase and process.

**Pros**:
- Simple deployment (one artifact)
- In-process calls (no network latency)
- Easy debugging (single log stream, single debugger)
- Strong consistency (single transaction)

**Cons**:
- All teams on one codebase (coordination overhead)
- One part can bring down the whole system
- Hard to scale individual components
- Technology lock-in

### Microservices
Split into small, independently deployable services.

**Pros**:
- Independent scaling (scale the auth service without scaling billing)
- Technology flexibility (Python ML service, Go websocket service)
- Fault isolation (one service fails, others continue)
- Independent deployments (faster releases)

**Cons**:
- Distributed systems complexity (network partitions, latency)
- No cross-service transactions (saga pattern needed)
- Operational overhead (K8s, service mesh, distributed tracing)
- Data consistency challenges (eventual consistency)

### Guidance
> Start with a monolith. Extract services when you have clear boundaries, high load on specific components, or team/ownership reasons. Microservices amplify good practices and also bad ones.

### Service decomposition strategies
- **By business capability**: order service, inventory service, user service
- **By subdomain** (DDD): bounded contexts map to services
- **Strangler Fig**: gradually migrate from monolith
`),

t('sysdes-ext-t-011', 'Service communication — sync (REST/gRPC) vs async (events)', 'Microservices', 'hard', `
## Inter-Service Communication

### Synchronous (request-response)

#### REST
- Simple, widely understood, HTTP/JSON
- Every call waits for response (temporal coupling)
- Circuit breaker needed to handle downstream failures

#### gRPC
- Protocol Buffers (binary, smaller, typed)
- HTTP/2 (multiplexing, streaming)
- Code generation from .proto files
- Better for internal, high-throughput services

### Asynchronous (event-driven)

\`\`\`
Order Service → [Event: order.created] → Inventory Service
                                       → Email Service
                                       → Analytics Service
\`\`\`

**Pros**: loose coupling, resilience, natural fan-out
**Cons**: complex debugging, eventual consistency, harder to reason about flow

### Saga Pattern (distributed transactions)
When a business operation spans multiple services, you can't use a single DB transaction.

#### Choreography Saga
Each service listens for events and publishes its own:
\`\`\`
OrderService → order.created → InventoryService → inventory.reserved → PaymentService
            → order.failed if inventory.failed (compensating transaction)
\`\`\`

#### Orchestration Saga
A central orchestrator calls services and handles failures:
\`\`\`
SagaOrchestrator → ReserveInventory
               → if OK: ChargePayer
               → if OK: ConfirmOrder
               → if any fail: compensate (ReleaseInventory, RefundPayment)
\`\`\`

### Service Mesh (Istio, Linkerd)
Moves cross-cutting concerns (TLS, retries, circuit breaking, observability) out of application code into sidecar proxies.
`),

mcq('sysdes-ext-m-006', 'Circuit breaker states', 'Microservices', 'hard',
  'What are the three states of a Circuit Breaker?',
  [
    'Open, Closed, Half-Open',
    'Active, Inactive, Pending',
    'Connected, Disconnected, Retry',
    'Up, Down, Degraded',
  ], 0,
  'Closed (normal, requests pass through), Open (failure threshold exceeded, requests fail fast), Half-Open (after timeout, allow test requests to see if service recovered).'),

]

// ─── CASE STUDIES (15 questions) ──────────────────────────────────────────────

const CASE_STUDIES: Row[] = [

t('sysdes-ext-t-012', 'Design a URL shortener — system design walkthrough', 'System Design Case Studies', 'hard', `
## Design a URL Shortener (like bit.ly)

### Requirements
- Shorten a URL: POST /shorten → short code
- Redirect: GET /abc123 → 301 redirect
- 100M URLs stored, 100:1 read/write ratio, 1000 redirects/sec

### Core algorithm — short code generation
**Option 1: Base62 encoding of auto-increment ID**
\`\`\`
ID: 12345 → Base62: "dnh" (6 chars supports 56 billion URLs)
\`\`\`

**Option 2: MD5/SHA hash + truncate**
\`\`\`
MD5(long_url + salt) → first 7 chars
Collision: check DB, retry with different salt
\`\`\`

### Data model
\`\`\`sql
urls (
  id          BIGSERIAL PRIMARY KEY,
  short_code  CHAR(7) UNIQUE,
  long_url    TEXT NOT NULL,
  user_id     INT,
  created_at  TIMESTAMP,
  expires_at  TIMESTAMP
)
\`\`\`

### Architecture
\`\`\`
Client → CDN → Load Balancer → [App Servers]
                                     ↓
                               Redis cache (short_code → long_url)
                                     ↓ (miss)
                               PostgreSQL
\`\`\`

### Redirect flow
1. Check Redis cache: O(1) lookup
2. Cache hit: return 301 (browser caches) or 302 (analytics need tracking)
3. Cache miss: query DB, populate cache, redirect
4. 301 = client caches, fewer requests; 302 = can track clicks accurately

### Scaling
- Read-heavy: cache tier handles 99% of traffic
- Write scaling: DB sharding by short_code prefix
- Analytics: async event stream (Kafka) → analytics DB
`),

t('sysdes-ext-t-013', 'Design a notification system — multi-channel push', 'System Design Case Studies', 'hard', `
## Design a Notification System

### Requirements
- Support: push (mobile), SMS, email, in-app
- 10M notifications/day, < 1s for push, < 5s for email
- Prioritization: critical (OTP) > transactional > marketing

### Architecture
\`\`\`
[Event Source (order, payment)] → [Notification Service]
                                        ↓
                                 [Message Queue (Kafka)]
                                        ↓
                        ┌──────────────────────────────┐
                   Push Workers    SMS Workers    Email Workers
                        ↓                ↓               ↓
                   [APNs/FCM]      [Twilio]       [SendGrid]
\`\`\`

### Notification record
\`\`\`sql
notifications (
  id, user_id, type, channel,
  template_id, variables (JSON),
  status (pending|sent|failed|delivered),
  scheduled_at, sent_at,
  retry_count
)
\`\`\`

### Priority queues
\`\`\`
Kafka Topics:
- notifications.critical   (OTP, security alerts) → workers with low lag
- notifications.transactional (order, payment)
- notifications.marketing  (promotions)         → batch processing
\`\`\`

### Deduplication
\`\`\`
idempotency_key = hash(user_id + template_id + reference_id)
Redis SET NX with TTL 24h
\`\`\`

### User preferences
\`\`\`sql
user_notification_prefs (
  user_id, channel, type, enabled,
  quiet_hours_start, quiet_hours_end, timezone
)
\`\`\`

### Failure handling
- Retry with exponential backoff (3 retries)
- Dead letter queue for failed notifications
- Alerting when DLQ grows beyond threshold
`),

mcq('sysdes-ext-m-007', 'Consistent hashing benefit', 'System Design Case Studies', 'medium',
  'What problem does consistent hashing solve in distributed systems?',
  [
    'Ensuring all nodes have the same data',
    'Minimizing the number of keys that must be remapped when nodes are added or removed',
    'Ensuring consistent read-after-write',
    'Distributing write load evenly across all nodes',
  ], 1,
  'With simple modulo hashing, adding/removing a node requires remapping ~all keys. Consistent hashing organizes nodes on a ring so adding/removing one node only remaps K/N keys on average (K=total keys, N=total nodes).'),

]

// ─── Export ───────────────────────────────────────────────────────────────────

export const allSystemDesignMoreProblems: Row[] = [
  ...DATABASES,
  ...CACHING,
  ...MESSAGE_QUEUES,
  ...API_DESIGN,
  ...MICROSERVICES,
  ...CASE_STUDIES,
]
