import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import {
  IconUsers,
  IconPlus,
  IconX,
  IconChevronRight,
  IconUserPlus,
  IconTarget,
} from '@tabler/icons-react'
import api from '../lib/api'
import { useAuthStore } from '../store/authStore'

interface Group {
  id: string
  name: string
  weeklyGoal: number
  creatorId: string
  createdAt: number
  memberCount: number
}

interface Member {
  id: string
  name: string
  username: string
  avatarUrl?: string | null
  joinedAt: number
  weeklySolved: number
}

interface GroupDetail {
  id: string
  name: string
  weeklyGoal: number
  creatorId: string
  members: Member[]
}

interface Friend {
  id: string
  name: string
  username: string
  avatarUrl?: string | null
}

function MemberAvatar({ member, size = 32 }: { member: Member | Friend; size?: number }) {
  if (member.avatarUrl) {
    return (
      <img
        src={member.avatarUrl}
        alt={member.name}
        style={{ width: size, height: size }}
        className="rounded-full object-cover shrink-0"
      />
    )
  }
  return (
    <div
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      className="rounded-full bg-(--color-accent)/15 flex items-center justify-center text-(--color-accent) font-bold shrink-0"
    >
      {member.name?.[0]?.toUpperCase() ?? '?'}
    </div>
  )
}

function GroupDetailPanel({
  group,
  onClose,
  currentUserId,
  friends,
}: {
  group: GroupDetail
  onClose: () => void
  currentUserId: string
  friends: Friend[]
}) {
  const [addingFriendId, setAddingFriendId] = useState<string | null>(null)
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())
  const [localMembers, setLocalMembers] = useState<Member[]>(group.members)

  const isCreator = group.creatorId === currentUserId
  const memberIds = new Set(localMembers.map((m) => m.id))
  const friendsNotInGroup = friends.filter((f) => !memberIds.has(f.id))

  async function addFriend(friendId: string) {
    setAddingFriendId(friendId)
    try {
      await api.post(`/api/groups/${group.id}/members`, { user_id: friendId })
      const friend = friends.find((f) => f.id === friendId)
      if (friend) {
        setLocalMembers((ms) => [
          ...ms,
          { ...friend, weeklySolved: 0, joinedAt: Date.now() },
        ])
      }
      setAddedIds((s) => new Set([...s, friendId]))
    } catch {
      // ignore
    } finally {
      setAddingFriendId(null)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 24 }}
      className="bg-(--color-surface) border border-(--color-border) rounded-2xl p-6 space-y-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-(--color-text-primary)">{group.name}</h2>
          <p className="text-xs text-(--color-text-secondary) mt-0.5">
            Weekly goal: {group.weeklyGoal} problems
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-(--color-text-secondary) hover:text-(--color-text-primary) hover:bg-(--color-bg) transition-colors"
        >
          <IconX size={16} />
        </button>
      </div>

      {/* Members */}
      <div className="space-y-3">
        <p className="text-xs font-semibold text-(--color-text-secondary) uppercase tracking-wider">
          Members ({localMembers.length})
        </p>
        {localMembers.map((m) => {
          const pct = group.weeklyGoal > 0 ? Math.min(100, Math.round((m.weeklySolved / group.weeklyGoal) * 100)) : 0
          return (
            <div key={m.id} className="flex items-center gap-3">
              <MemberAvatar member={m} size={32} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-(--color-text-primary) truncate">
                    {m.name}
                    {m.id === currentUserId && (
                      <span className="ml-1.5 text-xs text-(--color-accent)">(you)</span>
                    )}
                  </span>
                  <span className="text-xs text-(--color-text-secondary) tabular-nums shrink-0 ml-2">
                    {m.weeklySolved}/{group.weeklyGoal}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-(--color-bg)">
                  <motion.div
                    className="h-full rounded-full bg-(--color-accent)"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Add friends (creator only) */}
      {isCreator && friendsNotInGroup.length > 0 && (
        <div className="space-y-2 border-t border-(--color-border) pt-4">
          <p className="text-xs font-semibold text-(--color-text-secondary) uppercase tracking-wider flex items-center gap-1.5">
            <IconUserPlus size={13} />
            Add Friends
          </p>
          <div className="space-y-2">
            {friendsNotInGroup.map((f) => (
              <div key={f.id} className="flex items-center gap-2.5">
                <MemberAvatar member={f} size={28} />
                <span className="flex-1 text-sm text-(--color-text-primary) truncate">{f.name}</span>
                <button
                  onClick={() => addFriend(f.id)}
                  disabled={addingFriendId === f.id || addedIds.has(f.id)}
                  className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-(--color-accent)/10 text-(--color-accent) hover:bg-(--color-accent)/20 transition-colors disabled:opacity-50"
                >
                  {addedIds.has(f.id) ? '✓ Added' : addingFriendId === f.id ? '…' : 'Add'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}

function SkeletonCard() {
  return (
    <div className="animate-pulse bg-(--color-surface) border border-(--color-border) rounded-2xl p-5 space-y-3">
      <div className="h-5 bg-(--color-border) rounded w-1/2 opacity-40" />
      <div className="h-3 bg-(--color-border) rounded w-1/3 opacity-40" />
      <div className="h-2 bg-(--color-border) rounded opacity-40" />
    </div>
  )
}

export default function GroupsPage() {
  const { user } = useAuthStore()
  const [groups, setGroups] = useState<Group[]>([])
  const [friends, setFriends] = useState<Friend[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDetail, setSelectedDetail] = useState<GroupDetail | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  const [showCreate, setShowCreate] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createGoal, setCreateGoal] = useState('20')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    Promise.all([
      api.get<{ groups: Group[] }>('/api/groups'),
      api.get<{ friends: Friend[] }>('/api/friends'),
    ])
      .then(([groupsRes, friendsRes]) => {
        setGroups(groupsRes.data.groups ?? [])
        setFriends(friendsRes.data.friends ?? [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function openGroup(groupId: string) {
    setLoadingDetail(true)
    try {
      const { data } = await api.get<GroupDetail>(`/api/groups/${groupId}`)
      setSelectedDetail(data)
    } finally {
      setLoadingDetail(false)
    }
  }

  async function createGroup() {
    if (!createName.trim()) return
    setCreating(true)
    try {
      const { data } = await api.post<{ group_id: string }>('/api/groups', {
        name: createName.trim(),
        weekly_goal: Math.max(1, parseInt(createGoal, 10) || 20),
      })
      const newGroup: Group = {
        id: data.group_id,
        name: createName.trim(),
        weeklyGoal: parseInt(createGoal, 10) || 20,
        creatorId: user?.id ?? '',
        createdAt: Date.now(),
        memberCount: 1,
      }
      setGroups((gs) => [newGroup, ...gs])
      setCreateName('')
      setCreateGoal('20')
      setShowCreate(false)
    } catch {
      // ignore
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="max-w-4xl space-y-6 pb-20 lg:pb-0">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-(--color-text-primary)">Groups</h1>
          <p className="text-sm text-(--color-text-secondary) mt-1">
            Track weekly progress with your squad
          </p>
        </div>
        <button
          onClick={() => setShowCreate((s) => !s)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-(--color-accent) text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <IconPlus size={16} />
          New Group
        </button>
      </div>

      {/* Create form */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            className="bg-(--color-surface) border border-(--color-accent)/30 rounded-2xl p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-(--color-text-primary)">Create Group</h2>
              <button
                onClick={() => setShowCreate(false)}
                className="text-(--color-text-secondary) hover:text-(--color-text-primary)"
              >
                <IconX size={16} />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-(--color-text-secondary)">Group name</label>
                <input
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="Algo Warriors"
                  className="w-full rounded-xl border border-(--color-border) bg-(--color-bg) px-3 py-2 text-sm text-(--color-text-primary) focus:outline-none focus:ring-2 focus:ring-(--color-accent)/40"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-(--color-text-secondary)">
                  Weekly goal (problems)
                </label>
                <input
                  type="number"
                  value={createGoal}
                  onChange={(e) => setCreateGoal(e.target.value)}
                  min={1}
                  max={100}
                  className="w-full rounded-xl border border-(--color-border) bg-(--color-bg) px-3 py-2 text-sm text-(--color-text-primary) focus:outline-none focus:ring-2 focus:ring-(--color-accent)/40"
                />
              </div>
            </div>
            <button
              onClick={createGroup}
              disabled={creating || !createName.trim()}
              className="w-full py-2 rounded-xl bg-(--color-accent) text-white text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-40"
            >
              {creating ? 'Creating…' : 'Create Group'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Group list */}
        <div className="space-y-3">
          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : groups.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 bg-(--color-surface) border border-(--color-border) rounded-2xl">
              <div className="w-14 h-14 rounded-2xl bg-(--color-accent)/10 flex items-center justify-center">
                <IconUsers size={28} className="text-(--color-accent)" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-(--color-text-primary)">No groups yet</p>
                <p className="text-xs text-(--color-text-secondary) mt-1">
                  Create one and invite your friends
                </p>
              </div>
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-1.5 text-xs font-semibold text-(--color-accent) px-3 py-1.5 rounded-lg bg-(--color-accent)/10 hover:bg-(--color-accent)/20 transition-colors"
              >
                <IconPlus size={13} />
                Create Group
              </button>
            </div>
          ) : (
            groups.map((g) => (
              <button
                key={g.id}
                onClick={() => openGroup(g.id)}
                className="w-full text-left bg-(--color-surface) border border-(--color-border) hover:border-(--color-accent)/40 rounded-2xl p-5 transition-colors group"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-(--color-text-primary)">{g.name}</h3>
                  <IconChevronRight
                    size={16}
                    className="text-(--color-text-secondary) group-hover:text-(--color-accent) transition-colors"
                  />
                </div>
                <div className="flex items-center gap-4 text-xs text-(--color-text-secondary)">
                  <span className="flex items-center gap-1">
                    <IconUsers size={12} />
                    {g.memberCount} member{g.memberCount !== 1 ? 's' : ''}
                  </span>
                  <span className="flex items-center gap-1">
                    <IconTarget size={12} />
                    {g.weeklyGoal}/week goal
                  </span>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Group detail */}
        <div>
          <AnimatePresence mode="wait">
            {loadingDetail ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center py-16"
              >
                <div className="w-6 h-6 border-2 border-(--color-accent) border-t-transparent rounded-full animate-spin" />
              </motion.div>
            ) : selectedDetail ? (
              <GroupDetailPanel
                key={selectedDetail.id}
                group={selectedDetail}
                onClose={() => setSelectedDetail(null)}
                currentUserId={user?.id ?? ''}
                friends={friends}
              />
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-(--color-border) rounded-2xl text-center"
              >
                <IconUsers size={32} className="text-(--color-border) mb-3" />
                <p className="text-sm text-(--color-text-secondary)">
                  Select a group to see members
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
