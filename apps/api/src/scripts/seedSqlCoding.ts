import { drizzle } from 'drizzle-orm/d1'
import { problems } from '../db/schema'

// ─── Types ────────────────────────────────────────────────────────────────────

interface SqlCodingProblem {
  title: string
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
  platform: 'leetcode' | 'hackerrank'
  platformLink: string
  sheet: 'leetcode-sql-50' | 'hackerrank-sql'
  tags: string[]
  estimatedMinutes: number
}

// ─── LeetCode SQL 50 ─────────────────────────────────────────────────────────

const LEETCODE_SQL_50: SqlCodingProblem[] = [
  // ── Select (5) ──────────────────────────────────────────────────────────────
  { title: 'Recyclable and Low Fat Products', topic: 'Select', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/recyclable-and-low-fat-products/', sheet: 'leetcode-sql-50', tags: ['select', 'where'], estimatedMinutes: 10 },
  { title: 'Find Customer Referee', topic: 'Select', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/find-customer-referee/', sheet: 'leetcode-sql-50', tags: ['select', 'null-handling'], estimatedMinutes: 10 },
  { title: 'Big Countries', topic: 'Select', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/big-countries/', sheet: 'leetcode-sql-50', tags: ['select', 'where', 'or'], estimatedMinutes: 10 },
  { title: 'Article Views I', topic: 'Select', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/article-views-i/', sheet: 'leetcode-sql-50', tags: ['select', 'where', 'order-by'], estimatedMinutes: 10 },
  { title: 'Invalid Tweets', topic: 'Select', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/invalid-tweets/', sheet: 'leetcode-sql-50', tags: ['select', 'length', 'string-functions'], estimatedMinutes: 10 },

  // ── Basic Joins (9) ──────────────────────────────────────────────────────────
  { title: 'Replace Employee ID With The Unique Identifier', topic: 'Basic Joins', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/replace-employee-id-with-the-unique-identifier/', sheet: 'leetcode-sql-50', tags: ['left-join'], estimatedMinutes: 15 },
  { title: 'Product Sales Analysis I', topic: 'Basic Joins', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/product-sales-analysis-i/', sheet: 'leetcode-sql-50', tags: ['join', 'inner-join'], estimatedMinutes: 15 },
  { title: 'Customer Who Visited but Did Not Make Any Transactions', topic: 'Basic Joins', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/customer-who-visited-but-did-not-make-any-transactions/', sheet: 'leetcode-sql-50', tags: ['left-join', 'null-check', 'anti-join'], estimatedMinutes: 15 },
  { title: 'Rising Temperature', topic: 'Basic Joins', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/rising-temperature/', sheet: 'leetcode-sql-50', tags: ['self-join', 'date-functions', 'datediff'], estimatedMinutes: 20 },
  { title: 'Average Time of Process per Machine', topic: 'Basic Joins', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/average-time-of-process-per-machine/', sheet: 'leetcode-sql-50', tags: ['self-join', 'avg', 'group-by'], estimatedMinutes: 20 },
  { title: 'Employee Bonus', topic: 'Basic Joins', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/employee-bonus/', sheet: 'leetcode-sql-50', tags: ['left-join', 'null-handling'], estimatedMinutes: 15 },
  { title: 'Students and Examinations', topic: 'Basic Joins', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/students-and-examinations/', sheet: 'leetcode-sql-50', tags: ['cross-join', 'left-join', 'count', 'group-by'], estimatedMinutes: 20 },
  { title: 'Managers with at Least 5 Direct Reports', topic: 'Basic Joins', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/managers-with-at-least-5-direct-reports/', sheet: 'leetcode-sql-50', tags: ['inner-join', 'group-by', 'having', 'count'], estimatedMinutes: 20 },
  { title: 'Confirmation Rate', topic: 'Basic Joins', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/confirmation-rate/', sheet: 'leetcode-sql-50', tags: ['left-join', 'avg', 'case', 'round'], estimatedMinutes: 25 },

  // ── Basic Aggregate Functions (8) ────────────────────────────────────────────
  { title: 'Not Boring Movies', topic: 'Basic Aggregate Functions', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/not-boring-movies/', sheet: 'leetcode-sql-50', tags: ['where', 'mod', 'order-by'], estimatedMinutes: 15 },
  { title: 'Average Selling Price', topic: 'Basic Aggregate Functions', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/average-selling-price/', sheet: 'leetcode-sql-50', tags: ['left-join', 'sum', 'avg', 'round', 'between'], estimatedMinutes: 20 },
  { title: 'Project Employees I', topic: 'Basic Aggregate Functions', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/project-employees-i/', sheet: 'leetcode-sql-50', tags: ['inner-join', 'avg', 'round', 'group-by'], estimatedMinutes: 15 },
  { title: 'Percentage of Users Attended a Contest', topic: 'Basic Aggregate Functions', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/percentage-of-users-attended-a-contest/', sheet: 'leetcode-sql-50', tags: ['count', 'subquery', 'round', 'group-by', 'order-by'], estimatedMinutes: 20 },
  { title: 'Queries Quality and Percentage', topic: 'Basic Aggregate Functions', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/queries-quality-and-percentage/', sheet: 'leetcode-sql-50', tags: ['avg', 'case', 'round', 'group-by'], estimatedMinutes: 20 },
  { title: 'Monthly Transactions I', topic: 'Basic Aggregate Functions', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/monthly-transactions-i/', sheet: 'leetcode-sql-50', tags: ['date-format', 'sum', 'count', 'case', 'group-by'], estimatedMinutes: 25 },
  { title: 'Immediate Food Delivery II', topic: 'Basic Aggregate Functions', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/immediate-food-delivery-ii/', sheet: 'leetcode-sql-50', tags: ['subquery', 'min', 'avg', 'round', 'case'], estimatedMinutes: 25 },
  { title: 'Game Play Analysis IV', topic: 'Basic Aggregate Functions', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/game-play-analysis-iv/', sheet: 'leetcode-sql-50', tags: ['subquery', 'min', 'datediff', 'count', 'round'], estimatedMinutes: 25 },

  // ── Sorting and Grouping (7) ─────────────────────────────────────────────────
  { title: 'Number of Unique Subjects Taught by Each Teacher', topic: 'Sorting and Grouping', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/number-of-unique-subjects-taught-by-each-teacher/', sheet: 'leetcode-sql-50', tags: ['count-distinct', 'group-by'], estimatedMinutes: 10 },
  { title: 'User Activity for the Past 30 Days I', topic: 'Sorting and Grouping', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/user-activity-for-the-past-30-days-i/', sheet: 'leetcode-sql-50', tags: ['count-distinct', 'between', 'group-by', 'having'], estimatedMinutes: 15 },
  { title: 'Product Sales Analysis III', topic: 'Sorting and Grouping', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/product-sales-analysis-iii/', sheet: 'leetcode-sql-50', tags: ['subquery', 'min', 'in', 'group-by'], estimatedMinutes: 20 },
  { title: 'Classes More Than 5 Students', topic: 'Sorting and Grouping', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/classes-more-than-5-students/', sheet: 'leetcode-sql-50', tags: ['group-by', 'having', 'count'], estimatedMinutes: 10 },
  { title: 'Find Followers Count', topic: 'Sorting and Grouping', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/find-followers-count/', sheet: 'leetcode-sql-50', tags: ['count', 'group-by', 'order-by'], estimatedMinutes: 10 },
  { title: 'Biggest Single Number', topic: 'Sorting and Grouping', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/biggest-single-number/', sheet: 'leetcode-sql-50', tags: ['group-by', 'having', 'count', 'max', 'subquery'], estimatedMinutes: 15 },
  { title: 'Customers Who Bought All Products', topic: 'Sorting and Grouping', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/customers-who-bought-all-products/', sheet: 'leetcode-sql-50', tags: ['group-by', 'having', 'count-distinct'], estimatedMinutes: 20 },

  // ── Advanced Select and Joins (7) ────────────────────────────────────────────
  { title: 'The Number of Employees Which Report to Each Employee', topic: 'Advanced Select and Joins', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/the-number-of-employees-which-report-to-each-employee/', sheet: 'leetcode-sql-50', tags: ['self-join', 'count', 'avg', 'round', 'group-by'], estimatedMinutes: 20 },
  { title: 'Primary Department for Each Employee', topic: 'Advanced Select and Joins', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/primary-department-for-each-employee/', sheet: 'leetcode-sql-50', tags: ['union', 'group-by', 'having', 'count'], estimatedMinutes: 20 },
  { title: 'Triangle Judgement', topic: 'Advanced Select and Joins', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/triangle-judgement/', sheet: 'leetcode-sql-50', tags: ['case-when', 'if'], estimatedMinutes: 15 },
  { title: 'Consecutive Numbers', topic: 'Advanced Select and Joins', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/consecutive-numbers/', sheet: 'leetcode-sql-50', tags: ['self-join', 'distinct', 'window-functions', 'lag'], estimatedMinutes: 25 },
  { title: 'Product Price at a Given Date', topic: 'Advanced Select and Joins', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/product-price-at-a-given-date/', sheet: 'leetcode-sql-50', tags: ['subquery', 'union', 'max', 'case'], estimatedMinutes: 25 },
  { title: 'Last Person to Fit in the Bus', topic: 'Advanced Select and Joins', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/last-person-to-fit-in-the-bus/', sheet: 'leetcode-sql-50', tags: ['window-functions', 'sum-over', 'order-by', 'subquery'], estimatedMinutes: 25 },
  { title: 'Count Salary Categories', topic: 'Advanced Select and Joins', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/count-salary-categories/', sheet: 'leetcode-sql-50', tags: ['union-all', 'case', 'count', 'sum'], estimatedMinutes: 25 },

  // ── Subqueries (7) ───────────────────────────────────────────────────────────
  { title: 'Employees Whose Manager Left the Company', topic: 'Subqueries', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/employees-whose-manager-left-the-company/', sheet: 'leetcode-sql-50', tags: ['not-in', 'subquery', 'where', 'order-by'], estimatedMinutes: 20 },
  { title: 'Exchange Seats', topic: 'Subqueries', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/exchange-seats/', sheet: 'leetcode-sql-50', tags: ['case', 'mod', 'count', 'subquery'], estimatedMinutes: 25 },
  { title: 'Movie Rating', topic: 'Subqueries', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/movie-rating/', sheet: 'leetcode-sql-50', tags: ['union-all', 'avg', 'count', 'join', 'limit', 'subquery'], estimatedMinutes: 30 },
  { title: 'Restaurant Growth', topic: 'Subqueries', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/restaurant-growth/', sheet: 'leetcode-sql-50', tags: ['window-functions', 'sum-over', 'rows-between', 'avg', 'round'], estimatedMinutes: 30 },
  { title: 'Friend Requests II: Who Has the Most Friends', topic: 'Subqueries', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/friend-requests-ii-who-has-the-most-friends/', sheet: 'leetcode-sql-50', tags: ['union-all', 'count', 'group-by', 'order-by', 'limit'], estimatedMinutes: 25 },
  { title: 'Investments in 2016', topic: 'Subqueries', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/investments-in-2016/', sheet: 'leetcode-sql-50', tags: ['subquery', 'in', 'group-by', 'having', 'count', 'round'], estimatedMinutes: 30 },
  { title: 'Department Top Three Salaries', topic: 'Subqueries', difficulty: 'hard', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/department-top-three-salaries/', sheet: 'leetcode-sql-50', tags: ['window-functions', 'dense-rank', 'partition-by', 'join', 'subquery'], estimatedMinutes: 35 },

  // ── Advanced String Functions / Regex / Clause (7) ───────────────────────────
  { title: 'Fix Names in a Table', topic: 'Advanced String Functions / Regex / Clause', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/fix-names-in-a-table/', sheet: 'leetcode-sql-50', tags: ['concat', 'upper', 'lower', 'substring', 'string-functions'], estimatedMinutes: 15 },
  { title: 'Patients With a Condition', topic: 'Advanced String Functions / Regex / Clause', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/patients-with-a-condition/', sheet: 'leetcode-sql-50', tags: ['like', 'regexp', 'where', 'string-functions'], estimatedMinutes: 15 },
  { title: 'Delete Duplicate Emails', topic: 'Advanced String Functions / Regex / Clause', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/delete-duplicate-emails/', sheet: 'leetcode-sql-50', tags: ['delete', 'self-join', 'subquery', 'min'], estimatedMinutes: 20 },
  { title: 'Second Highest Salary', topic: 'Advanced String Functions / Regex / Clause', difficulty: 'medium', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/second-highest-salary/', sheet: 'leetcode-sql-50', tags: ['subquery', 'max', 'distinct', 'limit', 'offset', 'ifnull'], estimatedMinutes: 20 },
  { title: 'Group Sold Products By The Date', topic: 'Advanced String Functions / Regex / Clause', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/group-sold-products-by-the-date/', sheet: 'leetcode-sql-50', tags: ['group-concat', 'count-distinct', 'group-by', 'order-by'], estimatedMinutes: 15 },
  { title: 'List the Products Ordered in a Period', topic: 'Advanced String Functions / Regex / Clause', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/list-the-products-ordered-in-a-period/', sheet: 'leetcode-sql-50', tags: ['join', 'where', 'like', 'group-by', 'having', 'sum'], estimatedMinutes: 20 },
  { title: 'Find Users With Valid E-Mails', topic: 'Advanced String Functions / Regex / Clause', difficulty: 'easy', platform: 'leetcode', platformLink: 'https://leetcode.com/problems/find-users-with-valid-e-mails/', sheet: 'leetcode-sql-50', tags: ['regexp', 'like', 'where'], estimatedMinutes: 15 },
]

// ─── HackerRank SQL ───────────────────────────────────────────────────────────

const HACKERRANK_SQL: SqlCodingProblem[] = [
  // ── Basic Select (20) ────────────────────────────────────────────────────────
  { title: 'Revising the Select Query I', topic: 'Basic Select', difficulty: 'easy', platform: 'hackerrank', platformLink: 'https://www.hackerrank.com/challenges/revising-the-select-query/problem', sheet: 'hackerrank-sql', tags: ['select', 'where'], estimatedMinutes: 10 },
  { title: 'Revising the Select Query II', topic: 'Basic Select', difficulty: 'easy', platform: 'hackerrank', platformLink: 'https://www.hackerrank.com/challenges/revising-the-select-query-2/problem', sheet: 'hackerrank-sql', tags: ['select', 'where'], estimatedMinutes: 10 },
  { title: 'Select All', topic: 'Basic Select', difficulty: 'easy', platform: 'hackerrank', platformLink: 'https://www.hackerrank.com/challenges/select-all-sql/problem', sheet: 'hackerrank-sql', tags: ['select', 'select-star'], estimatedMinutes: 5 },
  { title: 'Select By ID', topic: 'Basic Select', difficulty: 'easy', platform: 'hackerrank', platformLink: 'https://www.hackerrank.com/challenges/select-by-id/problem', sheet: 'hackerrank-sql', tags: ['select', 'where', 'id'], estimatedMinutes: 5 },
  { title: "Japanese Cities' Attributes", topic: 'Basic Select', difficulty: 'easy', platform: 'hackerrank', platformLink: 'https://www.hackerrank.com/challenges/japanese-cities-attributes/problem', sheet: 'hackerrank-sql', tags: ['select', 'where'], estimatedMinutes: 5 },
  { title: "Japanese Cities' Names", topic: 'Basic Select', difficulty: 'easy', platform: 'hackerrank', platformLink: 'https://www.hackerrank.com/challenges/japanese-cities-name/problem', sheet: 'hackerrank-sql', tags: ['select', 'where'], estimatedMinutes: 5 },
  { title: 'Weather Observation Station 1', topic: 'Basic Select', difficulty: 'easy', platform: 'hackerrank', platformLink: 'https://www.hackerrank.com/challenges/weather-observation-station-1/problem', sheet: 'hackerrank-sql', tags: ['select', 'distinct'], estimatedMinutes: 5 },
  { title: 'Weather Observation Station 3', topic: 'Basic Select', difficulty: 'easy', platform: 'hackerrank', platformLink: 'https://www.hackerrank.com/challenges/weather-observation-station-3/problem', sheet: 'hackerrank-sql', tags: ['select', 'distinct', 'mod'], estimatedMinutes: 10 },
  { title: 'Weather Observation Station 4', topic: 'Basic Select', difficulty: 'easy', platform: 'hackerrank', platformLink: 'https://www.hackerrank.com/challenges/weather-observation-station-4/problem', sheet: 'hackerrank-sql', tags: ['count', 'count-distinct', 'difference'], estimatedMinutes: 10 },
  { title: 'Weather Observation Station 5', topic: 'Basic Select', difficulty: 'easy', platform: 'hackerrank', platformLink: 'https://www.hackerrank.com/challenges/weather-observation-station-5/problem', sheet: 'hackerrank-sql', tags: ['length', 'min', 'max', 'order-by', 'limit'], estimatedMinutes: 15 },
  { title: 'Weather Observation Station 6', topic: 'Basic Select', difficulty: 'easy', platform: 'hackerrank', platformLink: 'https://www.hackerrank.com/challenges/weather-observation-station-6/problem', sheet: 'hackerrank-sql', tags: ['where', 'like', 'regexp', 'vowels'], estimatedMinutes: 10 },
  { title: 'Weather Observation Station 7', topic: 'Basic Select', difficulty: 'easy', platform: 'hackerrank', platformLink: 'https://www.hackerrank.com/challenges/weather-observation-station-7/problem', sheet: 'hackerrank-sql', tags: ['where', 'like', 'regexp', 'right'], estimatedMinutes: 10 },
  { title: 'Weather Observation Station 8', topic: 'Basic Select', difficulty: 'easy', platform: 'hackerrank', platformLink: 'https://www.hackerrank.com/challenges/weather-observation-station-8/problem', sheet: 'hackerrank-sql', tags: ['where', 'regexp', 'starts-with', 'ends-with'], estimatedMinutes: 15 },
  { title: 'Weather Observation Station 9', topic: 'Basic Select', difficulty: 'easy', platform: 'hackerrank', platformLink: 'https://www.hackerrank.com/challenges/weather-observation-station-9/problem', sheet: 'hackerrank-sql', tags: ['where', 'not-like', 'regexp'], estimatedMinutes: 10 },
  { title: 'Weather Observation Station 10', topic: 'Basic Select', difficulty: 'easy', platform: 'hackerrank', platformLink: 'https://www.hackerrank.com/challenges/weather-observation-station-10/problem', sheet: 'hackerrank-sql', tags: ['where', 'not-like', 'right', 'regexp'], estimatedMinutes: 10 },
  { title: 'Weather Observation Station 11', topic: 'Basic Select', difficulty: 'easy', platform: 'hackerrank', platformLink: 'https://www.hackerrank.com/challenges/weather-observation-station-11/problem', sheet: 'hackerrank-sql', tags: ['where', 'not-regexp', 'or', 'right', 'left'], estimatedMinutes: 15 },
  { title: 'Weather Observation Station 12', topic: 'Basic Select', difficulty: 'easy', platform: 'hackerrank', platformLink: 'https://www.hackerrank.com/challenges/weather-observation-station-12/problem', sheet: 'hackerrank-sql', tags: ['where', 'regexp', 'not-starts-with', 'not-ends-with'], estimatedMinutes: 15 },
  { title: 'Higher Than 75 Marks', topic: 'Basic Select', difficulty: 'easy', platform: 'hackerrank', platformLink: 'https://www.hackerrank.com/challenges/more-than-75-marks/problem', sheet: 'hackerrank-sql', tags: ['where', 'substr', 'order-by', 'string-functions'], estimatedMinutes: 10 },
  { title: 'Employee Names', topic: 'Basic Select', difficulty: 'easy', platform: 'hackerrank', platformLink: 'https://www.hackerrank.com/challenges/name-of-employees/problem', sheet: 'hackerrank-sql', tags: ['select', 'order-by'], estimatedMinutes: 5 },
  { title: 'Employee Salaries', topic: 'Basic Select', difficulty: 'easy', platform: 'hackerrank', platformLink: 'https://www.hackerrank.com/challenges/salary-of-employees/problem', sheet: 'hackerrank-sql', tags: ['select', 'where', 'order-by', 'and'], estimatedMinutes: 5 },

  // ── Advanced Select (5) ──────────────────────────────────────────────────────
  { title: 'Type of Triangle', topic: 'Advanced Select', difficulty: 'easy', platform: 'hackerrank', platformLink: 'https://www.hackerrank.com/challenges/what-type-of-triangle/problem', sheet: 'hackerrank-sql', tags: ['case-when', 'if', 'conditional'], estimatedMinutes: 15 },
  { title: 'The PADS', topic: 'Advanced Select', difficulty: 'medium', platform: 'hackerrank', platformLink: 'https://www.hackerrank.com/challenges/the-pads/problem', sheet: 'hackerrank-sql', tags: ['concat', 'union-all', 'count', 'order-by'], estimatedMinutes: 20 },
  { title: 'Occupations', topic: 'Advanced Select', difficulty: 'medium', platform: 'hackerrank', platformLink: 'https://www.hackerrank.com/challenges/occupations/problem', sheet: 'hackerrank-sql', tags: ['pivot', 'row-number', 'case', 'group-by'], estimatedMinutes: 30 },
  { title: 'Binary Tree Nodes', topic: 'Advanced Select', difficulty: 'medium', platform: 'hackerrank', platformLink: 'https://www.hackerrank.com/challenges/binary-search-tree-1/problem', sheet: 'hackerrank-sql', tags: ['case', 'self-join', 'in', 'not-in'], estimatedMinutes: 20 },
  { title: 'New Companies', topic: 'Advanced Select', difficulty: 'medium', platform: 'hackerrank', platformLink: 'https://www.hackerrank.com/challenges/the-company/problem', sheet: 'hackerrank-sql', tags: ['count-distinct', 'join', 'group-by', 'order-by'], estimatedMinutes: 25 },

  // ── Aggregation (16) ─────────────────────────────────────────────────────────
  { title: 'Revising Aggregations - The Count Function', topic: 'Aggregation', difficulty: 'easy', platform: 'hackerrank', platformLink: 'https://www.hackerrank.com/challenges/revising-aggregations-the-count-function/problem', sheet: 'hackerrank-sql', tags: ['count', 'where'], estimatedMinutes: 5 },
  { title: 'Revising Aggregations - Averages', topic: 'Aggregation', difficulty: 'easy', platform: 'hackerrank', platformLink: 'https://www.hackerrank.com/challenges/revising-aggregations-the-average-function/problem', sheet: 'hackerrank-sql', tags: ['avg', 'where'], estimatedMinutes: 5 },
  { title: 'Average Population', topic: 'Aggregation', difficulty: 'easy', platform: 'hackerrank', platformLink: 'https://www.hackerrank.com/challenges/average-population/problem', sheet: 'hackerrank-sql', tags: ['avg', 'floor'], estimatedMinutes: 5 },
  { title: 'Japan Population', topic: 'Aggregation', difficulty: 'easy', platform: 'hackerrank', platformLink: 'https://www.hackerrank.com/challenges/japan-population/problem', sheet: 'hackerrank-sql', tags: ['sum', 'where'], estimatedMinutes: 5 },
  { title: 'Population Density Difference', topic: 'Aggregation', difficulty: 'easy', platform: 'hackerrank', platformLink: 'https://www.hackerrank.com/challenges/population-density-difference/problem', sheet: 'hackerrank-sql', tags: ['max', 'min', 'difference'], estimatedMinutes: 5 },
  { title: 'The Blunder', topic: 'Aggregation', difficulty: 'easy', platform: 'hackerrank', platformLink: 'https://www.hackerrank.com/challenges/the-blunder/problem', sheet: 'hackerrank-sql', tags: ['ceil', 'avg', 'replace', 'cast'], estimatedMinutes: 15 },
  { title: 'Top Earners', topic: 'Aggregation', difficulty: 'easy', platform: 'hackerrank', platformLink: 'https://www.hackerrank.com/challenges/earnings-of-employees/problem', sheet: 'hackerrank-sql', tags: ['max', 'count', 'group-by', 'order-by', 'limit'], estimatedMinutes: 15 },
  { title: 'Weather Observation Station 2', topic: 'Aggregation', difficulty: 'easy', platform: 'hackerrank', platformLink: 'https://www.hackerrank.com/challenges/weather-observation-station-2/problem', sheet: 'hackerrank-sql', tags: ['sum', 'round'], estimatedMinutes: 10 },
  { title: 'Weather Observation Station 13', topic: 'Aggregation', difficulty: 'easy', platform: 'hackerrank', platformLink: 'https://www.hackerrank.com/challenges/weather-observation-station-13/problem', sheet: 'hackerrank-sql', tags: ['sum', 'truncate', 'where', 'between'], estimatedMinutes: 10 },
  { title: 'Weather Observation Station 14', topic: 'Aggregation', difficulty: 'easy', platform: 'hackerrank', platformLink: 'https://www.hackerrank.com/challenges/weather-observation-station-14/problem', sheet: 'hackerrank-sql', tags: ['max', 'truncate', 'where'], estimatedMinutes: 10 },
  { title: 'Weather Observation Station 15', topic: 'Aggregation', difficulty: 'easy', platform: 'hackerrank', platformLink: 'https://www.hackerrank.com/challenges/weather-observation-station-15/problem', sheet: 'hackerrank-sql', tags: ['max', 'round', 'subquery', 'order-by'], estimatedMinutes: 15 },
  { title: 'Weather Observation Station 16', topic: 'Aggregation', difficulty: 'easy', platform: 'hackerrank', platformLink: 'https://www.hackerrank.com/challenges/weather-observation-station-16/problem', sheet: 'hackerrank-sql', tags: ['min', 'round', 'where'], estimatedMinutes: 10 },
  { title: 'Weather Observation Station 17', topic: 'Aggregation', difficulty: 'easy', platform: 'hackerrank', platformLink: 'https://www.hackerrank.com/challenges/weather-observation-station-17/problem', sheet: 'hackerrank-sql', tags: ['min', 'round', 'where', 'subquery'], estimatedMinutes: 15 },
  { title: 'Weather Observation Station 18', topic: 'Aggregation', difficulty: 'medium', platform: 'hackerrank', platformLink: 'https://www.hackerrank.com/challenges/weather-observation-station-18/problem', sheet: 'hackerrank-sql', tags: ['max', 'min', 'abs', 'round', 'manhattan-distance'], estimatedMinutes: 20 },
  { title: 'Weather Observation Station 19', topic: 'Aggregation', difficulty: 'medium', platform: 'hackerrank', platformLink: 'https://www.hackerrank.com/challenges/weather-observation-station-19/problem', sheet: 'hackerrank-sql', tags: ['sqrt', 'power', 'max', 'min', 'round', 'euclidean-distance'], estimatedMinutes: 20 },
  { title: 'Weather Observation Station 20', topic: 'Aggregation', difficulty: 'medium', platform: 'hackerrank', platformLink: 'https://www.hackerrank.com/challenges/weather-observation-station-20/problem', sheet: 'hackerrank-sql', tags: ['median', 'row-number', 'count', 'subquery', 'round'], estimatedMinutes: 25 },

  // ── Basic Join (5) ───────────────────────────────────────────────────────────
  { title: 'Population Census', topic: 'Basic Join', difficulty: 'easy', platform: 'hackerrank', platformLink: 'https://www.hackerrank.com/challenges/asian-population/problem', sheet: 'hackerrank-sql', tags: ['inner-join', 'sum', 'where'], estimatedMinutes: 15 },
  { title: 'African Cities', topic: 'Basic Join', difficulty: 'easy', platform: 'hackerrank', platformLink: 'https://www.hackerrank.com/challenges/african-cities/problem', sheet: 'hackerrank-sql', tags: ['inner-join', 'where'], estimatedMinutes: 10 },
  { title: 'Average Population of Each Continent', topic: 'Basic Join', difficulty: 'easy', platform: 'hackerrank', platformLink: 'https://www.hackerrank.com/challenges/average-population-of-each-continent/problem', sheet: 'hackerrank-sql', tags: ['inner-join', 'avg', 'floor', 'group-by'], estimatedMinutes: 15 },
  { title: 'The Report', topic: 'Basic Join', difficulty: 'medium', platform: 'hackerrank', platformLink: 'https://www.hackerrank.com/challenges/the-report/problem', sheet: 'hackerrank-sql', tags: ['join', 'case', 'between', 'order-by'], estimatedMinutes: 25 },
  { title: 'Top Competitors', topic: 'Basic Join', difficulty: 'medium', platform: 'hackerrank', platformLink: 'https://www.hackerrank.com/challenges/full-score/problem', sheet: 'hackerrank-sql', tags: ['join', 'count', 'group-by', 'having', 'order-by'], estimatedMinutes: 25 },

  // ── Advanced Join (5) ────────────────────────────────────────────────────────
  { title: 'Challenges', topic: 'Advanced Join', difficulty: 'medium', platform: 'hackerrank', platformLink: 'https://www.hackerrank.com/challenges/challenges/problem', sheet: 'hackerrank-sql', tags: ['join', 'count', 'group-by', 'having', 'subquery'], estimatedMinutes: 30 },
  { title: 'Contest Leaderboard', topic: 'Advanced Join', difficulty: 'medium', platform: 'hackerrank', platformLink: 'https://www.hackerrank.com/challenges/contest-leaderboard/problem', sheet: 'hackerrank-sql', tags: ['join', 'sum', 'max', 'group-by', 'order-by', 'subquery'], estimatedMinutes: 30 },
  { title: 'SQL Project Planning', topic: 'Advanced Join', difficulty: 'hard', platform: 'hackerrank', platformLink: 'https://www.hackerrank.com/challenges/sql-projects/problem', sheet: 'hackerrank-sql', tags: ['self-join', 'group-by', 'datediff', 'not-in', 'order-by'], estimatedMinutes: 35 },
  { title: 'Placements', topic: 'Advanced Join', difficulty: 'medium', platform: 'hackerrank', platformLink: 'https://www.hackerrank.com/challenges/placements/problem', sheet: 'hackerrank-sql', tags: ['join', 'where', 'order-by', 'multiple-join'], estimatedMinutes: 25 },
  { title: 'Symmetric Pairs', topic: 'Advanced Join', difficulty: 'medium', platform: 'hackerrank', platformLink: 'https://www.hackerrank.com/challenges/symmetric-pairs/problem', sheet: 'hackerrank-sql', tags: ['self-join', 'where', 'group-by', 'having'], estimatedMinutes: 30 },

  // ── Alternative Queries (3) ──────────────────────────────────────────────────
  { title: 'Draw The Triangle 1', topic: 'Alternative Queries', difficulty: 'easy', platform: 'hackerrank', platformLink: 'https://www.hackerrank.com/challenges/draw-the-triangle-1/problem', sheet: 'hackerrank-sql', tags: ['variables', 'repeat', 'loop', 'procedural-sql'], estimatedMinutes: 20 },
  { title: 'Draw The Triangle 2', topic: 'Alternative Queries', difficulty: 'easy', platform: 'hackerrank', platformLink: 'https://www.hackerrank.com/challenges/draw-the-triangle-2/problem', sheet: 'hackerrank-sql', tags: ['variables', 'repeat', 'loop', 'procedural-sql'], estimatedMinutes: 20 },
  { title: 'Print Prime Numbers', topic: 'Alternative Queries', difficulty: 'medium', platform: 'hackerrank', platformLink: 'https://www.hackerrank.com/challenges/print-prime-numbers/problem', sheet: 'hackerrank-sql', tags: ['variables', 'loop', 'modulo', 'group-concat', 'primes'], estimatedMinutes: 30 },
]

// ─── Exported Data ────────────────────────────────────────────────────────────

function buildSqlRows(
  problems_: SqlCodingProblem[],
  prefix: string,
): (typeof problems.$inferInsert)[] {
  return problems_.map((p, i) => ({
    id: `${prefix}-${String(i + 1).padStart(3, '0')}`,
    title: p.title,
    topic: p.topic,
    subtopic: null,
    difficulty: p.difficulty,
    platform: p.platform,
    platformLink: p.platformLink,
    estimatedMinutes: p.estimatedMinutes,
    sheet: p.sheet,
    problemNumber: i + 1,
    tags: JSON.stringify(p.tags),
    questionType: 'sql' as const,
    subject: 'sql' as const,
    content: null,
    contentSource: null,
  }))
}

export const allSqlCodingProblems = [
  ...buildSqlRows(LEETCODE_SQL_50, 'sql-lc'),
  ...buildSqlRows(HACKERRANK_SQL, 'sql-hr'),
]

export { LEETCODE_SQL_50, HACKERRANK_SQL }

// ─── Seeder ───────────────────────────────────────────────────────────────────

export async function seedSqlCoding(d1: D1Database): Promise<number> {
  const db = drizzle(d1)
  const BATCH = 20
  let inserted = 0

  for (let i = 0; i < allSqlCodingProblems.length; i += BATCH) {
    const r = await db
      .insert(problems)
      .values(allSqlCodingProblems.slice(i, i + BATCH))
      .onConflictDoNothing()
    inserted += r.meta?.changes ?? 0
  }

  const lcCount = LEETCODE_SQL_50.length
  const hrCount = HACKERRANK_SQL.length
  console.log(
    `SQL Coding: inserted ${inserted}/${allSqlCodingProblems.length}` +
      ` (LeetCode SQL 50: ${lcCount}, HackerRank: ${hrCount})`,
  )
  return inserted
}
