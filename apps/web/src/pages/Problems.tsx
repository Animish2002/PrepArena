import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import {
  IconSearch,
  IconCircle,
  IconClockHour4,
  IconCircleCheck,
  IconBookmark,
  IconBookmarkFilled,
  IconChevronDown,
  IconChevronUp,
  IconLoader2,
  IconBinaryTree,
  IconDatabase,
  IconCoffee,
  IconCube,
  IconLeaf,
  IconServer,
  IconBulb,
  IconCheck,
} from '@tabler/icons-react'
import { useProgressStore, type Problem, type McqContent } from '../store/progressStore'
import TopicSidebar from '../components/problems/TopicSidebar'
import ProblemDrawer from '../components/problems/ProblemDrawer'
import McqModal from '../components/problems/McqModal'
import TheoryContent from '../components/problems/TheoryContent'
import api from '../lib/api'

// ─── Constants ────────────────────────────────────────────────────────────────

const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'] as const
type Difficulty = (typeof DIFFICULTIES)[number]

const SUBJECTS = [
  { id: 'dsa',           label: 'DSA',          Icon: IconBinaryTree },
  { id: 'sql',           label: 'SQL',           Icon: IconDatabase   },
  { id: 'java',          label: 'Java',          Icon: IconCoffee     },
  { id: 'oops',          label: 'OOPs',          Icon: IconCube       },
  { id: 'spring-boot',   label: 'Spring Boot',   Icon: IconLeaf       },
  { id: 'system-design', label: 'System Design', Icon: IconServer     },
] as const

// question types available per subject (in display order)
const SUBJECT_TYPES: Record<string, { id: string; label: string }[]> = {
  dsa:            [{ id: 'coding',  label: 'Coding'     }],
  sql:            [{ id: 'sql',     label: 'SQL Coding' }, { id: 'theory', label: 'Theory' }],
  java:           [{ id: 'theory',  label: 'Theory'     }, { id: 'mcq',    label: 'MCQ'    }],
  oops:           [{ id: 'theory',  label: 'Theory'     }, { id: 'mcq',    label: 'MCQ'    }],
  'spring-boot':  [{ id: 'theory',  label: 'Theory'     }],
  'system-design':[{ id: 'theory',  label: 'Theory'     }],
}

const DIFF_BADGE: Record<string, string> = {
  easy:   'bg-emerald-500/15 text-emerald-500',
  medium: 'bg-amber-500/15 text-amber-500',
  hard:   'bg-red-500/15 text-red-500',
}

const CONFIDENCE_OPTIONS = [
  { value: 1, emoji: '😕', label: "Didn't get it" },
  { value: 2, emoji: '🤔', label: 'Needs revision' },
  { value: 3, emoji: '👍', label: 'Got it' },
  { value: 4, emoji: '🚀', label: 'Mastered' },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function PlatformBadge({ platform }: { platform?: string | null }) {
  if (!platform) return <span className="text-(--color-text-secondary)">—</span>
  const p = platform.toLowerCase()
  const map: Record<string, { label: string; cls: string }> = {
    leetcode:      { label: 'LC',  cls: 'bg-amber-500/15 text-amber-500'     },
    geeksforgeeks: { label: 'GFG', cls: 'bg-emerald-500/15 text-emerald-600' },
    codingninjas:  { label: 'CN',  cls: 'bg-orange-500/15 text-orange-500'   },
    codeforces:    { label: 'CF',  cls: 'bg-blue-500/15 text-blue-500'       },
    hackerrank:    { label: 'HR',  cls: 'bg-green-500/15 text-green-600'     },
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

function TypeBadge({ type }: { type?: string | null }) {
  const map: Record<string, string> = {
    theory: 'bg-blue-500/15 text-blue-500',
    mcq:    'bg-violet-500/15 text-violet-500',
    sql:    'bg-cyan-500/15 text-cyan-500',
    coding: 'bg-(--color-border) text-(--color-text-secondary)',
  }
  const label: Record<string, string> = {
    theory: 'Theory',
    mcq:    'MCQ',
    sql:    'SQL',
    coding: 'Coding',
  }
  if (!type || type === 'coding') return null
  return (
    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${map[type] ?? ''}`}>
      {label[type] ?? type}
    </span>
  )
}

// Inline theory expansion row
function TheoryExpansion({
  problem,
  onClose,
}: {
  problem: Problem
  onClose: () => void
}) {
  const { markSolved, userProgress } = useProgressStore()
  const [content, setContent] = useState<string | null>(
    typeof problem.content === 'string' ? problem.content : null,
  )
  const [showFull, setShowFull] = useState(false)
  const [selectedConf, setSelectedConf] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [xpGained, setXpGained] = useState<number | null>(null)
  const alreadySolved = userProgress[problem.id]?.status === 'solved'

  useEffect(() => {
    if (content) return
    api
      .get<{ content?: string }>(`/api/problems/${problem.id}`)
      .then((r) => setContent(r.data.content ?? ''))
      .catch(() => {})
  }, [problem.id]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit() {
    if (!selectedConf || submitting) return
    setSubmitting(true)
    try {
      const result = await markSolved(problem.id, {
        confidence: selectedConf,
        duration_seconds: 0,
        started_at: Date.now(),
      })
      setXpGained(result.xp_gained)
      setTimeout(onClose, 1800)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <td colSpan={8} className="px-4 pb-4 pt-0 bg-(--color-surface)">
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        className="border-t border-(--color-border) pt-4 space-y-4"
      >
        {xpGained != null ? (
          <div className="flex items-center justify-center gap-3 py-6">
            <motion.span
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-3xl font-black text-amber-500"
            >
              +{xpGained} XP
            </motion.span>
            <span className="text-lg">🎊</span>
          </div>
        ) : (
          <>
            {/* Content */}
            {content == null ? (
              <div className="flex justify-center py-6">
                <IconLoader2 size={20} className="animate-spin text-(--color-text-secondary)" />
              </div>
            ) : (
              <div
                className={`relative overflow-hidden ${showFull ? '' : 'max-h-80'}`}
              >
                <TheoryContent content={content} />
                {!showFull && content.length > 900 && (
                  <div className="absolute bottom-0 inset-x-0 h-14 bg-linear-to-t from-(--color-surface) to-transparent pointer-events-none" />
                )}
              </div>
            )}

            {content && !showFull && content.length > 900 && (
              <button
                onClick={() => setShowFull(true)}
                className="flex items-center gap-1 text-xs text-(--color-accent) hover:underline"
              >
                Show more <IconChevronDown size={12} />
              </button>
            )}

            {/* Confidence picker */}
            {!alreadySolved && content != null && (
              <div className="space-y-2 pt-2 border-t border-(--color-border)">
                <p className="text-xs font-semibold text-(--color-text-secondary) uppercase tracking-wider flex items-center gap-1.5">
                  <IconBulb size={12} className="text-amber-400" />
                  Rate your understanding
                </p>
                <div className="flex gap-2 flex-wrap">
                  {CONFIDENCE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setSelectedConf(opt.value)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                        selectedConf === opt.value
                          ? 'border-(--color-accent) bg-(--color-accent)/10 text-(--color-accent)'
                          : 'border-(--color-border) bg-(--color-bg) text-(--color-text-secondary) hover:border-(--color-accent)/40'
                      }`}
                    >
                      <span>{opt.emoji}</span>
                      <span>{opt.label}</span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={!selectedConf || submitting}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 text-white text-xs font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting
                    ? <><IconLoader2 size={12} className="animate-spin" /> Saving…</>
                    : <><IconCheck size={12} /> Mark as Understood</>
                  }
                </button>
              </div>
            )}

            {alreadySolved && (
              <div className="flex items-center gap-2 text-xs text-emerald-500 font-medium pt-2 border-t border-(--color-border)">
                <IconCheck size={13} />
                Already understood
              </div>
            )}
          </>
        )}
      </motion.div>
    </td>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function ProblemsPage() {
  const { problems, userProgress, bookmarks, isLoading, fetchProblems, fetchAllProblems, toggleBookmark } =
    useProgressStore()

  const [searchParams, setSearchParams] = useSearchParams()
  const subject = searchParams.get('subject') ?? 'dsa'
  const questionType = searchParams.get('question_type') ?? ''
  const sheet = searchParams.get('sheet') ?? ''

  const [selectedTopic, setSelectedTopic] = useState('All')
  const [difficulty, setDifficulty] = useState<Difficulty>('All')
  const [search, setSearch] = useState('')
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null)
  const [mcqProblem, setMcqProblem] = useState<Problem | null>(null)
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const prevKeyRef = useRef('')

  // Fetch when subject/type/sheet changes
  useEffect(() => {
    const key = `${subject}:${questionType}:${sheet}`
    if (prevKeyRef.current === key) return
    prevKeyRef.current = key
    setSelectedTopic('All')
    setExpandedIds(new Set())

    if (subject === 'dsa' && !questionType && !sheet) {
      fetchAllProblems()
    } else {
      const filters: Record<string, string> = { limit: '500', subject }
      if (questionType) filters.question_type = questionType
      if (sheet) filters.sheet = sheet
      fetchProblems(filters)
    }
  }, [subject, questionType, sheet]) // eslint-disable-line react-hooks/exhaustive-deps

  // Available question types for current subject
  const subjectTypes = SUBJECT_TYPES[subject] ?? []

  // Dynamic topics from current problems list
  const topics = useMemo(() => {
    const t = new Set(problems.map((p) => p.topic))
    return ['All', ...Array.from(t).sort()]
  }, [problems])

  const filtered = useMemo(() => {
    return problems.filter((p) => {
      if (selectedTopic !== 'All' && p.topic !== selectedTopic) return false
      if (difficulty !== 'All' && p.difficulty !== difficulty.toLowerCase()) return false
      if (search) {
        const q = search.toLowerCase()
        if (!p.title.toLowerCase().includes(q) && !p.topic.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [problems, selectedTopic, difficulty, search])

  const solvedCount = problems.filter((p) => userProgress[p.id]?.status === 'solved').length

  function setSubject(s: string) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('subject', s)
      next.delete('question_type')
      next.delete('sheet')
      return next
    })
    setSelectedTopic('All')
  }

  function setQType(qt: string) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (qt) next.set('question_type', qt)
      else next.delete('question_type')
      return next
    })
  }

  function toggleExpand(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function openProblem(p: Problem) {
    if (p.questionType === 'mcq') {
      setMcqProblem(p)
    } else if (p.questionType === 'theory') {
      toggleExpand(p.id)
    } else {
      setSelectedProblem((cur) => (cur?.id === p.id ? null : p))
    }
  }

  // For "Next Question" in McqModal
  const mcqList = useMemo(() => filtered.filter((p) => p.questionType === 'mcq'), [filtered])
  function openNextMcq() {
    if (!mcqProblem) return
    const idx = mcqList.findIndex((p) => p.id === mcqProblem.id)
    const next = mcqList[idx + 1]
    setMcqProblem(next ?? null)
  }

  const showTopicSidebar = subject === 'dsa'
  const showPlatformCol = !questionType || questionType === 'coding' || questionType === 'sql'
  const showTypeCol = !questionType || questionType === 'all'

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Topic sidebar (DSA only, desktop) ─────────────────────────────── */}
      {showTopicSidebar && (
        <TopicSidebar selectedTopic={selectedTopic} onSelectTopic={setSelectedTopic} />
      )}

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* ── Subject tabs ──────────────────────────────────────────────── */}
        <div
          className="shrink-0 flex items-center gap-1 px-4 pt-3 pb-0 overflow-x-auto border-b-0"
          style={{ scrollbarWidth: 'none' }}
        >
          {SUBJECTS.map(({ id, label, Icon }) => {
            const isActive = subject === id
            return (
              <button
                key={id}
                onClick={() => setSubject(id)}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg border border-b-0 transition-colors ${
                  isActive
                    ? 'bg-(--color-surface) border-(--color-border) text-(--color-accent) relative -mb-px z-10'
                    : 'bg-(--color-bg) border-transparent text-(--color-text-secondary) hover:text-(--color-text-primary)'
                }`}
              >
                <Icon size={14} strokeWidth={1.75} />
                {label}
              </button>
            )
          })}
        </div>

        {/* ── Filter bar ────────────────────────────────────────────────── */}
        <div className="shrink-0 border border-(--color-border) bg-(--color-surface)">
          {/* Question type pills */}
          {subjectTypes.length > 1 && (
            <div className="flex gap-2 px-4 pt-3 pb-1">
              <button
                onClick={() => setQType('')}
                className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                  !questionType
                    ? 'bg-(--color-accent) text-white'
                    : 'bg-(--color-bg) text-(--color-text-secondary) border border-(--color-border) hover:border-(--color-accent)/50'
                }`}
              >
                All
              </button>
              {subjectTypes.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setQType(id)}
                  className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                    questionType === id
                      ? 'bg-(--color-accent) text-white'
                      : 'bg-(--color-bg) text-(--color-text-secondary) border border-(--color-border) hover:border-(--color-accent)/50'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Topic pills row */}
          <div
            className="flex gap-2 overflow-x-auto px-4 pt-2 pb-2"
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

          {/* Search + difficulty row */}
          <div className="flex flex-wrap items-center gap-2 px-4 pb-3">
            <div className="relative flex-1 min-w-40">
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

            <span className="text-xs text-(--color-text-secondary) ml-auto shrink-0">
              {isLoading ? (
                'Loading…'
              ) : (
                <>
                  <span className="font-semibold text-(--color-text-primary)">{filtered.length}</span>
                  {' · '}
                  <span className="text-emerald-500 font-semibold">{solvedCount}</span>
                  {' solved'}
                </>
              )}
            </span>
          </div>
        </div>

        {/* ── Table ─────────────────────────────────────────────────────── */}
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
                  {showPlatformCol && (
                    <th className="text-left px-2 py-2.5 text-xs font-semibold text-(--color-text-secondary) hidden lg:table-cell">Platform</th>
                  )}
                  <th className="text-left px-2 py-2.5 text-xs font-semibold text-(--color-text-secondary) hidden lg:table-cell w-16">Est.</th>
                  <th className="text-center px-2 py-2.5 text-xs font-semibold text-(--color-text-secondary) w-10">✓</th>
                  <th className="text-center px-2 py-2.5 text-xs font-semibold text-(--color-text-secondary) w-10">★</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((problem, idx) => {
                  const progress = userProgress[problem.id]
                  const isBookmarked = bookmarks[problem.id] ?? false
                  const isExpanded = expandedIds.has(problem.id)
                  const isDrawerOpen = selectedProblem?.id === problem.id
                  const isMcq = problem.questionType === 'mcq'
                  const isTheory = problem.questionType === 'theory'

                  return (
                    <Fragment key={problem.id}>
                      <tr
                        onClick={() => openProblem(problem)}
                        className={`border-b border-(--color-border) cursor-pointer transition-colors group ${
                          isDrawerOpen || isExpanded
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
                          <div className="flex items-center gap-2 flex-wrap">
                            <span
                              className={`font-medium leading-snug transition-colors ${
                                isDrawerOpen || isExpanded
                                  ? 'text-(--color-accent)'
                                  : 'text-(--color-text-primary) group-hover:text-(--color-accent)'
                              }`}
                            >
                              {problem.title}
                            </span>
                            <TypeBadge type={problem.questionType} />
                            {isTheory && isExpanded
                              ? <IconChevronUp size={12} className="text-(--color-text-secondary)" />
                              : isTheory
                              ? <IconChevronDown size={12} className="text-(--color-text-secondary)" />
                              : null
                            }
                          </div>
                        </td>

                        <td className="px-2 py-3 hidden sm:table-cell">
                          <span
                            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${DIFF_BADGE[problem.difficulty] ?? ''}`}
                          >
                            {problem.difficulty[0].toUpperCase() + problem.difficulty.slice(1)}
                          </span>
                        </td>

                        <td className="px-2 py-3 text-xs text-(--color-text-secondary) hidden md:table-cell max-w-35 truncate">
                          {problem.topic}
                        </td>

                        {showPlatformCol && (
                          <td className="px-2 py-3 hidden lg:table-cell">
                            {isMcq ? (
                              <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-violet-500/15 text-violet-500">MCQ</span>
                            ) : isTheory ? (
                              <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-blue-500/15 text-blue-500">In-App</span>
                            ) : (
                              <PlatformBadge platform={problem.platform} />
                            )}
                          </td>
                        )}

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

                      {/* Inline theory expansion */}
                      <AnimatePresence>
                        {isTheory && isExpanded && (
                          <tr key={`${problem.id}-expanded`} className="bg-(--color-surface)">
                            <TheoryExpansion
                              problem={problem}
                              onClose={() => toggleExpand(problem.id)}
                            />
                          </tr>
                        )}
                      </AnimatePresence>
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Problem drawer (coding/sql only) ──────────────────────────────── */}
      <ProblemDrawer problem={selectedProblem} onClose={() => setSelectedProblem(null)} />

      {/* ── MCQ modal ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {mcqProblem && (
          <McqModal
            key={mcqProblem.id}
            problem={mcqProblem}
            onClose={() => setMcqProblem(null)}
            onNext={mcqList.findIndex((p) => p.id === mcqProblem.id) < mcqList.length - 1 ? openNextMcq : undefined}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
