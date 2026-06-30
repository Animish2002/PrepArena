-- PrepArena seed: SQL Theory
-- Problems: 30
-- Generated: 2026-06-30T16:42:46.265Z
-- Apply (local):  npx wrangler d1 execute preParena-db --local  --file=src/scripts/sql/sql-theory.sql
-- Apply (remote): npx wrangler d1 execute preParena-db --remote --file=src/scripts/sql/sql-theory.sql
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('sql-theory-001', 'What is the difference between DDL, DML, DCL, and TCL in SQL?', 'SQL Basics', 'SQL Categories', 'easy', NULL, NULL, 5, 'leetcode-sql-50', 1, '["DDL","DML","DCL","TCL"]', 'theory', 'sql', '## SQL Command Categories

| Category | Stands for | Commands | Purpose |
|----------|------------|----------|---------|
| **DDL** | Data Definition Language | CREATE, ALTER, DROP, TRUNCATE, RENAME | Define/modify schema |
| **DML** | Data Manipulation Language | SELECT, INSERT, UPDATE, DELETE | Manipulate data |
| **DCL** | Data Control Language | GRANT, REVOKE | Access control |
| **TCL** | Transaction Control Language | COMMIT, ROLLBACK, SAVEPOINT | Transaction management |

**DDL is auto-committed** in most RDBMS (can''t roll back a DROP).
**DML** operates within transactions — changes are visible only after COMMIT (or to the same session before).', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('sql-theory-002', 'What is the difference between DELETE, TRUNCATE, and DROP?', 'SQL Basics', 'Data Removal', 'easy', NULL, NULL, 5, 'leetcode-sql-50', 2, '["DELETE","TRUNCATE","DROP","DML","DDL"]', 'theory', 'sql', '## DELETE vs TRUNCATE vs DROP

| | DELETE | TRUNCATE | DROP |
|-|--------|---------|------|
| Category | DML | DDL | DDL |
| Removes | Rows (with WHERE option) | All rows | Entire table |
| WHERE clause | Yes | No | No |
| Rollback | Yes | No (mostly) | No |
| Triggers | Fires | Does NOT fire | N/A |
| Speed | Slower (row-by-row) | Faster (page dealloc) | Instant |
| Structure | Preserved | Preserved | Removed |

**TRUNCATE** resets auto-increment counters; DELETE does not.
**Use DELETE** when you need WHERE or rollback. **Use TRUNCATE** to quickly empty a table.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('sql-theory-003', 'What are the types of SQL JOINs?', 'Joins', 'Join Types', 'easy', NULL, NULL, 5, 'leetcode-sql-50', 3, '["INNER","LEFT","RIGHT","FULL","JOIN"]', 'theory', 'sql', '## SQL JOIN Types

```sql
-- INNER JOIN — only matching rows in both tables
SELECT u.name, o.amount
FROM users u INNER JOIN orders o ON u.id = o.user_id;

-- LEFT JOIN — all rows from left + matching from right (NULL if no match)
SELECT u.name, o.amount
FROM users u LEFT JOIN orders o ON u.id = o.user_id;

-- RIGHT JOIN — all from right + matching from left
-- FULL OUTER JOIN — all from both (NULLs where no match)
-- CROSS JOIN — Cartesian product (every combination)
-- SELF JOIN — join table to itself (e.g., employee-manager hierarchy)
```

**Tip**: LEFT JOIN to find rows with NO match: `WHERE o.user_id IS NULL` after a LEFT JOIN (users without orders).', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('sql-theory-004', 'What is the difference between INNER JOIN and LEFT JOIN with NULL filtering?', 'Joins', 'Advanced Joins', 'medium', NULL, NULL, 5, 'leetcode-sql-50', 4, '["LEFT JOIN","anti-join","NULL"]', 'theory', 'sql', '## Anti-Join Pattern

Find records in table A with NO matching record in table B.

```sql
-- Users who have never placed an order
SELECT u.id, u.name
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE o.user_id IS NULL;
```

Alternative with NOT EXISTS (often faster on large tables):
```sql
SELECT id, name FROM users u
WHERE NOT EXISTS (
  SELECT 1 FROM orders o WHERE o.user_id = u.id
);
```

Alternative with NOT IN (avoid if subquery can return NULLs — `NOT IN (... NULL)` always returns false).', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('sql-theory-005', 'What are GROUP BY and HAVING clauses in SQL?', 'Aggregation', 'GROUP BY', 'easy', NULL, NULL, 5, 'leetcode-sql-50', 5, '["GROUP BY","HAVING","aggregation"]', 'theory', 'sql', '## GROUP BY & HAVING

**GROUP BY** — groups rows by column values, then aggregates each group.

```sql
SELECT department_id, COUNT(*) as headcount, AVG(salary) as avg_salary
FROM employees
GROUP BY department_id;
```

**HAVING** — filters AFTER grouping (like WHERE but for groups):
```sql
SELECT department_id, COUNT(*) as headcount
FROM employees
GROUP BY department_id
HAVING COUNT(*) > 5;  -- departments with more than 5 employees
```

**Key rule**: columns in SELECT must either be in GROUP BY or wrapped in an aggregate function (COUNT, SUM, AVG, MIN, MAX).

**Execution order**: WHERE → GROUP BY → HAVING → SELECT → ORDER BY.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('sql-theory-006', 'What are common aggregate functions in SQL?', 'Aggregation', 'Functions', 'easy', NULL, NULL, 5, 'leetcode-sql-50', 6, '["COUNT","SUM","AVG","MIN","MAX"]', 'theory', 'sql', '## Aggregate Functions

| Function | Description |
|---------|-------------|
| `COUNT(*)` | Count all rows in group |
| `COUNT(col)` | Count non-NULL values |
| `COUNT(DISTINCT col)` | Count unique non-NULL values |
| `SUM(col)` | Sum of numeric values |
| `AVG(col)` | Average (ignores NULLs) |
| `MIN(col)` | Minimum value |
| `MAX(col)` | Maximum value |
| `GROUP_CONCAT(col)` | Concatenate values in group (MySQL) |

```sql
SELECT
  COUNT(*) AS total_orders,
  COUNT(DISTINCT customer_id) AS unique_customers,
  SUM(amount) AS revenue,
  AVG(amount) AS avg_order
FROM orders
WHERE status = ''completed'';
```', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('sql-theory-007', 'What is a subquery and what are its types?', 'Subqueries', 'Types', 'medium', NULL, NULL, 5, 'leetcode-sql-50', 7, '["subquery","correlated","scalar"]', 'theory', 'sql', '## Subquery Types

**Scalar subquery** — returns single value:
```sql
SELECT name, salary,
  (SELECT AVG(salary) FROM employees) AS company_avg
FROM employees;
```

**Multi-row subquery** — used with IN, ANY, ALL, EXISTS:
```sql
SELECT name FROM employees
WHERE dept_id IN (SELECT id FROM departments WHERE budget > 1000000);
```

**Correlated subquery** — references outer query; re-executed per row (slow for large datasets):
```sql
SELECT e.name FROM employees e
WHERE salary > (
  SELECT AVG(salary) FROM employees e2 WHERE e2.dept_id = e.dept_id
);
```

**Rule**: correlated subqueries can often be rewritten as JOINs or CTEs for better performance.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('sql-theory-008', 'What is a Common Table Expression (CTE) and when to use it?', 'Subqueries', 'CTE', 'medium', NULL, NULL, 5, 'leetcode-sql-50', 8, '["CTE","WITH","readability","recursive"]', 'theory', 'sql', '## Common Table Expressions (CTE)

Named temporary result set defined with `WITH`, valid only for the query that follows.

```sql
WITH monthly_revenue AS (
  SELECT DATE_TRUNC(''month'', order_date) AS month,
         SUM(amount) AS revenue
  FROM orders
  GROUP BY 1
),
top_months AS (
  SELECT * FROM monthly_revenue WHERE revenue > 100000
)
SELECT month, revenue FROM top_months ORDER BY revenue DESC;
```

**Benefits**:
- Improves readability vs deeply nested subqueries
- Can be referenced multiple times in same query
- Enables **recursive CTEs** (hierarchical data: org charts, trees)

**Recursive CTE**:
```sql
WITH RECURSIVE emp_hierarchy AS (
  SELECT id, name, manager_id, 0 AS level FROM employees WHERE manager_id IS NULL
  UNION ALL
  SELECT e.id, e.name, e.manager_id, h.level+1
  FROM employees e JOIN emp_hierarchy h ON e.manager_id = h.id
)
SELECT * FROM emp_hierarchy;
```', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('sql-theory-009', 'What are window functions in SQL?', 'Window Functions', 'Overview', 'hard', NULL, NULL, 5, 'leetcode-sql-50', 9, '["window-functions","OVER","PARTITION BY"]', 'theory', 'sql', '## Window Functions

Perform calculations **across a set of rows** related to the current row, without collapsing rows (unlike GROUP BY).

```sql
SELECT
  emp_id, dept_id, salary,
  AVG(salary) OVER (PARTITION BY dept_id) AS dept_avg,
  salary - AVG(salary) OVER (PARTITION BY dept_id) AS diff_from_avg,
  RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS dept_rank
FROM employees;
```

**Key clauses**:
- `PARTITION BY` — divide rows into groups (like GROUP BY but rows not collapsed)
- `ORDER BY` — defines row order within partition
- `ROWS BETWEEN` — frame definition (e.g., running totals)

**Categories**: ranking, aggregate, offset (LAG/LEAD), distribution', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('sql-theory-010', 'What are ROW_NUMBER, RANK, and DENSE_RANK?', 'Window Functions', 'Ranking', 'medium', NULL, NULL, 5, 'leetcode-sql-50', 10, '["ROW_NUMBER","RANK","DENSE_RANK"]', 'theory', 'sql', '## Ranking Window Functions

For salaries: 100, 90, 90, 80:

| Function | Result |
|---------|--------|
| ROW_NUMBER() | 1, 2, 3, 4 (always unique) |
| RANK() | 1, 2, 2, 4 (ties get same rank; skips next) |
| DENSE_RANK() | 1, 2, 2, 3 (ties get same rank; no skip) |

```sql
-- Top earner per department
SELECT * FROM (
  SELECT emp_id, dept_id, salary,
    DENSE_RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS rnk
  FROM employees
) t
WHERE rnk = 1;
```

**ROW_NUMBER** — use for pagination or picking exactly one row per group.
**RANK / DENSE_RANK** — use for competition-style ranking.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('sql-theory-011', 'What are LAG and LEAD window functions?', 'Window Functions', 'Offset', 'medium', NULL, NULL, 5, 'leetcode-sql-50', 11, '["LAG","LEAD","offset","window-functions"]', 'theory', 'sql', '## LAG & LEAD

Access values from **previous** (LAG) or **next** (LEAD) rows within a partition.

```sql
-- Month-over-month revenue change
SELECT
  month,
  revenue,
  LAG(revenue, 1, 0) OVER (ORDER BY month) AS prev_month_revenue,
  revenue - LAG(revenue, 1, 0) OVER (ORDER BY month) AS change
FROM monthly_revenue;
```

`LAG(expr, offset, default)`:
- `expr` — column to look back
- `offset` — how many rows back (default 1)
- `default` — value if no prior row exists

**Use cases**:
- Period-over-period comparisons
- Finding consecutive records (detect gaps)
- Session analysis (time between events)', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('sql-theory-012', 'What is a running total and how to calculate it in SQL?', 'Window Functions', 'Aggregation', 'medium', NULL, NULL, 5, 'leetcode-sql-50', 12, '["running-total","cumulative","ROWS BETWEEN"]', 'theory', 'sql', '## Running Total

Cumulative sum using a window with an ordered frame.

```sql
SELECT
  order_date,
  amount,
  SUM(amount) OVER (ORDER BY order_date
    ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total
FROM orders;
```

**Frame options** (`ROWS BETWEEN`):
- `UNBOUNDED PRECEDING` — from start of partition
- `CURRENT ROW` — up to current row
- `UNBOUNDED FOLLOWING` — to end of partition
- `N PRECEDING` — N rows before current (rolling window)

**7-day rolling average**:
```sql
AVG(amount) OVER (ORDER BY order_date
  ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)
```', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('sql-theory-013', 'What is a database index and how does it work?', 'Indexes', 'Basics', 'medium', NULL, NULL, 5, 'leetcode-sql-50', 13, '["index","B-tree","performance"]', 'theory', 'sql', '## Database Indexes

A data structure that speeds up data retrieval at the cost of extra storage and slower writes.

**B-Tree index** (default in most RDBMS):
- Balanced tree; leaves contain pointers to actual rows
- Supports: equality (`=`), range (`<`, `>`, `BETWEEN`), ORDER BY, prefix matching (`LIKE ''abc%''`)
- NOT useful for: `LIKE ''%abc''` (no prefix)

```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_orders_user_date ON orders(user_id, created_at);
```

**Types**: single-column, composite (multi-column), unique, partial (WHERE clause), covering, full-text, hash, GiST.

**Trade-off**: indexes speed up SELECT but slow down INSERT/UPDATE/DELETE (index must be maintained).', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('sql-theory-014', 'What is a covering index?', 'Indexes', 'Covering Index', 'hard', NULL, NULL, 5, 'leetcode-sql-50', 14, '["covering-index","index-only-scan","performance"]', 'theory', 'sql', '## Covering Index

An index that contains **all columns needed** to satisfy a query — the DB can answer the query entirely from the index without touching the base table (index-only scan).

```sql
-- Query
SELECT user_id, status, created_at FROM orders WHERE user_id = 42;

-- Covering index (includes all queried columns)
CREATE INDEX idx_orders_covering ON orders(user_id, status, created_at);
```

**Why faster**: avoid random I/O to base table (heap). For large tables, this can be 10x+ faster.

**Composite index column order**:
1. Equality predicates first
2. Range predicates next
3. Then SELECT columns (for covering)

**Caution**: covering indexes consume more disk; maintain balance between query patterns and write overhead.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('sql-theory-015', 'What is the difference between clustered and non-clustered index?', 'Indexes', 'Index Types', 'hard', NULL, NULL, 5, 'leetcode-sql-50', 15, '["clustered","non-clustered","primary-key"]', 'theory', 'sql', '## Clustered vs Non-Clustered Index

**Clustered index**: physically orders the table rows on disk by the index key.
- One per table (the primary key is clustered by default in MySQL InnoDB, SQL Server)
- Range queries on the PK are very fast (sequential disk reads)

**Non-clustered index**: separate structure with pointers (row locators) to the actual row.
- Multiple per table
- Lookup: find pointer in index, then fetch actual row (two I/Os vs one for clustered)

**In PostgreSQL**: all indexes are non-clustered (heap-based). `CLUSTER` command physically orders once but doesn''t maintain order.

**In MySQL InnoDB**: PK = clustered; secondary indexes store PK values as row locators.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('sql-theory-016', 'What are ACID properties in database transactions?', 'Transactions', 'ACID', 'medium', NULL, NULL, 5, 'leetcode-sql-50', 16, '["ACID","atomicity","consistency","isolation","durability"]', 'theory', 'sql', '## ACID Properties

- **Atomicity** — all operations in a transaction succeed or all fail (all-or-nothing). ROLLBACK undoes partial changes.

- **Consistency** — transaction brings DB from one valid state to another. Constraints, triggers, cascade rules are enforced.

- **Isolation** — concurrent transactions don''t interfere. Effects of in-progress transactions are not visible to others (level-dependent).

- **Durability** — committed transactions survive crashes. WAL (Write-Ahead Log) + fsync ensures this.

```sql
BEGIN;
  UPDATE accounts SET balance = balance - 100 WHERE id = 1;
  UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;  -- both succeed
-- or ROLLBACK; if any fails
```', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('sql-theory-017', 'What are transaction isolation levels?', 'Transactions', 'Isolation Levels', 'hard', NULL, NULL, 5, 'leetcode-sql-50', 17, '["isolation","dirty-read","phantom-read","MVCC"]', 'theory', 'sql', '## Isolation Levels

| Level | Dirty Read | Non-Repeatable Read | Phantom Read |
|-------|-----------|--------------------|--------------|
| READ UNCOMMITTED | ✓ Possible | ✓ Possible | ✓ Possible |
| READ COMMITTED | ✗ | ✓ Possible | ✓ Possible |
| REPEATABLE READ | ✗ | ✗ | ✓ Possible (✗ in MySQL) |
| SERIALIZABLE | ✗ | ✗ | ✗ |

- **Dirty read**: reading uncommitted data from another transaction
- **Non-repeatable read**: same row returns different values within one transaction
- **Phantom read**: same query returns different rows (rows added by another transaction)

**Default**: PostgreSQL = READ COMMITTED; MySQL InnoDB = REPEATABLE READ.

Higher isolation = fewer anomalies but more locking/performance cost.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('sql-theory-018', 'What are database normal forms?', 'Normalization', 'Normal Forms', 'hard', NULL, NULL, 5, 'leetcode-sql-50', 18, '["normalization","1NF","2NF","3NF","BCNF"]', 'theory', 'sql', '## Normal Forms

**1NF** (First Normal Form):
- Atomic values — no repeating groups, no arrays in a column
- Each column has a single value per row

**2NF** (Second Normal Form):
- In 1NF + no partial dependency (non-key column depends on PART of composite PK)
- Only relevant when PK is composite

**3NF** (Third Normal Form):
- In 2NF + no transitive dependency (non-key column depends on another non-key column)
- Example: zip_code → city is transitive; move city to a Zips table

**BCNF** (Boyce-Codd): stricter 3NF — every determinant must be a candidate key.

**Goal of normalization**: eliminate redundancy, prevent update/insert/delete anomalies.
**Denormalization**: sometimes done intentionally for read performance.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('sql-theory-019', 'What is query optimization and what is EXPLAIN?', 'Query Optimization', 'Execution Plan', 'hard', NULL, NULL, 5, 'leetcode-sql-50', 19, '["EXPLAIN","query-plan","optimization"]', 'theory', 'sql', '## Query Optimization & EXPLAIN

**EXPLAIN** — shows the query execution plan without running the query.
**EXPLAIN ANALYZE** — executes and shows actual runtime stats.

```sql
EXPLAIN ANALYZE
SELECT u.name, COUNT(o.id)
FROM users u JOIN orders o ON u.id = o.user_id
WHERE o.created_at > ''2024-01-01''
GROUP BY u.id;
```

**Key plan nodes**:
- `Seq Scan` — full table scan (bad on large tables)
- `Index Scan` — index used ✓
- `Index Only Scan` — covering index ✓✓
- `Hash Join` / `Nested Loop` / `Merge Join` — join strategies

**Optimization tips**:
- Add indexes on filter/join columns
- Avoid `SELECT *`
- Use covering indexes for hot queries
- Avoid functions on indexed columns in WHERE (`WHERE YEAR(date) = 2024` disables index)', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('sql-theory-020', 'What is the difference between UNION and UNION ALL?', 'SQL Basics', 'Set Operations', 'easy', NULL, NULL, 5, 'leetcode-sql-50', 20, '["UNION","UNION ALL","INTERSECT","EXCEPT"]', 'theory', 'sql', '## Set Operations

**UNION** — combines result sets, **removes duplicates** (sorts + deduplicates).
**UNION ALL** — combines result sets, **keeps ALL rows** (faster — no dedup step).

```sql
-- All customers from EU or US (no duplicates if in both)
SELECT id, name FROM eu_customers
UNION
SELECT id, name FROM us_customers;

-- Keep duplicates (e.g., combining log tables)
SELECT event FROM jan_logs UNION ALL SELECT event FROM feb_logs;
```

**Rule**: both SELECT must have same number of columns and compatible types.

**INTERSECT** — rows in both result sets.
**EXCEPT** (or MINUS in Oracle) — rows in first but not second.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('sql-theory-021', 'What are constraints in SQL?', 'SQL Basics', 'Constraints', 'easy', NULL, NULL, 5, 'leetcode-sql-50', 21, '["constraints","PRIMARY KEY","FOREIGN KEY","CHECK"]', 'theory', 'sql', '## SQL Constraints

| Constraint | Description |
|-----------|-------------|
| `PRIMARY KEY` | Unique + NOT NULL; one per table |
| `UNIQUE` | No duplicate values (NULLs allowed in most DBs) |
| `NOT NULL` | Column cannot be NULL |
| `FOREIGN KEY` | References PK/UNIQUE in another table; enforces referential integrity |
| `CHECK` | Custom condition must be true |
| `DEFAULT` | Default value if none supplied |

```sql
CREATE TABLE employees (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  salary NUMERIC CHECK (salary > 0),
  dept_id INT REFERENCES departments(id) ON DELETE SET NULL
);
```

**ON DELETE options**: CASCADE, SET NULL, RESTRICT, NO ACTION.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('sql-theory-022', 'What is the difference between WHERE and HAVING in SQL?', 'Aggregation', 'Filtering', 'easy', NULL, NULL, 5, 'leetcode-sql-50', 22, '["WHERE","HAVING","GROUP BY","filter"]', 'theory', 'sql', '## WHERE vs HAVING

| | WHERE | HAVING |
|-|-------|-------|
| Filters | Individual rows | Groups (after GROUP BY) |
| Aggregate functions | Cannot use | Can use |
| Executed before | GROUP BY | After GROUP BY |

```sql
-- WHERE filters rows before grouping
SELECT dept_id, AVG(salary)
FROM employees
WHERE status = ''active''      -- filter rows first
GROUP BY dept_id
HAVING AVG(salary) > 70000;  -- then filter groups
```

**Mnemonic**: WHERE is about rows, HAVING is about groups.

**Performance tip**: apply row-level filters in WHERE (reduces data before grouping); use HAVING only for aggregate conditions.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('sql-theory-023', 'What are views in SQL and when should you use them?', 'SQL Basics', 'Views', 'medium', NULL, NULL, 5, 'leetcode-sql-50', 23, '["view","virtual-table","materialized-view"]', 'theory', 'sql', '## SQL Views

A **named virtual table** defined by a SELECT query. The view doesn''t store data — query is re-run on each access.

```sql
CREATE VIEW active_users AS
SELECT id, name, email FROM users WHERE status = ''active'';

SELECT * FROM active_users WHERE name LIKE ''A%'';
```

**Benefits**:
- Simplify complex queries (reuse like a table)
- Security (expose only specific columns/rows)
- Abstraction (hide schema changes from consumers)

**Materialized View** — stores the query result physically; must be refreshed:
```sql
CREATE MATERIALIZED VIEW monthly_stats AS SELECT ...;
REFRESH MATERIALIZED VIEW monthly_stats; -- manual or scheduled
```

Use materialized views for expensive aggregation queries in reporting.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('sql-theory-024', 'What is SQL injection and how to prevent it?', 'SQL Basics', 'Security', 'medium', NULL, NULL, 5, 'leetcode-sql-50', 24, '["SQL-injection","prepared-statement","security"]', 'theory', 'sql', '## SQL Injection

Attack where malicious SQL is inserted into user input that gets executed by the DB.

**Vulnerable code**:
```java
String sql = "SELECT * FROM users WHERE name = ''" + userInput + "''";
// Input: '' OR ''1''=''1 → returns all users
// Input: ''; DROP TABLE users; -- → destroys data
```

**Prevention**:

1. **Prepared statements / parameterized queries** (primary defense):
```java
PreparedStatement ps = conn.prepareStatement("SELECT * FROM users WHERE name = ?");
ps.setString(1, userInput); // input treated as literal value
```

2. **ORM / JPA** — uses parameterized queries by default
3. **Input validation** — whitelist expected formats
4. **Least privilege** — DB user should only have needed permissions', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('sql-theory-025', 'What is the difference between CHAR and VARCHAR in SQL?', 'SQL Basics', 'Data Types', 'easy', NULL, NULL, 5, 'leetcode-sql-50', 25, '["CHAR","VARCHAR","TEXT","data-types"]', 'theory', 'sql', '## CHAR vs VARCHAR

| | CHAR(n) | VARCHAR(n) |
|-|--------|----------|
| Storage | Fixed length n bytes | Variable (actual + 1-2 bytes overhead) |
| Padding | Padded with spaces | No padding |
| Use case | Fixed-length data (country codes, hash values) | Variable-length strings |
| Performance | Slightly faster comparisons | More space efficient |

**TEXT** — variable length with no maximum (or very large max); used for long text.

```sql
country_code CHAR(2),    -- always 2 chars: ''US'', ''IN''
username VARCHAR(50),     -- up to 50 chars, stores only what''s needed
bio TEXT                  -- unlimited length
```

**Modern advice**: use VARCHAR for almost everything; use CHAR only for truly fixed-length codes where the fixed size is always filled.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('sql-theory-026', 'What are stored procedures and functions in SQL?', 'SQL Advanced', 'Stored Procedures', 'medium', NULL, NULL, 5, 'leetcode-sql-50', 26, '["stored-procedure","function","SQL-programming"]', 'theory', 'sql', '## Stored Procedures vs Functions

| | Stored Procedure | Function |
|-|-----------------|----------|
| Return value | Optional (via OUT params) | Must return a value |
| Call | CALL proc() | SELECT / inside expression |
| DML inside | Yes | Yes (functions in some DBs) |
| Transactions | Can contain COMMIT/ROLLBACK | Cannot (in most DBs) |
| Use in query | No | Yes |

**PostgreSQL example**:
```sql
-- Function
CREATE OR REPLACE FUNCTION get_user_count(dept_id INT)
RETURNS INT AS $$
  SELECT COUNT(*) FROM employees WHERE department_id = dept_id;
$$ LANGUAGE SQL;

SELECT get_user_count(5);
```

**Trade-offs**: stored procs/functions centralize logic in DB (harder to version control), but reduce round-trips for complex operations.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('sql-theory-027', 'What is database denormalization and when is it used?', 'Normalization', 'Denormalization', 'medium', NULL, NULL, 5, 'leetcode-sql-50', 27, '["denormalization","performance","read-optimization"]', 'theory', 'sql', '## Denormalization

Intentionally introducing redundancy into a schema to improve read performance at the cost of write overhead and consistency risk.

**Common techniques**:
1. **Pre-computed aggregates**: store `order_count` on the user table, updated on each order
2. **Materialized join columns**: store `category_name` on product table (avoid join)
3. **Duplicating data across services**: microservices store a copy of referenced data
4. **Flat tables for analytics**: star schema in data warehouses

**When to denormalize**:
- Read-heavy, write-light workloads
- Analytics/reporting queries on large datasets
- Low latency requirement (avoid expensive JOINs)

**Risks**: data inconsistency, extra application logic to keep copies in sync, larger storage.', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('sql-theory-028', 'What is the SQL execution order?', 'SQL Basics', 'Query Processing', 'medium', NULL, NULL, 5, 'leetcode-sql-50', 28, '["execution-order","SQL-processing","logical-order"]', 'theory', 'sql', '## SQL Logical Execution Order

SQL is written in a specific order but executed differently:

**Writing order**: SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY → LIMIT

**Execution order**:
1. **FROM** — identify source tables and joins
2. **WHERE** — filter rows
3. **GROUP BY** — group rows
4. **HAVING** — filter groups
5. **SELECT** — compute output columns / aliases
6. **DISTINCT** — remove duplicates
7. **ORDER BY** — sort (can use SELECT aliases here)
8. **LIMIT / OFFSET** — paginate

**Why it matters**:
- Can''t use SELECT aliases in WHERE (aliases not defined yet)
- Can use SELECT aliases in ORDER BY (executed after SELECT)
- HAVING sees aggregate results because it runs after GROUP BY', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('sql-theory-029', 'What is a deadlock in databases and how is it resolved?', 'Transactions', 'Deadlock', 'hard', NULL, NULL, 5, 'leetcode-sql-50', 29, '["deadlock","lock","resolution"]', 'theory', 'sql', '## Database Deadlock

Occurs when two transactions each hold a lock the other needs — neither can proceed.

**Example**:
- T1 locks row A, waits for row B
- T2 locks row B, waits for row A → deadlock

**Detection**: most databases (PostgreSQL, MySQL) automatically detect deadlocks via lock-wait graphs and abort one transaction (victim).

**Prevention strategies**:
1. **Consistent lock ordering** — always acquire locks in the same order across transactions
2. **Keep transactions short** — minimize time locks are held
3. **Use SELECT FOR UPDATE** carefully
4. **Index optimization** — row-level locks instead of table-level

**Application handling**: catch deadlock error and retry the transaction (with backoff).', 'custom');
INSERT OR IGNORE INTO problems (id, title, topic, subtopic, difficulty, platform, platform_link, estimated_minutes, sheet, problem_number, tags, question_type, subject, content, content_source) VALUES ('sql-theory-030', 'What is a composite index and when is it beneficial?', 'Indexes', 'Composite Index', 'medium', NULL, NULL, 5, 'leetcode-sql-50', 30, '["composite-index","multi-column","selectivity"]', 'theory', 'sql', '## Composite Index

An index on **multiple columns**.

```sql
CREATE INDEX idx_orders_user_status_date ON orders(user_id, status, created_at);
```

**Left-prefix rule**: the index can be used for queries filtering on a left-prefix of the index columns:
- ✓ WHERE user_id = 5
- ✓ WHERE user_id = 5 AND status = ''pending''
- ✓ WHERE user_id = 5 AND status = ''pending'' AND created_at > ''2024-01-01''
- ✗ WHERE status = ''pending'' (no user_id — skips first column)

**Column order principles**:
1. Equality conditions first (highest selectivity first)
2. Range conditions last
3. Columns in ORDER BY / GROUP BY (for index sort)

**vs multiple single-column indexes**: composite is usually better for multi-column queries.', 'custom');
