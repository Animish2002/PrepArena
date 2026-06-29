import { useCallback, useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
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
  IconUserCheck,
  IconX,
} from '@tabler/icons-react'
import api from '../lib/api'
import FriendProgressModal from '../components/friends/FriendProgressModal'
import { useFriendStore, type PendingRequest } from '../store/friendStore'
import { useFeedStore } from '../store/feedStore'

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
  is_friend: boolean
  pending_request: boolean
}

type Tab = 'friends' | 'add' | 'requests'

function Avatar({ name, avatarUrl, size = 40 }: { name: string; avatarUrl?: string | null; size?: number }) {
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        style={{ width: size, height: size }}
        className="rounded-full object-cover shrink-0"
      />
    )
  }
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
  const [searchParams] = useSearchParams()
  const initTab = (searchParams.get('tab') as Tab) ?? 'friends'
  const [tab, setTab] = useState<Tab>(initTab)

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
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  // Pending requests
  const { pendingRequests, pendingCount, setPendingRequests, removePendingRequest } = useFriendStore()
  const [loadingPending, setLoadingPending] = useState(false)
  const [actioningId, setActioningId] = useState<string | null>(null)
  const addToast = useFeedStore((s) => s.addToast)

  useEffect(() => {
    setLoadingFriends(true)
    api
      .get<{ friends: Friend[] }>('/api/friends')
      .then((r) => setFriends(r.data.friends))
      .catch(() => {})
      .finally(() => setLoadingFriends(false))
  }, [])

  useEffect(() => {
    if (tab !== 'requests') return
    setLoadingPending(true)
    api
      .get<{ requests: PendingRequest[] }>('/api/friends/pending')
      .then((r) => setPendingRequests(r.data.requests))
      .catch(() => {})
      .finally(() => setLoadingPending(false))
  }, [tab, setPendingRequests])

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
      setAddedIds((prev) => new Set([...prev, userId]))
    } finally {
      setAddingId(null)
    }
  }

  async function acceptRequest(friendshipId: string) {
    setActioningId(friendshipId)
    try {
      await api.post(`/api/friends/accept/${friendshipId}`)
      removePendingRequest(friendshipId)
      addToast('Friend request accepted!', 'success')
      // Refresh friends list
      api.get<{ friends: Friend[] }>('/api/friends').then((r) => setFriends(r.data.friends)).catch(() => {})
    } catch {
      addToast('Failed to accept request', 'info')
    } finally {
      setActioningId(null)
    }
  }

  async function declineRequest(friendshipId: string) {
    setActioningId(friendshipId)
    try {
      await api.post(`/api/friends/decline/${friendshipId}`)
      removePendingRequest(friendshipId)
    } catch {
      addToast('Failed to decline request', 'info')
    } finally {
      setActioningId(null)
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
        <TabButton active={tab === 'requests'} onClick={() => setTab('requests')}>
          <IconUserCheck size={15} />
          Requests
          {pendingCount > 0 && (
            <span className="bg-red-500/15 text-red-500 text-xs px-1.5 py-0.5 rounded-full font-semibold">
              {pendingCount}
            </span>
          )}
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

      {/* ── Requests ─────────────────────────────────────────────────────────── */}
      {tab === 'requests' && (
        <div className="space-y-3">
          {loadingPending ? (
            <div className="flex items-center justify-center py-20">
              <IconLoader2 size={24} className="animate-spin text-(--color-text-secondary)" />
            </div>
          ) : pendingRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2">
              <IconUserCheck size={32} className="text-(--color-text-secondary) opacity-40" />
              <p className="text-(--color-text-primary) font-semibold">No pending requests</p>
              <p className="text-sm text-(--color-text-secondary)">
                When someone sends you a request, it'll appear here
              </p>
            </div>
          ) : (
            pendingRequests.map((req) => (
              <RequestCard
                key={req.friendshipId}
                request={req}
                actioning={actioningId === req.friendshipId}
                onAccept={() => acceptRequest(req.friendshipId)}
                onDecline={() => declineRequest(req.friendshipId)}
              />
            ))
          )}
        </div>
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
                  const isPending = user.pending_request || addedIds.has(user.id)
                  const isFriend = user.is_friend
                  const isAdding = addingId === user.id
                  return (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 p-3 rounded-xl border border-(--color-border) bg-(--color-bg)"
                    >
                      <Avatar name={user.name} avatarUrl={user.avatarUrl} size={36} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-(--color-text-primary) truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-(--color-text-secondary)">@{user.username}</p>
                      </div>
                      <button
                        onClick={() => !isFriend && !isPending && addFriend(user.id)}
                        disabled={isFriend || isPending || isAdding}
                        className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-70 ${
                          isFriend
                            ? 'bg-emerald-500/10 text-emerald-600'
                            : isPending
                              ? 'bg-(--color-border) text-(--color-text-secondary)'
                              : 'bg-(--color-accent)/10 text-(--color-accent) hover:bg-(--color-accent)/20'
                        }`}
                      >
                        {isAdding ? (
                          <IconLoader2 size={12} className="animate-spin" />
                        ) : isFriend ? (
                          <IconCheck size={12} />
                        ) : isPending ? (
                          <IconUserCheck size={12} />
                        ) : (
                          <IconUserPlus size={12} />
                        )}
                        {isFriend ? 'Friends' : isPending ? 'Request Sent' : 'Add Friend'}
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

function RequestCard({
  request,
  actioning,
  onAccept,
  onDecline,
}: {
  request: PendingRequest
  actioning: boolean
  onAccept: () => void
  onDecline: () => void
}) {
  return (
    <div className="flex items-center gap-4 p-4 bg-(--color-surface) border border-(--color-border) rounded-2xl">
      <Avatar name={request.from.name} avatarUrl={request.from.avatarUrl} size={44} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-(--color-text-primary) truncate">
          {request.from.name}
        </p>
        <p className="text-xs text-(--color-text-secondary)">@{request.from.username}</p>
        <p className="text-xs text-(--color-text-secondary) mt-0.5">
          {request.from.problemsSolved} problems solved
        </p>
      </div>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={onAccept}
          disabled={actioning}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
        >
          {actioning ? <IconLoader2 size={12} className="animate-spin" /> : <IconCheck size={12} />}
          Accept
        </button>
        <button
          onClick={onDecline}
          disabled={actioning}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors disabled:opacity-50"
        >
          <IconX size={12} />
          Decline
        </button>
      </div>
    </div>
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
      <div className="flex items-center gap-3">
        <Avatar name={friend.name} avatarUrl={friend.avatarUrl} size={40} />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-(--color-text-primary) truncate">{friend.name}</p>
          <p className="text-xs text-(--color-text-secondary) truncate">@{friend.username}</p>
        </div>
      </div>
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
      <button
        onClick={onViewProgress}
        className="w-full py-2 rounded-xl text-xs font-semibold border border-(--color-border) text-(--color-text-secondary) hover:border-(--color-accent)/50 hover:text-(--color-accent) transition-colors"
      >
        View Progress
      </button>
    </div>
  )
}

function MiniStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 bg-(--color-bg) rounded-lg py-2">
      {icon}
      <p className="text-xs font-bold text-(--color-text-primary) tabular-nums">{value}</p>
      <p className="text-xs text-(--color-text-secondary)">{label}</p>
    </div>
  )
}
