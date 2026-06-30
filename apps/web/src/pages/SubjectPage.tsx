import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  IconBinaryTree,
  IconDatabase,
  IconCoffee,
  IconCube,
  IconLeaf,
  IconServer,
  IconArrowRight,
  IconCheck,
  IconBookOpen,
  IconCode,
  IconBrain,
} from '@tabler/icons-react'
import { useProgressStore, type Problem } from '../store/progressStore'

// ─── Subject config ───────────────────────────────────────────────────────────

interface SubjectConfig {
  label: string
  description: string
  icon: React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>
  color: string
  recommendedOrder: { type: string; label: string; icon: React.ComponentType<{ size?: number; className?: string }> }[]
}

const SUBJECT_CONFIG: Record<string, SubjectConfig> = {
  dsa: {
    label: 'Data Structures & Algorithms',
    description: 'Master coding problems across arrays, graphs, dynamic programming, and more.',
    icon: IconBinaryTree,
    color: 'text-emerald-500',
    recommendedOrder: [
      { type: 'coding', label: 'Coding Problems', icon: IconCode },
    ],
  },
  sql: {
    label: 'SQL',
    description: 'Practice SQL queries, joins, aggregations, window functions, and theory.',
    icon: IconDatabase,
    color: 'text-cyan-500',
    recommendedOrder: [
      { type: 'theory', label: 'SQL Theory',  icon: IconBookOpen },
      { type: 'sql',    label: 'SQL Coding',  icon: IconCode     },
    ],
  },
  java: {
    label: 'Java',
    description: 'Deep-dive into Java fundamentals, collections, concurrency, and JVM internals.',
    icon: IconCoffee,
    color: 'text-amber-500',
    recommendedOrder: [
      { type: 'theory', label: 'Theory',  icon: IconBookOpen },
      { type: 'mcq',    label: 'MCQ',     icon: IconBrain    },
    ],
  },
  oops: {
    label: 'Object-Oriented Programming',
    description: 'Learn the four pillars, SOLID principles, and all major design patterns.',
    icon: IconCube,
    color: 'text-violet-500',
    recommendedOrder: [
      { type: 'theory', label: 'Theory', icon: IconBookOpen },
      { type: 'mcq',    label: 'MCQ',    icon: IconBrain    },
    ],
  },
  'spring-boot': {
    label: 'Spring Boot',
    description: 'Cover Spring Core, Boot auto-configuration, MVC, Data JPA, and Security.',
    icon: IconLeaf,
    color: 'text-green-500',
    recommendedOrder: [
      { type: 'theory', label: 'Theory', icon: IconBookOpen },
    ],
  },
  'system-design': {
    label: 'System Design',
    description: 'Learn to architect scalable systems — databases, caching, queues, and APIs.',
    icon: IconServer,
    color: 'text-blue-500',
    recommendedOrder: [
      { type: 'theory', label: 'Theory', icon: IconBookOpen },
    ],
  },
}

const TYPE_LABEL: Record<string, string> = {
  coding: 'Coding Problems',
  sql:    'SQL Coding',
  theory: 'Theory',
  mcq:    'MCQ',
}

const TYPE_BADGE: Record<string, string> = {
  coding: 'bg-emerald-500/15 text-emerald-500',
  sql:    'bg-cyan-500/15 text-cyan-500',
  theory: 'bg-blue-500/15 text-blue-500',
  mcq:    'bg-violet-500/15 text-violet-500',
}

// ─── Main page ────────────────────────────────────────────────────────────────

interface SheetGroup {
  sheet: string
  total: number
  solved: number
  questionType: string
}

export default function SubjectPage() {
  const { subject = 'dsa' } = useParams<{ subject: string }>()
  const navigate = useNavigate()
  const { fetchProblems, userProgress, isLoading } = useProgressStore()
  const [problems, setProblems] = useState<Problem[]>([])

  const config = SUBJECT_CONFIG[subject]

  useEffect(() => {
    fetchProblems({ subject, limit: '500' }).then(() => {
      // Grab from store after fetch
    })
  }, [subject]) // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch directly to keep SubjectPage independent of shared problems array
  useEffect(() => {
    setProblems([])
    import('../lib/api').then(({ default: api }) => {
      api
        .get<{ problems: Problem[] }>(`/api/problems?subject=${subject}&limit=500`)
        .then((r) => setProblems(r.data.problems))
        .catch(() => {})
    })
  }, [subject])

  // Group by sheet
  const sheets = useMemo<SheetGroup[]>(() => {
    const map = new Map<string, { total: number; solved: number; type: string }>()
    for (const p of problems) {
      const key = p.sheet ?? 'unknown'
      const existing = map.get(key) ?? { total: 0, solved: 0, type: p.questionType ?? 'coding' }
      existing.total++
      if (userProgress[p.id]?.status === 'solved') existing.solved++
      map.set(key, existing)
    }
    return Array.from(map.entries()).map(([sheet, { total, solved, type }]) => ({
      sheet,
      total,
      solved,
      questionType: type,
    }))
  }, [problems, userProgress])

  const totalSolved = sheets.reduce((s, sh) => s + sh.solved, 0)
  const totalProblems = sheets.reduce((s, sh) => s + sh.total, 0)

  if (!config) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-(--color-text-secondary)">Subject not found</p>
      </div>
    )
  }

  const SubjectIcon = config.icon

  function startSheet(sheet: string, type: string) {
    navigate(`/problems?subject=${subject}&question_type=${type}&sheet=${encodeURIComponent(sheet)}`)
  }

  function startAll(type: string) {
    navigate(`/problems?subject=${subject}&question_type=${type}`)
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-3xl mx-auto w-full space-y-8">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-2xl bg-(--color-bg) border border-(--color-border) ${config.color}`}>
          <SubjectIcon size={32} strokeWidth={1.5} />
        </div>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-(--color-text-primary)">{config.label}</h1>
          <p className="text-sm text-(--color-text-secondary) mt-1 leading-relaxed">
            {config.description}
          </p>
          {totalProblems > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 max-w-48 h-1.5 rounded-full bg-(--color-cell-empty)">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                  style={{ width: `${totalProblems > 0 ? (totalSolved / totalProblems) * 100 : 0}%` }}
                />
              </div>
              <span className="text-xs text-(--color-text-secondary)">
                {totalSolved}/{totalProblems} solved
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Recommended path ──────────────────────────────────────────────── */}
      {config.recommendedOrder.length > 1 && (
        <div className="p-4 rounded-2xl bg-(--color-bg) border border-(--color-border) space-y-2">
          <p className="text-xs font-semibold text-(--color-text-secondary) uppercase tracking-wider">
            Suggested learning path
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            {config.recommendedOrder.map(({ type, label, icon: Icon }, i) => (
              <div key={type} className="flex items-center gap-2">
                <button
                  onClick={() => startAll(type)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-(--color-surface) border border-(--color-border) text-xs font-medium text-(--color-text-primary) hover:border-(--color-accent)/50 hover:text-(--color-accent) transition-colors"
                >
                  <Icon size={13} />
                  {i + 1}. {label}
                </button>
                {i < config.recommendedOrder.length - 1 && (
                  <IconArrowRight size={12} className="text-(--color-text-secondary) shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Sheet cards ───────────────────────────────────────────────────── */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-(--color-text-primary)">Available sheets</h2>

        {isLoading && problems.length === 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 rounded-2xl bg-(--color-bg) border border-(--color-border) animate-pulse" />
            ))}
          </div>
        ) : sheets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-(--color-text-secondary)">
            <p className="text-sm">No content available yet for this subject.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {sheets.map(({ sheet, total, solved, questionType }) => {
              const pct = total > 0 ? Math.round((solved / total) * 100) : 0
              const isDone = pct === 100

              return (
                <div
                  key={sheet}
                  className="group p-4 rounded-2xl bg-(--color-bg) border border-(--color-border) hover:border-(--color-accent)/40 transition-colors space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-(--color-text-primary) truncate capitalize">
                        {sheet.replace(/-/g, ' ')}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span
                          className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${TYPE_BADGE[questionType] ?? ''}`}
                        >
                          {TYPE_LABEL[questionType] ?? questionType}
                        </span>
                        <span className="text-xs text-(--color-text-secondary)">
                          {total} problems
                        </span>
                      </div>
                    </div>
                    {isDone ? (
                      <span className="shrink-0 flex items-center gap-1 text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">
                        <IconCheck size={12} />
                        Done
                      </span>
                    ) : (
                      <button
                        onClick={() => startSheet(sheet, questionType)}
                        className="shrink-0 flex items-center gap-1 text-xs font-semibold text-white bg-(--color-accent) px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
                      >
                        Start
                        <IconArrowRight size={12} />
                      </button>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-(--color-text-secondary)">{solved}/{total} solved</span>
                      <span className="text-xs font-semibold text-(--color-text-primary)">{pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-(--color-cell-empty)">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          isDone ? 'bg-emerald-500' : 'bg-(--color-accent)'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
