import { drizzle } from 'drizzle-orm/d1'
import { problems } from '../db/schema'

// ─── Types ────────────────────────────────────────────────────────────────────

type Difficulty = 'easy' | 'medium' | 'hard'
type Platform = 'leetcode' | 'gfg' | 'codechef'

interface RawProblem {
  title: string
  subtopic: string
  difficulty: Difficulty
  platform: Platform
  platformLink: string | null
  tags: string[]
}

interface TopicData {
  name: string
  slug: string
  rawProblems: RawProblem[]
}

// ─── Builder ──────────────────────────────────────────────────────────────────

const estMin = (d: Difficulty) => (d === 'easy' ? 15 : d === 'medium' ? 30 : 60)

function buildAllProblems(topics: TopicData[]): (typeof problems.$inferInsert)[] {
  return topics.flatMap((topic) =>
    topic.rawProblems.map((p, i) => {
      const num = i + 1
      return {
        id: `${topic.slug}-${String(num).padStart(3, '0')}`,
        title: p.title,
        topic: topic.name,
        subtopic: p.subtopic,
        difficulty: p.difficulty,
        platform: p.platform,
        platformLink: p.platformLink,
        estimatedMinutes: estMin(p.difficulty),
        sheet: 'striver-a2z',
        problemNumber: num,
        tags: JSON.stringify(p.tags),
      }
    }),
  )
}

// ─── Topic Data ───────────────────────────────────────────────────────────────

const TOPICS: TopicData[] = [
  // ═══════════════════════════════════════════════════════════════════════════
  // 1. ARRAYS  (39 problems — fully populated)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: 'Arrays',
    slug: 'arrays',
    rawProblems: [
      // ── Easy ──────────────────────────────────────────────────────────────
      { title: 'Largest Element in an Array', subtopic: 'Easy', difficulty: 'easy', platform: 'gfg', platformLink: 'https://www.geeksforgeeks.org/c-program-find-largest-element-array/', tags: ['array', 'linear-scan'] },
      { title: 'Second Largest Element in Array', subtopic: 'Easy', difficulty: 'easy', platform: 'gfg', platformLink: 'https://www.geeksforgeeks.org/find-second-largest-element-array/', tags: ['array', 'linear-scan'] },
      { title: 'Check if Array Is Sorted and Rotated', subtopic: 'Easy', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/check-if-array-is-sorted-and-rotated/', tags: ['array'] },
      { title: 'Remove Duplicates from Sorted Array', subtopic: 'Easy', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/remove-duplicates-from-sorted-array/', tags: ['array', 'two-pointer'] },
      { title: 'Left Rotate an Array by One Place', subtopic: 'Easy', difficulty: 'easy', platform: 'gfg', platformLink: 'https://www.geeksforgeeks.org/c-program-cyclically-rotate-array-by-one/', tags: ['array', 'rotation'] },
      { title: 'Rotate Array', subtopic: 'Easy', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/rotate-array/', tags: ['array', 'rotation', 'two-pointer'] },
      { title: 'Move Zeroes', subtopic: 'Easy', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/move-zeroes/', tags: ['array', 'two-pointer'] },
      { title: 'Linear Search', subtopic: 'Easy', difficulty: 'easy', platform: 'gfg', platformLink: 'https://www.geeksforgeeks.org/linear-search/', tags: ['array', 'searching'] },
      { title: 'Union of Two Sorted Arrays', subtopic: 'Easy', difficulty: 'easy', platform: 'gfg', platformLink: 'https://www.geeksforgeeks.org/union-and-intersection-of-two-sorted-arrays-2/', tags: ['array', 'two-pointer', 'sorting'] },
      { title: 'Missing Number', subtopic: 'Easy', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/missing-number/', tags: ['array', 'math', 'bit-manipulation'] },
      { title: 'Max Consecutive Ones', subtopic: 'Easy', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/max-consecutive-ones/', tags: ['array', 'sliding-window'] },
      { title: 'Single Number', subtopic: 'Easy', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/single-number/', tags: ['array', 'bit-manipulation', 'hashing'] },
      { title: 'Longest Sub-Array with Sum K (Positives)', subtopic: 'Easy', difficulty: 'easy', platform: 'gfg', platformLink: 'https://www.geeksforgeeks.org/longest-sub-array-sum-k/', tags: ['array', 'hashing', 'prefix-sum', 'sliding-window'] },
      { title: 'Longest Subarray with Sum K (Negatives Allowed)', subtopic: 'Easy', difficulty: 'easy', platform: 'gfg', platformLink: 'https://www.geeksforgeeks.org/longest-sub-array-sum-k/', tags: ['array', 'hashing', 'prefix-sum'] },
      // ── Medium ────────────────────────────────────────────────────────────
      { title: 'Two Sum', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/two-sum/', tags: ['array', 'hashing'] },
      { title: 'Sort Colors', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/sort-colors/', tags: ['array', 'two-pointer', 'dutch-flag'] },
      { title: 'Majority Element', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/majority-element/', tags: ['array', 'boyer-moore', 'hashing'] },
      { title: 'Maximum Subarray', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/maximum-subarray/', tags: ['array', 'kadane', 'dynamic-programming'] },
      { title: 'Best Time to Buy and Sell Stock', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/', tags: ['array', 'greedy'] },
      { title: 'Rearrange Array Elements by Sign', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/rearrange-array-elements-by-sign/', tags: ['array', 'two-pointer'] },
      { title: 'Next Permutation', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/next-permutation/', tags: ['array', 'math', 'two-pointer'] },
      { title: 'Leaders in an Array', subtopic: 'Medium', difficulty: 'medium', platform: 'gfg', platformLink: 'https://www.geeksforgeeks.org/leaders-in-an-array/', tags: ['array', 'suffix'] },
      { title: 'Longest Consecutive Sequence', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/longest-consecutive-sequence/', tags: ['array', 'hashing'] },
      { title: 'Set Matrix Zeroes', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/set-matrix-zeroes/', tags: ['array', 'matrix', 'hashing'] },
      { title: 'Rotate Image', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/rotate-image/', tags: ['array', 'matrix', 'math'] },
      { title: 'Spiral Matrix', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/spiral-matrix/', tags: ['array', 'matrix', 'simulation'] },
      { title: 'Subarray Sum Equals K', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/subarray-sum-equals-k/', tags: ['array', 'hashing', 'prefix-sum'] },
      { title: "Pascal's Triangle", subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/pascals-triangle/', tags: ['array', 'math', 'dynamic-programming'] },
      { title: 'Majority Element II', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/majority-element-ii/', tags: ['array', 'boyer-moore', 'hashing'] },
      // ── Hard ──────────────────────────────────────────────────────────────
      { title: '3Sum', subtopic: 'Hard', difficulty: 'hard', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/3sum/', tags: ['array', 'two-pointer', 'sorting'] },
      { title: '4Sum', subtopic: 'Hard', difficulty: 'hard', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/4sum/', tags: ['array', 'two-pointer', 'sorting'] },
      { title: 'Largest Subarray with 0 Sum', subtopic: 'Hard', difficulty: 'hard', platform: 'gfg', platformLink: 'https://www.geeksforgeeks.org/find-the-largest-subarray-with-0-sum/', tags: ['array', 'hashing', 'prefix-sum'] },
      { title: 'Count Subarrays with XOR K', subtopic: 'Hard', difficulty: 'hard', platform: 'gfg', platformLink: 'https://www.geeksforgeeks.org/count-number-subarrays-given-xor/', tags: ['array', 'hashing', 'bit-manipulation'] },
      { title: 'Merge Intervals', subtopic: 'Hard', difficulty: 'hard', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/merge-intervals/', tags: ['array', 'sorting', 'intervals'] },
      { title: 'Merge Sorted Array', subtopic: 'Hard', difficulty: 'hard', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/merge-sorted-array/', tags: ['array', 'two-pointer', 'sorting'] },
      { title: 'Find the Repeating and Missing Numbers', subtopic: 'Hard', difficulty: 'hard', platform: 'gfg', platformLink: 'https://www.geeksforgeeks.org/find-a-repeating-and-a-missing-number/', tags: ['array', 'math', 'bit-manipulation'] },
      { title: 'Count Inversions', subtopic: 'Hard', difficulty: 'hard', platform: 'gfg', platformLink: 'https://www.geeksforgeeks.org/counting-inversions/', tags: ['array', 'merge-sort', 'divide-and-conquer'] },
      { title: 'Reverse Pairs', subtopic: 'Hard', difficulty: 'hard', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/reverse-pairs/', tags: ['array', 'merge-sort', 'divide-and-conquer'] },
      { title: 'Maximum Product Subarray', subtopic: 'Hard', difficulty: 'hard', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/maximum-product-subarray/', tags: ['array', 'dynamic-programming'] },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. BINARY SEARCH  (27 problems — fully populated)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: 'Binary Search',
    slug: 'binary-search',
    rawProblems: [
      // ── Easy ──────────────────────────────────────────────────────────────
      { title: 'Binary Search', subtopic: 'Easy', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/binary-search/', tags: ['binary-search', 'array'] },
      { title: 'Implement Lower Bound', subtopic: 'Easy', difficulty: 'easy', platform: 'gfg', platformLink: 'https://www.geeksforgeeks.org/lower_bound-in-cpp/', tags: ['binary-search', 'array'] },
      { title: 'Implement Upper Bound', subtopic: 'Easy', difficulty: 'easy', platform: 'gfg', platformLink: 'https://www.geeksforgeeks.org/upper_bound-in-cpp/', tags: ['binary-search', 'array'] },
      { title: 'Search Insert Position', subtopic: 'Easy', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/search-insert-position/', tags: ['binary-search', 'array'] },
      { title: 'Floor and Ceil in Sorted Array', subtopic: 'Easy', difficulty: 'easy', platform: 'gfg', platformLink: 'https://www.geeksforgeeks.org/floor-and-ceil-from-a-bst/', tags: ['binary-search', 'array'] },
      { title: 'First and Last Position of Element in Sorted Array', subtopic: 'Easy', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/', tags: ['binary-search', 'array'] },
      { title: 'Count Occurrences in Sorted Array', subtopic: 'Easy', difficulty: 'easy', platform: 'gfg', platformLink: 'https://www.geeksforgeeks.org/count-number-of-occurrences-or-frequency-in-a-sorted-array/', tags: ['binary-search', 'array'] },
      { title: 'Search in Rotated Sorted Array', subtopic: 'Easy', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/search-in-rotated-sorted-array/', tags: ['binary-search', 'array', 'rotation'] },
      { title: 'Search in Rotated Sorted Array II', subtopic: 'Easy', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/search-in-rotated-sorted-array-ii/', tags: ['binary-search', 'array', 'rotation'] },
      { title: 'Find Minimum in Rotated Sorted Array', subtopic: 'Easy', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/', tags: ['binary-search', 'array', 'rotation'] },
      { title: 'Find How Many Times Array is Rotated', subtopic: 'Easy', difficulty: 'easy', platform: 'gfg', platformLink: 'https://www.geeksforgeeks.org/find-rotation-count-rotated-sorted-array/', tags: ['binary-search', 'array', 'rotation'] },
      { title: 'Single Element in a Sorted Array', subtopic: 'Easy', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/single-element-in-a-sorted-array/', tags: ['binary-search', 'array', 'bit-manipulation'] },
      { title: 'Find Peak Element', subtopic: 'Easy', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/find-peak-element/', tags: ['binary-search', 'array'] },
      // ── Medium ────────────────────────────────────────────────────────────
      { title: 'Sqrt(x)', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/sqrtx/', tags: ['binary-search', 'math'] },
      { title: 'Find Nth Root of a Number', subtopic: 'Medium', difficulty: 'medium', platform: 'gfg', platformLink: 'https://www.geeksforgeeks.org/n-th-root-of-a-number/', tags: ['binary-search', 'math'] },
      { title: 'Koko Eating Bananas', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/koko-eating-bananas/', tags: ['binary-search', 'greedy', 'array'] },
      { title: 'Minimum Number of Days to Make M Bouquets', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/minimum-number-of-days-to-make-m-bouquets/', tags: ['binary-search', 'greedy', 'array'] },
      { title: 'Find the Smallest Divisor Given a Threshold', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/find-the-smallest-divisor-given-a-threshold/', tags: ['binary-search', 'math'] },
      { title: 'Capacity to Ship Packages Within D Days', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/', tags: ['binary-search', 'greedy', 'array'] },
      { title: 'Kth Missing Positive Number', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/kth-missing-positive-number/', tags: ['binary-search', 'array'] },
      { title: 'Aggressive Cows', subtopic: 'Medium', difficulty: 'medium', platform: 'gfg', platformLink: 'https://www.geeksforgeeks.org/aggressive-cows-problem-with-explanations/', tags: ['binary-search', 'greedy', 'array'] },
      { title: 'Book Allocation Problem', subtopic: 'Medium', difficulty: 'medium', platform: 'gfg', platformLink: 'https://www.geeksforgeeks.org/allocate-minimum-number-pages/', tags: ['binary-search', 'greedy', 'dynamic-programming'] },
      { title: 'Split Array Largest Sum', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/split-array-largest-sum/', tags: ['binary-search', 'dynamic-programming', 'greedy'] },
      { title: "Painter's Partition Problem", subtopic: 'Medium', difficulty: 'medium', platform: 'gfg', platformLink: 'https://www.geeksforgeeks.org/painters-partition-problem/', tags: ['binary-search', 'greedy', 'dynamic-programming'] },
      { title: 'Minimize Maximum Distance to Gas Stations', subtopic: 'Medium', difficulty: 'medium', platform: 'gfg', platformLink: 'https://www.geeksforgeeks.org/minimize-the-maximum-distance-between-gas-stations/', tags: ['binary-search', 'greedy', 'heap'] },
      { title: 'Median of Two Sorted Arrays', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/median-of-two-sorted-arrays/', tags: ['binary-search', 'array', 'divide-and-conquer'] },
      { title: 'Kth Element of Two Sorted Arrays', subtopic: 'Medium', difficulty: 'medium', platform: 'gfg', platformLink: 'https://www.geeksforgeeks.org/k-th-element-two-sorted-arrays/', tags: ['binary-search', 'array', 'divide-and-conquer'] },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. STRINGS  (22 problems — fully populated)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: 'Strings',
    slug: 'strings',
    rawProblems: [
      // ── Easy ──────────────────────────────────────────────────────────────
      { title: 'Remove Outermost Parentheses', subtopic: 'Easy', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/remove-outermost-parentheses/', tags: ['string', 'stack'] },
      { title: 'Reverse Words in a String', subtopic: 'Easy', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/reverse-words-in-a-string/', tags: ['string', 'two-pointer'] },
      { title: 'Largest Odd Number in a String', subtopic: 'Easy', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/largest-odd-number-in-a-string/', tags: ['string', 'math', 'greedy'] },
      { title: 'Longest Common Prefix', subtopic: 'Easy', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/longest-common-prefix/', tags: ['string', 'trie'] },
      { title: 'Isomorphic Strings', subtopic: 'Easy', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/isomorphic-strings/', tags: ['string', 'hashing'] },
      { title: 'Valid Anagram', subtopic: 'Easy', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/valid-anagram/', tags: ['string', 'hashing', 'sorting'] },
      { title: 'Rotate String', subtopic: 'Easy', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/rotate-string/', tags: ['string', 'kmp'] },
      // ── Medium ────────────────────────────────────────────────────────────
      { title: 'Sort Characters by Frequency', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/sort-characters-by-frequency/', tags: ['string', 'hashing', 'heap', 'sorting'] },
      { title: 'Maximum Nesting Depth of the Parentheses', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/maximum-nesting-depth-of-the-parentheses/', tags: ['string', 'stack'] },
      { title: 'Roman to Integer', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/roman-to-integer/', tags: ['string', 'math', 'hashing'] },
      { title: 'String to Integer (atoi)', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/string-to-integer-atoi/', tags: ['string', 'math'] },
      { title: 'Count Number of Substrings with K Distinct Characters', subtopic: 'Medium', difficulty: 'medium', platform: 'gfg', platformLink: 'https://www.geeksforgeeks.org/count-number-of-substrings-with-exactly-k-distinct-characters/', tags: ['string', 'hashing', 'sliding-window'] },
      { title: 'Longest Palindromic Substring', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/longest-palindromic-substring/', tags: ['string', 'dynamic-programming', 'expand-around-center'] },
      { title: 'Sum of Beauty of All Substrings', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/sum-of-beauty-of-all-substrings/', tags: ['string', 'hashing'] },
      { title: 'Minimum Bracket Reversals', subtopic: 'Medium', difficulty: 'medium', platform: 'gfg', platformLink: 'https://www.geeksforgeeks.org/minimum-number-of-bracket-reversals-needed-to-make-an-expression-balanced/', tags: ['string', 'stack', 'greedy'] },
      // ── Hard ──────────────────────────────────────────────────────────────
      { title: 'Count and Say', subtopic: 'Hard', difficulty: 'hard', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/count-and-say/', tags: ['string', 'recursion', 'simulation'] },
      { title: 'Rabin Karp Algorithm', subtopic: 'Hard', difficulty: 'hard', platform: 'gfg', platformLink: 'https://www.geeksforgeeks.org/rabin-karp-algorithm-for-pattern-searching/', tags: ['string', 'hashing', 'pattern-matching', 'rolling-hash'] },
      { title: 'Z-Function', subtopic: 'Hard', difficulty: 'hard', platform: 'gfg', platformLink: 'https://www.geeksforgeeks.org/z-algorithm-linear-time-pattern-searching-algorithm/', tags: ['string', 'pattern-matching'] },
      { title: 'KMP Algorithm / Find the Index of the First Occurrence in a String', subtopic: 'Hard', difficulty: 'hard', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/', tags: ['string', 'pattern-matching', 'kmp', 'two-pointer'] },
      { title: 'Shortest Palindrome', subtopic: 'Hard', difficulty: 'hard', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/shortest-palindrome/', tags: ['string', 'kmp', 'rolling-hash'] },
      { title: 'Longest Happy Prefix', subtopic: 'Hard', difficulty: 'hard', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/longest-happy-prefix/', tags: ['string', 'kmp', 'rolling-hash'] },
      { title: 'Count Different Palindromic Subsequences', subtopic: 'Hard', difficulty: 'hard', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/count-different-palindromic-subsequences/', tags: ['string', 'dynamic-programming'] },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. LINKED LIST  (stubs)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: 'Linked List',
    slug: 'linked-list',
    rawProblems: [
      { title: 'Reverse Linked List', subtopic: 'Easy', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/reverse-linked-list/', tags: ['linked-list', 'recursion'] },
      { title: 'Middle of the Linked List', subtopic: 'Easy', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/middle-of-the-linked-list/', tags: ['linked-list', 'two-pointer'] },
      { title: 'Linked List Cycle', subtopic: 'Easy', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/linked-list-cycle/', tags: ['linked-list', 'two-pointer', 'floyd'] },
      { title: 'Merge Two Sorted Lists', subtopic: 'Easy', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/merge-two-sorted-lists/', tags: ['linked-list', 'recursion'] },
      { title: 'Delete Node in a Linked List', subtopic: 'Easy', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/delete-node-in-a-linked-list/', tags: ['linked-list'] },
      { title: 'Remove Nth Node From End of List', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/remove-nth-node-from-end-of-list/', tags: ['linked-list', 'two-pointer'] },
      { title: 'Add Two Numbers', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/add-two-numbers/', tags: ['linked-list', 'math', 'recursion'] },
      { title: 'Sort List', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/sort-list/', tags: ['linked-list', 'merge-sort', 'divide-and-conquer'] },
      { title: 'Rotate List', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/rotate-list/', tags: ['linked-list', 'two-pointer'] },
      { title: 'Copy List with Random Pointer', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/copy-list-with-random-pointer/', tags: ['linked-list', 'hashing'] },
      { title: 'Reverse Nodes in k-Group', subtopic: 'Hard', difficulty: 'hard', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/reverse-nodes-in-k-group/', tags: ['linked-list', 'recursion'] },
      { title: 'Flatten a Multilevel Doubly Linked List', subtopic: 'Hard', difficulty: 'hard', platform: 'gfg', platformLink: 'https://www.geeksforgeeks.org/flattening-a-linked-list/', tags: ['linked-list', 'merge-sort'] },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. RECURSION  (stubs)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: 'Recursion',
    slug: 'recursion',
    rawProblems: [
      { title: 'Fibonacci Number', subtopic: 'Easy', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/fibonacci-number/', tags: ['recursion', 'memoization', 'math'] },
      { title: 'Climbing Stairs', subtopic: 'Easy', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/climbing-stairs/', tags: ['recursion', 'dynamic-programming', 'memoization'] },
      { title: 'Power of Two', subtopic: 'Easy', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/power-of-two/', tags: ['recursion', 'bit-manipulation', 'math'] },
      { title: 'Reverse String', subtopic: 'Easy', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/reverse-string/', tags: ['recursion', 'string', 'two-pointer'] },
      { title: 'Pow(x, n)', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/powx-n/', tags: ['recursion', 'math', 'divide-and-conquer'] },
      { title: 'Generate Parentheses', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/generate-parentheses/', tags: ['recursion', 'backtracking', 'string'] },
      { title: 'Subsets', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/subsets/', tags: ['recursion', 'backtracking', 'bit-manipulation'] },
      { title: 'Letter Combinations of a Phone Number', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/letter-combinations-of-a-phone-number/', tags: ['recursion', 'backtracking', 'string', 'hashing'] },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. BIT MANIPULATION  (stubs)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: 'Bit Manipulation',
    slug: 'bit-manipulation',
    rawProblems: [
      { title: 'Number of 1 Bits', subtopic: 'Easy', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/number-of-1-bits/', tags: ['bit-manipulation'] },
      { title: 'Reverse Bits', subtopic: 'Easy', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/reverse-bits/', tags: ['bit-manipulation', 'divide-and-conquer'] },
      { title: 'Missing Number (Bit)', subtopic: 'Easy', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/missing-number/', tags: ['bit-manipulation', 'array', 'math'] },
      { title: 'Single Number (XOR)', subtopic: 'Easy', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/single-number/', tags: ['bit-manipulation', 'array'] },
      { title: 'Single Number II', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/single-number-ii/', tags: ['bit-manipulation', 'array'] },
      { title: 'Single Number III', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/single-number-iii/', tags: ['bit-manipulation', 'array'] },
      { title: 'XOR Queries of a Subarray', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/xor-queries-of-a-subarray/', tags: ['bit-manipulation', 'prefix-sum', 'array'] },
      { title: 'Divide Two Integers', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/divide-two-integers/', tags: ['bit-manipulation', 'math'] },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. SORTING  (stubs)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: 'Sorting',
    slug: 'sorting',
    rawProblems: [
      { title: 'Bubble Sort', subtopic: 'Easy', difficulty: 'easy', platform: 'gfg', platformLink: 'https://www.geeksforgeeks.org/bubble-sort/', tags: ['sorting', 'array'] },
      { title: 'Selection Sort', subtopic: 'Easy', difficulty: 'easy', platform: 'gfg', platformLink: 'https://www.geeksforgeeks.org/selection-sort/', tags: ['sorting', 'array'] },
      { title: 'Insertion Sort', subtopic: 'Easy', difficulty: 'easy', platform: 'gfg', platformLink: 'https://www.geeksforgeeks.org/insertion-sort/', tags: ['sorting', 'array'] },
      { title: 'Merge Sort', subtopic: 'Medium', difficulty: 'medium', platform: 'gfg', platformLink: 'https://www.geeksforgeeks.org/merge-sort/', tags: ['sorting', 'divide-and-conquer', 'recursion'] },
      { title: 'Quick Sort', subtopic: 'Medium', difficulty: 'medium', platform: 'gfg', platformLink: 'https://www.geeksforgeeks.org/quick-sort/', tags: ['sorting', 'divide-and-conquer', 'recursion'] },
      { title: 'Sort an Array', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/sort-an-array/', tags: ['sorting', 'divide-and-conquer', 'heap'] },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 8. STACK & QUEUE  (stubs)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: 'Stack & Queue',
    slug: 'stack-queue',
    rawProblems: [
      { title: 'Valid Parentheses', subtopic: 'Easy', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/valid-parentheses/', tags: ['stack', 'string'] },
      { title: 'Implement Stack using Queues', subtopic: 'Easy', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/implement-stack-using-queues/', tags: ['stack', 'queue', 'design'] },
      { title: 'Implement Queue using Stacks', subtopic: 'Easy', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/implement-queue-using-stacks/', tags: ['stack', 'queue', 'design'] },
      { title: 'Next Greater Element I', subtopic: 'Easy', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/next-greater-element-i/', tags: ['stack', 'monotonic-stack', 'hashing'] },
      { title: 'Min Stack', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/min-stack/', tags: ['stack', 'design'] },
      { title: 'Evaluate Reverse Polish Notation', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/evaluate-reverse-polish-notation/', tags: ['stack', 'math', 'array'] },
      { title: 'Daily Temperatures', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/daily-temperatures/', tags: ['stack', 'monotonic-stack', 'array'] },
      { title: 'Largest Rectangle in Histogram', subtopic: 'Hard', difficulty: 'hard', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/largest-rectangle-in-histogram/', tags: ['stack', 'monotonic-stack', 'array'] },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 9. SLIDING WINDOW  (stubs)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: 'Sliding Window',
    slug: 'sliding-window',
    rawProblems: [
      { title: 'Maximum Average Subarray I', subtopic: 'Easy', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/maximum-average-subarray-i/', tags: ['sliding-window', 'array'] },
      { title: 'Longest Substring Without Repeating Characters', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/', tags: ['sliding-window', 'hashing', 'string', 'two-pointer'] },
      { title: 'Longest Repeating Character Replacement', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/longest-repeating-character-replacement/', tags: ['sliding-window', 'hashing', 'string'] },
      { title: 'Permutation in String', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/permutation-in-string/', tags: ['sliding-window', 'hashing', 'two-pointer', 'string'] },
      { title: 'Minimum Window Substring', subtopic: 'Hard', difficulty: 'hard', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/minimum-window-substring/', tags: ['sliding-window', 'hashing', 'string', 'two-pointer'] },
      { title: 'Sliding Window Maximum', subtopic: 'Hard', difficulty: 'hard', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/sliding-window-maximum/', tags: ['sliding-window', 'deque', 'monotonic-queue', 'array'] },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 10. HEAPS  (stubs)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: 'Heaps',
    slug: 'heaps',
    rawProblems: [
      { title: 'Last Stone Weight', subtopic: 'Easy', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/last-stone-weight/', tags: ['heap', 'greedy', 'array'] },
      { title: 'Kth Largest Element in an Array', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/kth-largest-element-in-an-array/', tags: ['heap', 'sorting', 'quickselect', 'array'] },
      { title: 'K Closest Points to Origin', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/k-closest-points-to-origin/', tags: ['heap', 'sorting', 'quickselect', 'geometry'] },
      { title: 'Task Scheduler', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/task-scheduler/', tags: ['heap', 'greedy', 'hashing', 'array'] },
      { title: 'Design Twitter', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/design-twitter/', tags: ['heap', 'hashing', 'design', 'linked-list'] },
      { title: 'Merge K Sorted Lists', subtopic: 'Hard', difficulty: 'hard', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/merge-k-sorted-lists/', tags: ['heap', 'divide-and-conquer', 'linked-list'] },
      { title: 'Find Median from Data Stream', subtopic: 'Hard', difficulty: 'hard', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/find-median-from-data-stream/', tags: ['heap', 'design', 'sorting', 'data-stream'] },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 11. GREEDY  (stubs)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: 'Greedy',
    slug: 'greedy',
    rawProblems: [
      { title: 'Assign Cookies', subtopic: 'Easy', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/assign-cookies/', tags: ['greedy', 'sorting', 'array'] },
      { title: 'Jump Game', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/jump-game/', tags: ['greedy', 'array', 'dynamic-programming'] },
      { title: 'Jump Game II', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/jump-game-ii/', tags: ['greedy', 'array', 'dynamic-programming'] },
      { title: 'Gas Station', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/gas-station/', tags: ['greedy', 'array'] },
      { title: 'Hand of Straights', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/hand-of-straights/', tags: ['greedy', 'hashing', 'sorting'] },
      { title: 'Merge Triplets to Form Target Triplet', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/merge-triplets-to-form-target-triplet/', tags: ['greedy', 'array'] },
      { title: 'Partition Labels', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/partition-labels/', tags: ['greedy', 'hashing', 'two-pointer', 'string'] },
      { title: 'Valid Parenthesis String', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/valid-parenthesis-string/', tags: ['greedy', 'string', 'dynamic-programming'] },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 12. BINARY TREES  (stubs)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: 'Binary Trees',
    slug: 'binary-trees',
    rawProblems: [
      { title: 'Binary Tree Inorder Traversal', subtopic: 'Easy', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/binary-tree-inorder-traversal/', tags: ['binary-tree', 'recursion', 'stack', 'dfs'] },
      { title: 'Binary Tree Preorder Traversal', subtopic: 'Easy', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/binary-tree-preorder-traversal/', tags: ['binary-tree', 'recursion', 'stack', 'dfs'] },
      { title: 'Binary Tree Postorder Traversal', subtopic: 'Easy', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/binary-tree-postorder-traversal/', tags: ['binary-tree', 'recursion', 'stack', 'dfs'] },
      { title: 'Maximum Depth of Binary Tree', subtopic: 'Easy', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/', tags: ['binary-tree', 'recursion', 'dfs', 'bfs'] },
      { title: 'Diameter of Binary Tree', subtopic: 'Easy', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/diameter-of-binary-tree/', tags: ['binary-tree', 'recursion', 'dfs'] },
      { title: 'Balanced Binary Tree', subtopic: 'Easy', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/balanced-binary-tree/', tags: ['binary-tree', 'recursion', 'dfs'] },
      { title: 'Same Tree', subtopic: 'Easy', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/same-tree/', tags: ['binary-tree', 'recursion', 'dfs', 'bfs'] },
      { title: 'Binary Tree Level Order Traversal', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/binary-tree-level-order-traversal/', tags: ['binary-tree', 'bfs', 'queue'] },
      { title: 'Construct Binary Tree from Preorder and Inorder Traversal', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/', tags: ['binary-tree', 'recursion', 'divide-and-conquer', 'hashing'] },
      { title: 'Binary Tree Maximum Path Sum', subtopic: 'Hard', difficulty: 'hard', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/binary-tree-maximum-path-sum/', tags: ['binary-tree', 'recursion', 'dynamic-programming', 'dfs'] },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 13. BST  (stubs)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: 'BST',
    slug: 'bst',
    rawProblems: [
      { title: 'Search in a Binary Search Tree', subtopic: 'Easy', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/search-in-a-binary-search-tree/', tags: ['bst', 'recursion', 'dfs'] },
      { title: 'Insert into a Binary Search Tree', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/insert-into-a-binary-search-tree/', tags: ['bst', 'recursion'] },
      { title: 'Delete Node in a BST', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/delete-node-in-a-bst/', tags: ['bst', 'recursion'] },
      { title: 'Validate Binary Search Tree', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/validate-binary-search-tree/', tags: ['bst', 'recursion', 'inorder', 'dfs'] },
      { title: 'Lowest Common Ancestor of a Binary Search Tree', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-search-tree/', tags: ['bst', 'recursion', 'dfs'] },
      { title: 'Kth Smallest Element in a BST', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/kth-smallest-element-in-a-bst/', tags: ['bst', 'inorder', 'recursion', 'stack'] },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 14. GRAPHS  (stubs)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: 'Graphs',
    slug: 'graphs',
    rawProblems: [
      { title: 'Number of Islands', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/number-of-islands/', tags: ['graph', 'bfs', 'dfs', 'matrix', 'union-find'] },
      { title: 'Clone Graph', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/clone-graph/', tags: ['graph', 'bfs', 'dfs', 'hashing'] },
      { title: 'Max Area of Island', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/max-area-of-island/', tags: ['graph', 'bfs', 'dfs', 'matrix', 'array'] },
      { title: 'Pacific Atlantic Water Flow', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/pacific-atlantic-water-flow/', tags: ['graph', 'bfs', 'dfs', 'matrix'] },
      { title: 'Surrounded Regions', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/surrounded-regions/', tags: ['graph', 'bfs', 'dfs', 'matrix', 'union-find'] },
      { title: 'Rotting Oranges', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/rotting-oranges/', tags: ['graph', 'bfs', 'matrix', 'array'] },
      { title: 'Course Schedule', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/course-schedule/', tags: ['graph', 'topological-sort', 'dfs', 'bfs'] },
      { title: 'Course Schedule II', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/course-schedule-ii/', tags: ['graph', 'topological-sort', 'dfs', 'bfs'] },
      { title: "Dijkstra's Algorithm", subtopic: 'Medium', difficulty: 'medium', platform: 'gfg', platformLink: 'https://www.geeksforgeeks.org/dijkstras-shortest-path-algorithm-greedy-algo-7/', tags: ['graph', 'dijkstra', 'shortest-path', 'heap', 'greedy'] },
      { title: 'Word Ladder', subtopic: 'Hard', difficulty: 'hard', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/word-ladder/', tags: ['graph', 'bfs', 'string', 'hashing'] },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 15. DYNAMIC PROGRAMMING  (stubs)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: 'Dynamic Programming',
    slug: 'dynamic-programming',
    rawProblems: [
      { title: 'Climbing Stairs (DP)', subtopic: 'Easy', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/climbing-stairs/', tags: ['dynamic-programming', 'memoization', 'math'] },
      { title: 'House Robber', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/house-robber/', tags: ['dynamic-programming', 'array'] },
      { title: 'House Robber II', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/house-robber-ii/', tags: ['dynamic-programming', 'array'] },
      { title: 'Longest Palindromic Substring (DP)', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/longest-palindromic-substring/', tags: ['dynamic-programming', 'string'] },
      { title: 'Palindromic Substrings', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/palindromic-substrings/', tags: ['dynamic-programming', 'string'] },
      { title: 'Decode Ways', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/decode-ways/', tags: ['dynamic-programming', 'string', 'recursion'] },
      { title: 'Coin Change', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/coin-change/', tags: ['dynamic-programming', 'array', 'bfs'] },
      { title: 'Maximum Product Subarray (DP)', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/maximum-product-subarray/', tags: ['dynamic-programming', 'array'] },
      { title: 'Word Break', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/word-break/', tags: ['dynamic-programming', 'trie', 'hashing', 'memoization'] },
      { title: 'Longest Increasing Subsequence', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/longest-increasing-subsequence/', tags: ['dynamic-programming', 'binary-search', 'patience-sorting'] },
      { title: 'Partition Equal Subset Sum', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/partition-equal-subset-sum/', tags: ['dynamic-programming', 'array'] },
      { title: '0/1 Knapsack Problem', subtopic: 'Medium', difficulty: 'medium', platform: 'gfg', platformLink: 'https://www.geeksforgeeks.org/0-1-knapsack-problem-dp-10/', tags: ['dynamic-programming', 'array'] },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 16. TRIES  (stubs)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: 'Tries',
    slug: 'tries',
    rawProblems: [
      { title: 'Implement Trie (Prefix Tree)', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/implement-trie-prefix-tree/', tags: ['trie', 'design', 'string'] },
      { title: 'Design Add and Search Words Data Structure', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/design-add-and-search-words-data-structure/', tags: ['trie', 'design', 'string', 'dfs', 'backtracking'] },
      { title: 'Longest Word in Dictionary', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/longest-word-in-dictionary/', tags: ['trie', 'hashing', 'sorting', 'string'] },
      { title: 'Word Search II', subtopic: 'Hard', difficulty: 'hard', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/word-search-ii/', tags: ['trie', 'backtracking', 'matrix', 'dfs'] },
    ],
  },

  // ═══════════════════════════════════════════════════════════════════════════
  // 17. SEGMENT TREES  (stubs)
  // ═══════════════════════════════════════════════════════════════════════════
  {
    name: 'Segment Trees',
    slug: 'segment-trees',
    rawProblems: [
      { title: 'Range Sum Query - Mutable', subtopic: 'Medium', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/range-sum-query-mutable/', tags: ['segment-tree', 'binary-indexed-tree', 'design', 'array'] },
      { title: 'Range Minimum Query', subtopic: 'Medium', difficulty: 'medium', platform: 'gfg', platformLink: 'https://www.geeksforgeeks.org/range-minimum-query-for-static-array/', tags: ['segment-tree', 'sparse-table', 'array'] },
      { title: 'Count of Range Sum', subtopic: 'Hard', difficulty: 'hard', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/count-of-range-sum/', tags: ['segment-tree', 'binary-indexed-tree', 'merge-sort', 'divide-and-conquer'] },
    ],
  },
]

// ─── Exported Data & Seeder ──────────────────────────────────────────────────

export const allProblems = buildAllProblems(TOPICS)

export async function seedProblems(d1: D1Database): Promise<void> {
  const db = drizzle(d1)
  const BATCH = 20

  for (let i = 0; i < allProblems.length; i += BATCH) {
    await db
      .insert(problems)
      .values(allProblems.slice(i, i + BATCH))
      .onConflictDoNothing()
  }

  console.log(`Seeded ${allProblems.length} problems across ${TOPICS.length} topics`)
}
