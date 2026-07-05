import { useEffect, useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  IconArrowLeft,
  IconMessageCircle,
  IconSearch,
  IconPlus,
  IconSend,
  IconPaperclip,
  IconSword,
  IconX,
  IconCheck,
  IconChecks,
  IconExternalLink,
  IconLoader2,
} from "@tabler/icons-react";
import { useAuthStore } from "../store/authStore";
import {
  useChatStore,
  type Conversation,
  type ChatMessage,
} from "../store/chatStore";
import { useChatWebSocket } from "../hooks/useChatWebSocket";
import api from "../lib/api";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtTime(ts: number) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function fmtDateLabel(ts: number) {
  const d = new Date(ts);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return d.toLocaleDateString([], {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function getDateKey(ts: number) {
  return new Date(ts).toISOString().slice(0, 10);
}

function Avatar({
  name,
  avatarUrl,
  size = 36,
  online,
}: {
  name: string;
  avatarUrl?: string | null;
  size?: number;
  online?: boolean;
}) {
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          className="rounded-full object-cover w-full h-full"
        />
      ) : (
        <div
          style={{ fontSize: size * 0.38 }}
          className="w-full h-full rounded-full bg-(--color-accent)/15 flex items-center justify-center text-(--color-accent) font-bold select-none"
        >
          {name?.[0]?.toUpperCase() ?? "?"}
        </div>
      )}
      {online && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-(--color-surface)" />
      )}
    </div>
  );
}

// ── Special message cards ─────────────────────────────────────────────────────

function ProblemShareCard({ meta }: { meta: ChatMessage["metadata"] }) {
  if (!meta) return null;
  const diffColor =
    meta.difficulty === "easy"
      ? "text-emerald-500"
      : meta.difficulty === "hard"
        ? "text-red-500"
        : "text-amber-500";
  return (
    <div className="mt-1 rounded-xl border border-(--color-border) bg-(--color-bg) p-3 min-w-48 max-w-64">
      <p className="text-xs font-semibold text-(--color-text-secondary) mb-1 flex items-center gap-1">
        <IconPaperclip size={12} /> Problem
      </p>
      <p className="text-sm font-semibold text-(--color-text-primary) leading-snug mb-1">
        {meta.problem_title}
      </p>
      <p className={`text-xs font-medium ${diffColor} capitalize`}>
        {meta.difficulty} · {meta.topic}
      </p>
      {meta.platform_link && (
        <a
          href={meta.platform_link}
          target="_blank"
          rel="noreferrer"
          className="mt-2 flex items-center gap-1 text-xs font-semibold text-(--color-accent) hover:underline"
        >
          Open Problem <IconExternalLink size={11} />
        </a>
      )}
    </div>
  );
}

function ChallengeInviteCard({ meta }: { meta: ChatMessage["metadata"] }) {
  return (
    <div className="mt-1 rounded-xl border border-(--color-border) bg-(--color-bg) p-3 min-w-48 max-w-64">
      <p className="text-xs font-semibold text-(--color-text-secondary) mb-1">
        ⚔️ Challenge Invite
      </p>
      <p className="text-sm font-semibold text-(--color-text-primary)">
        {meta?.challenge_title ?? "Weekly Challenge"}
      </p>
      {meta?.xp_reward && (
        <p className="text-xs text-amber-500 mt-0.5">
          +{meta.xp_reward} XP on completion
        </p>
      )}
      <a
        href="/challenges"
        className="mt-2 block text-xs font-semibold text-(--color-accent) hover:underline"
      >
        View Challenge →
      </a>
    </div>
  );
}

function BattleInviteCard() {
  return (
    <div className="mt-1 rounded-xl border border-(--color-border) bg-(--color-bg) p-3 min-w-48 max-w-64">
      <p className="text-xs font-semibold text-(--color-text-secondary) mb-1">
        🏟 Battle Challenge
      </p>
      <p className="text-sm font-semibold text-(--color-text-primary)">
        5 problems · 45 min
      </p>
      <a
        href="/battles"
        className="mt-2 block text-xs font-semibold text-red-500 hover:underline"
      >
        Accept Battle →
      </a>
    </div>
  );
}

// ── Typing indicator ──────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 px-4 py-2">
      <div className="flex gap-1 px-3 py-2 rounded-2xl rounded-bl-sm bg-(--color-bg) border border-(--color-border)">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-(--color-text-secondary)"
            style={{
              animation: "typingPulse 1.2s ease-in-out infinite",
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ── Message bubble ────────────────────────────────────────────────────────────

const QUICK_EMOJIS = ["👍", "🔥", "💡", "😂", "🎯", "✅"];

function MessageBubble({
  msg,
  isOwn,
  onReact,
  onRead,
}: {
  msg: ChatMessage;
  isOwn: boolean;
  onReact: (msgId: string, emoji: string) => void;
  onRead: (msgId: string) => void;
}) {
  const [showReactions, setShowReactions] = useState(false);

  // Mark as read when rendered and it's not my own
  const readRef = useRef(false);
  useEffect(() => {
    if (!isOwn && !msg.read_at && !readRef.current) {
      readRef.current = true;
      onRead(msg.id);
    }
  }, [isOwn, msg.id, msg.read_at, onRead]);

  const bubbleCls = isOwn
    ? "bg-(--color-accent)/20 rounded-2xl rounded-br-sm self-end"
    : "bg-(--color-bg) border border-(--color-border) rounded-2xl rounded-bl-sm self-start";

  const grouped =
    msg.reactions.length > 0
      ? msg.reactions.reduce<Record<string, number>>((acc, r) => {
          acc[r.emoji] = (acc[r.emoji] ?? 0) + 1;
          return acc;
        }, {})
      : null;

  return (
    <div
      className={`group/msg flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-[70%] ${isOwn ? "self-end" : "self-start"}`}
      onMouseEnter={() => setShowReactions(true)}
      onMouseLeave={() => setShowReactions(false)}
    >
      <div className={`relative px-3 py-2 ${bubbleCls}`}>
        {msg.type === "text" && (
          <p className="text-sm text-(--color-text-primary) whitespace-pre-wrap break-words leading-relaxed">
            {msg.content}
          </p>
        )}
        {msg.type === "problem_share" && (
          <ProblemShareCard meta={msg.metadata} />
        )}
        {msg.type === "challenge_invite" && (
          <ChallengeInviteCard meta={msg.metadata} />
        )}
        {msg.type === "battle_invite" && <BattleInviteCard />}

        {/* Reaction bar on hover */}
        <AnimatePresence>
          {showReactions && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.12 }}
              className={`absolute ${isOwn ? "right-0" : "left-0"} -bottom-9 z-10 flex gap-1 bg-(--color-surface) border border-(--color-border) rounded-full px-2 py-1 shadow-lg`}
            >
              {QUICK_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => onReact(msg.id, emoji)}
                  className="text-base hover:scale-125 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Reactions display */}
      {grouped && (
        <div className="flex gap-1 mt-1 flex-wrap">
          {Object.entries(grouped).map(([emoji, count]) => (
            <button
              key={emoji}
              onClick={() => onReact(msg.id, emoji)}
              className="flex items-center gap-0.5 text-xs bg-(--color-bg) border border-(--color-border) rounded-full px-1.5 py-0.5 hover:border-(--color-accent)/50 transition-colors"
            >
              {emoji}{" "}
              {count > 1 && (
                <span className="text-(--color-text-secondary)">{count}</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Time + read receipt */}
      <div
        className={`flex items-center gap-1 mt-0.5 ${isOwn ? "self-end" : "self-start"}`}
      >
        <span className="text-[11px] text-(--color-text-secondary)">
          {fmtTime(msg.sent_at)}
        </span>
        {isOwn && (
          <span
            className={
              msg.read_at ? "text-blue-400" : "text-(--color-text-secondary)"
            }
          >
            {msg.read_at ? <IconChecks size={12} /> : <IconCheck size={12} />}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Message input ─────────────────────────────────────────────────────────────

function MessageInput({
  onSend,
  onTyping,
}: {
  onSend: (content: string) => void;
  onTyping: (isTyping: boolean) => void;
}) {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );
  const isTypingRef = useRef(false);

  function autoResize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 96) + "px";
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setValue(e.target.value);
    autoResize();

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      onTyping(true);
    }
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      isTypingRef.current = false;
      onTyping(false);
    }, 2000);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  function submit() {
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue("");
    clearTimeout(typingTimerRef.current);
    isTypingRef.current = false;
    onTyping(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.focus();
    }
  }

  return (
    <div className="shrink-0 border-t border-(--color-border) p-3 flex items-end gap-2 bg-(--color-surface)">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Type a message…"
        rows={1}
        className="flex-1 resize-none rounded-xl bg-(--color-bg) border border-(--color-border) px-3 py-2 text-sm text-(--color-text-primary) placeholder:text-(--color-text-secondary) focus:outline-none focus:border-(--color-accent)/60 transition-colors leading-relaxed"
        style={{ maxHeight: 96, overflowY: "auto" }}
      />
      <button
        onClick={submit}
        disabled={!value.trim()}
        className="shrink-0 p-2 rounded-xl bg-(--color-accent) text-white hover:opacity-90 transition-opacity disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Send"
      >
        <IconSend size={18} />
      </button>
    </div>
  );
}

// ── Conversation row ──────────────────────────────────────────────────────────

function ConversationRow({
  conv,
  active,
  onClick,
}: {
  conv: Conversation;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
        active
          ? "bg-(--color-accent)/10 text-(--color-accent)"
          : "hover:bg-(--color-bg) text-(--color-text-primary)"
      }`}
    >
      <Avatar
        name={conv.other_user.name}
        avatarUrl={conv.other_user.avatarUrl}
        size={40}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-semibold truncate">
            {conv.other_user.name}
          </p>
          {conv.last_message_at && (
            <span className="text-[11px] text-(--color-text-secondary) shrink-0">
              {fmtTime(conv.last_message_at)}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-(--color-text-secondary) truncate">
            {conv.last_message_preview ?? "No messages yet"}
          </p>
          {conv.unread_count > 0 && (
            <span className="shrink-0 min-w-4 h-4 px-1 flex items-center justify-center bg-(--color-accent) text-white text-[10px] font-bold rounded-full">
              {conv.unread_count > 9 ? "9+" : conv.unread_count}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

// ── New chat modal ────────────────────────────────────────────────────────────

function NewChatModal({
  onClose,
  onSelect,
}: {
  onClose: () => void;
  onSelect: (friendId: string) => void;
}) {
  const [friends, setFriends] = useState<
    Array<{
      id: string;
      name: string;
      username: string;
      avatarUrl?: string | null;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    api
      .get<{ friends: typeof friends }>("/api/friends")
      .then((r) => setFriends(r.data.friends))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = friends.filter(
    (f) =>
      f.name.toLowerCase().includes(q.toLowerCase()) ||
      f.username.toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-(--color-surface) border border-(--color-border) rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-(--color-border)">
          <p className="text-sm font-semibold text-(--color-text-primary)">
            New Chat
          </p>
          <button
            onClick={onClose}
            className="text-(--color-text-secondary) hover:text-(--color-text-primary)"
          >
            <IconX size={16} />
          </button>
        </div>
        <div className="p-3 border-b border-(--color-border)">
          <div className="flex items-center gap-2 bg-(--color-bg) rounded-lg px-3 py-1.5 border border-(--color-border)">
            <IconSearch size={14} className="text-(--color-text-secondary)" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search friends…"
              autoFocus
              className="flex-1 bg-transparent text-sm text-(--color-text-primary) placeholder:text-(--color-text-secondary) focus:outline-none"
            />
          </div>
        </div>
        <div className="max-h-72 overflow-y-auto p-2">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <IconLoader2
                size={20}
                className="animate-spin text-(--color-text-secondary)"
              />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-(--color-text-secondary) text-center py-6">
              No friends found
            </p>
          ) : (
            filtered.map((f) => (
              <button
                key={f.id}
                onClick={() => onSelect(f.id)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-(--color-bg) transition-colors"
              >
                <Avatar name={f.name} avatarUrl={f.avatarUrl} size={36} />
                <div className="text-left">
                  <p className="text-sm font-medium text-(--color-text-primary)">
                    {f.name}
                  </p>
                  <p className="text-xs text-(--color-text-secondary)">
                    @{f.username}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ── Date separator ────────────────────────────────────────────────────────────

function DateSeparator({ ts }: { ts: number }) {
  return (
    <div className="flex items-center gap-3 py-2 px-4">
      <span className="flex-1 h-px bg-(--color-border)" />
      <span className="text-xs text-(--color-text-secondary) font-medium shrink-0">
        {fmtDateLabel(ts)}
      </span>
      <span className="flex-1 h-px bg-(--color-border)" />
    </div>
  );
}

// ── Main ChatPage ─────────────────────────────────────────────────────────────

export default function ChatPage() {
  const { user } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const {
    conversations,
    activeConversationId,
    messages,
    totalUnread,
    typingUsers,
    conversationsLoaded,
    setActiveConversation,
    fetchConversations,
    markRead,
  } = useChatStore();

  const [chatView, setChatView] = useState<"list" | "thread">("list");
  const [searchQ, setSearchQ] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const [openingConv, setOpeningConv] = useState(false);

  const msgListRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);
  const initialScrollRef = useRef(false);

  const activeConv =
    conversations.find((c) => c.id === activeConversationId) ?? null;
  const activeMessages = activeConversationId
    ? (messages[activeConversationId] ?? [])
    : [];

  const {
    isConnected,
    isTyping,
    hasOlderMessages,
    loadingHistory,
    sendMessage,
    sendTyping,
    sendRead,
    sendReaction,
    loadOlderMessages,
  } = useChatWebSocket(activeConversationId);

  // Load conversations on mount
  useEffect(() => {
    if (!conversationsLoaded) {
      void fetchConversations();
    }
  }, [conversationsLoaded, fetchConversations]);

  // Handle ?with= param — open conversation with a friend
  useEffect(() => {
    const withId = searchParams.get("with");
    if (!withId || openingConv) return;
    setOpeningConv(true);
    api
      .get<{ conversation_id: string }>(`/api/chat/with/${withId}`)
      .then((r) => {
        setActiveConversation(r.data.conversation_id);
        setChatView("thread");
        setSearchParams({}, { replace: true });
        void fetchConversations();
      })
      .catch(() => {})
      .finally(() => setOpeningConv(false));
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  // Mark read when conversation becomes active
  useEffect(() => {
    if (activeConversationId) {
      markRead(activeConversationId);
    }
  }, [activeConversationId, markRead]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    const el = msgListRef.current;
    if (!el) return;

    if (!initialScrollRef.current) {
      el.scrollTop = el.scrollHeight;
      initialScrollRef.current = true;
      return;
    }

    if (isAtBottomRef.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [activeMessages.length]);

  // Reset scroll state when conversation changes
  useEffect(() => {
    initialScrollRef.current = false;
    isAtBottomRef.current = true;
  }, [activeConversationId]);

  function handleScroll() {
    const el = msgListRef.current;
    if (!el) return;
    const fromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    isAtBottomRef.current = fromBottom < 80;

    // Infinite scroll: load older when near top
    if (el.scrollTop < 60 && hasOlderMessages && !loadingHistory) {
      const prevHeight = el.scrollHeight;
      loadOlderMessages();
      // Maintain scroll position after prepend
      requestAnimationFrame(() => {
        if (msgListRef.current) {
          msgListRef.current.scrollTop =
            msgListRef.current.scrollHeight - prevHeight;
        }
      });
    }
  }

  async function openConversation(friendId: string) {
    setShowNewChat(false);
    setOpeningConv(true);
    try {
      const r = await api.get<{ conversation_id: string }>(
        `/api/chat/with/${friendId}`,
      );
      setActiveConversation(r.data.conversation_id);
      setChatView("thread");
      void fetchConversations();
    } catch {}
    setOpeningConv(false);
  }

  function handleSend(content: string) {
    sendMessage(content);
  }

  function handleTyping(isTypingNow: boolean) {
    sendTyping(isTypingNow);
  }

  const filtered = conversations.filter(
    (c) =>
      !searchQ ||
      c.other_user.name.toLowerCase().includes(searchQ.toLowerCase()) ||
      c.other_user.username.toLowerCase().includes(searchQ.toLowerCase()),
  );

  // Group messages by date for separators
  const groupedMessages: Array<
    { type: "separator"; ts: number } | { type: "message"; msg: ChatMessage }
  > = [];
  let lastDateKey = "";
  for (const msg of activeMessages) {
    const key = getDateKey(msg.sent_at);
    if (key !== lastDateKey) {
      groupedMessages.push({ type: "separator", ts: msg.sent_at });
      lastDateKey = key;
    }
    groupedMessages.push({ type: "message", msg });
  }

  const otherTyping = activeConversationId
    ? (typingUsers[activeConversationId] ?? isTyping)
    : false;

  // ── Panels ────────────────────────────────────────────────────────────────

  const leftPanel = (
    <div
      className={[
        "flex flex-col border-r border-(--color-border) bg-(--color-surface) shrink-0",
        "md:flex md:w-72",
        chatView === "thread" ? "hidden md:flex" : "flex w-full",
      ].join(" ")}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-(--color-border) shrink-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-(--color-text-primary)">
            Messages
          </p>
          {totalUnread > 0 && (
            <span className="text-[10px] font-bold text-white bg-(--color-accent) px-1.5 py-0.5 rounded-full">
              {totalUnread}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowNewChat(true)}
          className="p-1.5 rounded-lg hover:bg-(--color-bg) text-(--color-text-secondary) hover:text-(--color-accent) transition-colors"
          title="New Chat"
        >
          <IconPlus size={18} />
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b border-(--color-border) shrink-0">
        <div className="flex items-center gap-2 bg-(--color-bg) rounded-lg px-3 py-1.5 border border-(--color-border)">
          <IconSearch size={13} className="text-(--color-text-secondary)" />
          <input
            value={searchQ}
            onChange={(e) => setSearchQ(e.target.value)}
            placeholder="Search conversations…"
            className="flex-1 bg-transparent text-sm text-(--color-text-primary) placeholder:text-(--color-text-secondary) focus:outline-none"
          />
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {!conversationsLoaded ? (
          <div className="space-y-2 p-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-(--color-border)" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 rounded bg-(--color-border) w-2/3" />
                  <div className="h-2.5 rounded bg-(--color-border) w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <IconMessageCircle size={36} className="text-(--color-border)" />
            <p className="text-sm text-(--color-text-secondary)">
              No conversations yet
            </p>
            <button
              onClick={() => setShowNewChat(true)}
              className="text-xs font-semibold text-(--color-accent) hover:underline"
            >
              Start a chat →
            </button>
          </div>
        ) : (
          filtered.map((conv) => (
            <ConversationRow
              key={conv.id}
              conv={conv}
              active={conv.id === activeConversationId}
              onClick={() => {
                setActiveConversation(conv.id);
                setChatView("thread");
              }}
            />
          ))
        )}
      </div>
    </div>
  );

  const rightPanel = (
    <div
      className={[
        "flex flex-col flex-1 min-w-0",
        chatView === "list" ? "hidden md:flex" : "flex",
      ].join(" ")}
    >
      {!activeConv ? (
        // Empty state
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-(--color-text-secondary)">
          <IconMessageCircle
            size={56}
            strokeWidth={1.25}
            className="text-(--color-border)"
          />
          <p className="text-sm font-medium">
            Select a friend to start chatting
          </p>
          <button
            onClick={() => setShowNewChat(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-(--color-accent) hover:underline"
          >
            <IconPlus size={13} /> New Conversation
          </button>
        </div>
      ) : (
        <>
          {/* Thread header */}
          <div className="shrink-0 flex items-center gap-3 px-4 h-14 border-b border-(--color-border) bg-(--color-surface)">
            <button
              onClick={() => {
                setChatView("list");
                setActiveConversation(null);
              }}
              className="md:hidden p-1.5 text-(--color-text-secondary) hover:text-(--color-text-primary) transition-colors"
            >
              <IconArrowLeft size={18} />
            </button>
            <Avatar
              name={activeConv.other_user.name}
              avatarUrl={activeConv.other_user.avatarUrl}
              size={34}
              online={isConnected}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-(--color-text-primary) truncate">
                {activeConv.other_user.name}
              </p>
              <p className="text-xs text-(--color-text-secondary)">
                @{activeConv.other_user.username}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => navigate(`/battles`)}
                title="Challenge to Battle"
                className="p-1.5 rounded-lg hover:bg-(--color-bg) text-(--color-text-secondary) hover:text-red-500 transition-colors"
              >
                <IconSword size={16} />
              </button>
            </div>
          </div>

          {/* Message area */}
          <div
            ref={msgListRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2"
          >
            {loadingHistory && hasOlderMessages && (
              <div className="flex justify-center py-2">
                <IconLoader2
                  size={18}
                  className="animate-spin text-(--color-text-secondary)"
                />
              </div>
            )}

            {groupedMessages.map((item, i) => {
              if (item.type === "separator") {
                return <DateSeparator key={`sep-${i}`} ts={item.ts} />;
              }
              const msg = item.msg;
              const isOwn = msg.sender_id === user?.id;
              return (
                <MessageBubble
                  key={msg.id}
                  msg={msg}
                  isOwn={isOwn}
                  onReact={(msgId, emoji) => {
                    sendReaction(msgId, emoji);
                    if (activeConversationId) {
                      useChatStore
                        .getState()
                        .addReaction(
                          activeConversationId,
                          msgId,
                          user?.id ?? "",
                          emoji,
                        );
                    }
                  }}
                  onRead={sendRead}
                />
              );
            })}

            <AnimatePresence>
              {otherTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                >
                  <TypingIndicator />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Message input */}
          <MessageInput onSend={handleSend} onTyping={handleTyping} />
        </>
      )}
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes typingPulse {
          0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-3px); }
        }
      `}</style>

      <div className="flex h-full overflow-hidden">
        {leftPanel}
        {rightPanel}
      </div>

      <AnimatePresence>
        {showNewChat && (
          <NewChatModal
            onClose={() => setShowNewChat(false)}
            onSelect={openConversation}
          />
        )}
      </AnimatePresence>
    </>
  );
}
