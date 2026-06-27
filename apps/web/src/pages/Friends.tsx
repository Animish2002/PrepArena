import { useCallback, useEffect, useRef, useState } from 'react'
import {
  IconUserPlus,
  IconUsers,
  IconCopy,
  IconCheck,
  IconBrandWhatsapp,
  IconSearch,
  IconFlame,
  IconBolt,
  IconLoader2,
} from '@tabler/icons-react'
import api from '../lib/api'
import FriendProgressModal from '../components/friends/FriendProgressModal'

interface Friend {
  id: string
  name: string
  username: string
  avatarUrl?: string | null
  totalXp: number
  weeklyXp: number
  problemsSolvedThisWeek: number
  currentStreak: number
}

interface SearchUser {
  id: string
  name: string
  username: string
  avatarUrl?: string | null
}

type Tab = 'friends' | 'add'

function InitialAvatar({ name, size = 40 }: { name: string; size?: number }) {
  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      className="rounded-full bg-(--color-accent)/15 flex items-center justify-center text-(--color-accent) font-bold shrink-0 select-none"
    >
      {name?.[0]?.toUpperCase() ?? '?'}
    </div>
  )
}

export default function FriendsPage() {
  const [tab, setTab] = useState<Tab>('friends')
  const [friends, setFriends] = useState<Friend[]>([])
  const [loadingFriends, setLoadingFriends] = useState(true)
  const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null)

  // Invite state
  const [inviteLink, setInviteLink] = useState('')
  const [generatingLink, setGeneratingLink] = useState(false)
  const [copied, setCopied] = useState(false)

  // Search state
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchUser[]>([])
  const [searching, setSearching] = useState(false)
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())
  const [addingId, setAddingId] = useState<string | null>(null)
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    setLoadingFriends(true)
    api
      .get<{ friends: Friend[] }>('/api/friends')
      .then((r) => setFriends(r.data.friends))
      .catch(() => {})
      .finally(() => setLoadingFriends(false))
  }, [])

  async function generateInviteLink() {
    setGeneratingLink(true)
    try {
      const { data } = await api.post<{ invite_link: string }>('/api/friends/invite')
      setInviteLink(data.invite_link)
    } finally {
      setGeneratingLink(false)
    }
  }

  async function copyLink() {
    if (!inviteLink) return
    await navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q)
    clearTimeout(searchTimeout.current)
    if (q.trim().length < 2) {
      setSearchResults([])
      return
    }
    setSearching(true)
    searchTimeout.current = setTimeout(() => {
      api
        .get<{ users: SearchUser[] }>(`/api/friends/search?q=${encodeURIComponent(q.trim())}`)
        .then((r) => setSearchResults(r.data.users))
        .catch(() => {})
        .finally(() => setSearching(false))
    }, 350)
  }, [])

  async function addFriend(userId: string) {
    setAddingId(userId)
    try {
      await api.post(`/api/friends/request/${userId}`)
      setAddedIds((prev) => new Set([...prev, userId]))
    } catch {
      // May already be friends or pending — treat as added
      setAddedIds((prev) => new Set([...prev, userId]))
    } finally {
      setAddingId(null)
    }
  }

  const waText = encodeURIComponent(
    `Hey! Join me on PrepArena and let's practice DSA together 🚀 ${inviteLink}`,
  )

  return (
    <div className="max-w-4xl space-y-6">
      {/* ── Tab bar ──────────────────────────────────────────────────────────── */}
      <div className="flex gap-1 bg-(--color-surface) border border-(--color-border) rounded-xl p-1 w-fit">
        <TabButton active={tab === 'friends'} onClick={() => setTab('friends')}>
          <IconUsers size={15} />
          My Friends
          {friends.length > 0 && (
            <span className="bg-(--color-accent)/15 text-(--color-accent) text-xs px-1.5 py-0.5 rounded-full font-semibold">
              {friends.length}
            </span>
          )}
        </TabButton>
        <TabButton active={tab === 'add'} onClick={() => setTab('add')}>
          <IconUserPlus size={15} />
          Add Friends
        </TabButton>
      </div>

      {/* ── My Friends ───────────────────────────────────────────────────────── */}
      {tab === 'friends' && (
        <>
          {loadingFriends ? (
            <div className="flex items-center justify-center py-20">
              <IconLoader2 size={24} className="animate-spin text-(--color-text-secondary)" />
            </div>
          ) : friends.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <p className="text-(--color-text-primary) font-semibold">No friends yet</p>
              <p className="text-sm text-(--color-text-secondary)">
                Switch to "Add Friends" to invite someone
              </p>
              <button
                onClick={() => setTab('add')}
                className="mt-2 px-4 py-2 rounded-xl bg-(--color-accent) text-white text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                Add Friends
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {friends.map((friend) => (
                <FriendCard
                  key={friend.id}
                  friend={friend}
                  onViewProgress={() => setSelectedFriend(friend)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Add Friends ──────────────────────────────────────────────────────── */}
      {tab === 'add' && (
        <div className="space-y-8">
          {/* Invite section */}
          <div className="bg-(--color-surface) border border-(--color-border) rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-(--color-text-primary) mb-1">
              Invite via Link
            </h2>
            <p className="text-sm text-(--color-text-secondary) mb-4">
              Generate a one-time invite link (valid 7 days) and share it with a friend.
            </p>

            {!inviteLink ? (
              <button
                onClick={generateInviteLink}
                disabled={generatingLink}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-(--color-accent) text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {generatingLink ? (
                  <IconLoader2 size={16} className="animate-spin" />
                ) : (
                  <IconUserPlus size={16} />
                )}
                {generatingLink ? 'Generating…' : 'Generate Invite Link'}
              </button>
            ) : (
              <div className="space-y-3">
                {/* Link display */}
                <div className="flex items-center gap-2 p-3 bg-(--color-bg) border border-(--color-border) rounded-xl">
                  <p className="flex-1 text-xs text-(--color-text-secondary) truncate font-mono select-all">
                    {inviteLink}
                  </p>
                  <button
                    onClick={copyLink}
                    className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors bg-(--color-accent)/10 text-(--color-accent) hover:bg-(--color-accent)/20"
                  >
                    {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>

                {/* Share buttons */}
                <div className="flex gap-2">
                  <a
                    href={`https://wa.me/?text=${waText}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 text-sm font-semibold hover:bg-green-500/20 transition-colors"
                  >
                    <IconBrandWhatsapp size={16} />
                    Share on WhatsApp
                  </a>
                  <button
                    onClick={generateInviteLink}
                    className="px-3 py-2 rounded-lg border border-(--color-border) text-(--color-text-secondary) text-sm hover:bg-(--color-bg) transition-colors"
                  >
                    New link
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Search section */}
          <div className="bg-(--color-surface) border border-(--color-border) rounded-2xl p-5">
            <h2 className="text-sm font-semibold text-(--color-text-primary) mb-1">
              Find by Username
            </h2>
            <p className="text-sm text-(--color-text-secondary) mb-4">
              Search for PrepArena users by their username and send a friend request.
            </p>

            <div className="relative mb-4">
              <IconSearch
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-(--color-text-secondary)"
              />
              {searching && (
                <IconLoader2
                  size={14}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-(--color-text-secondary) animate-spin"
                />
              )}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search username…"
                className="w-full pl-9 pr-9 py-2 text-sm rounded-xl border border-(--color-border) bg-(--color-bg) text-(--color-text-primary) placeholder:text-(--color-text-secondary)/60 focus:outline-none focus:ring-2 focus:ring-(--color-accent)/40 transition-shadow"
              />
            </div>

            {searchResults.length > 0 && (
              <div className="space-y-2">
                {searchResults.map((user) => {
                  const isAdded = addedIds.has(user.id)
                  const isAdding = addingId === user.id
                  return (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 p-3 rounded-xl border border-(--color-border) bg-(--color-bg)"
                    >
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          className="w-9 h-9 rounded-full object-cover shrink-0"
                        />
                      ) : (
                        <InitialAvatar name={user.name} size={36} />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-(--color-text-primary) truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-(--color-text-secondary)">@{user.username}</p>
                      </div>
                      <button
                        onClick={() => addFriend(user.id)}
                        disabled={isAdded || isAdding}
                        className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          isAdded
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : 'bg-(--color-accent)/10 text-(--color-accent) hover:bg-(--color-accent)/20'
                        } disabled:opacity-60`}
                      >
                        {isAdding ? (
                          <IconLoader2 size={12} className="animate-spin" />
                        ) : isAdded ? (
                          <IconCheck size={12} />
                        ) : (
                          <IconUserPlus size={12} />
                        )}
                        {isAdded ? 'Requested' : 'Add Friend'}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}

            {searchQuery.trim().length >= 2 && !searching && searchResults.length === 0 && (
              <p className="text-sm text-(--color-text-secondary) text-center py-6">
                No users found for "{searchQuery}"
              </p>
            )}
          </div>
        </div>
      )}

      {/* Friend progress modal */}
      <FriendProgressModal friend={selectedFriend} onClose={() => setSelectedFriend(null)} />
    </div>
  )
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
        active
          ? 'bg-(--color-accent) text-white shadow-sm'
          : 'text-(--color-text-secondary) hover:text-(--color-text-primary)'
      }`}
    >
      {children}
    </button>
  )
}

function FriendCard({
  friend,
  onViewProgress,
}: {
  friend: Friend
  onViewProgress: () => void
}) {
  return (
    <div className="bg-(--color-surface) border border-(--color-border) rounded-2xl p-4 flex flex-col gap-4 hover:border-(--color-accent)/40 transition-colors">
      {/* Avatar + identity */}
      <div className="flex items-center gap-3">
        {friend.avatarUrl ? (
          <img
            src={friend.avatarUrl}
            alt={friend.name}
            className="w-10 h-10 rounded-full object-cover shrink-0"
          />
        ) : (
          <div
            style={{ width: 40, height: 40, fontSize: 40 * 0.38 }}
            className="rounded-full bg-(--color-accent)/15 flex items-center justify-center text-(--color-accent) font-bold shrink-0"
          >
            {friend.name?.[0]?.toUpperCase() ?? '?'}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-(--color-text-primary) truncate">{friend.name}</p>
          <p className="text-xs text-(--color-text-secondary) truncate">@{friend.username}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2">
        <MiniStat
          icon={<IconBolt size={12} className="text-amber-500" />}
          label="Wk XP"
          value={friend.weeklyXp.toLocaleString()}
        />
        <MiniStat
          icon={<IconFlame size={12} className="text-orange-500" />}
          label="Streak"
          value={`${friend.currentStreak}d`}
        />
        <MiniStat
          icon={<IconCheck size={12} className="text-emerald-500" />}
          label="This wk"
          value={String(friend.problemsSolvedThisWeek)}
        />
      </div>

      {/* Action */}
      <button
        onClick={onViewProgress}
        className="w-full py-2 rounded-xl text-xs font-semibold border border-(--color-border) text-(--color-text-secondary) hover:border-(--color-accent)/50 hover:text-(--color-accent) transition-colors"
      >
        View Progress
      </button>
    </div>
  )
}

function MiniStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex flex-col items-center gap-0.5 bg-(--color-bg) rounded-lg py-2">
      {icon}
      <p className="text-xs font-bold text-(--color-text-primary) tabular-nums">{value}</p>
      <p className="text-xs text-(--color-text-secondary)">{label}</p>
    </div>
  )
}

