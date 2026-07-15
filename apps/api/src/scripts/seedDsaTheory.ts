import { problems } from '../db/schema'

type Row = typeof problems.$inferInsert

function t(id: string, title: string, topic: string, difficulty: 'easy'|'medium'|'hard', content: string, subtopic?: string): Row {
  return {
    id, title, topic, subtopic: subtopic ?? null, difficulty,
    platform: null, platformLink: null,
    estimatedMinutes: difficulty === 'easy' ? 8 : difficulty === 'medium' ? 12 : 20,
    sheet: 'dsa-theory', problemNumber: null,
    tags: JSON.stringify([topic.toLowerCase().replace(/ &| /g, '-'), 'dsa', 'theory']),
    questionType: 'theory', subject: 'dsa',
    content, contentSource: 'internal',
  }
}

function mcq(id: string, title: string, topic: string, difficulty: 'easy'|'medium'|'hard', question: string, options: string[], correct_index: number, explanation: string): Row {
  return {
    id, title, topic, subtopic: null, difficulty,
    platform: null, platformLink: null,
    estimatedMinutes: 5, sheet: 'dsa-theory', problemNumber: null,
    tags: JSON.stringify([topic.toLowerCase().replace(/ &| /g, '-'), 'dsa', 'mcq']),
    questionType: 'mcq', subject: 'dsa',
    content: JSON.stringify({ question, options, correct_index, explanation }),
    contentSource: 'internal',
  }
}

// ─── COMPLEXITY ANALYSIS (20 questions) ───────────────────────────────────────

const COMPLEXITY: Row[] = [

t('dsa-theory-001', 'Big O notation — what it measures and common complexities', 'Complexity Analysis', 'easy', `
## Big O Notation

Big O describes the **upper bound** of an algorithm's growth rate as input size n → ∞. It ignores constants and lower-order terms.

### Common complexities (best to worst)
| Notation | Name | Example |
|----------|------|---------|
| O(1) | Constant | Array index access, hash map lookup |
| O(log n) | Logarithmic | Binary search, balanced BST |
| O(n) | Linear | Linear scan, single loop |
| O(n log n) | Linearithmic | Merge sort, heapsort, timsort |
| O(n²) | Quadratic | Bubble sort, nested loops |
| O(n³) | Cubic | Floyd-Warshall, naive matrix multiply |
| O(2ⁿ) | Exponential | Subset enumeration, naive recursion |
| O(n!) | Factorial | Permutations, brute-force TSP |

### Deriving complexity
\`\`\`
Single loop over n elements         → O(n)
Two nested loops over n elements    → O(n²)
Halving the problem each step       → O(log n)
Dividing and merging (merge sort)   → O(n log n)
Recursive with branching factor b   → O(bⁿ) or O(bˡᵒᵍ ⁿ)
\`\`\`

### Space complexity
Count extra memory used (excluding input):
- Variables, recursion call stack, auxiliary data structures
- In-place algorithm: O(1) extra space
- Merge sort: O(n) auxiliary array

### Interview tip
Report BOTH time and space. Consider best, average, and worst cases. For hash maps: O(1) average but O(n) worst case (all keys collide).
`),

t('dsa-theory-002', 'Amortized analysis — why dynamic array append is O(1)', 'Complexity Analysis', 'medium', `
## Amortized Analysis

Amortized analysis gives the average cost per operation over a sequence of operations, even when individual operations vary.

### Dynamic array (ArrayList/vector) — append
A dynamic array doubles when full. Costly copies happen rarely.

\`\`\`
Append 1:  [_]         — no copy
Append 2:  [_, _]      — copy 1 element (resize from 1 to 2)
Append 3:  [_, _, _, _] — copy 2 elements (resize from 2 to 4)
Append 4:  no resize
Append 5:  resize 4→8  — copy 4 elements
...
Append n:  total copies = 1 + 2 + 4 + 8 + ... + n/2 ≈ 2n = O(n)
\`\`\`

Total cost for n appends: O(n). Amortized cost per append: O(n)/n = **O(1)**.

### Other amortized examples
- **Splay tree**: amortized O(log n) per operation
- **Fibonacci heap**: amortized O(1) decrease-key, O(log n) delete-min
- **Stack with multi-pop**: if we count pushes, each element can only be popped once → O(n) total pops for n pushes → O(1) amortized

### Accounting method
Charge extra "credits" on cheap operations to pre-pay for expensive ones.

### Why it matters in interviews
"O(n) worst case but O(1) amortized" is the correct answer for ArrayList.add(). Saying just O(n) is imprecise and may cost you points.
`),

mcq('dsa-theory-mcq-001', 'Binary search time complexity', 'Complexity Analysis', 'easy',
  'What is the time complexity of binary search on a sorted array of n elements?',
  ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], 1,
  'Binary search halves the search space each step. Starting with n elements, it takes at most log₂(n) steps to find the target or determine it\'s absent.'),

mcq('dsa-theory-mcq-002', 'Hash map complexity', 'Complexity Analysis', 'easy',
  'What is the average-case time complexity of lookup, insert, and delete in a hash map?',
  ['O(log n)', 'O(n)', 'O(1)', 'O(n²)'], 2,
  'Hash maps use a hash function to compute bucket indices, giving O(1) average for all three operations. Worst case is O(n) when many keys hash to the same bucket (collisions).'),

]

// ─── ARRAYS & STRINGS THEORY (20 questions) ───────────────────────────────────

const ARRAYS_STRINGS: Row[] = [

t('dsa-theory-003', 'Two-pointer technique — patterns and when to apply', 'Arrays & Strings', 'medium', `
## Two-Pointer Technique

Using two indices to scan an array/string from different positions. Reduces O(n²) naive solutions to O(n).

### Opposite ends (sorted array)
\`\`\`python
def two_sum_sorted(arr, target):
    left, right = 0, len(arr) - 1
    while left < right:
        s = arr[left] + arr[right]
        if s == target: return (left, right)
        elif s < target: left += 1   # need larger sum
        else:            right -= 1  # need smaller sum
    return None  # O(n), O(1) space
\`\`\`

### Same direction (sliding window variant)
\`\`\`python
def remove_duplicates_sorted(arr):
    if not arr: return 0
    slow = 0
    for fast in range(1, len(arr)):
        if arr[fast] != arr[slow]:
            slow += 1
            arr[slow] = arr[fast]
    return slow + 1  # O(n), O(1) space
\`\`\`

### Pattern recognition
Apply two pointers when:
- Array/string is **sorted** (or can be sorted)
- Looking for a **pair** satisfying a condition
- **In-place** modification (slow/fast pointers)
- **Palindrome** checks (left/right meet in middle)

### Palindrome check
\`\`\`python
def is_palindrome(s):
    l, r = 0, len(s) - 1
    while l < r:
        if s[l] != s[r]: return False
        l += 1; r -= 1
    return True
\`\`\`
`),

t('dsa-theory-004', 'Sliding window — fixed and variable size windows', 'Arrays & Strings', 'medium', `
## Sliding Window

Maintains a window [left, right] over a sequence, expanding/shrinking to satisfy constraints. Turns O(n²) brute-force into O(n).

### Fixed window
\`\`\`python
def max_sum_subarray_k(arr, k):
    window_sum = sum(arr[:k])
    max_sum = window_sum
    for i in range(k, len(arr)):
        window_sum += arr[i] - arr[i - k]  # slide: add right, remove left
        max_sum = max(max_sum, window_sum)
    return max_sum  # O(n), O(1)
\`\`\`

### Variable window (shrink when invalid)
\`\`\`python
def longest_substring_no_repeat(s):
    char_set = set()
    left = max_len = 0
    for right in range(len(s)):
        while s[right] in char_set:   # shrink window until valid
            char_set.remove(s[left])
            left += 1
        char_set.add(s[right])
        max_len = max(max_len, right - left + 1)
    return max_len  # O(n), O(k) where k = alphabet size
\`\`\`

### Recognition cues
- "Longest/shortest subarray/substring satisfying X"
- "Maximum sum of k consecutive elements"
- Involves contiguous segments
- Anagram/permutation detection in string

### Frequency map window
\`\`\`python
from collections import Counter

def find_anagrams(s, p):
    need = Counter(p)
    window = Counter()
    result = []
    for right in range(len(s)):
        window[s[right]] += 1
        if right >= len(p):
            left = right - len(p)
            window[s[left]] -= 1
            if window[s[left]] == 0: del window[s[left]]
        if window == need:
            result.append(right - len(p) + 1)
    return result
\`\`\`
`),

t('dsa-theory-005', 'Prefix sum — range query in O(1)', 'Arrays & Strings', 'easy', `
## Prefix Sum

Build a running sum array to answer range sum queries in O(1) after O(n) preprocessing.

\`\`\`python
def build_prefix(arr):
    prefix = [0] * (len(arr) + 1)
    for i, v in enumerate(arr):
        prefix[i + 1] = prefix[i] + v
    return prefix

def range_sum(prefix, l, r):  # sum of arr[l..r] inclusive
    return prefix[r + 1] - prefix[l]

# Example
arr    = [1, 2, 3, 4, 5]
prefix = [0, 1, 3, 6, 10, 15]
range_sum(prefix, 1, 3) = prefix[4] - prefix[1] = 10 - 1 = 9  # ✓
\`\`\`

### 2D prefix sum
\`\`\`python
def build_2d_prefix(matrix):
    rows, cols = len(matrix), len(matrix[0])
    p = [[0] * (cols + 1) for _ in range(rows + 1)]
    for r in range(rows):
        for c in range(cols):
            p[r+1][c+1] = matrix[r][c] + p[r][c+1] + p[r+1][c] - p[r][c]
    return p

def region_sum(p, r1, c1, r2, c2):
    return p[r2+1][c2+1] - p[r1][c2+1] - p[r2+1][c1] + p[r1][c1]
\`\`\`

### Use cases
- Count subarrays with sum == K (use hash map of prefix sums)
- Product of array except self
- Matrix region sums
- Subarray XOR queries
`),

mcq('dsa-theory-mcq-003', 'Sliding window type', 'Arrays & Strings', 'medium',
  'For "Find the minimum length subarray with sum ≥ target", which technique is most efficient?',
  ['Fixed sliding window', 'Variable-size sliding window', 'Two pointers on sorted array', 'Binary search'],
  1,
  'Variable-size sliding window: expand right until sum ≥ target, then shrink left while maintaining the constraint. O(n) time, O(1) space.'),

]

// ─── LINKED LISTS THEORY (20 questions) ───────────────────────────────────────

const LINKED_LISTS: Row[] = [

t('dsa-theory-006', 'Linked list fundamentals — types and operations complexity', 'Linked Lists', 'easy', `
## Linked List Fundamentals

A linked list is a sequence of nodes where each node contains data and a pointer to the next node.

### Types
- **Singly linked**: each node → next
- **Doubly linked**: each node ↔ prev and next
- **Circular**: tail → head

### Operations complexity
| Operation | Singly | Doubly | Array |
|-----------|--------|--------|-------|
| Access by index | O(n) | O(n) | O(1) |
| Search | O(n) | O(n) | O(n) |
| Insert at head | O(1) | O(1) | O(n) |
| Insert at tail | O(n)† | O(1)‡ | O(1) amortized |
| Insert in middle | O(n) | O(n) | O(n) |
| Delete at head | O(1) | O(1) | O(n) |
| Delete with ref | O(n)† | O(1)‡ | O(n) |

†With tail pointer it becomes O(1)  ‡With predecessor pointer

### Node structure
\`\`\`python
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next
\`\`\`

### Common interview patterns
1. **Fast/slow pointers**: detect cycle, find middle
2. **Dummy head node**: simplifies edge cases (empty list, head deletion)
3. **Reverse in-place**: using prev pointer
4. **Merge two sorted**: use a dummy head

### When to use linked list
- Frequent O(1) insertions/deletions at known positions
- Queue implementation (O(1) enqueue/dequeue with head and tail pointers)
- When memory isn't contiguous and you can't afford O(n) shifts
`),

t('dsa-theory-007', 'Floyd\'s cycle detection — tortoise and hare', 'Linked Lists', 'medium', `
## Floyd's Cycle Detection

Use two pointers (slow moves 1 step, fast moves 2 steps) to detect cycles in O(n) time and O(1) space.

### Cycle detection
\`\`\`python
def has_cycle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow == fast:
            return True
    return False
\`\`\`

### Finding cycle start
Once meeting point is found, reset one pointer to head. Both then move at the same speed — they'll meet at the cycle start.

\`\`\`python
def detect_cycle_start(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
        if slow == fast:
            break
    else:
        return None  # no cycle

    # Reset slow to head
    slow = head
    while slow != fast:
        slow = slow.next
        fast = fast.next
    return slow  # cycle start node
\`\`\`

### Why does this work? (Proof sketch)
Let:
- F = distance from head to cycle start
- C = cycle length
- h = where fast and slow meet (measured from cycle start)

When they meet: slow travelled F + h, fast travelled F + h + nC.
Since fast = 2 × slow: 2(F+h) = F+h+nC → F = nC - h.
So moving slow back to head and both forward at equal speed: both reach cycle start after exactly F steps.

### Applications
- Detect cycle in linked list / graph
- Find duplicate number (Floyd's on "implicit linked list" of array indices)
- Detect loop in functional sequences
`),

t('dsa-theory-008', 'Reversing a linked list — iterative and recursive', 'Linked Lists', 'medium', `
## Reversing a Linked List

### Iterative (O(n) time, O(1) space)
\`\`\`python
def reverse_list(head):
    prev = None
    curr = head
    while curr:
        nxt = curr.next   # save next
        curr.next = prev  # reverse link
        prev = curr       # advance prev
        curr = nxt        # advance curr
    return prev  # new head
\`\`\`

### Recursive (O(n) time, O(n) space — call stack)
\`\`\`python
def reverse_list_recursive(head):
    if not head or not head.next:
        return head
    new_head = reverse_list_recursive(head.next)
    head.next.next = head  # reverse the link
    head.next = None       # cut old forward link
    return new_head
\`\`\`

### Reverse a segment [left, right]
\`\`\`python
def reverse_between(head, left, right):
    dummy = ListNode(0, head)
    prev = dummy
    # Move prev to node before position left
    for _ in range(left - 1):
        prev = prev.next
    curr = prev.next
    # Reverse right-left times
    for _ in range(right - left):
        nxt = curr.next
        curr.next = nxt.next
        nxt.next = prev.next
        prev.next = nxt
    return dummy.next
\`\`\`

### Common applications
- Check if linked list is palindrome (reverse second half, compare)
- Reverse nodes in k-group
- Reorder list (find middle, reverse second half, merge)
`),

mcq('dsa-theory-mcq-004', 'Fast/slow pointer convergence', 'Linked Lists', 'medium',
  'In Floyd\'s cycle detection, if slow moves 1 step and fast moves 2 steps, and there IS a cycle of length C, in how many steps at most will they meet?',
  ['C steps', 'C/2 steps', 'O(n) where n is list length', '2C steps'], 2,
  'They meet within O(n) steps where n is total list length. The fast pointer enters the cycle within n steps, and once both are in the cycle, they converge within C more steps.'),

]

// ─── TREES & GRAPHS THEORY (20 questions) ─────────────────────────────────────

const TREES_GRAPHS: Row[] = [

t('dsa-theory-009', 'Binary tree traversals — pre, in, post, level-order', 'Trees & Graphs', 'easy', `
## Binary Tree Traversals

### Inorder (Left → Root → Right) — gives sorted order for BST
\`\`\`python
def inorder(root, result=[]):
    if root:
        inorder(root.left, result)
        result.append(root.val)
        inorder(root.right, result)
    return result

# Iterative inorder
def inorder_iterative(root):
    result, stack = [], []
    curr = root
    while curr or stack:
        while curr:             # go as far left as possible
            stack.append(curr)
            curr = curr.left
        curr = stack.pop()
        result.append(curr.val)
        curr = curr.right       # switch to right subtree
    return result
\`\`\`

### Preorder (Root → Left → Right) — useful for serialization
\`\`\`python
def preorder(root):
    if not root: return []
    return [root.val] + preorder(root.left) + preorder(root.right)
\`\`\`

### Postorder (Left → Right → Root) — useful for deletion, evaluating expressions
\`\`\`python
def postorder(root):
    if not root: return []
    return postorder(root.left) + postorder(root.right) + [root.val]
\`\`\`

### Level-order (BFS)
\`\`\`python
from collections import deque
def level_order(root):
    if not root: return []
    queue, result = deque([root]), []
    while queue:
        level = []
        for _ in range(len(queue)):      # process entire level
            node = queue.popleft()
            level.append(node.val)
            if node.left:  queue.append(node.left)
            if node.right: queue.append(node.right)
        result.append(level)
    return result
\`\`\`
`),

t('dsa-theory-010', 'BST operations and balanced trees — AVL, Red-Black', 'Trees & Graphs', 'medium', `
## Binary Search Trees

### BST property
Left subtree values < node < right subtree values. This gives O(log n) average search/insert/delete for a balanced BST.

### BST search
\`\`\`python
def search(root, key):
    if not root or root.val == key:
        return root
    if key < root.val:
        return search(root.left, key)
    return search(root.right, key)
\`\`\`

### BST insert
\`\`\`python
def insert(root, key):
    if not root: return TreeNode(key)
    if key < root.val:   root.left  = insert(root.left, key)
    elif key > root.val: root.right = insert(root.right, key)
    return root
\`\`\`

### BST delete — 3 cases
1. No children → remove node
2. One child → replace node with child
3. Two children → replace with inorder successor (leftmost in right subtree), delete successor

### Balanced BST variants
| | Insert | Delete | Search | Notes |
|--|-------|--------|--------|-------|
| Unbalanced BST | O(n) worst | O(n) | O(n) | Degenerate (sorted input) |
| AVL tree | O(log n) | O(log n) | O(log n) | Strictly balanced (height diff ≤ 1) |
| Red-Black tree | O(log n) | O(log n) | O(log n) | Loosely balanced; fewer rotations |
| B-tree | O(log n) | O(log n) | O(log n) | Disk-friendly; used in databases |

> Python's \`sortedcontainers.SortedList\` and Java's \`TreeMap\`/\`TreeSet\` use Red-Black trees.
`),

t('dsa-theory-011', 'Graph traversal — DFS and BFS patterns', 'Trees & Graphs', 'medium', `
## Graph Traversal

### BFS — shortest path in unweighted graphs
\`\`\`python
from collections import deque

def bfs(graph, start):
    visited = {start}
    queue = deque([start])
    while queue:
        node = queue.popleft()
        for neighbor in graph[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)
\`\`\`

**BFS guarantees the shortest path (fewest edges) in unweighted graphs.**

### DFS — path existence, cycle detection, topological sort
\`\`\`python
def dfs(graph, node, visited=None):
    if visited is None: visited = set()
    visited.add(node)
    for neighbor in graph[node]:
        if neighbor not in visited:
            dfs(graph, neighbor, visited)
    return visited
\`\`\`

### Topological sort (DFS-based, for DAGs)
\`\`\`python
def topo_sort(graph):
    visited, result = set(), []
    def dfs(node):
        visited.add(node)
        for nbr in graph.get(node, []):
            if nbr not in visited:
                dfs(nbr)
        result.append(node)  # add AFTER processing all neighbors
    for node in graph:
        if node not in visited:
            dfs(node)
    return result[::-1]  # reverse post-order
\`\`\`

### When to use which
- **BFS**: shortest path, level-by-level processing, nearest neighbor
- **DFS**: cycle detection, topological sort, connected components, backtracking, path existence
`),

mcq('dsa-theory-mcq-005', 'BFS vs DFS for shortest path', 'Trees & Graphs', 'medium',
  'Which algorithm finds the shortest path (fewest edges) in an unweighted graph?',
  ['DFS', 'BFS', 'Dijkstra\'s', 'Bellman-Ford'], 1,
  'BFS explores nodes level by level. The first time it reaches the destination is via the fewest edges. DFS may reach the destination via a longer path first. Dijkstra works for weighted graphs.'),

]

// ─── DYNAMIC PROGRAMMING THEORY (20 questions) ────────────────────────────────

const DP: Row[] = [

t('dsa-theory-012', 'Dynamic programming — overlapping subproblems and optimal substructure', 'Dynamic Programming', 'medium', `
## Dynamic Programming Fundamentals

DP is applicable when a problem has:
1. **Optimal substructure**: optimal solution built from optimal sub-solutions
2. **Overlapping subproblems**: same subproblem solved multiple times

### Memoization (top-down DP)
\`\`\`python
from functools import lru_cache

@lru_cache(maxsize=None)
def fib(n):
    if n <= 1: return n
    return fib(n-1) + fib(n-2)

# Time: O(n)  Space: O(n) call stack + memo
\`\`\`

### Tabulation (bottom-up DP)
\`\`\`python
def fib(n):
    if n <= 1: return n
    dp = [0, 1]
    for i in range(2, n + 1):
        dp.append(dp[-1] + dp[-2])
    return dp[n]
# Optimize space: only need last 2 values → O(1) space
\`\`\`

### DP problem taxonomy
| Pattern | Example |
|---------|---------|
| 1D DP | Fibonacci, climbing stairs, house robber |
| 2D DP | Longest common subsequence, edit distance |
| Interval DP | Matrix chain multiplication |
| Knapsack | 0/1 knapsack, coin change |
| Tree DP | Diameter of binary tree |
| State machine | Buy and sell stock with cooldown |

### Approach
1. Define the state: dp[i] means \_\_\_
2. Write the recurrence relation
3. Identify base cases
4. Determine evaluation order (ensure dependencies computed first)
5. Optimize space if possible
`),

t('dsa-theory-013', 'Classic DP problems — Knapsack, LCS, LIS patterns', 'Dynamic Programming', 'hard', `
## Classic DP Patterns

### 0/1 Knapsack
Each item can be included once. dp[i][w] = max value with first i items and capacity w.
\`\`\`python
def knapsack(weights, values, W):
    n = len(weights)
    dp = [[0]*(W+1) for _ in range(n+1)]
    for i in range(1, n+1):
        for w in range(W+1):
            dp[i][w] = dp[i-1][w]  # skip item i
            if weights[i-1] <= w:
                dp[i][w] = max(dp[i][w],
                    dp[i-1][w-weights[i-1]] + values[i-1])  # take item i
    return dp[n][W]
\`\`\`

### Longest Common Subsequence (LCS)
\`\`\`python
def lcs(s1, s2):
    m, n = len(s1), len(s2)
    dp = [[0]*(n+1) for _ in range(m+1)]
    for i in range(1, m+1):
        for j in range(1, n+1):
            if s1[i-1] == s2[j-1]:
                dp[i][j] = dp[i-1][j-1] + 1
            else:
                dp[i][j] = max(dp[i-1][j], dp[i][j-1])
    return dp[m][n]
\`\`\`

### Longest Increasing Subsequence (LIS)
\`\`\`python
# O(n²) DP
def lis(arr):
    dp = [1] * len(arr)
    for i in range(1, len(arr)):
        for j in range(i):
            if arr[j] < arr[i]:
                dp[i] = max(dp[i], dp[j] + 1)
    return max(dp)

# O(n log n) with patience sorting (binary search)
import bisect
def lis_fast(arr):
    tails = []
    for num in arr:
        pos = bisect.bisect_left(tails, num)
        if pos == len(tails): tails.append(num)
        else:                 tails[pos] = num
    return len(tails)
\`\`\`
`),

mcq('dsa-theory-mcq-006', 'DP vs greedy', 'Dynamic Programming', 'medium',
  'When should you prefer Dynamic Programming over a Greedy approach?',
  [
    'When the problem has no overlapping subproblems',
    'When locally optimal choices do NOT guarantee a globally optimal solution',
    'When the input is already sorted',
    'When recursion depth would exceed stack limits',
  ], 1,
  'Greedy works when locally optimal choices always lead to global optimum (e.g., Dijkstra, Huffman, Fractional Knapsack). DP is needed when you must consider all subproblems to find the global optimum (e.g., 0/1 Knapsack, LCS).'),

]

// ─── SORTING & SEARCHING (20 questions) ───────────────────────────────────────

const SORTING: Row[] = [

t('dsa-theory-014', 'Sorting algorithms — properties and complexity comparison', 'Sorting & Searching', 'medium', `
## Sorting Algorithms Comparison

| Algorithm | Best | Average | Worst | Space | Stable |
|-----------|------|---------|-------|-------|--------|
| Bubble Sort | O(n) | O(n²) | O(n²) | O(1) | ✅ |
| Selection Sort | O(n²) | O(n²) | O(n²) | O(1) | ❌ |
| Insertion Sort | O(n) | O(n²) | O(n²) | O(1) | ✅ |
| Merge Sort | O(n log n) | O(n log n) | O(n log n) | O(n) | ✅ |
| Quick Sort | O(n log n) | O(n log n) | O(n²) | O(log n) | ❌ |
| Heap Sort | O(n log n) | O(n log n) | O(n log n) | O(1) | ❌ |
| Counting Sort | O(n+k) | O(n+k) | O(n+k) | O(k) | ✅ |
| Radix Sort | O(nk) | O(nk) | O(nk) | O(n+k) | ✅ |

**Stable**: equal elements maintain original relative order.

### When to use which
- **Small n (< 10)**: Insertion sort
- **General purpose**: Merge sort (stable) or Quick sort (cache-friendly)
- **Limited memory**: Heap sort (O(1) space, O(n log n) worst)
- **Nearly sorted**: Insertion sort (O(n) when nearly sorted)
- **Integer range known**: Counting/Radix sort (O(n))

### Quick sort pivot strategies
- **First/Last**: O(n²) on sorted input
- **Random**: expected O(n log n), worst O(n²) (rare)
- **Median of three**: good in practice
- **Dutch flag partition**: 3-way partition for many duplicates
`),

t('dsa-theory-015', 'Binary search variations — template and edge cases', 'Sorting & Searching', 'medium', `
## Binary Search Variations

### Standard — exact match
\`\`\`python
def binary_search(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = lo + (hi - lo) // 2      # avoids integer overflow
        if arr[mid] == target: return mid
        elif arr[mid] < target: lo = mid + 1
        else:                   hi = mid - 1
    return -1
\`\`\`

### Left bound — first index where arr[i] >= target
\`\`\`python
def left_bound(arr, target):
    lo, hi = 0, len(arr)               # hi is exclusive
    while lo < hi:
        mid = (lo + hi) // 2
        if arr[mid] < target: lo = mid + 1
        else:                 hi = mid
    return lo  # lo == hi; arr[lo] is first element >= target
\`\`\`

### Right bound — last index where arr[i] <= target
\`\`\`python
def right_bound(arr, target):
    lo, hi = 0, len(arr)
    while lo < hi:
        mid = (lo + hi) // 2
        if arr[mid] <= target: lo = mid + 1
        else:                  hi = mid
    return lo - 1
\`\`\`

### "Search on answer" — binary search the result space
When answer has monotone property (if valid for X, valid for all Y < X):
\`\`\`python
# Minimum eating speed to finish all bananas in h hours
def min_eating_speed(piles, h):
    lo, hi = 1, max(piles)
    while lo < hi:
        mid = (lo + hi) // 2
        if sum(-(-p // mid) for p in piles) <= h:
            hi = mid           # try slower
        else:
            lo = mid + 1       # too slow
    return lo
\`\`\`
`),

mcq('dsa-theory-mcq-007', 'Merge sort stability', 'Sorting & Searching', 'easy',
  'Why is merge sort stable while quick sort (with standard partition) is not?',
  [
    'Merge sort always runs in O(n log n); quick sort does not',
    'Merge sort preserves relative order during merge by preferring the left element when equal; quick sort\'s partition can swap equal elements past each other',
    'Merge sort uses more memory',
    'Quick sort is recursive; merge sort is iterative',
  ], 1,
  'In merge sort\'s merge step, when elements from left and right halves are equal, we take from the left first — preserving original order. Quick sort\'s partition can move equal elements relative to each other.'),

mcq('dsa-theory-mcq-008', 'Quick sort worst case', 'Sorting & Searching', 'medium',
  'What input triggers worst-case O(n²) behavior in QuickSort with a fixed pivot (e.g., always picking the last element)?',
  ['Random order input', 'Sorted or reverse-sorted input', 'All elements equal', 'Input with many duplicates'],
  1,
  'When the array is already sorted and you always pick the last element as pivot, each partition splits into 0 and n-1 elements — giving O(n) partitions, O(n) each = O(n²). Random pivot avoids this.'),

]

// ─── HEAP & PRIORITY QUEUE (15 questions) ─────────────────────────────────────

const HEAPS: Row[] = [

t('dsa-theory-016', 'Heaps — min-heap, max-heap, heapify, K-th largest patterns', 'Heaps', 'medium', `
## Heaps

A heap is a **complete binary tree** with the heap property:
- **Min-heap**: parent ≤ children (root = min element)
- **Max-heap**: parent ≥ children (root = max element)

### Operations
| Operation | Time |
|-----------|------|
| peek min/max | O(1) |
| insert | O(log n) |
| extract min/max | O(log n) |
| heapify (build from array) | O(n) |
| find kth largest | O(n + k log n) |

### Python heapq (min-heap by default)
\`\`\`python
import heapq

heap = []
heapq.heappush(heap, 3)
heapq.heappush(heap, 1)
heapq.heappush(heap, 4)
heapq.heappop(heap)    # returns 1 (minimum)

# Build heap in O(n)
nums = [3, 1, 4, 1, 5]
heapq.heapify(nums)

# Max-heap: negate values
heapq.heappush(heap, -value)
heapq.heappop(heap) * -1  # get max

# K largest elements: maintain min-heap of size k
def k_largest(nums, k):
    heap = nums[:k]
    heapq.heapify(heap)
    for n in nums[k:]:
        if n > heap[0]:
            heapq.heapreplace(heap, n)
    return heap  # O(n log k)
\`\`\`

### Common patterns
- **K-th largest/smallest**: heap of size k
- **Merge K sorted lists**: min-heap with (value, list_index)
- **Running median**: two heaps (max-heap of lower half, min-heap of upper half)
- **Task scheduling**: max-heap by frequency
`),

mcq('dsa-theory-mcq-009', 'Heap heapify complexity', 'Heaps', 'medium',
  'What is the time complexity of building a heap from an unsorted array of n elements?',
  ['O(n log n)', 'O(n)', 'O(log n)', 'O(n²)'], 1,
  'Building a heap via heapify (sifting down from the middle) is O(n) — not O(n log n) as intuition suggests. The proof uses geometric series: nodes near the bottom need few swaps, and there are many of them.'),

]

// ─── Export ───────────────────────────────────────────────────────────────────

export const allDsaTheoryProblems: Row[] = [
  ...COMPLEXITY,
  ...ARRAYS_STRINGS,
  ...LINKED_LISTS,
  ...TREES_GRAPHS,
  ...DP,
  ...SORTING,
  ...HEAPS,
]
