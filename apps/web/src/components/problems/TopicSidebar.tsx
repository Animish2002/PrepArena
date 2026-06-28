import { useMemo } from 'react'
import { useProgressStore } from '../../store/progressStore'

interface TopicSidebarProps {
  selectedTopic: string
  onSelectTopic: (topic: string) => void
}

export default function TopicSidebar({ selectedTopic, onSelectTopic }: TopicSidebarProps) {
  const { problems, userProgress } = useProgressStore()

  const topicStats = useMemo(() => {
    const map: Record<string, { total: number; solved: number }> = {}
    for (const p of problems) {
      if (!map[p.topic]) map[p.topic] = { total: 0, solved: 0 }
      map[p.topic].total++
      if (userProgress[p.id]?.status === 'solved') map[p.topic].solved++
    }
    return Object.entries(map)
      .map(([topic, { total, solved }]) => ({ topic, total, solved }))
      .sort((a, b) => a.topic.localeCompare(b.topic))
  }, [problems, userProgress])

  const totalSolved = Object.values(userProgress).filter((p) => p.status === 'solved').length

  return (
    <aside className="hidden lg:flex flex-col w-52 flex-shrink-0 border-r border-(--color-border) overflow-y-auto bg-(--color-surface)">
      {/* All problems row */}
      <button
        onClick={() => onSelectTopic('All')}
        className={`flex items-center justify-between px-4 py-3 text-sm font-semibold border-b border-(--color-border) transition-colors ${
          selectedTopic === 'All'
            ? 'bg-(--color-accent)/10 text-(--color-accent)'
            : 'text-(--color-text-primary) hover:bg-(--color-bg)'
        }`}
      >
        <span>All Topics</span>
        <span className="text-xs font-normal text-(--color-text-secondary) tabular-nums">
          {totalSolved}/{problems.length}
        </span>
      </button>

      {/* Per-topic rows */}
      <div className="flex-1 py-1">
        {topicStats.map(({ topic, total, solved }) => {
          const pct = total > 0 ? (solved / total) * 100 : 0
          const isActive = selectedTopic === topic
          return (
            <button
              key={topic}
              onClick={() => onSelectTopic(topic)}
              className={`w-full flex flex-col gap-1.5 px-4 py-2.5 text-left transition-colors ${
                isActive
                  ? 'bg-(--color-accent)/10 text-(--color-accent)'
                  : 'text-(--color-text-primary) hover:bg-(--color-bg)'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium leading-tight truncate pr-1">{topic}</span>
                <span className="text-xs text-(--color-text-secondary) tabular-nums shrink-0">
                  {solved}/{total}
                </span>
              </div>
              <div className="h-1 rounded-full bg-(--color-cell-empty)">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isActive ? 'bg-(--color-accent)' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </button>
          )
        })}
      </div>
    </aside>
  )
}
