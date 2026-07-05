import { useState } from 'react'
import { Link } from 'react-router-dom'

const ANIM = `
@keyframes lp-up {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes lp-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes lp-glow {
  0%,100% { opacity:.38; }
  50%      { opacity:.6; }
}
@keyframes lp-bar {
  from { width: 0; }
}
@keyframes lp-pulse {
  0%,100% { opacity:1; }
  50%      { opacity:.45; }
}
@keyframes lp-chat {
  from { opacity:0; transform:translateY(6px); }
  to   { opacity:1; transform:translateY(0); }
}
.lp-u { animation: lp-up .55s cubic-bezier(.16,1,.3,1) both; }
.lp-i { animation: lp-in .55s ease both; }
.d1{animation-delay:.05s}.d2{animation-delay:.12s}.d3{animation-delay:.20s}
.d4{animation-delay:.28s}.d5{animation-delay:.37s}.d6{animation-delay:.46s}
.d7{animation-delay:.56s}.d8{animation-delay:.66s}
.lp-bar { animation: lp-bar .9s cubic-bezier(.16,1,.3,1) both; }
.lb1{animation-delay:.6s}.lb2{animation-delay:.75s}.lb3{animation-delay:.9s}
.lp-c1{animation: lp-chat .4s ease both; animation-delay:.5s;}
.lp-c2{animation: lp-chat .4s ease both; animation-delay:.75s;}
.lp-c3{animation: lp-chat .4s ease both; animation-delay:1s;}
.lp-bento {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  border-radius: 14px;
  overflow: hidden;
  background: var(--color-border);
  border: 1px solid var(--color-border);
}
.lp-span2 { grid-column: span 2; }
.lp-span3 { grid-column: span 3; }
/* stats bar: inline-flex on desktop, 2×2 grid on small phones */
.lp-stats {
  display: inline-flex;
  border: 1px solid var(--color-border);
  border-radius: 12px;
  background: var(--color-surface);
  overflow: hidden;
  max-width: 100%;
}
.lp-stats-cell {
  padding: 11px 20px;
  text-align: center;
  flex-shrink: 0;
}
/* weekly days row — scroll rather than bleed on very small phones */
.lp-days {
  display: flex;
  gap: 5px;
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 2px;
}
.lp-days::-webkit-scrollbar { display: none; }
@media (max-width: 680px) {
  .lp-bento > * { grid-column: span 3 !important; }
}
@media (max-width: 440px) {
  .lp-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    width: 100%;
  }
  .lp-stats-cell { border-right: none !important; }
  .lp-stats-cell:nth-child(-n+2) { border-bottom: 1px solid var(--color-border); }
  .lp-stats-cell:nth-child(odd) { border-right: 1px solid var(--color-border) !important; }
}
@media (prefers-reduced-motion: reduce) {
  .lp-u,.lp-i,.lp-bar,.lp-c1,.lp-c2,.lp-c3 { animation: none !important; opacity:1 !important; }
}
`

const SUBJECTS = [
  { label: 'DSA',           color: '#22c55e' },
  { label: 'Java',          color: '#f59e0b' },
  { label: 'SQL',           color: '#3b82f6' },
  { label: 'OOPs',          color: '#8b5cf6' },
  { label: 'Spring Boot',   color: '#10b981' },
  { label: 'System Design', color: '#6366f1' },
  { label: 'JavaScript',    color: '#eab308' },
  { label: 'React',         color: '#06b6d4' },
  { label: 'Angular',       color: '#ef4444' },
  { label: 'RxJS',          color: '#a855f7' },
]

/* ── small reusable tag ──────────────────────────────────────────────── */
function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      display: 'inline-block', alignSelf: 'flex-start', fontSize: 10, fontWeight: 600,
      textTransform: 'uppercase', letterSpacing: '.07em',
      padding: '2px 7px', borderRadius: 5,
      background: 'color-mix(in oklch, var(--color-accent) 10%, var(--color-bg))',
      color: 'var(--color-accent)', border: '1px solid color-mix(in oklch, var(--color-accent) 20%, transparent)',
      marginBottom: '.75rem',
    }}>{children}</span>
  )
}

/* ── bento card wrapper ──────────────────────────────────────────────── */
function BCard({ children, span, tall, style: sx }: {
  children: React.ReactNode
  span?: 2 | 3
  tall?: boolean
  style?: React.CSSProperties
}) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      className={span === 2 ? 'lp-span2' : span === 3 ? 'lp-span3' : ''}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered
          ? 'color-mix(in oklch, var(--color-accent) 3%, var(--color-surface))'
          : 'var(--color-surface)',
        padding: '1.5rem',
        display: 'flex', flexDirection: 'column',
        minHeight: tall ? 220 : 190,
        transition: 'background .18s',
        position: 'relative',
        overflow: 'hidden',
        ...sx,
      }}
    >{children}</div>
  )
}

/* ── Weekly challenge visual ─────────────────────────────────────────── */
function WeeklyViz() {
  const days = ['S','M','T','W','T','F','S']
  return (
    <div style={{ marginTop: 'auto', paddingTop: '1.25rem' }}>
      <div className="lp-days" style={{ marginBottom: 10 }}>
        {days.map((d, i) => (
          <div key={i} style={{
            width: 28, height: 28, borderRadius: 7, fontSize: 10, fontWeight: 600,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: i === 1
              ? 'var(--color-accent)'
              : 'color-mix(in oklch, var(--color-border) 60%, var(--color-bg))',
            color: i === 1 ? '#fff' : 'var(--color-text-secondary)',
            border: i === 1 ? 'none' : '1px solid var(--color-border)',
          }}>{d}</div>
        ))}
      </div>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        fontSize: 11, fontWeight: 500, color: 'var(--color-text-secondary)',
        background: 'var(--color-bg)', border: '1px solid var(--color-border)',
        borderRadius: 8, padding: '5px 10px',
      }}>
        <span style={{
          width: 6, height: 6, borderRadius: '50%', background: '#22c55e',
          display: 'inline-block', animation: 'lp-pulse 2s ease infinite',
        }}/>
        This week's challenge is live
      </div>
    </div>
  )
}

/* ── Battles visual ──────────────────────────────────────────────────── */
function BattleViz() {
  return (
    <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ textAlign: 'center' }}>
          <img
            src="https://lh3.googleusercontent.com/a/ACg8ocInQALPthlnKGJjPKKxY5ljlFrPPwFFbNZ4CbcCj9GTQf0FPB7Z=s96-c"
            alt="You"
            style={{ width: 36, height: 36, borderRadius: '50%', margin: '0 auto 4px', display: 'block', border: '2px solid var(--color-accent)', objectFit: 'cover' }}
          />
          <div style={{
            height: 4, width: 60, borderRadius: 99, overflow: 'hidden',
            background: 'var(--color-border)',
          }}>
            <div style={{ height: '100%', width: '65%', background: 'var(--color-accent)', borderRadius: 99 }} />
          </div>
        </div>
        <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-text-secondary)', letterSpacing: '.05em' }}>VS</div>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%', margin: '0 auto 4px',
            background: 'color-mix(in oklch, var(--color-border) 80%, var(--color-bg))',
            border: '2px solid var(--color-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: 'var(--color-text-secondary)',
          }}>Fr.</div>
          <div style={{
            height: 4, width: 60, borderRadius: 99, overflow: 'hidden',
            background: 'var(--color-border)',
          }}>
            <div style={{ height: '100%', width: '40%', background: 'var(--color-text-secondary)', borderRadius: 99 }} />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Chat visual ─────────────────────────────────────────────────────── */
function ChatViz() {
  return (
    <div style={{ marginTop: 'auto', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: 6 }}>
      {[
        { me: false, text: 'How did you solve the DP one?' },
        { me: true,  text: 'Memoized recursion, let me share' },
        { me: false, text: 'Challenge me when you\'re free 🔥' },
      ].map(({ me, text }, i) => (
        <div key={i}
          className={`lp-c${i + 1}` as 'lp-c1'}
          style={{
            alignSelf: me ? 'flex-end' : 'flex-start',
            maxWidth: '82%', fontSize: 11, fontWeight: 400, lineHeight: 1.4,
            padding: '6px 10px', borderRadius: me ? '10px 10px 3px 10px' : '10px 10px 10px 3px',
            background: me
              ? 'color-mix(in oklch, var(--color-accent) 14%, var(--color-bg))'
              : 'var(--color-bg)',
            border: `1px solid ${me ? 'color-mix(in oklch, var(--color-accent) 25%, transparent)' : 'var(--color-border)'}`,
            color: 'var(--color-text-primary)',
          }}
        >{text}</div>
      ))}
    </div>
  )
}

/* ── Leaderboard visual ──────────────────────────────────────────────── */
function LeaderViz() {
  const rows = [
    { name: 'You', pts: '1,240', w: '82%', accent: true },
    { name: 'Rohan', pts: '980', w: '63%', accent: false },
    { name: 'Priya', pts: '740', w: '48%', accent: false },
  ]
  return (
    <div style={{ marginTop: 'auto', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: 7 }}>
      {rows.map(({ name, pts, w, accent }, i) => (
        <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: 10, fontWeight: 700, minWidth: 14, color: accent ? 'var(--color-accent)' : 'var(--color-text-secondary)',
          }}>#{i + 1}</span>
          <span style={{ fontSize: 11, fontWeight: 500, minWidth: 36, color: 'var(--color-text-primary)' }}>{name}</span>
          <div style={{ flex: 1, height: 6, borderRadius: 99, background: 'var(--color-bg)', overflow: 'hidden' }}>
            <div
              className={`lp-bar lb${i + 1}`}
              style={{
                height: '100%', width: w, borderRadius: 99,
                background: accent ? 'var(--color-accent)' : 'var(--color-border)',
              }}
            />
          </div>
          <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--color-text-secondary)', minWidth: 32, textAlign: 'right' }}>{pts}</span>
        </div>
      ))}
    </div>
  )
}

/* ── Friends visual ──────────────────────────────────────────────────── */
function FriendsViz() {
  const initials = ['RS','AP','NK','VK']
  const colors   = ['#6366f1','#22c55e','#f59e0b','#06b6d4']
  return (
    <div style={{ marginTop: 'auto', paddingTop: '1rem', display: 'flex', alignItems: 'center', gap: 4 }}>
      {initials.map((init, i) => (
        <div key={i} style={{
          width: 32, height: 32, borderRadius: '50%', fontSize: 10, fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
          background: colors[i], border: '2px solid var(--color-surface)',
          marginLeft: i > 0 ? -8 : 0, zIndex: initials.length - i,
          position: 'relative',
        }}>{init}</div>
      ))}
      <div style={{
        width: 32, height: 32, borderRadius: '50%', fontSize: 16, fontWeight: 400,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--color-bg)', border: '2px dashed var(--color-border)',
        color: 'var(--color-text-secondary)', marginLeft: -8, position: 'relative',
      }}>+</div>
      <span style={{ marginLeft: 6, fontSize: 11, color: 'var(--color-text-secondary)', fontWeight: 400 }}>
        Invite with a link
      </span>
    </div>
  )
}

const AVATAR = 'https://lh3.googleusercontent.com/a/ACg8ocInQALPthlnKGJjPKKxY5ljlFrPPwFFbNZ4CbcCj9GTQf0FPB7Z=s96-c'

export default function LandingPage() {

  return (
    <div style={{
      fontFamily: "'Geist', system-ui, -apple-system, sans-serif",
      background: 'var(--color-bg)',
      color: 'var(--color-text-primary)',
      minHeight: '100vh',
      WebkitFontSmoothing: 'antialiased',
      overflowX: 'clip',  // prevent ANY child from causing horizontal scroll
    }}>
      <style>{ANIM}</style>

      {/* ── NAV ─────────────────────────────────────── */}
      <nav className="lp-i" style={{
        position: 'sticky', top: 0, zIndex: 50,
        borderBottom: '1px solid var(--color-border)',
        background: 'color-mix(in oklch, var(--color-bg) 80%, transparent)',
        backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <img src="https://prep-arena.animishchopade.in/assets/PrepArena_favicon.png" alt="" style={{ width: 24, height: 24, borderRadius: 5 }} />
            <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-.02em' }}>PrepArena</span>
          </div>
          <Link
            to="/login"
            style={{ fontSize: 13, fontWeight: 500, padding: '6px 14px', borderRadius: 8, border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', textDecoration: 'none', transition: 'border-color .15s, color .15s' }}
            onMouseEnter={e => { ;(e.currentTarget as HTMLElement).style.borderColor='var(--color-accent)';(e.currentTarget as HTMLElement).style.color='var(--color-text-primary)' }}
            onMouseLeave={e => { ;(e.currentTarget as HTMLElement).style.borderColor='var(--color-border)';(e.currentTarget as HTMLElement).style.color='var(--color-text-secondary)' }}
          >Sign in</Link>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────── */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '5rem 1.5rem 3.5rem', position: 'relative' }}>
        <div className="lp-i" style={{
          position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)',
          width: 560, height: 260,
          background: 'radial-gradient(ellipse, color-mix(in oklch, var(--color-accent) 14%, transparent) 0%, transparent 70%)',
          pointerEvents: 'none', animation: 'lp-glow 4.5s ease-in-out infinite',
        }}/>
        <div style={{ textAlign: 'center', position: 'relative' }}>
          <div className="lp-u d1" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: '1.25rem', fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)', borderRadius: 100, padding: '4px 12px' }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--color-accent)', display: 'inline-block' }}/>
            Free to use · No signup fee · Open to all
          </div>
          <h1 className="lp-u d2" style={{ fontSize: 'clamp(2.1rem, 5vw, 3.5rem)', fontWeight: 700, letterSpacing: '-.035em', lineHeight: 1.1, marginBottom: '1rem' }}>
            The only prep platform<br/>you&apos;ll actually <span style={{ color: 'var(--color-accent)' }}>finish.</span>
          </h1>
          <p className="lp-u d3" style={{ fontSize: 'clamp(.9rem, 2vw, 1rem)', lineHeight: 1.7, color: 'var(--color-text-secondary)', maxWidth: 460, margin: '0 auto 2rem', fontWeight: 400 }}>
            DSA, Java, SQL, System Design, React and more — theory, MCQs, coding problems, and real-time battles.
          </p>
          <div className="lp-u d4" style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3rem' }}>
            <Link to="/login" style={{ fontSize: 14, fontWeight: 600, padding: '10px 22px', borderRadius: 10, background: 'var(--color-accent)', color: '#fff', textDecoration: 'none', transition: 'opacity .15s', letterSpacing: '-.01em' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity='.86' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity='1' }}
            >Start preparing →</Link>
            <a
              href="https://twitter.com/intent/tweet?text=I+built+PrepArena+%E2%80%94+a+free+interview+prep+platform+with+DSA%2C+Java%2C+SQL%2C+System+Design%2C+React+%26+more.+Theory%2C+MCQs%2C+and+real-time+coding+battles.+%F0%9F%9A%80%0A%0ACheck+it+out%3A+https%3A%2F%2Fprep-arena.animishchopade.in"
              target="_blank" rel="noopener noreferrer"
              style={{ fontSize: 14, fontWeight: 500, padding: '10px 22px', borderRadius: 10, border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', textDecoration: 'none', transition: 'border-color .15s, color .15s', letterSpacing: '-.01em' }}
              onMouseEnter={e => { ;(e.currentTarget as HTMLElement).style.borderColor='var(--color-accent)';(e.currentTarget as HTMLElement).style.color='var(--color-text-primary)' }}
              onMouseLeave={e => { ;(e.currentTarget as HTMLElement).style.borderColor='var(--color-border)';(e.currentTarget as HTMLElement).style.color='var(--color-text-secondary)' }}
            >Share on X</a>
          </div>
          <div className="lp-u d5 lp-stats">
            {[['560+','Problems'],['10','Subjects'],['3','Formats'],['∞','Battles']].map(([n, l], i) => (
              <div key={l} className="lp-stats-cell" style={{ borderRight: i < 3 ? '1px solid var(--color-border)' : undefined }}>
                <div style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-.03em' }}>{n}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 1 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SUBJECTS ────────────────────────────────── */}
      <section className="lp-u d6" style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem 3.5rem' }}>
        <p style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--color-text-secondary)', marginBottom: '.875rem' }}>Subjects covered</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
          {SUBJECTS.map(({ label, color }) => (
            <div key={label}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '5px 11px', borderRadius: 8, border: '1px solid var(--color-border)', background: 'var(--color-surface)', fontSize: 13, fontWeight: 500, transition: 'border-color .15s', cursor: 'default' }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = color}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'}
            >
              <span style={{ width: 5, height: 5, borderRadius: '50%', background: color, flexShrink: 0 }}/>
              {label}
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES BENTO ──────────────────────────── */}
      <section className="lp-u d7" style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem 4.5rem' }}>
        <p style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--color-text-secondary)', marginBottom: '.875rem' }}>Everything in one place</p>

        <div className="lp-bento">

          {/* ── Weekly Challenge ── (2 cols, tall) */}
          <BCard span={2} tall>
            <Tag>Every Monday</Tag>
            <h3 style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-.02em', marginBottom: '.35rem' }}>Weekly Challenge</h3>
            <p style={{ fontSize: 13, lineHeight: 1.65, color: 'var(--color-text-secondary)', maxWidth: 340 }}>
              A fresh curated problem drops every Monday — across subjects, with a hard deadline. Earn bonus XP, climb the global leaderboard, and see how you stack up.
            </p>
            <WeeklyViz />
          </BCard>

          {/* ── Battles ── (1 col, tall) */}
          <BCard tall>
            <Tag>Real-time</Tag>
            <h3 style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-.02em', marginBottom: '.35rem' }}>1v1 Battles</h3>
            <p style={{ fontSize: 13, lineHeight: 1.65, color: 'var(--color-text-secondary)' }}>
              Same problem. Same timer. Race a friend to the solution. Competitive pressure that actually prepares you for interviews.
            </p>
            <BattleViz />
          </BCard>

          {/* ── Chat ── (1 col) */}
          <BCard>
            <Tag>Built-in</Tag>
            <h3 style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-.02em', marginBottom: '.35rem' }}>Real-time Chat</h3>
            <p style={{ fontSize: 13, lineHeight: 1.65, color: 'var(--color-text-secondary)' }}>
              Discuss problems, share solutions, and coordinate battles with your prep group — without leaving the platform.
            </p>
            <ChatViz />
          </BCard>

          {/* ── Friends & Challenges ── (1 col) */}
          <BCard>
            <Tag>Social</Tag>
            <h3 style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-.02em', marginBottom: '.35rem' }}>Friends & Challenges</h3>
            <p style={{ fontSize: 13, lineHeight: 1.65, color: 'var(--color-text-secondary)' }}>
              Invite friends with a shareable link. Challenge anyone to a custom problem set — your pick, your stakes.
            </p>
            <FriendsViz />
          </BCard>

          {/* ── Leaderboard ── (1 col) */}
          <BCard>
            <Tag>Competitive</Tag>
            <h3 style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-.02em', marginBottom: '.35rem' }}>Leaderboard</h3>
            <p style={{ fontSize: 13, lineHeight: 1.65, color: 'var(--color-text-secondary)' }}>
              Weekly XP rankings among your friends. Filter by subject. See exactly who's outworking you.
            </p>
            <LeaderViz />
          </BCard>

          {/* ── Division Groups ── (3 cols, short horizontal) */}
          <BCard span={3} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 100, gap: '2rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 220 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                background: 'color-mix(in oklch, var(--color-accent) 10%, var(--color-bg))',
                border: '1px solid var(--color-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--color-accent)',
              }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="5" cy="4" r="2.2" stroke="currentColor" strokeWidth="1.3"/>
                  <circle cx="11" cy="4" r="2.2" stroke="currentColor" strokeWidth="1.3"/>
                  <path d="M1 13c0-2 1.8-3.5 4-3.5s4 1.5 4 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                  <path d="M11 9.5c1.7 0 3 1.1 3 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '-.02em' }}>Division Groups</span>
                  <Tag>New</Tag>
                </div>
                <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', lineHeight: 1.5, margin: 0 }}>
                  Create a private group with your team. Shared leaderboard, group chat, and problem sets. Prep together, compete together.
                </p>
              </div>
            </div>
            <Link to="/login" style={{
              flexShrink: 0, fontSize: 13, fontWeight: 600, padding: '8px 16px',
              borderRadius: 9, border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)', textDecoration: 'none', transition: 'border-color .15s',
              whiteSpace: 'nowrap',
            }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-accent)'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'}
            >Create a group →</Link>
          </BCard>

        </div>
      </section>

      {/* ── ABOUT ───────────────────────────────────── */}
      <section className="lp-u d8" style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem 4.5rem' }}>
        <div style={{
          border: '1px solid var(--color-border)', borderRadius: 14,
          background: 'var(--color-surface)', padding: '2rem 2.25rem',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: 0, left: '2.25rem', width: 40, height: 2, borderRadius: '0 0 2px 2px', background: 'var(--color-accent)' }}/>

          {/* identity row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
            <img src={AVATAR} alt="Animish Chopade" style={{ width: 52, height: 52, borderRadius: '50%', border: '2px solid var(--color-border)', objectFit: 'cover', flexShrink: 0 }}/>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
                <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-.02em' }}>Animish Chopade</span>
                <span style={{ fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 5, background: 'color-mix(in oklch, var(--color-accent) 10%, var(--color-bg))', color: 'var(--color-accent)', border: '1px solid color-mix(in oklch, var(--color-accent) 20%, transparent)' }}>Full Stack Developer</span>
              </div>
              <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Pune, India</span>
            </div>
          </div>

          {/* bio */}
          <p style={{ fontSize: 13, lineHeight: 1.75, color: 'var(--color-text-secondary)', maxWidth: 620, marginBottom: '1.5rem' }}>
            I built PrepArena because every prep resource I found was either incomplete, scattered, or just another LeetCode clone.
            This covers the full stack of what actually gets asked — DSA, Java, System Design, the entire front-end ecosystem —
            with real-time battles, progress tracking, and weekly challenges to keep things sharp.
            No fluff. Just the prep I wished existed when I was going through interviews myself.
          </p>

          {/* social links */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[
              {
                href: 'https://www.linkedin.com/in/animish-chopade',
                label: 'LinkedIn',
                icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>,
              },
              {
                href: 'https://github.com/Animish2002',
                label: 'GitHub',
                icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.026A9.578 9.578 0 0 1 12 6.836c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.026 2.747-1.026.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.744 0 .267.18.579.688.481C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z"/></svg>,
              },
              {
                href: 'https://x.com/animish06',
                label: '@animish06',
                icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.261 5.632 5.904-5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>,
              },
              {
                href: 'https://animishchopade.in',
                label: 'Portfolio',
                icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
              },
            ].map(({ href, label, icon }) => (
              <a
                key={href}
                href={href} target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 500, padding: '6px 12px', borderRadius: 8, border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', textDecoration: 'none', transition: 'border-color .15s, color .15s' }}
                onMouseEnter={e => { ;(e.currentTarget as HTMLElement).style.borderColor='var(--color-accent)';(e.currentTarget as HTMLElement).style.color='var(--color-text-primary)' }}
                onMouseLeave={e => { ;(e.currentTarget as HTMLElement).style.borderColor='var(--color-border)';(e.currentTarget as HTMLElement).style.color='var(--color-text-secondary)' }}
              >{icon}{label}</a>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────── */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem 5.5rem' }}>
        <div style={{ borderRadius: 14, border: '1px solid var(--color-border)', background: 'var(--color-surface)', padding: '2.75rem 2rem', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '35%', height: 1, background: 'linear-gradient(90deg, transparent, var(--color-accent), transparent)' }}/>
          <h2 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 700, letterSpacing: '-.03em', marginBottom: '.5rem' }}>Ready to crack that interview?</h2>
          <p style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>Free to use. No credit card. Start prepping in 30 seconds.</p>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, padding: '10px 22px', borderRadius: 10, background: 'var(--color-accent)', color: '#fff', textDecoration: 'none', transition: 'opacity .15s', letterSpacing: '-.01em' }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity='.86'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity='1'}
          >Open PrepArena →</Link>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────── */}
      <footer style={{ borderTop: '1px solid var(--color-border)', maxWidth: 1100, margin: '0 auto', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, fontSize: 12, color: 'var(--color-text-secondary)' }}>
        <span>© 2025 PrepArena</span>
        <span>Built on Cloudflare Workers · Made in India 🇮🇳</span>
      </footer>
    </div>
  )
}
