import { useEffect, useMemo, useRef, useState } from 'react'
import {
  IconSearch,
  IconCircle,
  IconClockHour4,
  IconCircleCheck,
  IconBookmark,
  IconBookmarkFilled,
  IconChevronDown,
} from '@tabler/icons-react'
import { useProgressStore, type Problem } from '../store/progressStore'
import TopicSidebar from '../components/problems/TopicSidebar'
import ProblemDrawer from '../components/problems/ProblemDrawer'

const DIFF_BADGE: Record<string, string> = {
  easy: 'bg-emerald-500/15 text-emerald-500',
  medium: 'bg-amber-500/15 text-amber-500',
  hard: 'bg-red-500/15 text-red-500',
}

const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'] as const
type Difficulty = (typeof DIFFICULTIES)[number]

function PlatformBadge({ platform }: { platform?: string | null }) {
  if (!platform) return <span className="text-(--color-text-secondary)">—</span>
  const p = platform.toLowerCase()
  const map: Record<string, { label: string; cls: string }> = {
    leetcode: { label: 'LC', cls: 'bg-amber-500/15 text-amber-500' },
    geeksforgeeks: { label: 'GFG', cls: 'bg-emerald-500/15 text-emerald-600' },
    codingninjas: { label: 'CN', cls: 'bg-orange-500/15 text-orange-500' },
    codeforces: { label: 'CF', cls: 'bg-blue-500/15 text-blue-500' },
    hackerrank: { label: 'HR', cls: 'bg-green-500/15 text-green-600' },
  }
  const info = map[p] ?? {
    label: platform.slice(0, 2).toUpperCase(),
    cls: 'bg-(--color-border) text-(--color-text-secondary)',
  }
  return (
    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${info.cls}`}>{info.label}</span>
  )
}

function StatusIcon({ status }: { status?: string | null }) {
  if (status === 'solved')
    return <IconCircleCheck size={16} className="text-emerald-500 shrink-0" />
  if (status === 'attempted')
    return <IconClockHour4 size={16} className="text-amber-500 shrink-0" />
  return <IconCircle size={16} className="text-(--color-border) shrink-0" />
}

export default function ProblemsPage() {
  const { problems, userProgress, bookmarks, isLoading, allLoaded, fetchAllProblems, toggleBookmark } =
    useProgressStore()

  const [selectedTopic, setSelectedTopic] = useState('All')
  const [difficulty, setDifficulty] = useState<Difficulty>('All')
  const [search, setSearch] = useState('')
  const [platform, setPlatform] = useState('')
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null)

  const topicPillsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!allLoaded) fetchAllProblems()
  }, [allLoaded, fetchAllProblems])

  const topics = useMemo(() => {
    const t = new Set(problems.map((p) => p.topic))
    return ['All', ...Array.from(t).sort()]
  }, [problems])

  const platforms = useMemo(() => {
    const s = new Set(problems.map((p) => p.platform).filter(Boolean) as string[])
    return Array.from(s).sort()
  }, [problems])

  const filtered = useMemo(() => {
    return problems.filter((p) => {
      if (selectedTopic !== 'All' && p.topic !== selectedTopic) return false
      if (difficulty !== 'All' && p.difficulty !== difficulty.toLowerCase()) return false
      if (search) {
        const q = search.toLowerCase()
        if (!p.title.toLowerCase().includes(q) && !p.topic.toLowerCase().includes(q)) return false
      }
      if (platform && p.platform?.toLowerCase() !== platform.toLowerCase()) return false
      return true
    })
  }, [problems, selectedTopic, difficulty, search, platform])

  const solvedCount = problems.filter((p) => userProgress[p.id]?.status === 'solved').length

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Left sidebar (desktop) ──────────────────────────────────────────── */}
      <TopicSidebar selectedTopic={selectedTopic} onSelectTopic={setSelectedTopic} />

      {/* ── Main content ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* ── Filter bar ──────────────────────────────────────────────────── */}
        <div className="shrink-0 border-b border-(--color-border) bg-(--color-surface)">
          {/* Topic pills row */}
          <div
            ref={topicPillsRef}
            className="flex gap-2 overflow-x-auto px-4 pt-3 pb-2"
            style={{ scrollbarWidth: 'none' }}
          >
            {topics.map((topic) => (
              <button
                key={topic}
                onClick={() => setSelectedTopic(topic)}
                className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-colors whitespace-nowrap ${
                  selectedTopic === topic
                    ? 'bg-(--color-accent) text-white'
                    : 'bg-(--color-bg) text-(--color-text-secondary) border border-(--color-border) hover:border-(--color-accent)/50 hover:text-(--color-text-primary)'
                }`}
              >
                {topic}
              </button>
            ))}
          </div>

          {/* Search + difficulty + platform row */}
          <div className="flex flex-wrap items-center gap-2 px-4 pb-3">
            <div className="relative flex-1 min-w-[160px]">
              <IconSearch
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-(--color-text-secondary)"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search problems…"
                className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border border-(--color-border) bg-(--color-bg) text-(--color-text-primary) placeholder:text-(--color-text-secondary)/60 focus:outline-none focus:ring-2 focus:ring-(--color-accent)/40 transition-shadow"
              />
            </div>

            <div className="flex bg-(--color-bg) border border-(--color-border) rounded-lg p-0.5 gap-0.5">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                    difficulty === d
                      ? 'bg-(--color-accent) text-white shadow-sm'
                      : 'text-(--color-text-secondary) hover:text-(--color-text-primary)'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>

            {platforms.length > 0 && (
              <div className="relative">
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value)}
                  className="appearance-none pl-3 pr-7 py-1.5 text-xs rounded-lg border border-(--color-border) bg-(--color-bg) text-(--color-text-primary) focus:outline-none focus:ring-2 focus:ring-(--color-accent)/40 cursor-pointer"
                >
                  <option value="">All Platforms</option>
                  {platforms.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
                <IconChevronDown
                  size={12}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-(--color-text-secondary) pointer-events-none"
                />
              </div>
            )}

            <span className="text-xs text-(--color-text-secondary) ml-auto shrink-0">
              {isLoading ? (
                'Loading…'
              ) : (
                <>
                  <span className="font-semibold text-(--color-text-primary)">{filtered.length}</span>
                  {' problems · '}
                  <span className="text-emerald-500 font-semibold">{solvedCount}</span>
                  {' solved'}
                </>
              )}
            </span>
          </div>
        </div>

        {/* ── Problems table ───────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-2 border-(--color-accent) border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-2">
              <p className="text-(--color-text-primary) font-medium">No problems found</p>
              <p className="text-sm text-(--color-text-secondary)">Try adjusting your filters</p>
            </div>
          ) : (
            <table className="w-full text-sm border-collapse">
              <thead className="sticky top-0 z-10 bg-(--color-surface) border-b border-(--color-border)">
                <tr>
                  <th className="text-left px-4 py-2.5 text-xs font-semibold text-(--color-text-secondary) w-10">#</th>
                  <th className="text-left px-2 py-2.5 text-xs font-semibold text-(--color-text-secondary)">Title</th>
                  <th className="text-left px-2 py-2.5 text-xs font-semibold text-(--color-text-secondary) hidden sm:table-cell">Difficulty</th>
                  <th className="text-left px-2 py-2.5 text-xs font-semibold text-(--color-text-secondary) hidden md:table-cell">Topic</th>
                  <th className="text-left px-2 py-2.5 text-xs font-semibold text-(--color-text-secondary) hidden lg:table-cell">Platform</th>
                  <th className="text-left px-2 py-2.5 text-xs font-semibold text-(--color-text-secondary) hidden lg:table-cell w-16">Est.</th>
                  <th className="text-center px-2 py-2.5 text-xs font-semibold text-(--color-text-secondary) w-10">✓</th>
                  <th className="text-center px-2 py-2.5 text-xs font-semibold text-(--color-text-secondary) w-10">★</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((problem, idx) => {
                  const progress = userProgress[problem.id]
                  const isBookmarked = bookmarks[problem.id] ?? false
                  const isSelected = selectedProblem?.id === problem.id
                  return (
                    <tr
                      key={problem.id}
                      onClick={() => setSelectedProblem(isSelected ? null : problem)}
                      className={`border-b border-(--color-border) cursor-pointer transition-colors group ${
                        isSelected
                          ? 'bg-(--color-accent)/8'
                          : progress?.status === 'solved'
                          ? 'hover:bg-(--color-bg) opacity-80'
                          : 'hover:bg-(--color-bg)'
                      }`}
                    >
                      <td className="px-4 py-3 text-xs text-(--color-text-secondary) tabular-nums">
                        {problem.problemNumber ?? idx + 1}
                      </td>

                      <td className="px-2 py-3">
                        <span
                          className={`font-medium leading-snug transition-colors ${
                            isSelected
                              ? 'text-(--color-accent)'
                              : 'text-(--color-text-primary) group-hover:text-(--color-accent)'
                          }`}
                        >
                          {problem.title}
                        </span>
                        <span
                          className={`sm:hidden ml-2 text-xs font-semibold px-1.5 py-0.5 rounded-full ${DIFF_BADGE[problem.difficulty] ?? ''}`}
                        >
                          {problem.difficulty[0].toUpperCase()}
                        </span>
                      </td>

                      <td className="px-2 py-3 hidden sm:table-cell">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${DIFF_BADGE[problem.difficulty] ?? ''}`}
                        >
                          {problem.difficulty[0].toUpperCase() + problem.difficulty.slice(1)}
                        </span>
                      </td>

                      <td className="px-2 py-3 text-xs text-(--color-text-secondary) hidden md:table-cell max-w-[140px] truncate">
                        {problem.topic}
                      </td>

                      <td className="px-2 py-3 hidden lg:table-cell">
                        <PlatformBadge platform={problem.platform} />
                      </td>

                      <td className="px-2 py-3 text-xs text-(--color-text-secondary) hidden lg:table-cell tabular-nums">
                        {problem.estimatedMinutes ? `${problem.estimatedMinutes}m` : '—'}
                      </td>

                      <td className="px-2 py-3 text-center">
                        <div className="flex justify-center">
                          <StatusIcon status={progress?.status} />
                        </div>
                      </td>

                      <td className="px-2 py-3 text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleBookmark(problem.id)
                          }}
                          className="p-1 rounded hover:bg-(--color-accent)/10 transition-colors"
                          aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark'}
                        >
                          {isBookmarked ? (
                            <IconBookmarkFilled size={14} className="text-(--color-accent)" />
                          ) : (
                            <IconBookmark size={14} className="text-(--color-border) group-hover:text-(--color-text-secondary) transition-colors" />
                          )}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Problem drawer ───────────────────────────────────────────────────── */}
      <ProblemDrawer problem={selectedProblem} onClose={() => setSelectedProblem(null)} />
    </div>
  )
}
