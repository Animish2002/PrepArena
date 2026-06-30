-- PrepArena seed: OOPs Theory + MCQ
-- Problems: 69
-- Generated: 2026-06-30T16:42:46.263Z
-- Apply (local):  npx wrangler d1 execute preParena-db --local  --file=src/scripts/sql/oops.sql
-- Apply (remote): npx wrangler d1 execute preParena-db --remote --file=src/scripts/sql/oops.sql
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-theory-001', 'What is encapsulation and why is it important?', 'Encapsulation', NULL, 'easy', NULL, NULL, 5, 'oops-concepts', 1, '["encapsulation","data-hiding","getter-setter"]', 'theory', 'oops', '## Encapsulation

Bundling data (fields) and the methods that operate on that data into a single unit (class), and **hiding internal state** from the outside world.

**How**: make fields `private`, expose only necessary operations via public methods.

```java
class BankAccount {
  private double balance;
  public void deposit(double amount) {
    if (amount > 0) balance += amount;
  }
  public double getBalance() { return balance; }
}
```

**Benefits**:
- Protects data integrity (validation in setters)
- Allows changing internals without breaking callers
- Reduces coupling
- Enables controlled access (read-only via getter only)', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-theory-002', 'What is abstraction in OOP?', 'Abstraction', NULL, 'easy', NULL, NULL, 5, 'oops-concepts', 2, '["abstraction","interface","abstract-class"]', 'theory', 'oops', '## Abstraction

Hiding implementation complexity and exposing only essential features. The user knows *what* an object does, not *how*.

**Mechanisms in Java**:
- **Abstract class**: partial abstraction — some methods have implementations
- **Interface**: full abstraction of contract

```java
interface Shape {
  double area();
  double perimeter();
}

class Circle implements Shape {
  private double r;
  public double area() { return Math.PI * r * r; }
  public double perimeter() { return 2 * Math.PI * r; }
}
```

The caller only sees the `Shape` contract — doesn''t need to know it''s a Circle.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-theory-003', 'What is inheritance and what are its types?', 'Inheritance', NULL, 'easy', NULL, NULL, 5, 'oops-concepts', 3, '["inheritance","extends","types"]', 'theory', 'oops', '## Inheritance

Allows a class (child) to acquire state and behaviour of another class (parent) using `extends`.

**Types**:
1. **Single** — A extends B
2. **Multi-level** — A extends B, B extends C
3. **Hierarchical** — Multiple classes extend one class
4. **Multiple** — Forbidden for classes in Java; allowed via interfaces
5. **Hybrid** — combination (via interfaces)

```java
class Animal { void eat() {} }
class Dog extends Animal { void bark() {} }
class GuideDog extends Dog { void guide() {} } // multi-level
```

**Why Java avoids multiple class inheritance**: ambiguity (Diamond Problem) — solved by using interfaces.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-theory-004', 'What is runtime polymorphism and how does it work?', 'Polymorphism', NULL, 'medium', NULL, NULL, 5, 'oops-concepts', 4, '["polymorphism","dynamic-dispatch","overriding"]', 'theory', 'oops', '## Runtime Polymorphism

The JVM determines which method implementation to call at **runtime** based on the actual object type, not the reference type. Achieved via method overriding.

```java
Animal a = new Dog();
a.speak(); // calls Dog.speak(), not Animal.speak()
```

**Mechanism**: virtual method dispatch. Every non-private, non-static method in Java is virtual by default.

**Vtable**: the JVM maintains a virtual method table per class — each method slot points to the most-derived implementation.

**Compile-time polymorphism** (method overloading) resolves at compile time based on signature.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-theory-005', 'What is the Single Responsibility Principle (SRP)?', 'SOLID', NULL, 'easy', NULL, NULL, 5, 'oops-concepts', 5, '["SRP","SOLID","design-principles"]', 'theory', 'oops', '## Single Responsibility Principle

A class should have **one and only one reason to change** — it should be responsible for one part of functionality.

**Violation**:
```java
class UserService {
  void createUser() {}
  void sendWelcomeEmail() {}  // email concerns here — violation
  void generateReport() {}    // reporting concern — violation
}
```

**Fix**: split into `UserService`, `EmailService`, `ReportService`.

**Why it matters**: a class with multiple reasons to change is harder to test, more fragile, and more likely to be broken by unrelated changes.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-theory-006', 'What is the Open/Closed Principle (OCP)?', 'SOLID', NULL, 'medium', NULL, NULL, 5, 'oops-concepts', 6, '["OCP","SOLID","extension"]', 'theory', 'oops', '## Open/Closed Principle

Software entities should be **open for extension but closed for modification**.

**Bad** — adding a new shape requires modifying existing code:
```java
double area(Shape s) {
  if (s instanceof Circle) return ...
  else if (s instanceof Square) return ... // must edit here
}
```

**Good** — extend via polymorphism:
```java
interface Shape { double area(); }
class Circle implements Shape { public double area() { ... } }
class Triangle implements Shape { public double area() { ... } } // no existing code changed
```

Apply via: **Strategy pattern**, **Template Method**, **plugins**, or abstract class hierarchies.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-theory-007', 'What is the Liskov Substitution Principle (LSP)?', 'SOLID', NULL, 'medium', NULL, NULL, 5, 'oops-concepts', 7, '["LSP","SOLID","substitution"]', 'theory', 'oops', '## Liskov Substitution Principle

Objects of a subtype must be **substitutable for objects of their supertype** without altering the correctness of the program.

**Violation** (classic example):
```java
class Rectangle { setWidth(); setHeight(); }
class Square extends Rectangle {
  @Override setWidth(int w) { width = height = w; } // breaks Rectangle contract!
}
```

Code expecting a Rectangle that sets width and height independently will break when given a Square.

**Fix**: Square should NOT extend Rectangle. Use a common Shape interface instead.

**Contract rules**: subclass must not strengthen preconditions, weaken postconditions, or throw new checked exceptions.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-theory-008', 'What is the Interface Segregation Principle (ISP)?', 'SOLID', NULL, 'medium', NULL, NULL, 5, 'oops-concepts', 8, '["ISP","SOLID","interface"]', 'theory', 'oops', '## Interface Segregation Principle

Clients should not be forced to depend on interfaces they do not use. **Split fat interfaces into small, focused ones.**

**Violation**:
```java
interface Worker {
  void work();
  void eat(); // robots don''t eat!
}
class Robot implements Worker {
  void eat() { throw new UnsupportedOperationException(); } // forced to implement
}
```

**Fix**:
```java
interface Workable { void work(); }
interface Feedable { void eat(); }
class Human implements Workable, Feedable { ... }
class Robot implements Workable { ... }
```', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-theory-009', 'What is the Dependency Inversion Principle (DIP)?', 'SOLID', NULL, 'medium', NULL, NULL, 5, 'oops-concepts', 9, '["DIP","SOLID","dependency-injection"]', 'theory', 'oops', '## Dependency Inversion Principle

1. High-level modules should not depend on low-level modules — both should depend on **abstractions**.
2. Abstractions should not depend on details — details should depend on abstractions.

**Violation**:
```java
class OrderService {
  private MySQLDatabase db = new MySQLDatabase(); // tightly coupled
}
```

**Fix** (inject the abstraction):
```java
interface Database { void save(Order o); }
class OrderService {
  private Database db;
  OrderService(Database db) { this.db = db; } // injection
}
```

DIP enables dependency injection and makes unit testing trivial (inject mock).', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-theory-010', 'What is the Factory Method design pattern?', 'Design Patterns', 'Creational', 'medium', NULL, NULL, 5, 'oops-concepts', 10, '["factory-method","creational","design-pattern"]', 'theory', 'oops', '## Factory Method Pattern

Defines an interface for creating an object, but lets **subclasses** decide which class to instantiate. Delegates instantiation to subclasses.

```java
abstract class Dialog {
  abstract Button createButton(); // factory method
  void render() { Button b = createButton(); b.draw(); }
}
class WindowsDialog extends Dialog {
  Button createButton() { return new WindowsButton(); }
}
class WebDialog extends Dialog {
  Button createButton() { return new HtmlButton(); }
}
```

**Use when**: you don''t know ahead of time which class to instantiate, or when subclasses should control creation.

**vs Abstract Factory**: Factory Method uses inheritance; Abstract Factory uses composition (family of products).', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-theory-011', 'What is the Observer design pattern?', 'Design Patterns', 'Behavioral', 'medium', NULL, NULL, 5, 'oops-concepts', 11, '["observer","event","publish-subscribe"]', 'theory', 'oops', '## Observer Pattern

Defines a one-to-many dependency: when an object (Subject/Publisher) changes state, all its dependents (Observers/Subscribers) are notified automatically.

```java
interface Observer { void update(String event); }
class EventBus {
  List<Observer> observers = new ArrayList<>();
  void subscribe(Observer o) { observers.add(o); }
  void publish(String event) { observers.forEach(o -> o.update(event)); }
}
```

**Real-world**: Java event listeners, RxJava, Spring ApplicationEvents, UI frameworks.

**Variants**: push model (Subject sends data) vs pull model (Observer fetches from subject).', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-theory-012', 'What is the Strategy design pattern?', 'Design Patterns', 'Behavioral', 'medium', NULL, NULL, 5, 'oops-concepts', 12, '["strategy","algorithm","design-pattern"]', 'theory', 'oops', '## Strategy Pattern

Defines a family of algorithms, encapsulates each one, and makes them **interchangeable** — lets the algorithm vary independently from clients that use it.

```java
interface SortStrategy { void sort(int[] arr); }
class QuickSort implements SortStrategy { ... }
class MergeSort implements SortStrategy { ... }

class Sorter {
  private SortStrategy strategy;
  Sorter(SortStrategy s) { this.strategy = s; }
  void sort(int[] arr) { strategy.sort(arr); }
}

// Usage
new Sorter(new QuickSort()).sort(data);
new Sorter(new MergeSort()).sort(data);
```

**vs Template Method**: Strategy uses composition (inject); Template uses inheritance (extend).', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-theory-013', 'What is the Decorator design pattern?', 'Design Patterns', 'Structural', 'medium', NULL, NULL, 5, 'oops-concepts', 13, '["decorator","wrapper","structural"]', 'theory', 'oops', '## Decorator Pattern

Attaches additional responsibilities to an object **dynamically** — wraps the object in decorator objects that add behaviour.

```java
interface Coffee { double cost(); }
class SimpleCoffee implements Coffee { public double cost() { return 1.0; } }

class MilkDecorator implements Coffee {
  private Coffee c;
  MilkDecorator(Coffee c) { this.c = c; }
  public double cost() { return c.cost() + 0.25; }
}

Coffee c = new MilkDecorator(new SimpleCoffee()); // 1.25
```

**Real-world**: Java I/O streams (`BufferedInputStream` wraps `FileInputStream`), Spring''s `TransactionInterceptor`.

**vs inheritance**: decorator allows combining behaviours at runtime, avoids class explosion.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-theory-014', 'What is the Builder design pattern?', 'Design Patterns', 'Creational', 'medium', NULL, NULL, 5, 'oops-concepts', 14, '["builder","fluent","creational"]', 'theory', 'oops', '## Builder Pattern

Constructs complex objects **step-by-step**, separating construction logic from the representation.

```java
class Pizza {
  private String crust; private String sauce; private List<String> toppings;
  private Pizza() {}
  static class Builder {
    private Pizza p = new Pizza();
    Builder crust(String c) { p.crust = c; return this; }
    Builder sauce(String s) { p.sauce = s; return this; }
    Builder topping(String t) { p.toppings.add(t); return this; }
    Pizza build() { return p; }
  }
}

Pizza pizza = new Pizza.Builder().crust("thin").sauce("tomato").topping("cheese").build();
```

**Use when**: constructor has many optional parameters (avoids telescoping constructors / ambiguous nulls).', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-theory-015', 'What is the Adapter design pattern?', 'Design Patterns', 'Structural', 'medium', NULL, NULL, 5, 'oops-concepts', 15, '["adapter","wrapper","compatibility"]', 'theory', 'oops', '## Adapter Pattern

Converts the interface of a class into another interface that clients expect — makes incompatible interfaces work together.

```java
interface MediaPlayer { void play(String file); }
class VLCPlayer { void playVLC(String file) { ... } }

// Adapter wraps VLCPlayer and exposes MediaPlayer interface
class VLCAdapter implements MediaPlayer {
  private VLCPlayer vlc = new VLCPlayer();
  public void play(String file) { vlc.playVLC(file); }
}

MediaPlayer player = new VLCAdapter();
player.play("video.vlc");
```

**Object adapter** (uses composition, preferred) vs **Class adapter** (uses multiple inheritance — not possible in Java for classes).

Real-world: `Arrays.asList()`, `InputStreamReader`.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-theory-016', 'What is the Singleton pattern and what are its thread-safety concerns?', 'Design Patterns', 'Creational', 'hard', NULL, NULL, 5, 'oops-concepts', 16, '["singleton","thread-safety","double-checked"]', 'theory', 'oops', '## Singleton Pattern — Thread Safety

**Lazy initialization (NOT thread-safe)**:
```java
if (instance == null) instance = new Singleton(); // race condition
```

**Synchronized method (thread-safe, slow)**:
```java
public static synchronized Singleton getInstance() { ... }
```

**Double-checked locking (thread-safe, fast — requires volatile)**:
```java
private static volatile Singleton instance;
if (instance == null) {
  synchronized (Singleton.class) {
    if (instance == null) instance = new Singleton();
  }
}
```

**Best approach — Enum singleton**:
```java
public enum Singleton { INSTANCE; }
```
Thread-safe, handles serialization, no reflection attack.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-theory-017', 'When would you choose an abstract class over an interface?', 'Abstraction', NULL, 'medium', NULL, NULL, 5, 'oops-concepts', 17, '["abstract-class","interface","design-decision"]', 'theory', 'oops', '## Abstract Class vs Interface — When to Choose

**Choose abstract class when**:
- You want to share **mutable state** (instance fields) among related classes
- You need **constructors** to enforce initialization logic
- Partial implementations make sense (Template Method pattern)
- Classes have a genuine IS-A relationship with shared code

**Choose interface when**:
- Defining a capability/contract (Printable, Comparable, Serializable)
- Need multiple inheritance of type
- Unrelated classes will implement it
- You want to decouple API from implementation completely

**Java 8+ blurs the line** with default methods — but interfaces still can''t hold mutable state.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-theory-018', 'What is "composition over inheritance" and why is it preferred?', 'Design Principles', NULL, 'medium', NULL, NULL, 5, 'oops-concepts', 18, '["composition","inheritance","coupling"]', 'theory', 'oops', '## Composition over Inheritance

**Inheritance** creates a tight, compile-time IS-A coupling. Changes to the parent can break all subclasses (fragile base class problem).

**Composition** — hold an instance of a collaborator, delegate to it.

```java
// Bad: inherit just for logging
class LoggedList extends ArrayList<String> { ... }

// Good: compose
class LoggedList {
  private List<String> delegate = new ArrayList<>();
  void add(String s) { log(s); delegate.add(s); }
}
```

**Benefits of composition**:
- Change behaviour at runtime (swap implementation)
- No tight coupling to parent''s internals
- Easier to test (mock collaborators)

*"Favor composition over inheritance"* — GoF, Effective Java (Bloch Item 18).', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-theory-019', 'What is the Diamond Problem and how does Java handle it?', 'Inheritance', NULL, 'hard', NULL, NULL, 5, 'oops-concepts', 19, '["diamond-problem","multiple-inheritance","default-method"]', 'theory', 'oops', '## Diamond Problem

Occurs when a class inherits from two classes that share a common ancestor — ambiguity in which implementation to use.

**Java''s approach**: classes can only extend **one** class (no multiple class inheritance). This completely avoids the diamond problem for classes.

**Java 8+ with default methods**: if two interfaces provide the same default method, the implementing class **must** override it (or it''s a compile error).

```java
interface A { default void greet() { System.out.println("A"); } }
interface B { default void greet() { System.out.println("B"); } }

class C implements A, B {
  public void greet() { A.super.greet(); } // must resolve explicitly
}
```', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-theory-020', 'What is coupling and cohesion in OOP?', 'Design Principles', NULL, 'medium', NULL, NULL, 5, 'oops-concepts', 20, '["coupling","cohesion","design-quality"]', 'theory', 'oops', '## Coupling & Cohesion

**Coupling** — degree to which one class depends on another.
- **Low coupling** (desirable): classes are independent; changes in one don''t cascade.
- **High coupling** (bad): ripple effects; hard to test in isolation.

**Cohesion** — degree to which elements inside a class belong together.
- **High cohesion** (desirable): a class does one well-defined thing.
- **Low cohesion** (bad): a "god class" doing everything.

**Goal**: **High cohesion + Low coupling**.

Achieved by: SRP, DIP (depend on abstractions), encapsulation, proper layering (no UI → DB direct calls).', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-theory-021', 'What is the Proxy design pattern?', 'Design Patterns', 'Structural', 'medium', NULL, NULL, 5, 'oops-concepts', 21, '["proxy","lazy-loading","access-control"]', 'theory', 'oops', '## Proxy Pattern

Provides a **surrogate** for another object to control access to it.

**Types**:
- **Virtual proxy** — delays expensive creation until needed (lazy loading)
- **Protection proxy** — controls access based on permissions
- **Remote proxy** — represents an object in a different address space
- **Caching proxy** — caches results of expensive operations

```java
interface Image { void display(); }
class RealImage implements Image {
  RealImage(String f) { loadFromDisk(f); } // expensive
  public void display() { ... }
}
class ProxyImage implements Image {
  private RealImage real;
  private String filename;
  ProxyImage(String f) { this.filename = f; }
  public void display() {
    if (real == null) real = new RealImage(filename);
    real.display();
  }
}
```

Spring uses **JDK dynamic proxy** or **CGLIB** for AOP and `@Transactional`.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-theory-022', 'What is the Template Method design pattern?', 'Design Patterns', 'Behavioral', 'medium', NULL, NULL, 5, 'oops-concepts', 22, '["template-method","behavioral","hook"]', 'theory', 'oops', '## Template Method Pattern

Defines the **skeleton of an algorithm** in a base class, deferring some steps to subclasses — subclasses override specific steps without changing the overall structure.

```java
abstract class DataProcessor {
  // Template method
  final void process() {
    readData();      // step 1
    processData();   // step 2 — subclass provides
    writeData();     // step 3
  }
  abstract void processData();
  void readData() { System.out.println("reading"); }    // default
  void writeData() { System.out.println("writing"); }   // default
}
class CsvProcessor extends DataProcessor {
  void processData() { /* parse CSV */ }
}
```

**Hook methods**: optional overridable steps that do nothing by default.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-theory-023', 'What is the Command design pattern?', 'Design Patterns', 'Behavioral', 'medium', NULL, NULL, 5, 'oops-concepts', 23, '["command","undo","encapsulate-request"]', 'theory', 'oops', '## Command Pattern

Encapsulates a request as an object, letting you parameterize clients with operations, queue/log requests, and support undoable operations.

```java
interface Command { void execute(); void undo(); }

class LightOnCommand implements Command {
  Light light;
  public void execute() { light.on(); }
  public void undo() { light.off(); }
}

class RemoteControl {
  Command cmd;
  void pressButton() { cmd.execute(); }
  void pressUndo() { cmd.undo(); }
}
```

**Uses**: undo/redo stacks, task queues, macro recording, transaction logs.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-theory-024', 'What is the difference between abstract class and concrete class?', 'Abstraction', NULL, 'easy', NULL, NULL, 5, 'oops-concepts', 24, '["abstract","concrete","instantiation"]', 'theory', 'oops', '## Abstract vs Concrete Class

| | Abstract Class | Concrete Class |
|-|---------------|---------------|
| Instantiation | Cannot (`new` throws error) | Can be instantiated |
| Abstract methods | Can have | Cannot have |
| Purpose | Define partial template | Provide full implementation |

```java
abstract class Vehicle {
  abstract void startEngine(); // must be overridden
  void honk() { System.out.println("beep"); } // concrete
}

class Car extends Vehicle {
  void startEngine() { System.out.println("vroom"); } // must implement
}

Vehicle v = new Vehicle(); // ERROR — abstract
Vehicle v = new Car();     // OK
```', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-theory-025', 'What is the difference between method overloading and overriding in terms of binding?', 'Polymorphism', NULL, 'medium', NULL, NULL, 5, 'oops-concepts', 25, '["static-binding","dynamic-binding","overloading","overriding"]', 'theory', 'oops', '## Static vs Dynamic Binding

**Static binding (early binding)** — resolved at compile time:
- Applies to: overloaded methods, static methods, final methods, private methods
- Determined by the **reference type**

**Dynamic binding (late binding)** — resolved at runtime:
- Applies to: overridden instance methods
- Determined by the **actual object type**

```java
Animal a = new Dog();
a.speak(); // dynamic — calls Dog.speak() at runtime

// Overloading — static
void print(Animal a) { System.out.println("animal"); }
void print(Dog d) { System.out.println("dog"); }
print(a); // prints "animal" — ref type is Animal
```', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-theory-026', 'What is the Flyweight design pattern?', 'Design Patterns', 'Structural', 'hard', NULL, NULL, 5, 'oops-concepts', 26, '["flyweight","memory","sharing"]', 'theory', 'oops', '## Flyweight Pattern

Reduces memory by **sharing** common parts of object state among many objects instead of keeping all data in every object.

**Intrinsic state** — shared, immutable (stored in flyweight)
**Extrinsic state** — unique per context, passed by caller

```java
class CharacterGlyph { // flyweight
  final char symbol; final Font font; // intrinsic
  void draw(int x, int y) { /* x,y are extrinsic */ }
}
Map<Character, CharacterGlyph> cache = new HashMap<>();
```

**Real-world**: Java String pool, `Integer.valueOf()` cache (-128 to 127), game engine sprites, font glyph caches.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-theory-027', 'What is the Chain of Responsibility pattern?', 'Design Patterns', 'Behavioral', 'medium', NULL, NULL, 5, 'oops-concepts', 27, '["chain-of-responsibility","pipeline","handler"]', 'theory', 'oops', '## Chain of Responsibility Pattern

Passes a request along a chain of handlers — each decides to process or pass it on to the next.

```java
abstract class Handler {
  Handler next;
  Handler setNext(Handler n) { this.next = n; return n; }
  abstract void handle(Request r);
  protected void passOn(Request r) { if (next != null) next.handle(r); }
}
class AuthHandler extends Handler {
  void handle(Request r) {
    if (!r.isAuthenticated()) r.deny();
    else passOn(r);
  }
}
```

**Real-world**: Java Servlet Filters, Spring Security filter chain, Express.js middleware, logging frameworks.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-theory-028', 'What is the Memento design pattern?', 'Design Patterns', 'Behavioral', 'hard', NULL, NULL, 5, 'oops-concepts', 28, '["memento","undo","snapshot"]', 'theory', 'oops', '## Memento Pattern

Captures and externalizes an object''s internal state so it can be **restored later** without violating encapsulation.

**Participants**:
- **Originator** — object whose state needs saving
- **Memento** — stores snapshot of state
- **Caretaker** — holds mementos, never inspects contents

```java
class Editor {
  private String text;
  Memento save() { return new Memento(text); }
  void restore(Memento m) { text = m.state(); }
  record Memento(String state) {}
}
Deque<Editor.Memento> history = new ArrayDeque<>();
history.push(editor.save());
editor.restore(history.pop()); // undo
```

**Use case**: undo/redo, game save states, transaction rollback.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-theory-029', 'What is object composition in OOP?', 'Design Principles', NULL, 'easy', NULL, NULL, 5, 'oops-concepts', 29, '["composition","HAS-A","delegation"]', 'theory', 'oops', '## Object Composition

Building complex objects by combining simpler ones via **HAS-A** relationships (as opposed to inheritance IS-A).

```java
class Engine {
  void start() { System.out.println("engine starts"); }
}
class Car {
  private Engine engine = new Engine(); // composition
  void drive() { engine.start(); /* ... */ }
}
```

**Benefits over inheritance**:
- Behaviour can be changed at runtime by swapping components
- No unintended method exposure from parent
- Easier unit testing (inject mocks)
- Avoids the fragile base class problem

**Rule**: use composition to reuse *implementation*; use inheritance only for genuine IS-A relationships.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-theory-030', 'What is the difference between is-a and has-a relationships?', 'OOP Fundamentals', NULL, 'easy', NULL, NULL, 5, 'oops-concepts', 30, '["IS-A","HAS-A","inheritance","composition"]', 'theory', 'oops', '## IS-A vs HAS-A

**IS-A** — inheritance relationship:
- "A Dog IS-A Animal" → `class Dog extends Animal`
- The child type can be used wherever the parent type is expected (Liskov)

**HAS-A** — composition/aggregation:
- "A Car HAS-A Engine" → `class Car { Engine engine; }`
- One object holds/uses another

**Test**: ask "Is this relationship genuinely an IS-A at all times?"
- A Square IS-A Rectangle... but behaves differently (LSP violation)
- A Stack IS-A Vector... but shouldn''t expose add() at any index (Java''s Stack is a design mistake)

When in doubt, favor HAS-A.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-theory-031', 'What are the GRASP patterns in OOP design?', 'Design Principles', NULL, 'hard', NULL, NULL, 5, 'oops-concepts', 31, '["GRASP","responsibility","design"]', 'theory', 'oops', '## GRASP Patterns

**General Responsibility Assignment Software Patterns** — guidelines for assigning responsibilities to classes:

1. **Information Expert** — assign responsibility to the class with the information to fulfill it
2. **Creator** — assign B to create A if B aggregates/contains/closely uses A
3. **Controller** — assign use-case handling to a non-UI facade/controller class
4. **Low Coupling** — minimize dependencies between classes
5. **High Cohesion** — keep responsibilities focused
6. **Polymorphism** — assign varying behavior to the type it varies with
7. **Pure Fabrication** — create a helper class that doesn''t represent a domain concept, to achieve low coupling
8. **Indirection** — introduce an intermediary to decouple
9. **Protected Variations** — identify variation points, wrap with stable interfaces', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-theory-032', 'What is the difference between aggregation and composition in OOP?', 'OOP Fundamentals', NULL, 'medium', NULL, NULL, 5, 'oops-concepts', 32, '["aggregation","composition","lifecycle"]', 'theory', 'oops', '## Aggregation vs Composition

Both are HAS-A relationships, differing in **lifecycle dependency**.

**Composition** (strong ownership):
- Child object **cannot exist** without the parent
- Parent creates/destroys child
- Example: `House HAS-A Room` — Room doesn''t exist without House

```java
class House {
  private Room room = new Room(); // created & destroyed with House
}
```

**Aggregation** (weak association):
- Child can exist independently of the parent
- Example: `Department HAS-A Professor` — Professor exists even if Department is dissolved

```java
class Department {
  private List<Professor> faculty; // professors exist independently
}
```', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-theory-033', 'What is the Iterator design pattern?', 'Design Patterns', 'Behavioral', 'easy', NULL, NULL, 5, 'oops-concepts', 33, '["iterator","traversal","collection"]', 'theory', 'oops', '## Iterator Pattern

Provides a way to **sequentially access** elements of an aggregate object without exposing its underlying representation.

```java
interface Iterator<T> {
  boolean hasNext();
  T next();
}
interface Iterable<T> { Iterator<T> iterator(); }

class NumberRange implements Iterable<Integer> {
  int start, end;
  public Iterator<Integer> iterator() {
    return new Iterator<>() {
      int cur = start;
      public boolean hasNext() { return cur <= end; }
      public Integer next() { return cur++; }
    };
  }
}
```

Java''s `java.util.Iterator` + `Iterable` enable the for-each loop for any custom collection.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-theory-034', 'What is the State design pattern?', 'Design Patterns', 'Behavioral', 'medium', NULL, NULL, 5, 'oops-concepts', 34, '["state","FSM","behavioral"]', 'theory', 'oops', '## State Pattern

Allows an object to alter its **behaviour when its internal state changes** — appears to change its class.

```java
interface VendingState { void insertCoin(VendingMachine vm); void dispense(VendingMachine vm); }
class IdleState implements VendingState {
  public void insertCoin(VendingMachine vm) { vm.setState(new HasCoinState()); }
  public void dispense(VendingMachine vm) { System.out.println("Insert coin first"); }
}
class VendingMachine {
  private VendingState state = new IdleState();
  void setState(VendingState s) { this.state = s; }
  void insertCoin() { state.insertCoin(this); }
}
```

**vs Strategy**: State transitions are often managed by the State objects themselves; Strategy is set by the client.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-theory-035', 'What is the Abstract Factory design pattern?', 'Design Patterns', 'Creational', 'hard', NULL, NULL, 5, 'oops-concepts', 35, '["abstract-factory","creational","family"]', 'theory', 'oops', '## Abstract Factory Pattern

Provides an interface for creating **families of related or dependent objects** without specifying their concrete classes.

```java
interface UIFactory {
  Button createButton();
  Checkbox createCheckbox();
}
class WindowsUIFactory implements UIFactory {
  public Button createButton() { return new WindowsButton(); }
  public Checkbox createCheckbox() { return new WindowsCheckbox(); }
}
class MacUIFactory implements UIFactory {
  public Button createButton() { return new MacButton(); }
  public Checkbox createCheckbox() { return new MacCheckbox(); }
}
```

**vs Factory Method**: Abstract Factory creates a family of products via composition; Factory Method creates one product via inheritance.

**Real-world**: JDBC (creates Connection, Statement, ResultSet), javax.xml.parsers.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-theory-036', 'What is the Facade design pattern?', 'Design Patterns', 'Structural', 'easy', NULL, NULL, 5, 'oops-concepts', 36, '["facade","simplification","structural"]', 'theory', 'oops', '## Facade Pattern

Provides a **simplified interface** to a complex subsystem — hides subsystem complexity from clients.

```java
class HomeTheaterFacade {
  private Projector proj; private SoundSystem sound; private DVDPlayer dvd;
  void watchMovie(String title) {
    proj.on();
    sound.setVolume(5);
    dvd.play(title);
  }
  void endMovie() { proj.off(); sound.off(); dvd.stop(); }
}
// Client only calls facade — doesn''t know about proj/sound/dvd
new HomeTheaterFacade().watchMovie("Inception");
```

**Benefits**: reduces coupling between client and subsystem; provides a clean API. Used in Spring''s `JdbcTemplate`, `RestTemplate`.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-theory-037', 'What is the Prototype design pattern?', 'Design Patterns', 'Creational', 'medium', NULL, NULL, 5, 'oops-concepts', 37, '["prototype","clone","creational"]', 'theory', 'oops', '## Prototype Pattern

Creates new objects by **cloning** an existing object (prototype) rather than constructing from scratch — useful when construction is expensive.

```java
abstract class Shape implements Cloneable {
  String color;
  abstract Shape clone();
}
class Circle extends Shape {
  int radius;
  Circle clone() {
    try { return (Circle) super.clone(); }
    catch (CloneNotSupportedException e) { throw new AssertionError(); }
  }
}

// Usage
Circle template = new Circle(); template.color = "red"; template.radius = 5;
Circle c2 = template.clone(); // fast — no expensive initialization
```

**When to use**: object creation is expensive (DB reads, complex computation); many similar objects needed.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-theory-038', 'What is the Bridge design pattern?', 'Design Patterns', 'Structural', 'hard', NULL, NULL, 5, 'oops-concepts', 38, '["bridge","abstraction","implementation"]', 'theory', 'oops', '## Bridge Pattern

Separates an abstraction from its implementation so the two can vary independently.

```java
// Implementation hierarchy
interface Renderer { void render(String shape); }
class VectorRenderer implements Renderer { ... }
class RasterRenderer implements Renderer { ... }

// Abstraction hierarchy
abstract class Shape {
  protected Renderer renderer;
  Shape(Renderer r) { this.renderer = r; }
  abstract void draw();
}
class Circle extends Shape {
  Circle(Renderer r) { super(r); }
  void draw() { renderer.render("circle"); }
}

// Mix and match
new Circle(new VectorRenderer()).draw();
new Circle(new RasterRenderer()).draw();
```

**vs Adapter**: Bridge is designed upfront to separate concerns; Adapter retrofits incompatible interfaces.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-theory-039', 'What is method hiding vs method overriding in OOP?', 'Polymorphism', NULL, 'hard', NULL, NULL, 5, 'oops-concepts', 39, '["method-hiding","overriding","static"]', 'theory', 'oops', '## Method Hiding vs Method Overriding

**Method overriding** — instance method in subclass with same signature. Resolved at **runtime** (dynamic dispatch).

**Method hiding** — static method in subclass with same signature as static method in parent. Resolved at **compile time** based on reference type.

```java
class Parent {
  static void staticMethod() { System.out.println("Parent static"); }
  void instanceMethod() { System.out.println("Parent instance"); }
}
class Child extends Parent {
  static void staticMethod() { System.out.println("Child static"); } // hiding
  void instanceMethod() { System.out.println("Child instance"); }   // overriding
}

Parent p = new Child();
p.staticMethod();  // "Parent static" — compile-time (ref type)
p.instanceMethod(); // "Child instance" — runtime (actual type)
```', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-mcq-001', 'Which OOP pillar is implemented via private fields and public getters/setters?', 'Encapsulation', NULL, 'easy', NULL, NULL, 2, 'oops-concepts', 1, '["encapsulation","pillars"]', 'mcq', 'oops', '{"question":"Which OOP pillar is implemented via private fields and public getters/setters?","options":["Abstraction","Inheritance","Encapsulation","Polymorphism"],"correct_index":2,"explanation":"Encapsulation bundles data with behaviour and hides internal state. Private fields with public getters/setters control how the internal state is accessed and modified, maintaining data integrity."}', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-mcq-002', 'Which SOLID principle states a class should have only one reason to change?', 'SOLID', NULL, 'easy', NULL, NULL, 2, 'oops-concepts', 2, '["SRP","SOLID"]', 'mcq', 'oops', '{"question":"Which SOLID principle states a class should have only one reason to change?","options":["Open/Closed Principle","Single Responsibility Principle","Interface Segregation Principle","Dependency Inversion Principle"],"correct_index":1,"explanation":"SRP (Single Responsibility Principle): a class should have one and only one reason to change, meaning it should be responsible for only one part of the software functionality."}', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-mcq-003', 'What design pattern is the Java Iterator a classic example of?', 'Design Patterns', NULL, 'easy', NULL, NULL, 2, 'oops-concepts', 3, '["iterator","design-pattern"]', 'mcq', 'oops', '{"question":"What design pattern does the Java Iterator interface implement?","options":["Observer","Strategy","Iterator","Visitor"],"correct_index":2,"explanation":"The Iterator pattern provides a standard way to traverse a collection sequentially without exposing its underlying structure. Java''s java.util.Iterator is the canonical example."}', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-mcq-004', 'What does "program to an interface, not an implementation" mean?', 'Design Principles', NULL, 'medium', NULL, NULL, 2, 'oops-concepts', 4, '["interface","abstraction","coupling"]', 'mcq', 'oops', '{"question":"What does \"program to an interface, not an implementation\" mean?","options":["Use only Java interfaces, never abstract classes","Declare variables with the most abstract type needed, not the concrete type","Avoid using classes altogether","Write all code in interface default methods"],"correct_index":1,"explanation":"Declare variables/parameters with the interface or abstract type: List<String> not ArrayList<String>. This decouples code from specific implementations, making it easy to swap them without changing callers."}', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-mcq-005', 'Which pattern converts an incompatible interface into a compatible one?', 'Design Patterns', NULL, 'easy', NULL, NULL, 2, 'oops-concepts', 5, '["adapter","structural"]', 'mcq', 'oops', '{"question":"Which structural pattern converts an incompatible interface into one that clients expect?","options":["Facade","Decorator","Adapter","Proxy"],"correct_index":2,"explanation":"The Adapter pattern wraps an existing class and provides a different interface, making incompatible classes work together. Like a power adapter converting US plug to EU socket."}', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-mcq-006', 'In the Observer pattern, what is the role of the Subject?', 'Design Patterns', NULL, 'medium', NULL, NULL, 2, 'oops-concepts', 6, '["observer","subject","publisher"]', 'mcq', 'oops', '{"question":"In the Observer pattern, what is the role of the Subject (Publisher)?","options":["It observes changes in other objects","It maintains a list of observers and notifies them of state changes","It filters events before sending to observers","It stores observer responses"],"correct_index":1,"explanation":"The Subject (Publisher) maintains a list of observers, notifies them when its state changes, and provides register/unregister methods. The observers react to these notifications."}', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-mcq-007', 'Which pattern adds behaviour to an object without modifying its class?', 'Design Patterns', NULL, 'medium', NULL, NULL, 2, 'oops-concepts', 7, '["decorator","extension"]', 'mcq', 'oops', '{"question":"Which pattern dynamically adds behaviour to an object without modifying its class?","options":["Strategy","Decorator","Template Method","Chain of Responsibility"],"correct_index":1,"explanation":"Decorator wraps an object in decorator objects to add behaviour dynamically. Java I/O streams are the classic example: BufferedInputStream wraps FileInputStream adding buffering without modifying FileInputStream."}', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-mcq-008', 'What is the Liskov Substitution Principle violated by in the classic Rectangle/Square example?', 'SOLID', NULL, 'hard', NULL, NULL, 2, 'oops-concepts', 8, '["LSP","rectangle","square"]', 'mcq', 'oops', '{"question":"Why does Square extending Rectangle violate the Liskov Substitution Principle?","options":["Square has fewer methods than Rectangle","Setting width on a Square also changes height, breaking Rectangle''s contract that width and height are independent","Square uses more memory","Rectangle cannot be instantiated"],"correct_index":1,"explanation":"LSP requires subtypes to honor the parent''s contracts. Rectangle''s contract implies width and height are independent. Square violates this by linking them — code that depends on this contract breaks when passed a Square."}', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-mcq-009', 'Which creational pattern creates objects by cloning an existing prototype?', 'Design Patterns', NULL, 'easy', NULL, NULL, 2, 'oops-concepts', 9, '["prototype","clone","creational"]', 'mcq', 'oops', '{"question":"Which creational pattern creates new objects by copying an existing instance?","options":["Builder","Factory Method","Prototype","Singleton"],"correct_index":2,"explanation":"The Prototype pattern creates new objects by cloning an existing instance (the prototype). Useful when object creation is expensive. Java''s Object.clone() supports this pattern."}', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-mcq-010', 'What does composition over inheritance mean in practice?', 'Design Principles', NULL, 'medium', NULL, NULL, 2, 'oops-concepts', 10, '["composition","inheritance","design"]', 'mcq', 'oops', '{"question":"What does \"favor composition over inheritance\" mean in practice?","options":["Never use inheritance","Represent HAS-A relationships with fields (holding collaborator objects) instead of IS-A relationships via extends","Use interfaces instead of abstract classes always","Avoid using polymorphism"],"correct_index":1,"explanation":"Composition means building behavior by holding references to objects that perform the behavior (HAS-A / delegation), rather than inheriting it. This avoids tight coupling to parent internals and allows runtime flexibility."}', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-mcq-011', 'Which pattern encapsulates a request as an object to support undo?', 'Design Patterns', NULL, 'medium', NULL, NULL, 2, 'oops-concepts', 11, '["command","undo"]', 'mcq', 'oops', '{"question":"Which pattern encapsulates a request as an object, enabling undo/redo functionality?","options":["Observer","Memento","Command","Strategy"],"correct_index":2,"explanation":"Command pattern turns a request into a standalone object containing all information about the request. This allows queuing, logging, and undoing operations by keeping a history of Command objects."}', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-mcq-012', 'Which pattern saves and restores an object''s state?', 'Design Patterns', NULL, 'medium', NULL, NULL, 2, 'oops-concepts', 12, '["memento","snapshot"]', 'mcq', 'oops', '{"question":"Which pattern captures an object''s state as a snapshot to restore it later?","options":["Command","State","Memento","Prototype"],"correct_index":2,"explanation":"Memento saves an object''s state into a memento object (without exposing internals) and allows restoring it later. Used for undo/redo, game saves, text editor history."}', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-mcq-013', 'What is the purpose of the Facade pattern?', 'Design Patterns', NULL, 'easy', NULL, NULL, 2, 'oops-concepts', 13, '["facade","simplification"]', 'mcq', 'oops', '{"question":"What is the primary purpose of the Facade pattern?","options":["Add behavior to objects dynamically","Provide a simplified interface to a complex subsystem","Create families of related objects","Control access to objects"],"correct_index":1,"explanation":"Facade provides a simple, unified interface to a complex set of subsystems, reducing the coupling between clients and subsystems. Think of it as a \"front desk\" that routes requests to internal systems."}', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-mcq-014', 'What is aggregation in OOP?', 'OOP Fundamentals', NULL, 'medium', NULL, NULL, 2, 'oops-concepts', 14, '["aggregation","HAS-A","lifecycle"]', 'mcq', 'oops', '{"question":"What distinguishes aggregation from composition in OOP?","options":["Aggregation uses inheritance; composition uses fields","In aggregation, child objects can exist independently of the parent; in composition they cannot","Composition is only for primitive types","They are the same thing"],"correct_index":1,"explanation":"Composition: child cannot exist without parent (House-Room). Aggregation: child can exist independently (Department-Professor). Both are HAS-A relationships, differing in lifecycle ownership."}', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-mcq-015', 'In Java, can a class implement multiple interfaces?', 'OOP Fundamentals', NULL, 'easy', NULL, NULL, 2, 'oops-concepts', 15, '["interface","multiple-inheritance"]', 'mcq', 'oops', '{"question":"Can a Java class implement multiple interfaces?","options":["No, only one interface per class","Yes, unlimited interfaces","Yes, but only if they share a common parent interface","Yes, but maximum 5"],"correct_index":1,"explanation":"A Java class can implement as many interfaces as needed: class MyClass implements A, B, C {}. This gives Java multiple inheritance of type (not implementation). Default method conflicts must be resolved explicitly."}', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-mcq-016', 'Which pattern defines a skeleton algorithm in a base class with some steps deferred to subclasses?', 'Design Patterns', NULL, 'medium', NULL, NULL, 2, 'oops-concepts', 16, '["template-method","behavioral"]', 'mcq', 'oops', '{"question":"Which pattern defines a skeleton of an algorithm in a base class, deferring some steps to subclasses?","options":["Strategy","Template Method","Factory Method","Builder"],"correct_index":1,"explanation":"Template Method defines the overall structure (skeleton) in a base class method, with some steps as abstract methods that subclasses must implement. The structure never changes; only the variable steps do."}', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-mcq-017', 'What is the key difference between Strategy and State patterns?', 'Design Patterns', NULL, 'hard', NULL, NULL, 2, 'oops-concepts', 17, '["strategy","state","behavioral"]', 'mcq', 'oops', '{"question":"What is the key difference between the Strategy and State patterns?","options":["Strategy uses interfaces; State uses abstract classes","In State, states know about each other and control transitions; in Strategy, strategies are independent and the client controls which to use","Strategy is creational; State is behavioral","There is no difference"],"correct_index":1,"explanation":"Both delegate behavior to an object. Key difference: in State, the concrete states typically trigger transitions to other states themselves. In Strategy, the context/client chooses and swaps strategies; strategies don''t know about each other."}', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-mcq-018', 'What is the Dependency Inversion Principle primarily about?', 'SOLID', NULL, 'medium', NULL, NULL, 2, 'oops-concepts', 18, '["DIP","SOLID","abstraction"]', 'mcq', 'oops', '{"question":"What is the Dependency Inversion Principle primarily about?","options":["Avoid using inheritance","High-level modules should not depend on low-level modules; both should depend on abstractions","Invert the order of method calls","Always use constructor injection"],"correct_index":1,"explanation":"DIP says: depend on abstractions (interfaces/abstract classes), not concretions. High-level business logic shouldn''t directly instantiate low-level DB/network classes. This enables DI (Dependency Injection) and makes testing easy."}', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-mcq-019', 'Which pattern provides a surrogate to control access to another object?', 'Design Patterns', NULL, 'medium', NULL, NULL, 2, 'oops-concepts', 19, '["proxy","structural"]', 'mcq', 'oops', '{"question":"Which structural pattern provides a surrogate or placeholder to control access to another object?","options":["Decorator","Facade","Adapter","Proxy"],"correct_index":3,"explanation":"Proxy provides a surrogate that controls access to the real object. Uses: lazy loading (virtual proxy), access control (protection proxy), remote object (remote proxy). Spring AOP uses CGLIB/JDK proxy for @Transactional."}', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-mcq-020', 'What is method overloading resolved at?', 'Polymorphism', NULL, 'easy', NULL, NULL, 2, 'oops-concepts', 20, '["overloading","compile-time","static-binding"]', 'mcq', 'oops', '{"question":"Method overloading in Java is resolved at which time?","options":["Runtime — based on actual object type","Compile-time — based on parameter types and reference type","Load time — when the class is loaded","Both compile and runtime"],"correct_index":1,"explanation":"Overloading is compile-time (static) polymorphism. The compiler selects the correct overloaded method based on the declared parameter types. Method overriding is runtime (dynamic) polymorphism based on actual object type."}', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-mcq-021', 'What does the Open/Closed Principle say about adding new features?', 'SOLID', NULL, 'medium', NULL, NULL, 2, 'oops-concepts', 21, '["OCP","extension","modification"]', 'mcq', 'oops', '{"question":"According to the Open/Closed Principle, how should new features be added?","options":["By modifying existing code to accommodate the new feature","By extending the system (new classes/implementations) without changing existing code","By deleting old code and rewriting it","By using reflection to add methods dynamically"],"correct_index":1,"explanation":"OCP: classes should be open for extension (add new behavior) but closed for modification (don''t change existing tested code). Achieve this with polymorphism and abstractions — add new implementations of an interface."}', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-mcq-022', 'Which pattern reduces memory by sharing common state across many objects?', 'Design Patterns', NULL, 'hard', NULL, NULL, 2, 'oops-concepts', 22, '["flyweight","memory","sharing"]', 'mcq', 'oops', '{"question":"Which pattern reduces memory by sharing common (intrinsic) state across many fine-grained objects?","options":["Singleton","Prototype","Flyweight","Object Pool"],"correct_index":2,"explanation":"Flyweight separates intrinsic state (shared, immutable) from extrinsic state (unique per use). Classic examples: Java String pool, Integer cache (-128 to 127), game particle systems, text editor character glyphs."}', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-mcq-023', 'What is the purpose of the Builder pattern?', 'Design Patterns', NULL, 'easy', NULL, NULL, 2, 'oops-concepts', 23, '["builder","creational"]', 'mcq', 'oops', '{"question":"What problem does the Builder pattern primarily solve?","options":["Creating objects without constructors","Constructing complex objects with many optional parameters step-by-step","Ensuring only one instance exists","Cloning expensive objects"],"correct_index":1,"explanation":"Builder solves the telescoping constructor problem (many constructors for combinations of optional params). Instead, a fluent builder collects parameters then creates the object via build(). Lombok''s @Builder generates this automatically."}', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-mcq-024', 'What is coupling in OOP?', 'Design Principles', NULL, 'easy', NULL, NULL, 2, 'oops-concepts', 24, '["coupling","dependency"]', 'mcq', 'oops', '{"question":"What does \"coupling\" mean in OOP design?","options":["The number of methods in a class","The degree of interdependence between classes","How cohesive the responsibilities of a class are","The number of parameters in a constructor"],"correct_index":1,"explanation":"Coupling is the degree to which one class depends on another. High coupling = changes in one class ripple through others (fragile). Low coupling = classes are independent and changes are isolated. Goal: low coupling + high cohesion."}', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-mcq-025', 'Which SOLID principle addresses fat interfaces?', 'SOLID', NULL, 'medium', NULL, NULL, 2, 'oops-concepts', 25, '["ISP","fat-interface","SOLID"]', 'mcq', 'oops', '{"question":"Which SOLID principle says clients should not be forced to implement methods they don''t use?","options":["Single Responsibility","Open/Closed","Liskov Substitution","Interface Segregation"],"correct_index":3,"explanation":"ISP (Interface Segregation Principle): Split fat interfaces into smaller, more specific ones. Clients should only depend on the interface methods they use. Example: separate Printable and Scannable rather than one AllInOneDevice interface."}', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-mcq-026', 'What is polymorphism in OOP?', 'Polymorphism', NULL, 'easy', NULL, NULL, 2, 'oops-concepts', 26, '["polymorphism","OOP"]', 'mcq', 'oops', '{"question":"What does polymorphism mean in OOP?","options":["A class can have multiple constructors","One interface can have many implementations; the same method call behaves differently depending on the actual object","A class can inherit from multiple parents","Objects can change their class at runtime"],"correct_index":1,"explanation":"Polymorphism (Greek: \"many forms\"): one interface, many implementations. Compile-time: method overloading. Runtime: method overriding + dynamic dispatch. Enables writing generic code that works with any subtype."}', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-mcq-027', 'What is an abstract class in Java?', 'Abstraction', NULL, 'easy', NULL, NULL, 2, 'oops-concepts', 27, '["abstract-class","instantiation"]', 'mcq', 'oops', '{"question":"Which statement about abstract classes in Java is correct?","options":["Abstract classes can be instantiated directly","Abstract classes can have both abstract and concrete methods","Abstract classes cannot have constructors","Abstract classes must declare all methods as abstract"],"correct_index":1,"explanation":"Abstract classes can have a mix of abstract methods (no body) and concrete methods (with body). They cannot be instantiated directly. They can have constructors (called by subclass via super()), fields, and static members."}', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-mcq-028', 'Which design pattern is used by Java Servlet Filters and Spring Security?', 'Design Patterns', NULL, 'medium', NULL, NULL, 2, 'oops-concepts', 28, '["chain-of-responsibility","filter","pipeline"]', 'mcq', 'oops', '{"question":"Which design pattern underpins Java Servlet Filters and Spring Security filter chains?","options":["Decorator","Observer","Chain of Responsibility","Strategy"],"correct_index":2,"explanation":"Chain of Responsibility passes a request along a chain of handlers, each deciding to process or forward it. Servlet Filters and Spring Security''s filter chain are canonical examples — each filter handles its concern and passes to the next."}', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-mcq-029', 'What is the goal of the Dependency Inversion Principle for testing?', 'SOLID', NULL, 'medium', NULL, NULL, 2, 'oops-concepts', 29, '["DIP","testability","mock"]', 'mcq', 'oops', '{"question":"How does the Dependency Inversion Principle improve testability?","options":["It removes the need for tests","It allows injecting mock implementations of dependencies instead of real ones","It makes all methods public","It generates test cases automatically"],"correct_index":1,"explanation":"When code depends on abstractions (interfaces) and those are injected, tests can inject mock/stub implementations instead of real databases or services. Without DIP, instantiating concrete classes inside methods makes mocking impossible."}', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('oops-mcq-030', 'What is cohesion in OOP?', 'Design Principles', NULL, 'easy', NULL, NULL, 2, 'oops-concepts', 30, '["cohesion","responsibility"]', 'mcq', 'oops', '{"question":"What does \"high cohesion\" mean in OOP design?","options":["A class has many methods","All elements of a class are closely related and focused on one purpose","A class is tightly coupled with others","A class inherits from many parents"],"correct_index":1,"explanation":"High cohesion means a class has a single, well-defined purpose and all its methods/fields work toward that purpose. Low cohesion (\"god class\") does unrelated things — hard to understand, test, and maintain."}', 'custom');
