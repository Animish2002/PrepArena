-- PrepArena seed: Java Theory + MCQ
-- Problems: 109
-- Generated: 2026-06-30T16:42:46.260Z
-- Apply (local):  npx wrangler d1 execute preParena-db --local  --file=src/scripts/sql/java.sql
-- Apply (remote): npx wrangler d1 execute preParena-db --remote --file=src/scripts/sql/java.sql
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-001', 'What are the primitive data types in Java?', 'Core Java Basics', 'Data Types', 'easy', NULL, NULL, 5, 'java-interview', 1, '["primitives","data-types"]', 'theory', 'java', '## Primitive Data Types in Java

Java has **8 primitive types**:

| Type | Size | Default | Range |
|------|------|---------|-------|
| `byte` | 1B | 0 | -128 to 127 |
| `short` | 2B | 0 | -32768 to 32767 |
| `int` | 4B | 0 | ~±2.1B |
| `long` | 8B | 0L | ~±9.2×10¹⁸ |
| `float` | 4B | 0.0f | ±3.4×10³⁸ |
| `double` | 8B | 0.0d | ±1.7×10³⁰⁸ |
| `char` | 2B | ''\u0000'' | 0–65535 |
| `boolean` | 1b | false | true/false |

Primitives are stored on the **stack** and hold values directly (not references).', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-002', 'What is the difference between == and .equals() in Java?', 'Core Java Basics', 'Equality', 'easy', NULL, NULL, 5, 'java-interview', 2, '["equality","string","reference"]', 'theory', 'java', '## == vs .equals()

- `==` compares **references** (memory addresses) for objects, and **values** for primitives.
- `.equals()` compares **logical content** — defined by the class.

```java
String a = new String("hello");
String b = new String("hello");
a == b;        // false — different objects
a.equals(b);   // true  — same content
```

> **String Pool**: String literals share pool entries so `"hi" == "hi"` is `true`, but this is an implementation detail — always use `.equals()` for strings.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-003', 'What is autoboxing and unboxing in Java?', 'Core Java Basics', 'Wrapper Classes', 'easy', NULL, NULL, 5, 'java-interview', 3, '["autoboxing","wrapper","primitives"]', 'theory', 'java', '## Autoboxing & Unboxing

**Autoboxing** — automatic conversion of a primitive to its wrapper class.
**Unboxing** — automatic conversion of a wrapper to its primitive.

```java
Integer i = 42;      // autoboxing: int → Integer
int x = i;           // unboxing:  Integer → int
```

**Pitfalls**:
- `Integer` caches -128 to 127, so `Integer a = 127; Integer b = 127; a == b` is `true`, but `a = 200; b = 200; a == b` is `false`.
- Unboxing a `null` wrapper throws `NullPointerException`.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-004', 'What is the String pool in Java?', 'Core Java Basics', 'Strings', 'easy', NULL, NULL, 5, 'java-interview', 4, '["string-pool","interning","memory"]', 'theory', 'java', '## String Pool

The **String pool** (interned string table) is a special area in the Java heap where string literals are stored and reused.

```java
String a = "hello";           // stored in pool
String b = "hello";           // reuses same pool entry
String c = new String("hello"); // new heap object, NOT in pool

System.out.println(a == b);   // true
System.out.println(a == c);   // false
System.out.println(a == c.intern()); // true — .intern() returns pool ref
```

**Why it exists**: saves memory — identical string literals share one object. Strings are immutable, so sharing is safe.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-005', 'Why is String immutable in Java?', 'Core Java Basics', 'Strings', 'medium', NULL, NULL, 5, 'java-interview', 5, '["immutability","string","security"]', 'theory', 'java', '## Why String is Immutable

1. **String pool safety** — multiple references share one object; mutation would corrupt all.
2. **Security** — class names, file paths, network connections use strings. Mutability could allow attacks.
3. **Thread safety** — immutable objects need no synchronisation.
4. **HashCode caching** — `String.hashCode()` is cached on first call; safe only if value never changes.

Immutability is enforced by making the `char[]` (or `byte[]` in Java 9+) backing field `private final` and exposing no mutation methods.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-006', 'What is the difference between StringBuilder and StringBuffer?', 'Core Java Basics', 'Strings', 'easy', NULL, NULL, 5, 'java-interview', 6, '["StringBuilder","StringBuffer","thread-safety"]', 'theory', 'java', '## StringBuilder vs StringBuffer

| Feature | StringBuilder | StringBuffer |
|---------|--------------|-------------|
| Thread-safe | No | Yes (synchronized) |
| Performance | Faster | Slower |
| Introduced | Java 5 | Java 1.0 |

**Use StringBuilder** in single-threaded contexts (the vast majority of cases).
**Use StringBuffer** only when multiple threads share the same builder — in practice, prefer higher-level concurrency constructs instead.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-007', 'What is the difference between final, finally, and finalize?', 'Core Java Basics', 'Keywords', 'easy', NULL, NULL, 5, 'java-interview', 7, '["final","finally","finalize"]', 'theory', 'java', '## final / finally / finalize

- **`final`** — keyword:
  - variable: value cannot be reassigned
  - method: cannot be overridden
  - class: cannot be subclassed

- **`finally`** — block in try-catch that always executes (even if exception thrown or return hit). Used for cleanup.

- **`finalize()`** — method called by GC before reclaiming object. **Deprecated in Java 9**, removed in 18. Avoid it — use `Cleaner` or try-with-resources instead.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-008', 'What is the static keyword in Java?', 'Core Java Basics', 'Keywords', 'easy', NULL, NULL, 5, 'java-interview', 8, '["static","class-level","memory"]', 'theory', 'java', '## static Keyword

Members marked `static` belong to the **class**, not to any instance.

- **Static variable** — shared across all instances; lives in method area.
- **Static method** — callable without creating an object; cannot access `this` or instance members.
- **Static block** — runs once when the class is loaded, before constructors.
- **Static inner class** — nested class that does not hold a reference to the outer instance.

```java
class Counter {
  static int count = 0;
  Counter() { count++; }
}
```', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-009', 'What is the difference between an abstract class and an interface?', 'OOP in Java', 'Abstraction', 'medium', NULL, NULL, 5, 'java-interview', 9, '["abstract","interface","OOP"]', 'theory', 'java', '## Abstract Class vs Interface

| Feature | Abstract Class | Interface |
|---------|---------------|----------|
| Instantiation | No | No |
| Methods | Abstract + concrete | Default + static + abstract |
| Fields | Any | public static final only |
| Constructor | Yes | No |
| Inheritance | Single | Multiple |
| Access modifiers | Any | public (implicitly) |

**When to use**:
- Abstract class — shared state or partial implementation across related types.
- Interface — define a contract / capability; supports multiple inheritance of type.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-010', 'What is method overloading vs method overriding?', 'OOP in Java', 'Polymorphism', 'easy', NULL, NULL, 5, 'java-interview', 10, '["overloading","overriding","polymorphism"]', 'theory', 'java', '## Overloading vs Overriding

| | Overloading | Overriding |
|-|------------|----------|
| Where | Same class | Subclass |
| Signature | Different params | Same params |
| Return type | Can differ | Must be same (or covariant) |
| Resolved at | Compile time | Runtime |
| Type | Compile-time polymorphism | Runtime polymorphism |

```java
// Overloading
void print(int x) {}
void print(String s) {}

// Overriding
@Override
public void speak() { System.out.println("Dog"); }
```', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-011', 'What are the four pillars of OOP in Java?', 'OOP in Java', 'Fundamentals', 'easy', NULL, NULL, 5, 'java-interview', 11, '["oop","encapsulation","inheritance","polymorphism","abstraction"]', 'theory', 'java', '## Four Pillars of OOP

1. **Encapsulation** — bundle data + behaviour; hide internal state via `private` fields + public getters/setters.
2. **Abstraction** — expose what an object *does*, hide *how*. Achieved via abstract classes and interfaces.
3. **Inheritance** — child class inherits state/behaviour from parent (`extends`). Promotes reuse.
4. **Polymorphism** — one interface, many implementations.
   - Compile-time: method overloading.
   - Runtime: method overriding + dynamic dispatch.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-012', 'What is constructor chaining in Java?', 'OOP in Java', 'Constructors', 'medium', NULL, NULL, 5, 'java-interview', 12, '["constructor","this","super"]', 'theory', 'java', '## Constructor Chaining

Calling one constructor from another to avoid duplicating initialization code.

- **Within same class** — use `this(...)`
- **Parent class** — use `super(...)`

```java
class Person {
  String name; int age;
  Person(String name) { this(name, 0); }
  Person(String name, int age) {
    this.name = name; this.age = age;
  }
}
```

> `this()` or `super()` must be the **first statement** in a constructor.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-013', 'What is the difference between shallow copy and deep copy?', 'OOP in Java', 'Cloning', 'medium', NULL, NULL, 5, 'java-interview', 13, '["clone","shallow","deep","copy"]', 'theory', 'java', '## Shallow vs Deep Copy

- **Shallow copy** — copies field values as-is. For reference fields, both original and copy point to the **same** nested object.
- **Deep copy** — recursively copies all nested objects so original and copy are fully independent.

```java
// Shallow (default Object.clone())
Person p2 = (Person) p1.clone(); // p2.address == p1.address

// Deep — manually clone nested objects
Person p2 = new Person(p1.name, new Address(p1.address.city));
```

**Risk of shallow copy**: mutating a shared nested object through one reference affects the other.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-014', 'What is the difference between checked and unchecked exceptions?', 'Exception Handling', 'Exception Types', 'easy', NULL, NULL, 5, 'java-interview', 14, '["checked","unchecked","exception"]', 'theory', 'java', '## Checked vs Unchecked Exceptions

| | Checked | Unchecked |
|-|---------|----------|
| Extends | `Exception` | `RuntimeException` |
| Must handle? | Yes (catch or declare `throws`) | No |
| Examples | IOException, SQLException | NullPointerException, ArrayIndexOutOfBoundsException |

**Checked** exceptions represent recoverable conditions the caller should handle.
**Unchecked** exceptions represent programming bugs — fix the code, don''t catch them blindly.

`Error` (OutOfMemoryError, StackOverflowError) is separate — don''t catch errors.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-015', 'What is try-with-resources in Java?', 'Exception Handling', 'Resource Management', 'medium', NULL, NULL, 5, 'java-interview', 15, '["try-with-resources","AutoCloseable","resource"]', 'theory', 'java', '## Try-With-Resources

Introduced in Java 7. Automatically closes resources that implement `AutoCloseable` after the try block.

```java
try (FileReader fr = new FileReader("file.txt");
     BufferedReader br = new BufferedReader(fr)) {
  String line = br.readLine();
} catch (IOException e) {
  e.printStackTrace();
}
// fr and br are automatically closed here
```

**Suppressed exceptions**: if both the try body and `close()` throw, the close exception is suppressed (accessible via `e.getSuppressed()`).', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-016', 'What is exception chaining in Java?', 'Exception Handling', 'Wrapping', 'medium', NULL, NULL, 5, 'java-interview', 16, '["cause","chaining","wrapping"]', 'theory', 'java', '## Exception Chaining

Wrapping a caught exception inside a new one to preserve the original cause while adding context.

```java
try {
  connectToDb();
} catch (SQLException e) {
  throw new ServiceException("DB unavailable", e); // e is the cause
}
```

Access the original via `getCause()`. Appears in stack traces as "Caused by:".

**Best practice**: always chain exceptions when re-throwing at a higher abstraction level — lose the cause and you lose the root diagnosis.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-017', 'What is the Java Collections Framework hierarchy?', 'Collections', 'Overview', 'medium', NULL, NULL, 5, 'java-interview', 17, '["collections","list","set","map","queue"]', 'theory', 'java', '## Collections Framework Hierarchy

```
Iterable
└── Collection
    ├── List  → ArrayList, LinkedList, Vector
    ├── Set   → HashSet, LinkedHashSet, TreeSet
    └── Queue → PriorityQueue, ArrayDeque

Map (separate hierarchy)
    → HashMap, LinkedHashMap, TreeMap, Hashtable
```

- **List** — ordered, allows duplicates
- **Set** — no duplicates; HashSet (O(1)), TreeSet (sorted, O(log n))
- **Queue/Deque** — FIFO/LIFO access
- **Map** — key-value pairs; HashMap (O(1) avg), TreeMap (sorted)', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-018', 'What is the difference between ArrayList and LinkedList?', 'Collections', 'List Implementations', 'easy', NULL, NULL, 5, 'java-interview', 18, '["ArrayList","LinkedList","performance"]', 'theory', 'java', '## ArrayList vs LinkedList

| Operation | ArrayList | LinkedList |
|-----------|-----------|----------|
| Random access | O(1) | O(n) |
| Insert/delete at end | O(1) amortized | O(1) |
| Insert/delete at middle | O(n) | O(n) — but no shift |
| Memory | Less (array) | More (node pointers) |

**ArrayList** — backed by a dynamic array. Excellent for get/set by index.
**LinkedList** — doubly-linked list. Good as a deque (addFirst/removeLast). Rarely faster than ArrayList in practice due to cache misses.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-019', 'How does HashMap work internally in Java?', 'Collections', 'Map Internals', 'hard', NULL, NULL, 5, 'java-interview', 19, '["HashMap","hashing","buckets","collision"]', 'theory', 'java', '## HashMap Internals

1. **Array of buckets** (default 16). Index = `hash(key) & (capacity-1)`.
2. **Collision handling**: Java 7 — linked list per bucket. Java 8+ — linked list converts to **red-black tree** when bucket size ≥ 8 (and total entries ≥ 64).
3. **Load factor** (default 0.75): when `size > capacity × loadFactor`, the map **rehashes** (doubles capacity, O(n)).

```
put(k,v):
  h = hash(k.hashCode())
  idx = h & (n-1)
  if bucket[idx] is empty → store Node
  else → check .equals() on existing; update or append
```

**Key contract**: if `a.equals(b)` then `a.hashCode() == b.hashCode()`.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-020', 'What is the difference between HashMap, LinkedHashMap, and TreeMap?', 'Collections', 'Map Implementations', 'medium', NULL, NULL, 5, 'java-interview', 20, '["HashMap","LinkedHashMap","TreeMap","ordering"]', 'theory', 'java', '## HashMap vs LinkedHashMap vs TreeMap

| | HashMap | LinkedHashMap | TreeMap |
|-|---------|--------------|--------|
| Order | None | Insertion/access | Sorted (natural/Comparator) |
| Performance | O(1) avg | O(1) avg | O(log n) |
| Null keys | 1 allowed | 1 allowed | Not allowed |

**LinkedHashMap**: maintains a doubly-linked list through entries. Good for LRU caches (override `removeEldestEntry`).
**TreeMap**: backed by red-black tree. Use when you need sorted keys or range queries (`subMap`, `headMap`, `tailMap`).', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-021', 'What is the ConcurrentHashMap and how does it differ from HashMap?', 'Collections', 'Concurrent Collections', 'hard', NULL, NULL, 5, 'java-interview', 21, '["ConcurrentHashMap","thread-safety","concurrency"]', 'theory', 'java', '## ConcurrentHashMap vs HashMap

**HashMap** is not thread-safe — concurrent modifications cause `ConcurrentModificationException` or data corruption.

**ConcurrentHashMap** (Java 5+):
- Java 7: **segment locking** — 16 segments (stripes), each with its own lock.
- Java 8+: **node-level CAS + synchronized buckets** — much finer granularity, better performance.
- Allows concurrent reads with no locking.
- `putIfAbsent`, `computeIfAbsent`, `merge` — atomic compound operations.

> `Collections.synchronizedMap(map)` locks the entire map on every access — much coarser than ConcurrentHashMap.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-022', 'What is the Iterator pattern and how is it used in Java?', 'Collections', 'Iteration', 'easy', NULL, NULL, 5, 'java-interview', 22, '["Iterator","for-each","Iterable"]', 'theory', 'java', '## Iterator Pattern

Provides a standard way to traverse a collection without exposing its underlying structure.

```java
Iterator<String> it = list.iterator();
while (it.hasNext()) {
  String s = it.next();
  if (s.isEmpty()) it.remove(); // safe removal during iteration
}
```

**For-each loop** works on any `Iterable` (calls `iterator()` internally).

**ListIterator** — bidirectional; supports `previous()`, `add()`, `set()`.

**Fail-fast iterators**: throw `ConcurrentModificationException` if collection is modified structurally outside the iterator.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-023', 'What are the ways to create a thread in Java?', 'Multithreading', 'Thread Creation', 'easy', NULL, NULL, 5, 'java-interview', 23, '["thread","Runnable","Callable"]', 'theory', 'java', '## Creating Threads in Java

**1. Extend Thread**
```java
class MyThread extends Thread {
  public void run() { System.out.println("running"); }
}
new MyThread().start();
```

**2. Implement Runnable**
```java
new Thread(() -> System.out.println("running")).start();
```

**3. Callable + Future (returns value)**
```java
Future<Integer> f = executor.submit(() -> 42);
int result = f.get();
```

**4. ExecutorService (preferred)**
```java
ExecutorService pool = Executors.newFixedThreadPool(4);
pool.submit(runnable);
```', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-024', 'What is the difference between synchronized method and synchronized block?', 'Multithreading', 'Synchronization', 'medium', NULL, NULL, 5, 'java-interview', 24, '["synchronized","monitor","lock"]', 'theory', 'java', '## Synchronized Method vs Block

**Synchronized method** — locks the entire object (`this`) for instance methods, or the Class object for static methods.

```java
public synchronized void increment() { count++; }
```

**Synchronized block** — locks only a specified object for a smaller critical section.

```java
public void increment() {
  synchronized (this) { count++; }
  doOtherWork(); // not locked
}
```

**Prefer blocks** — minimize lock scope to reduce contention. Using a private lock object is better than locking `this` (prevents external code from holding the same lock).', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-025', 'What is volatile keyword in Java?', 'Multithreading', 'Memory Visibility', 'hard', NULL, NULL, 5, 'java-interview', 25, '["volatile","visibility","JMM"]', 'theory', 'java', '## volatile Keyword

Ensures that reads/writes to a variable go directly to main memory, not a thread-local CPU cache.

```java
private volatile boolean running = true;

void stop() { running = false; } // other thread sees immediately
void loop() { while (running) { ... } }
```

**Guarantees**: visibility + ordering (prevents instruction reordering around the variable).

**Does NOT guarantee**: atomicity. `volatile int x; x++;` is still NOT atomic (it''s read-modify-write). Use `AtomicInteger` or `synchronized` for that.

**Java Memory Model**: volatile establishes a happens-before relationship.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-026', 'What is a deadlock and how can it be prevented?', 'Multithreading', 'Deadlock', 'hard', NULL, NULL, 5, 'java-interview', 26, '["deadlock","prevention","lock-ordering"]', 'theory', 'java', '## Deadlock

Occurs when two or more threads are blocked forever, each waiting for a lock held by the other.

**Four conditions (all must hold)**: Mutual exclusion, Hold-and-wait, No preemption, Circular wait.

**Prevention strategies**:
1. **Lock ordering** — always acquire locks in a fixed global order.
2. **Lock timeout** — use `tryLock(timeout)` from `ReentrantLock`.
3. **Avoid nested locks** — minimize holding multiple locks simultaneously.
4. **Use higher-level constructs** — `java.util.concurrent` classes reduce manual lock management.

```java
ReentrantLock lock = new ReentrantLock();
if (lock.tryLock(1, TimeUnit.SECONDS)) { ... }
```', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-027', 'What is the ExecutorService and thread pool in Java?', 'Multithreading', 'Thread Pools', 'medium', NULL, NULL, 5, 'java-interview', 27, '["ExecutorService","thread-pool","Executors"]', 'theory', 'java', '## ExecutorService & Thread Pools

Manages a pool of worker threads to execute submitted tasks — avoids overhead of creating a new thread per task.

```java
ExecutorService pool = Executors.newFixedThreadPool(4);
pool.submit(() -> doWork());
pool.shutdown(); // waits for running tasks to finish
```

**Factory methods**:
- `newFixedThreadPool(n)` — fixed n threads
- `newCachedThreadPool()` — grows/shrinks dynamically
- `newSingleThreadExecutor()` — serial execution
- `newScheduledThreadPool(n)` — delayed/periodic tasks

**Under the hood**: `ThreadPoolExecutor(coreSize, maxSize, keepAlive, unit, BlockingQueue)`.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-028', 'What are lambda expressions in Java 8?', 'Java 8+', 'Lambdas', 'easy', NULL, NULL, 5, 'java-interview', 28, '["lambda","functional-interface","java8"]', 'theory', 'java', '## Lambda Expressions

A concise way to implement a **functional interface** (an interface with exactly one abstract method).

```java
// Before Java 8
Runnable r = new Runnable() {
  public void run() { System.out.println("hi"); }
};

// Lambda
Runnable r = () -> System.out.println("hi");

// With params
Comparator<String> c = (a, b) -> a.compareTo(b);
```

Built-in functional interfaces in `java.util.function`:
- `Predicate<T>` — `test(T) → boolean`
- `Function<T,R>` — `apply(T) → R`
- `Consumer<T>` — `accept(T)`
- `Supplier<T>` — `get() → T`', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-029', 'What is the Stream API in Java 8?', 'Java 8+', 'Streams', 'medium', NULL, NULL, 5, 'java-interview', 29, '["streams","functional","pipeline"]', 'theory', 'java', '## Stream API

Provides a declarative pipeline for processing sequences of elements.

```java
List<String> result = names.stream()
  .filter(n -> n.startsWith("A"))   // intermediate
  .map(String::toUpperCase)         // intermediate
  .sorted()
  .collect(Collectors.toList());    // terminal
```

**Key points**:
- **Lazy** — intermediate ops don''t execute until a terminal op is called.
- **Non-reusable** — a stream can only be consumed once.
- **Parallel**: `parallelStream()` — uses ForkJoinPool; helpful for CPU-heavy work on large data.

Common terminals: `collect`, `forEach`, `reduce`, `count`, `findFirst`, `anyMatch`.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-030', 'What is Optional in Java 8 and why is it used?', 'Java 8+', 'Optional', 'medium', NULL, NULL, 5, 'java-interview', 30, '["Optional","null-safety","java8"]', 'theory', 'java', '## Optional

A container that may or may not hold a non-null value — replaces null-returning methods to force callers to handle the absence case.

```java
Optional<String> name = findUser(id).map(User::getName);
name.ifPresent(System.out::println);
String val = name.orElse("Anonymous");
String val2 = name.orElseGet(() -> computeDefault());
String val3 = name.orElseThrow(() -> new NotFoundException());
```

**Anti-patterns**:
- Don''t use `get()` without `isPresent()` — same risk as null.
- Don''t use Optional as a field or method parameter — it''s designed for return types.
- Don''t wrap collections (use empty collection instead).', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-031', 'What are default and static methods in interfaces (Java 8)?', 'Java 8+', 'Interface Features', 'medium', NULL, NULL, 5, 'java-interview', 31, '["default-method","static-method","interface"]', 'theory', 'java', '## Default & Static Interface Methods

**Default methods** — provide a default implementation in the interface. Implementing classes can override.

```java
interface Vehicle {
  default String getType() { return "Vehicle"; }
}
```

**Static methods** — utility methods on the interface itself; cannot be overridden by implementing classes.

```java
interface MathOps {
  static int add(int a, int b) { return a + b; }
}
MathOps.add(1, 2);
```

**Why added**: allow adding methods to existing interfaces without breaking all implementations (e.g., `Collection.stream()`).', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-032', 'What are method references in Java 8?', 'Java 8+', 'Method References', 'easy', NULL, NULL, 5, 'java-interview', 32, '["method-reference","lambda","shorthand"]', 'theory', 'java', '## Method References

A shorthand lambda when you''re just calling an existing method.

| Type | Syntax | Example |
|------|--------|--------|
| Static | `Class::staticMethod` | `Integer::parseInt` |
| Instance (specific) | `instance::method` | `System.out::println` |
| Instance (arbitrary) | `Class::instanceMethod` | `String::toLowerCase` |
| Constructor | `Class::new` | `ArrayList::new` |

```java
list.stream().map(String::toUpperCase).forEach(System.out::println);
```

Compiler matches the method signature to the target functional interface.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-033', 'What are the different memory areas in JVM?', 'JVM & Memory', 'JVM Architecture', 'hard', NULL, NULL, 5, 'java-interview', 33, '["JVM","heap","stack","metaspace"]', 'theory', 'java', '## JVM Memory Areas

1. **Heap** — objects and class instances; shared across threads; GC-managed. Divided into Young Gen (Eden + S0/S1) and Old Gen.
2. **Stack** — per-thread; stores frames (local variables, operand stack, return address). Auto-freed when method returns.
3. **Method Area / Metaspace** — class metadata, static fields, method bytecode. Metaspace (Java 8+) is off-heap, grows dynamically.
4. **PC Register** — per-thread; holds address of current JVM instruction.
5. **Native Method Stack** — for native (JNI) method calls.

`OutOfMemoryError` in heap = too many objects. `StackOverflowError` = too many nested calls.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-034', 'What is garbage collection in Java?', 'JVM & Memory', 'GC', 'hard', NULL, NULL, 5, 'java-interview', 34, '["GC","garbage-collection","generational"]', 'theory', 'java', '## Garbage Collection

Automatic memory reclamation of unreachable objects.

**Generational hypothesis**: most objects die young → split heap into Young and Old gen.

**Young GC (Minor GC)**: Eden is full → live objects copied to Survivor spaces (S0/S1). Objects that survive several rounds promoted to Old Gen.

**Old GC (Major/Full GC)**: runs when Old Gen is full; typically Stop-the-World (STW).

**Collectors**:
- **G1** (default Java 9+) — concurrent, low-pause, region-based
- **ZGC** / **Shenandoah** — sub-millisecond pauses (Java 15+)
- **Serial / Parallel** — throughput-oriented, simpler

`-XX:+UseG1GC -Xms512m -Xmx2g`', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-035', 'What are generics in Java and why are they used?', 'Generics', 'Basics', 'medium', NULL, NULL, 5, 'java-interview', 35, '["generics","type-safety","erasure"]', 'theory', 'java', '## Generics

Allow classes, interfaces, and methods to operate on **parameterized types**, providing compile-time type safety without runtime overhead.

```java
List<String> list = new ArrayList<>();
list.add("hello");
String s = list.get(0); // no cast needed
```

**Type erasure**: generic type parameters are erased at compile time — `List<String>` becomes `List` at runtime. This is why you can''t do `new T()` or `instanceof List<String>`.

**Bounded wildcards**:
- `<? extends Number>` — covariant (read)
- `<? super Integer>` — contravariant (write)
- PECS: **Producer Extends, Consumer Super**', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-036', 'What is Java serialization and how does it work?', 'I/O & Serialization', 'Serialization', 'medium', NULL, NULL, 5, 'java-interview', 36, '["serialization","Serializable","transient"]', 'theory', 'java', '## Java Serialization

Converts an object''s state to a byte stream (for storage/network); deserialization reverses it.

```java
class User implements Serializable {
  private static final long serialVersionUID = 1L;
  String name;
  transient String password; // excluded from serialization
}

ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream("u.ser"));
oos.writeObject(user);
```

**serialVersionUID**: if omitted, JVM computes one — any class change breaks deserialization. Always declare it.

**`transient`**: fields not serialized (credentials, caches).

**Alternatives**: JSON (Jackson/Gson), Protobuf, Kryo — faster and safer.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-037', 'What is the difference between byte streams and character streams in Java I/O?', 'I/O & Serialization', 'I/O Streams', 'easy', NULL, NULL, 5, 'java-interview', 37, '["InputStream","Reader","byte-stream","char-stream"]', 'theory', 'java', '## Byte Streams vs Character Streams

| | Byte Streams | Character Streams |
|-|-------------|------------------|
| Base classes | InputStream / OutputStream | Reader / Writer |
| Unit | byte (8-bit) | char (16-bit Unicode) |
| Use for | Binary data (images, audio) | Text data |
| Encoding | Raw | Handles charset conversion |

```java
// Byte
FileInputStream fis = new FileInputStream("img.png");

// Character (wraps byte stream with charset)
BufferedReader br = new BufferedReader(
  new InputStreamReader(new FileInputStream("file.txt"), StandardCharsets.UTF_8));
```

Always specify charset explicitly (`StandardCharsets.UTF_8`) — don''t rely on the platform default.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-038', 'What is the difference between Stack and Heap memory in Java?', 'JVM & Memory', 'Memory', 'easy', NULL, NULL, 5, 'java-interview', 38, '["stack","heap","memory"]', 'theory', 'java', '## Stack vs Heap

| | Stack | Heap |
|-|-------|------|
| Stores | Primitive locals, references, frames | Objects |
| Per | Thread | JVM (shared) |
| Lifetime | Method scope | Until GC |
| Speed | Faster (LIFO) | Slower (GC overhead) |
| Size | Small (~512KB–1MB default) | Large (set by -Xmx) |

```java
void foo() {
  int x = 10;            // stack
  String s = "hi";       // reference on stack, object in heap
  Person p = new Person(); // p (reference) on stack, Person object on heap
}
```', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-039', 'What is the Comparable vs Comparator interface in Java?', 'Collections', 'Sorting', 'easy', NULL, NULL, 5, 'java-interview', 39, '["Comparable","Comparator","sorting"]', 'theory', 'java', '## Comparable vs Comparator

**Comparable** — natural ordering; the class itself implements the sorting logic.
```java
class Student implements Comparable<Student> {
  public int compareTo(Student other) { return this.gpa - other.gpa; }
}
Collections.sort(students); // uses natural order
```

**Comparator** — external/custom ordering; separate class or lambda.
```java
students.sort(Comparator.comparing(Student::getName)
             .thenComparingDouble(Student::getGpa).reversed());
```

**Rule**: use Comparable for the primary, canonical sort order. Use Comparator for alternate orderings.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-040', 'What is a functional interface in Java?', 'Java 8+', 'Functional Programming', 'easy', NULL, NULL, 5, 'java-interview', 40, '["functional-interface","SAM","lambda"]', 'theory', 'java', '## Functional Interface

An interface with **exactly one abstract method** (SAM — Single Abstract Method). Can have any number of default/static methods.

```java
@FunctionalInterface
interface Transformer<T, R> {
  R transform(T input);
  // can have default methods
}

Transformer<String, Integer> len = s -> s.length();
```

`@FunctionalInterface` — optional annotation; compiler enforces the SAM constraint if present.

Built-in: `Runnable`, `Callable`, `Comparator`, and all in `java.util.function`.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-041', 'What are the access modifiers in Java?', 'Core Java Basics', 'Access Control', 'easy', NULL, NULL, 5, 'java-interview', 41, '["access-modifiers","encapsulation","visibility"]', 'theory', 'java', '## Access Modifiers

| Modifier | Class | Package | Subclass | World |
|----------|-------|---------|----------|-------|
| `public` | ✓ | ✓ | ✓ | ✓ |
| `protected` | ✓ | ✓ | ✓ | ✗ |
| (default) | ✓ | ✓ | ✗ | ✗ |
| `private` | ✓ | ✗ | ✗ | ✗ |

- Top-level classes: only `public` or package-private.
- Use the **most restrictive** access that still lets the code function — good encapsulation.
- `protected` is weaker than default for unrelated packages but allows subclass access.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-042', 'What is the this keyword in Java?', 'OOP in Java', 'Keywords', 'easy', NULL, NULL, 5, 'java-interview', 42, '["this","reference","constructor"]', 'theory', 'java', '## `this` Keyword

Refers to the **current object instance** inside a non-static method or constructor.

Uses:
1. **Disambiguate fields from params**: `this.name = name;`
2. **Call another constructor**: `this(arg1, arg2);` (must be first statement)
3. **Pass current object**: `builder.set(this);`
4. **Return current object** (builder/fluent pattern): `return this;`

Cannot be used in static contexts (no instance).', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-043', 'What is the super keyword in Java?', 'OOP in Java', 'Inheritance', 'easy', NULL, NULL, 5, 'java-interview', 43, '["super","parent","inheritance"]', 'theory', 'java', '## `super` Keyword

Refers to the **parent class** from within a subclass.

Uses:
1. **Call parent constructor**: `super(args);` — must be first line in child constructor
2. **Access parent method**: `super.methodName()` — useful when overriding
3. **Access parent field**: `super.field` (rare; prefer encapsulation)

```java
class Dog extends Animal {
  Dog(String name) {
    super(name); // Animal(String)
  }
  @Override
  void speak() {
    super.speak(); // Animal.speak()
    System.out.println("Woof!");
  }
}
```', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-044', 'What are inner classes in Java?', 'OOP in Java', 'Inner Classes', 'medium', NULL, NULL, 5, 'java-interview', 44, '["inner-class","static-nested","anonymous"]', 'theory', 'java', '## Inner Classes

1. **Non-static inner class** — holds reference to outer instance. Can access outer fields.
2. **Static nested class** — no outer reference. Like a top-level class in a namespace.
3. **Local class** — defined inside a method; accesses effectively-final locals.
4. **Anonymous class** — unnamed one-off implementation.

```java
// Anonymous class (pre-lambda)
Runnable r = new Runnable() {
  public void run() { System.out.println("run"); }
};

// Static nested
class Outer {
  static class Inner { void greet() {} }
}
Outer.Inner i = new Outer.Inner();
```', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-045', 'What is the difference between throw and throws in Java?', 'Exception Handling', 'Throwing Exceptions', 'easy', NULL, NULL, 5, 'java-interview', 45, '["throw","throws","exception"]', 'theory', 'java', '## throw vs throws

- `throw` — actually **throws** an exception instance at runtime.
```java
throw new IllegalArgumentException("bad input");
```

- `throws` — **declares** that a method may propagate checked exceptions; part of method signature.
```java
public void readFile(String path) throws IOException {
  // ...
}
```

**Key difference**: `throw` is a statement; `throws` is a declaration. A method using `throw` for checked exceptions must also have `throws` in its signature (or handle it internally).', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-046', 'What is the difference between List.of() and Arrays.asList()?', 'Collections', 'Immutable Collections', 'medium', NULL, NULL, 5, 'java-interview', 46, '["List.of","Arrays.asList","immutable"]', 'theory', 'java', '## List.of() vs Arrays.asList()

| | `List.of()` (Java 9+) | `Arrays.asList()` |
|-|----------------------|------------------|
| Null elements | Not allowed | Allowed |
| Structural mutation | Throws UnsupportedOperationException | Throws UOE |
| Element mutation (set) | Throws UOE | Allowed |
| Backed by array | No | Yes |

```java
List<String> a = List.of("x", "y"); // truly immutable
List<String> b = Arrays.asList("x", "y"); // fixed-size but mutable values
b.set(0, "z"); // OK
b.add("w");   // throws
```

**Prefer `List.of()`** when you want a truly immutable list.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-047', 'What is the difference between Runnable and Callable in Java?', 'Multithreading', 'Task Interfaces', 'easy', NULL, NULL, 5, 'java-interview', 47, '["Runnable","Callable","Future"]', 'theory', 'java', '## Runnable vs Callable

| | Runnable | Callable<V> |
|-|----------|------------|
| Method | `void run()` | `V call() throws Exception` |
| Returns value | No | Yes |
| Throws checked exception | No | Yes |
| Use with | Thread, execute() | submit() → Future<V> |

```java
// Callable
Future<Integer> future = executor.submit(() -> {
  int result = heavyComputation();
  return result;
});
int value = future.get(); // blocks until done
```

Use `Callable` when you need a result or need to propagate checked exceptions.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-048', 'What is Java reflection?', 'Core Java Basics', 'Reflection', 'hard', NULL, NULL, 5, 'java-interview', 48, '["reflection","Class","runtime"]', 'theory', 'java', '## Reflection

Allows inspecting and modifying classes, fields, methods, constructors at **runtime** via the `java.lang.reflect` package.

```java
Class<?> clazz = Class.forName("com.example.User");
Method m = clazz.getDeclaredMethod("setName", String.class);
m.setAccessible(true); // bypass private
m.invoke(userInstance, "Alice");
```

**Use cases**: frameworks (Spring DI, JUnit, Jackson), serialization, dynamic proxies.

**Drawbacks**:
- Breaks encapsulation
- No compile-time type safety
- Slower than direct calls
- Can break with Java modules (JPMS)

**Prefer** explicit interfaces/APIs over reflection in application code.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-049', 'What is the difference between HashMap and Hashtable?', 'Collections', 'Map Implementations', 'easy', NULL, NULL, 5, 'java-interview', 49, '["HashMap","Hashtable","thread-safety"]', 'theory', 'java', '## HashMap vs Hashtable

| | HashMap | Hashtable |
|-|---------|----------|
| Thread-safe | No | Yes (synchronized) |
| Null keys | 1 allowed | Not allowed |
| Null values | Allowed | Not allowed |
| Performance | Faster | Slower |
| Iteration | Fail-fast | Enumerator (older) |
| Java version | 1.2 | 1.0 (legacy) |

**Verdict**: Hashtable is obsolete. Use `HashMap` for single-threaded, `ConcurrentHashMap` for multi-threaded use.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-050', 'What is the difference between process and thread in Java?', 'Multithreading', 'Fundamentals', 'easy', NULL, NULL, 5, 'java-interview', 50, '["process","thread","concurrency"]', 'theory', 'java', '## Process vs Thread

| | Process | Thread |
|-|---------|--------|
| Memory | Own address space | Shared heap, own stack |
| Communication | IPC (sockets, pipes) | Shared memory (easier but risky) |
| Creation cost | High | Low |
| Crash impact | Isolated | Can crash entire process |

In Java, all threads inside a JVM instance share the **same heap**. Each thread has its own **stack**, PC register, and native method stack.

Threads within a process communicate via shared objects — requires synchronisation to avoid race conditions.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-051', 'What is the Java Memory Model (JMM)?', 'Multithreading', 'Memory Visibility', 'hard', NULL, NULL, 5, 'java-interview', 51, '["JMM","happens-before","visibility"]', 'theory', 'java', '## Java Memory Model

Defines how threads interact through memory — specifically **visibility** and **ordering** rules.

**Happens-before (HB) relationships** guarantee that actions in one thread are visible to another:
- Unlock of monitor HB subsequent lock of same monitor
- Write to volatile field HB subsequent read of same field
- Thread.start() HB all actions in started thread
- All actions in thread HB Thread.join() return

**Without HB**: the JVM/CPU can reorder instructions and cache values in registers, causing one thread to see stale values.

Syncing via `synchronized` or `volatile` establishes HB and flushes caches.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-052', 'What are CompletableFuture and its advantages?', 'Java 8+', 'Async Programming', 'hard', NULL, NULL, 5, 'java-interview', 52, '["CompletableFuture","async","non-blocking"]', 'theory', 'java', '## CompletableFuture

Java 8+ class for composable async programming without blocking threads.

```java
CompletableFuture.supplyAsync(() -> fetchUser(id))
  .thenApply(user -> enrichUser(user))
  .thenAccept(user -> sendEmail(user))
  .exceptionally(ex -> { log(ex); return null; });
```

**Key methods**:
- `supplyAsync` / `runAsync` — run task on ForkJoinPool (or custom Executor)
- `thenApply` / `thenCompose` / `thenAccept` — chain transformations
- `thenCombine` / `allOf` / `anyOf` — combine multiple futures
- `exceptionally` / `handle` — error recovery

**Advantage over Future**: non-blocking chaining; `Future.get()` blocks.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-053', 'What are enums in Java and what can they do?', 'Core Java Basics', 'Enums', 'easy', NULL, NULL, 5, 'java-interview', 53, '["enum","constants","type-safe"]', 'theory', 'java', '## Enums

Type-safe set of named constants. In Java, enums are full classes.

```java
enum Day {
  MON, TUE, WED, THU, FRI, SAT, SUN;

  public boolean isWeekend() {
    return this == SAT || this == SUN;
  }
}

Day d = Day.MON;
System.out.println(d.isWeekend()); // false
```

**Features**:
- Can have fields, constructors, abstract methods
- Implement interfaces
- `Enum.values()` returns all constants
- Works with `switch` statements/expressions
- Thread-safe singleton pattern via enum is the most concise approach', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-054', 'What is a record in Java 16+?', 'Java 8+', 'Records', 'medium', NULL, NULL, 5, 'java-interview', 54, '["record","immutable","data-class"]', 'theory', 'java', '## Records (Java 16+)

Compact syntax for immutable data carriers. Auto-generates:
- Constructor, getters (field-name accessor, not `get`-prefix), `equals()`, `hashCode()`, `toString()`

```java
record Point(int x, int y) {}

Point p = new Point(3, 4);
p.x(); // 3
p.y(); // 4
```

**Restrictions**: fields are final, no additional instance fields beyond components.

**Custom compact constructor**:
```java
record Range(int min, int max) {
  Range { // compact ctor — params already bound
    if (min > max) throw new IllegalArgumentException();
  }
}
```', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-055', 'What is the difference between HashMap and TreeMap?', 'Collections', 'Map Implementations', 'easy', NULL, NULL, 5, 'java-interview', 55, '["HashMap","TreeMap","sorted"]', 'theory', 'java', '## HashMap vs TreeMap

| | HashMap | TreeMap |
|-|---------|--------|
| Ordering | None | Sorted by key |
| Performance | O(1) avg | O(log n) |
| Null key | Allowed (1) | Not allowed |
| Implements | Map | NavigableMap, SortedMap |

**TreeMap extras**: `firstKey()`, `lastKey()`, `headMap(toKey)`, `tailMap(fromKey)`, `subMap(from, to)` — range queries.

Use TreeMap when you need keys in sorted order or range operations. Use HashMap for fast get/put with no ordering requirement.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-056', 'What is the Singleton design pattern in Java?', 'OOP in Java', 'Design Patterns', 'medium', NULL, NULL, 5, 'java-interview', 56, '["singleton","design-pattern","thread-safe"]', 'theory', 'java', '## Singleton Pattern

Ensures a class has only one instance and provides a global access point.

**Best implementation — enum singleton** (thread-safe, handles serialization):
```java
public enum AppConfig {
  INSTANCE;
  public void doSomething() { ... }
}
```

**Double-checked locking** (classic):
```java
private static volatile MySingleton instance;
public static MySingleton getInstance() {
  if (instance == null) {
    synchronized (MySingleton.class) {
      if (instance == null) instance = new MySingleton();
    }
  }
  return instance;
}
```

`volatile` is required to prevent partial initialization visibility issues.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-057', 'What is the difference between fail-fast and fail-safe iterators?', 'Collections', 'Iteration', 'medium', NULL, NULL, 5, 'java-interview', 57, '["fail-fast","fail-safe","iterator"]', 'theory', 'java', '## Fail-Fast vs Fail-Safe Iterators

**Fail-fast**: throws `ConcurrentModificationException` if the collection is structurally modified during iteration (outside the iterator itself).
- Used by: ArrayList, HashMap, HashSet iterators
- Detects modification via `modCount`

**Fail-safe**: works on a **copy** of the collection; does not throw but may not reflect latest state.
- Used by: `CopyOnWriteArrayList`, `ConcurrentHashMap`

```java
List<String> list = new CopyOnWriteArrayList<>(List.of("a","b"));
for (String s : list) { list.add("c"); } // no exception
```

Fail-safe has higher memory cost (copy); choose based on whether concurrent modification is expected.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-058', 'What are design patterns and what are the main categories?', 'OOP in Java', 'Design Patterns', 'medium', NULL, NULL, 5, 'java-interview', 58, '["design-patterns","GoF","creational","structural","behavioral"]', 'theory', 'java', '## Design Patterns

Reusable solutions to common software design problems (Gang of Four — GoF).

**Creational** — object creation:
- Singleton, Factory Method, Abstract Factory, Builder, Prototype

**Structural** — class/object composition:
- Adapter, Bridge, Composite, Decorator, Facade, Flyweight, Proxy

**Behavioral** — algorithms & responsibilities:
- Chain of Responsibility, Command, Iterator, Mediator, Memento, Observer, State, Strategy, Template Method, Visitor

**Key principle**: favor composition over inheritance; program to interfaces, not implementations.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-059', 'What is the difference between wait(), notify() and notifyAll()?', 'Multithreading', 'Inter-thread Communication', 'hard', NULL, NULL, 5, 'java-interview', 59, '["wait","notify","monitor"]', 'theory', 'java', '## wait() / notify() / notifyAll()

Methods on `Object` for inter-thread communication. Must be called inside `synchronized` block.

- **`wait()`** — releases the lock and puts the thread into WAITING state until notified.
- **`notify()`** — wakes up ONE arbitrary waiting thread on this object''s monitor.
- **`notifyAll()`** — wakes up ALL waiting threads; they re-compete for the lock.

```java
synchronized (lock) {
  while (!condition) lock.wait(); // always loop — spurious wakeups
  doWork();
  lock.notifyAll();
}
```

**Prefer `notifyAll()`** unless you know exactly one thread needs to act — `notify()` can cause missed signals.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-060', 'What are Java annotations?', 'Core Java Basics', 'Annotations', 'medium', NULL, NULL, 5, 'java-interview', 60, '["annotations","metadata","reflection"]', 'theory', 'java', '## Java Annotations

Metadata tags attached to code elements (classes, methods, fields) — no direct effect on execution by themselves; read by tools/frameworks at compile time or runtime.

**Built-in**:
- `@Override` — compile-time check
- `@Deprecated` — marks API as outdated
- `@SuppressWarnings("unchecked")`
- `@FunctionalInterface`

**Custom annotation**:
```java
@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
public @interface Retry {
  int times() default 3;
}
```

Retention: SOURCE (discarded), CLASS (in .class), RUNTIME (available via reflection).', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-061', 'What is the difference between an interface and an abstract class in Java 8+?', 'OOP in Java', 'Abstraction', 'medium', NULL, NULL, 5, 'java-interview', 61, '["interface","abstract-class","default-methods"]', 'theory', 'java', '## Interface vs Abstract Class (Java 8+)

With Java 8+ default/static interface methods, the gap narrowed, but key differences remain:

| | Abstract Class | Interface (Java 8+) |
|-|---------------|---------------------|
| State | Instance fields | Constants only |
| Constructor | Yes | No |
| Inheritance | Single | Multiple |
| Access on methods | Any | public |
| Purpose | IS-A + shared state | CAN-DO contract |

**When to use abstract class**: template method pattern, sharing mutable state, need a constructor.
**When to use interface**: defining capabilities (Printable, Serializable), need multiple inheritance of type.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-062', 'What is type casting in Java?', 'Core Java Basics', 'Type System', 'easy', NULL, NULL, 5, 'java-interview', 62, '["casting","widening","narrowing","ClassCastException"]', 'theory', 'java', '## Type Casting

**Widening (implicit)** — smaller → larger type; no data loss; automatic.
```java
int i = 100;
long l = i;  // widening — safe
```

**Narrowing (explicit)** — larger → smaller; may lose data; requires cast.
```java
long l = 1000L;
int i = (int) l; // explicit cast
```

**Object casting**:
```java
Animal a = new Dog();
Dog d = (Dog) a;  // safe — a IS-A Dog
Cat c = (Cat) a;  // throws ClassCastException at runtime
```

Use `instanceof` (or Java 16+ pattern matching) before downcasting:
```java
if (a instanceof Dog dog) { dog.bark(); }
```', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-063', 'What is the difference between Iterator and ListIterator?', 'Collections', 'Iteration', 'easy', NULL, NULL, 5, 'java-interview', 63, '["Iterator","ListIterator","bidirectional"]', 'theory', 'java', '## Iterator vs ListIterator

| Feature | Iterator | ListIterator |
|---------|----------|-------------|
| Direction | Forward only | Bidirectional |
| Available for | Any Collection | List only |
| Methods | hasNext, next, remove | + hasPrevious, previous, add, set, nextIndex, previousIndex |

```java
ListIterator<String> li = list.listIterator();
while (li.hasNext()) {
  String s = li.next();
  li.set(s.toUpperCase()); // replace
}
while (li.hasPrevious()) {
  System.out.println(li.previous());
}
```', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-064', 'What is the difference between stack and queue data structures?', 'Collections', 'Data Structures', 'easy', NULL, NULL, 5, 'java-interview', 64, '["stack","queue","Deque"]', 'theory', 'java', '## Stack vs Queue

| | Stack | Queue |
|-|-------|-------|
| Order | LIFO (Last In First Out) | FIFO (First In First Out) |
| Java class | `Deque<T>` (use ArrayDeque) | `Queue<T>` / `ArrayDeque` |
| Add | `push` / `addFirst` | `offer` / `add` |
| Remove | `pop` / `removeFirst` | `poll` / `remove` |
| Peek | `peek` / `peekFirst` | `peek` / `element` |

**Avoid `java.util.Stack`** (extends Vector, synchronized, legacy). Use `ArrayDeque` as a stack.
```java
Deque<Integer> stack = new ArrayDeque<>();
stack.push(1); stack.push(2);
stack.pop(); // returns 2
```', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-065', 'What is the difference between Checked and Runtime exceptions — when to use each?', 'Exception Handling', 'Best Practices', 'medium', NULL, NULL, 5, 'java-interview', 65, '["checked","runtime","exception-design"]', 'theory', 'java', '## Checked vs Runtime Exception — When to Use

**Throw checked exceptions** when:
- The caller can **reasonably be expected to recover** (retry, show message, try alternate path)
- Example: file not found (maybe ask user for correct path), network timeout (maybe retry)

**Throw unchecked (runtime) exceptions** when:
- The caller **cannot recover** — it''s a programming error
- Example: null argument to a method that requires non-null, invalid array index

**Guidelines**:
- Don''t use exceptions for flow control
- Never catch `Exception` or `Throwable` unless at the boundary (global handler)
- Always add useful message and chain the cause', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-066', 'What is the fork/join framework in Java?', 'Multithreading', 'Fork/Join', 'hard', NULL, NULL, 5, 'java-interview', 66, '["fork-join","RecursiveTask","parallelism"]', 'theory', 'java', '## Fork/Join Framework (Java 7+)

Designed for **divide-and-conquer** parallel tasks that can be split recursively into smaller sub-tasks.

```java
class SumTask extends RecursiveTask<Long> {
  int[] arr; int lo, hi;
  protected Long compute() {
    if (hi - lo <= THRESHOLD) return sumSeq(arr, lo, hi);
    int mid = (lo + hi) / 2;
    SumTask left  = new SumTask(arr, lo, mid);
    SumTask right = new SumTask(arr, mid, hi);
    left.fork();
    return right.compute() + left.join();
  }
}
new ForkJoinPool().invoke(new SumTask(arr, 0, arr.length));
```

**Work-stealing**: idle threads steal tasks from busy threads'' queues — keeps CPUs busy.
`parallelStream()` uses the common ForkJoinPool internally.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-067', 'What is the difference between String, StringBuilder, and String.format()?', 'Core Java Basics', 'Strings', 'easy', NULL, NULL, 5, 'java-interview', 67, '["String","StringBuilder","format","concatenation"]', 'theory', 'java', '## String Concatenation Options

- **`+` operator** — creates a new String per concatenation; in loops → O(n²) garbage. Compiler optimises single-line `+` chains with StringBuilder automatically.

- **StringBuilder** — mutable char buffer; best for loop concatenation.
```java
StringBuilder sb = new StringBuilder();
for (String s : list) sb.append(s).append(",");
String result = sb.toString();
```

- **String.format / formatted()** — readable but slower (regex parsing).
```java
String s = "Hello %s, you are %d years old".formatted(name, age);
```

- **Text blocks** (Java 15+) — multi-line string literals with `"""`.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-068', 'What is the difference between HashSet and TreeSet?', 'Collections', 'Set Implementations', 'easy', NULL, NULL, 5, 'java-interview', 68, '["HashSet","TreeSet","ordering"]', 'theory', 'java', '## HashSet vs TreeSet

| | HashSet | TreeSet |
|-|---------|--------|
| Ordering | None | Sorted (natural / Comparator) |
| Performance | O(1) avg | O(log n) |
| Null | 1 allowed | Not allowed (comparison would fail) |
| Backed by | HashMap | TreeMap (Red-Black Tree) |

**TreeSet extras**: `first()`, `last()`, `headSet(e)`, `tailSet(e)`, `subSet(from, to)`.

Use HashSet when you just need uniqueness with fast operations. Use TreeSet when you need sorted iteration or range views.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-theory-069', 'What is the difference between synchronized and ReentrantLock?', 'Multithreading', 'Locking', 'hard', NULL, NULL, 5, 'java-interview', 69, '["synchronized","ReentrantLock","lock"]', 'theory', 'java', '## synchronized vs ReentrantLock

| Feature | synchronized | ReentrantLock |
|---------|-------------|---------------|
| Syntax | keyword | API (`lock()`/`unlock()`) |
| Try-lock | No | `tryLock(timeout)` |
| Fairness | No | Optional (`new ReentrantLock(true)`) |
| Interruptible | No | `lockInterruptibly()` |
| Condition variables | `wait/notify` | Multiple `Condition` objects |
| Auto-release | Yes (block exit) | Must call `unlock()` in finally |

```java
lock.lock();
try { doWork(); } finally { lock.unlock(); }
```

**Prefer `synchronized`** for simple cases. Use `ReentrantLock` when you need tryLock, fairness, or multiple conditions.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-mcq-001', 'What is the output of: Integer.valueOf(127) == Integer.valueOf(127)?', 'Core Java Basics', NULL, 'medium', NULL, NULL, 2, 'java-interview', 1, '["autoboxing","integer-cache"]', 'mcq', 'java', '{"question":"What is the output of: Integer.valueOf(127) == Integer.valueOf(127)?","options":["false","true","Compilation error","Runtime exception"],"correct_index":1,"explanation":"Integer caches values from -128 to 127. Integer.valueOf(127) returns the same cached object both times, so == returns true."}', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-mcq-002', 'Which collection allows duplicate keys?', 'Collections', NULL, 'easy', NULL, NULL, 2, 'java-interview', 2, '["map","multimap"]', 'mcq', 'java', '{"question":"Which Java collection allows duplicate keys?","options":["HashMap","TreeMap","LinkedHashMap","None of the above"],"correct_index":3,"explanation":"Standard Java Map implementations (HashMap, TreeMap, LinkedHashMap) do not allow duplicate keys. Inserting a duplicate key updates the value. Multimap is available in third-party libraries like Guava."}', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-mcq-003', 'Which access modifier makes a member visible only within the same package?', 'Core Java Basics', NULL, 'easy', NULL, NULL, 2, 'java-interview', 3, '["access-modifiers","package"]', 'mcq', 'java', '{"question":"Which access modifier makes a member visible only within the same package and subclasses?","options":["private","default (no modifier)","protected","public"],"correct_index":2,"explanation":"protected allows access within the same package AND from subclasses (even in different packages). Default (no modifier) is package-private — accessible only within the same package."}', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-mcq-004', 'What does the volatile keyword NOT guarantee?', 'Multithreading', NULL, 'hard', NULL, NULL, 2, 'java-interview', 4, '["volatile","atomicity"]', 'mcq', 'java', '{"question":"What does the volatile keyword NOT guarantee?","options":["Visibility across threads","Ordering (happens-before)","Atomicity of compound operations","Preventing instruction reordering around the variable"],"correct_index":2,"explanation":"volatile guarantees visibility and ordering but NOT atomicity. A volatile int x; x++ is still a non-atomic read-modify-write. Use AtomicInteger for atomic compound operations."}', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-mcq-005', 'What happens when you call start() on a Thread that has already been started?', 'Multithreading', NULL, 'medium', NULL, NULL, 2, 'java-interview', 5, '["thread","lifecycle"]', 'mcq', 'java', '{"question":"What happens when you call start() on a Thread that has already been started?","options":["The thread restarts from the beginning","Nothing happens","IllegalThreadStateException is thrown","InterruptedException is thrown"],"correct_index":2,"explanation":"Calling start() on an already-started Thread throws IllegalThreadStateException. A Thread can only be started once; you must create a new Thread object to run the task again."}', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-mcq-006', 'Which method must be implemented when a class implements Runnable?', 'Multithreading', NULL, 'easy', NULL, NULL, 2, 'java-interview', 6, '["Runnable","thread"]', 'mcq', 'java', '{"question":"Which method must be implemented when a class implements Runnable?","options":["start()","execute()","run()","call()"],"correct_index":2,"explanation":"Runnable is a functional interface with a single abstract method: void run(). Implementing classes must provide the run() body. Note: call start() on a Thread wrapping the Runnable — calling run() directly does NOT start a new thread."}', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-mcq-007', 'What is the return type of Callable?', 'Multithreading', NULL, 'easy', NULL, NULL, 2, 'java-interview', 7, '["Callable","Future"]', 'mcq', 'java', '{"question":"What is the return type of the call() method in Callable<V>?","options":["void","Object","V (generic type parameter)","Future<V>"],"correct_index":2,"explanation":"Callable<V> has call() returning V — the generic type parameter. This is what lets ExecutorService.submit(callable) return a Future<V> so you can retrieve the result later."}', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-mcq-008', 'Which of the following is an immutable class in Java?', 'Core Java Basics', NULL, 'easy', NULL, NULL, 2, 'java-interview', 8, '["immutability","String","wrapper"]', 'mcq', 'java', '{"question":"Which of the following is an immutable class in Java?","options":["StringBuilder","ArrayList","String","HashMap"],"correct_index":2,"explanation":"String is immutable — once created its value cannot change. All wrapper classes (Integer, Long, etc.) are also immutable. StringBuilder and ArrayList are mutable."}', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-mcq-009', 'What will happen if you try to add a null to a TreeSet?', 'Collections', NULL, 'medium', NULL, NULL, 2, 'java-interview', 9, '["TreeSet","null","NullPointerException"]', 'mcq', 'java', '{"question":"What happens when you add null to a TreeSet?","options":["null is added as the first element","null is silently ignored","NullPointerException is thrown","UnsupportedOperationException is thrown"],"correct_index":2,"explanation":"TreeSet uses compareTo() or a Comparator to order elements. Calling compareTo(null) throws NullPointerException. HashSet allows one null; TreeSet does not."}', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-mcq-010', 'Which functional interface takes one argument and returns nothing?', 'Java 8+', NULL, 'easy', NULL, NULL, 2, 'java-interview', 10, '["Consumer","functional-interface"]', 'mcq', 'java', '{"question":"Which functional interface takes one argument and returns nothing?","options":["Supplier<T>","Function<T,R>","Consumer<T>","Predicate<T>"],"correct_index":2,"explanation":"Consumer<T> has accept(T t) returning void. Supplier<T> takes nothing and returns T. Function<T,R> maps T→R. Predicate<T> takes T and returns boolean."}', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-mcq-011', 'What does Stream.filter() return?', 'Java 8+', NULL, 'easy', NULL, NULL, 2, 'java-interview', 11, '["streams","filter","lazy"]', 'mcq', 'java', '{"question":"What does Stream.filter() return?","options":["A List of matching elements","A new Stream of matching elements","An Optional of the first match","void"],"correct_index":1,"explanation":"filter() is an intermediate operation returning a new Stream. It is lazy — nothing is processed until a terminal operation (collect, forEach, etc.) is called on the stream."}', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-mcq-012', 'What is the output of Optional.empty().isPresent()?', 'Java 8+', NULL, 'easy', NULL, NULL, 2, 'java-interview', 12, '["Optional","isPresent"]', 'mcq', 'java', '{"question":"What is the output of Optional.empty().isPresent()?","options":["true","false","null","NoSuchElementException"],"correct_index":1,"explanation":"Optional.empty() creates an Optional with no value. isPresent() returns false. Calling get() on an empty Optional throws NoSuchElementException."}', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-mcq-013', 'Which keyword prevents method overriding in Java?', 'OOP in Java', NULL, 'easy', NULL, NULL, 2, 'java-interview', 13, '["final","overriding"]', 'mcq', 'java', '{"question":"Which keyword prevents a method from being overridden in a subclass?","options":["static","private","final","abstract"],"correct_index":2,"explanation":"final methods cannot be overridden. static methods are hidden (not overridden) but that is different. private methods are not visible to subclasses. abstract methods require overriding."}', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-mcq-014', 'What is the size of char in Java?', 'Core Java Basics', NULL, 'easy', NULL, NULL, 2, 'java-interview', 14, '["char","primitive","unicode"]', 'mcq', 'java', '{"question":"What is the size of the char primitive type in Java?","options":["1 byte","2 bytes","4 bytes","Platform-dependent"],"correct_index":1,"explanation":"char in Java is 2 bytes (16 bits) and represents a Unicode code point (UTF-16). Range: 0 to 65535 (''\\u0000'' to ''\\uFFFF''). Unlike C/C++, it is always 2 bytes regardless of platform."}', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-mcq-015', 'Which collection is ordered by insertion and fast for get/put?', 'Collections', NULL, 'medium', NULL, NULL, 2, 'java-interview', 15, '["LinkedHashMap","insertion-order"]', 'mcq', 'java', '{"question":"Which Map implementation maintains insertion order and provides O(1) average-time operations?","options":["TreeMap","HashMap","LinkedHashMap","Hashtable"],"correct_index":2,"explanation":"LinkedHashMap maintains a doubly-linked list through entries in insertion order (or access order if constructed with accessOrder=true). It provides O(1) average get/put like HashMap."}', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-mcq-016', 'Which of the following is NOT a feature of Java 8?', 'Java 8+', NULL, 'easy', NULL, NULL, 2, 'java-interview', 16, '["java8","features"]', 'mcq', 'java', '{"question":"Which of the following was NOT introduced in Java 8?","options":["Lambda expressions","Stream API","Optional","Records"],"correct_index":3,"explanation":"Records were introduced as a preview in Java 14 and became stable in Java 16. Lambda expressions, Stream API, and Optional were all introduced in Java 8."}', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-mcq-017', 'What is the default load factor of HashMap?', 'Collections', NULL, 'medium', NULL, NULL, 2, 'java-interview', 17, '["HashMap","load-factor","rehash"]', 'mcq', 'java', '{"question":"What is the default load factor of HashMap?","options":["0.5","0.75","1.0","0.25"],"correct_index":1,"explanation":"HashMap uses a default load factor of 0.75. This means rehashing occurs when the number of entries exceeds 75% of the current capacity. It balances time vs space: lower LF = fewer collisions but more memory."}', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-mcq-018', 'What is the output of "5" + 3 + 2 in Java?', 'Core Java Basics', NULL, 'medium', NULL, NULL, 2, 'java-interview', 18, '["string-concatenation","operator-precedence"]', 'mcq', 'java', '{"question":"What is the output of System.out.println(\"5\" + 3 + 2)?","options":["10","532","55","535"],"correct_index":1,"explanation":"\"5\" + 3 evaluates left-to-right: \"5\" + 3 = \"53\" (string concat), then \"53\" + 2 = \"532\". If it were 3 + 2 + \"5\" the result would be \"55\" because 3+2=5 first (int addition)."}', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-mcq-019', 'Which method removes all elements from an ArrayList?', 'Collections', NULL, 'easy', NULL, NULL, 2, 'java-interview', 19, '["ArrayList","clear","removeAll"]', 'mcq', 'java', '{"question":"Which method removes all elements from an ArrayList?","options":["removeAll()","delete()","clear()","reset()"],"correct_index":2,"explanation":"clear() removes all elements from the list and sets its size to 0 (O(n) to nullify references). removeAll(collection) removes all elements that are in the given collection — different operation."}', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-mcq-020', 'What exception is thrown when you access an array index out of bounds?', 'Core Java Basics', NULL, 'easy', NULL, NULL, 2, 'java-interview', 20, '["exception","array","bounds"]', 'mcq', 'java', '{"question":"What exception is thrown when accessing an invalid array index?","options":["IndexOutOfBoundsException","ArrayIndexOutOfBoundsException","IllegalArgumentException","NullPointerException"],"correct_index":1,"explanation":"ArrayIndexOutOfBoundsException (unchecked) is thrown when accessing an index < 0 or >= array.length. For List, it is IndexOutOfBoundsException. AIOOBE is a subclass of IOOBE."}', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-mcq-021', 'What does the synchronized keyword do to a static method?', 'Multithreading', NULL, 'medium', NULL, NULL, 2, 'java-interview', 21, '["synchronized","static","class-lock"]', 'mcq', 'java', '{"question":"When a static method is synchronized in Java, which object is used as the monitor?","options":["The calling thread","The instance of the class","The Class object (e.g., MyClass.class)","A new object per call"],"correct_index":2,"explanation":"A synchronized static method locks on the Class object (e.g., MyClass.class), not on any instance. This means all threads share a single class-level lock for that method."}', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-mcq-022', 'Which of the following is NOT a valid way to create a String?', 'Core Java Basics', NULL, 'easy', NULL, NULL, 2, 'java-interview', 22, '["String","creation"]', 'mcq', 'java', '{"question":"Which is NOT a valid way to create a String in Java?","options":["String s = \"hello\";","String s = new String(\"hello\");","String s = String.create(\"hello\");","String s = new String(new char[]{''h'',''i''});"],"correct_index":2,"explanation":"String.create() does not exist. You can create Strings via literals, new String(...), String.valueOf(), CharBuffer wrap, etc. — but not String.create()."}', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-mcq-023', 'What does Collections.unmodifiableList() do?', 'Collections', NULL, 'medium', NULL, NULL, 2, 'java-interview', 23, '["unmodifiable","Collections","view"]', 'mcq', 'java', '{"question":"What does Collections.unmodifiableList(list) return?","options":["A deep copy that cannot be modified","A view that throws UnsupportedOperationException on mutation","A sorted unmodifiable list","A thread-safe unmodifiable list"],"correct_index":1,"explanation":"Returns an unmodifiable *view* of the list — same backing data. Mutations via the view throw UnsupportedOperationException. Mutations via the original list ARE reflected in the view. For a truly independent immutable copy use List.copyOf()."}', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-mcq-024', 'What is the output of Math.round(2.5)?', 'Core Java Basics', NULL, 'medium', NULL, NULL, 2, 'java-interview', 24, '["Math","rounding"]', 'mcq', 'java', '{"question":"What is the output of Math.round(2.5) in Java?","options":["2","3","2.5","Compilation error"],"correct_index":1,"explanation":"Math.round(2.5) returns 3. Java uses half-up rounding: ties round toward positive infinity. Math.round(double) is equivalent to (long) Math.floor(x + 0.5)."}', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-mcq-025', 'Which of the following supports both null keys and null values?', 'Collections', NULL, 'medium', NULL, NULL, 2, 'java-interview', 25, '["HashMap","null","map"]', 'mcq', 'java', '{"question":"Which Map implementation supports both null keys and null values?","options":["TreeMap","Hashtable","ConcurrentHashMap","HashMap"],"correct_index":3,"explanation":"HashMap allows one null key and multiple null values. TreeMap and ConcurrentHashMap do not allow null keys. Hashtable does not allow null keys or values."}', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-mcq-026', 'What is the correct way to check if a String is null or empty?', 'Core Java Basics', NULL, 'easy', NULL, NULL, 2, 'java-interview', 26, '["String","null-check","isEmpty"]', 'mcq', 'java', '{"question":"What is the safest way to check if a String is null or empty?","options":["str.isEmpty()","str == null || str.isEmpty()","str.equals(\"\")","str == \"\""],"correct_index":1,"explanation":"str.isEmpty() throws NullPointerException if str is null. Always check null first: str == null || str.isEmpty(). Java 11+: str == null || str.isBlank() also handles whitespace-only strings."}', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-mcq-027', 'Which method in Stream API collects elements into a List?', 'Java 8+', NULL, 'easy', NULL, NULL, 2, 'java-interview', 27, '["streams","collect","Collectors"]', 'mcq', 'java', '{"question":"Which terminal operation collects stream elements into a List?","options":["toList()","collect(Collectors.toList())","gather()","Both A and B"],"correct_index":3,"explanation":"Both work: collect(Collectors.toList()) (Java 8+) and the shorthand toList() (Java 16+). toList() returns an unmodifiable List. Collectors.toList() returns a modifiable ArrayList."}', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-mcq-028', 'What is the difference between peek() and map() in Streams?', 'Java 8+', NULL, 'medium', NULL, NULL, 2, 'java-interview', 28, '["streams","peek","map"]', 'mcq', 'java', '{"question":"What is the difference between Stream.peek() and Stream.map()?","options":["peek() transforms elements; map() inspects them","peek() is terminal; map() is intermediate","peek() inspects elements without transforming; map() transforms them","They are identical"],"correct_index":2,"explanation":"map() transforms each element and passes the result downstream. peek() is for side-effects (logging/debugging) — it receives each element but passes it through unchanged. Both are intermediate operations."}', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-mcq-029', 'What is method hiding in Java?', 'OOP in Java', NULL, 'hard', NULL, NULL, 2, 'java-interview', 29, '["method-hiding","static","overriding"]', 'mcq', 'java', '{"question":"What is method hiding in Java?","options":["When a private method is not visible in a subclass","When a static method in a subclass has the same signature as a static method in the parent","When you use the final keyword on a method","When a method is declared abstract"],"correct_index":1,"explanation":"Method hiding occurs when a subclass defines a static method with the same signature as a static method in its superclass. Unlike overriding, resolution is based on the reference type (compile-time), not the object type (runtime)."}', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-mcq-030', 'What happens to the finally block when System.exit() is called?', 'Exception Handling', NULL, 'hard', NULL, NULL, 2, 'java-interview', 30, '["finally","System.exit"]', 'mcq', 'java', '{"question":"What happens to the finally block when System.exit() is called inside a try block?","options":["finally executes normally","finally is skipped","finally throws an exception","Compilation error"],"correct_index":1,"explanation":"System.exit() terminates the JVM immediately. The finally block does NOT execute. The only other case where finally is skipped: if the JVM crashes, or if the thread is killed with Thread.stop() (deprecated)."}', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-mcq-031', 'Which interface must be implemented for an object to be used in try-with-resources?', 'Exception Handling', NULL, 'easy', NULL, NULL, 2, 'java-interview', 31, '["try-with-resources","AutoCloseable","Closeable"]', 'mcq', 'java', '{"question":"Which interface must an object implement to be used in try-with-resources?","options":["Closeable","AutoCloseable","Serializable","Disposable"],"correct_index":1,"explanation":"AutoCloseable (java.lang) must be implemented — it has a single method close() that can throw Exception. Closeable (java.io) extends AutoCloseable but narrows the exception to IOException. Try-with-resources accepts any AutoCloseable."}', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-mcq-032', 'What is the parent class of all classes in Java?', 'OOP in Java', NULL, 'easy', NULL, NULL, 2, 'java-interview', 32, '["Object","inheritance","class-hierarchy"]', 'mcq', 'java', '{"question":"What is the parent class of all classes in Java?","options":["Class","Base","Object","Root"],"correct_index":2,"explanation":"java.lang.Object is the root of the Java class hierarchy. Every class implicitly extends Object unless it explicitly extends another class. Key methods: equals(), hashCode(), toString(), clone(), wait(), notify(), getClass()."}', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-mcq-033', 'What is the default initial capacity of ArrayList?', 'Collections', NULL, 'easy', NULL, NULL, 2, 'java-interview', 33, '["ArrayList","initial-capacity"]', 'mcq', 'java', '{"question":"What is the default initial capacity of an ArrayList?","options":["0","5","10","16"],"correct_index":2,"explanation":"ArrayList has a default initial capacity of 10. When the list grows beyond capacity, it resizes to 1.5x the current size. You can pass an initial capacity to the constructor to avoid resizing: new ArrayList<>(expectedSize)."}', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-mcq-034', 'Which Java feature introduced sealed classes?', 'Java 8+', NULL, 'medium', NULL, NULL, 2, 'java-interview', 34, '["sealed","records","java17"]', 'mcq', 'java', '{"question":"In which Java version were sealed classes made stable (non-preview)?","options":["Java 14","Java 15","Java 16","Java 17"],"correct_index":3,"explanation":"Sealed classes were a preview in Java 15 and 16, then became stable in Java 17. They restrict which classes can extend or implement them using the permits clause."}', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-mcq-035', 'What does the transient keyword do?', 'I/O & Serialization', NULL, 'easy', NULL, NULL, 2, 'java-interview', 35, '["transient","serialization"]', 'mcq', 'java', '{"question":"What does the transient keyword do in Java?","options":["Makes a field thread-local","Excludes a field from serialization","Makes a field volatile","Prevents a field from being garbage collected"],"correct_index":1,"explanation":"transient marks a field to be excluded from serialization. When an object is serialized, transient fields are not written to the stream. On deserialization, they receive their default values (null, 0, false)."}', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-mcq-036', 'What is the difference between deep copy and clone() in Java?', 'OOP in Java', NULL, 'medium', NULL, NULL, 2, 'java-interview', 36, '["clone","deep-copy","Cloneable"]', 'mcq', 'java', '{"question":"What does the default Object.clone() method produce?","options":["Deep copy — all nested objects are recursively copied","Shallow copy — field values copied, references shared","A serialized copy","It throws CloneNotSupportedException always"],"correct_index":1,"explanation":"Object.clone() produces a shallow copy by default — primitive fields are copied by value, reference fields are copied by reference (both original and clone point to the same nested objects). Deep copy requires manual implementation."}', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-mcq-037', 'What is the purpose of serialVersionUID?', 'I/O & Serialization', NULL, 'medium', NULL, NULL, 2, 'java-interview', 37, '["serialVersionUID","serialization","versioning"]', 'mcq', 'java', '{"question":"What is the purpose of serialVersionUID in Java?","options":["It stores the version of Java used to compile the class","It is used during deserialization to verify that the serialized and loaded class are compatible","It controls the number of times an object can be serialized","It is a unique ID assigned by the JVM at runtime"],"correct_index":1,"explanation":"serialVersionUID is used during deserialization to verify that the serialized class and the loaded class are compatible. If they differ, an InvalidClassException is thrown. Always declare it explicitly to avoid unexpected breaks when the class changes."}', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-mcq-038', 'What will happen if equals() is overridden but hashCode() is not?', 'Core Java Basics', NULL, 'hard', NULL, NULL, 2, 'java-interview', 38, '["equals","hashCode","contract"]', 'mcq', 'java', '{"question":"What is the consequence of overriding equals() without overriding hashCode()?","options":["Compilation error","equals() will not work correctly","Objects that are equal may be placed in different buckets in HashMap/HashSet, breaking lookup","No consequences"],"correct_index":2,"explanation":"The contract: if a.equals(b) then a.hashCode() == b.hashCode(). If hashCode() is not overridden, two logically-equal objects may have different hash codes, placing them in different buckets in HashMap/HashSet — causing them not to be found on lookup."}', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-mcq-039', 'What is the output of 1/0 in Java?', 'Exception Handling', NULL, 'easy', NULL, NULL, 2, 'java-interview', 39, '["ArithmeticException","division","integer"]', 'mcq', 'java', '{"question":"What is the result of evaluating 1/0 in Java?","options":["Infinity","NaN","ArithmeticException: / by zero","Compilation error"],"correct_index":2,"explanation":"Integer division by zero throws ArithmeticException: / by zero at runtime. Floating-point division: 1.0/0.0 = Infinity, 0.0/0.0 = NaN (no exception thrown for float/double division by zero)."}', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('java-mcq-040', 'Which method converts a primitive int to Integer?', 'Core Java Basics', NULL, 'easy', NULL, NULL, 2, 'java-interview', 40, '["autoboxing","valueOf","Integer"]', 'mcq', 'java', '{"question":"Which method explicitly boxes an int to Integer (recommended over new Integer())?","options":["Integer.parseInt()","new Integer(42)","Integer.valueOf(42)","Integer.intValue()"],"correct_index":2,"explanation":"Integer.valueOf(42) is the preferred way to box an int — it uses the cache for -128 to 127. new Integer() was deprecated in Java 9 and removed in Java 17. parseInt() converts a String to int, not int to Integer."}', 'custom');
