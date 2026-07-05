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
  0%, 100% { opacity: .45; }
  50%       { opacity: .7; }
}
.lp-u  { animation: lp-up .55s cubic-bezier(.16,1,.3,1) both; }
.lp-i  { animation: lp-in .6s ease both; }
.d1 { animation-delay: .05s }
.d2 { animation-delay: .13s }
.d3 { animation-delay: .21s }
.d4 { animation-delay: .30s }
.d5 { animation-delay: .40s }
.d6 { animation-delay: .50s }
@media (prefers-reduced-motion: reduce) {
  .lp-u, .lp-i { animation: none; opacity: 1; }
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

const FEATURES = [
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
        <rect x="9" y="1" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
        <rect x="1" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
        <rect x="9" y="9" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
      </svg>
    ),
    title: 'Three formats, one place',
    body: 'Theory, MCQs, and coding problems for every topic. No more switching between five tabs.',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M8 4.5v3.75l2.5 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Live coding battles',
    body: 'Race a friend on the same problem in real time. Competitive pressure that actually prepares you.',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 12L6 8l3 3 5-6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Track what matters',
    body: 'Confidence ratings, XP, streaks, weak topic flags. You always know exactly what to study next.',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="5" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
        <circle cx="11" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.3"/>
        <path d="M1 13.5c0-2.21 1.79-4 4-4s4 1.79 4 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
        <path d="M11 9.5c1.657 0 3 1.343 3 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
    title: '10+ subjects, not just DSA',
    body: 'Java, Spring Boot, System Design, React, Angular, RxJS — the full stack of what actually gets asked.',
  },
]

export default function LandingPage() {
  return (
    <div
      style={{
        fontFamily: "'Geist', system-ui, -apple-system, sans-serif",
        background: 'var(--color-bg)',
        color: 'var(--color-text-primary)',
        minHeight: '100vh',
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      <style>{ANIM}</style>

      {/* ── NAV ─────────────────────────────────────── */}
      <nav
        style={{
          position: 'sticky', top: 0, zIndex: 50,
          borderBottom: '1px solid var(--color-border)',
          background: 'color-mix(in oklch, var(--color-bg) 85%, transparent)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
        className="lp-i"
      >
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem', height: 52, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 26, height: 26, borderRadius: 7, background: 'var(--color-accent)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9, fontWeight: 700, color: '#fff', letterSpacing: '.02em',
              fontFamily: 'monospace',
            }}>PA</div>
            <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-.02em', color: 'var(--color-text-primary)' }}>PrepArena</span>
          </div>
          <Link
            to="/login"
            style={{
              fontSize: 13, fontWeight: 500, padding: '6px 14px',
              borderRadius: 8, border: '1px solid var(--color-border)',
              color: 'var(--color-text-primary)', textDecoration: 'none',
              transition: 'border-color .15s, background .15s',
            }}
            onMouseEnter={e => {
              ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--color-accent)'
              ;(e.currentTarget as HTMLElement).style.background = 'color-mix(in oklch, var(--color-accent) 8%, transparent)'
            }}
            onMouseLeave={e => {
              ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'
              ;(e.currentTarget as HTMLElement).style.background = 'transparent'
            }}
          >
            Sign in
          </Link>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────── */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '5rem 1.5rem 4rem', position: 'relative' }}>
        {/* ambient glow */}
        <div
          className="lp-i"
          style={{
            position: 'absolute', top: '20%', left: '50%', transform: 'translate(-50%, -50%)',
            width: 500, height: 280,
            background: 'radial-gradient(ellipse, color-mix(in oklch, var(--color-accent) 18%, transparent) 0%, transparent 70%)',
            pointerEvents: 'none',
            animation: 'lp-glow 4s ease-in-out infinite',
          }}
        />

        <div style={{ textAlign: 'center', position: 'relative' }}>
          {/* eyebrow */}
          <div className="lp-u d1" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: '1.25rem',
            fontSize: 12, fontWeight: 500, color: 'var(--color-text-secondary)',
            border: '1px solid var(--color-border)', borderRadius: 100,
            padding: '4px 12px', letterSpacing: '.02em',
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--color-accent)', display: 'inline-block' }} />
            Free · No signup fee · Open to all
          </div>

          {/* headline */}
          <h1 className="lp-u d2" style={{
            fontSize: 'clamp(2.2rem, 5vw, 3.6rem)',
            fontWeight: 700, letterSpacing: '-.035em', lineHeight: 1.1,
            marginBottom: '1.1rem',
          }}>
            The only prep platform<br />
            you&apos;ll actually <span style={{ color: 'var(--color-accent)' }}>finish.</span>
          </h1>

          {/* subtitle */}
          <p className="lp-u d3" style={{
            fontSize: 'clamp(.95rem, 2vw, 1.05rem)',
            lineHeight: 1.7, color: 'var(--color-text-secondary)',
            maxWidth: 480, margin: '0 auto 2rem', fontWeight: 400,
          }}>
            DSA, Java, SQL, System Design, React and more — theory, MCQs, and coding problems with real-time battles.
          </p>

          {/* CTAs */}
          <div className="lp-u d4" style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3.5rem' }}>
            <Link
              to="/login"
              style={{
                fontSize: 14, fontWeight: 600, padding: '10px 22px',
                borderRadius: 10, background: 'var(--color-accent)',
                color: '#fff', textDecoration: 'none',
                transition: 'opacity .15s, transform .15s',
                letterSpacing: '-.01em',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '.88' }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1' }}
            >
              Start preparing →
            </Link>
            <a
              href="https://twitter.com/intent/tweet?text=I+built+PrepArena+%E2%80%94+a+free+interview+prep+platform+with+DSA%2C+Java%2C+SQL%2C+System+Design%2C+React+%26+more.+Theory%2C+MCQs%2C+and+real-time+coding+battles.+%F0%9F%9A%80%0A%0ACheck+it+out%3A+https%3A%2F%2Fprep-arena.animishchopade.in"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: 14, fontWeight: 500, padding: '10px 22px',
                borderRadius: 10, border: '1px solid var(--color-border)',
                color: 'var(--color-text-secondary)', textDecoration: 'none',
                transition: 'border-color .15s, color .15s',
                letterSpacing: '-.01em',
              }}
              onMouseEnter={e => {
                ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--color-accent)'
                ;(e.currentTarget as HTMLElement).style.color = 'var(--color-text-primary)'
              }}
              onMouseLeave={e => {
                ;(e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'
                ;(e.currentTarget as HTMLElement).style.color = 'var(--color-text-secondary)'
              }}
            >
              Share on X
            </a>
          </div>

          {/* stats */}
          <div className="lp-u d5" style={{
            display: 'inline-flex', gap: 0,
            border: '1px solid var(--color-border)', borderRadius: 12,
            background: 'var(--color-surface)', overflow: 'hidden',
          }}>
            {[['560+', 'Problems'], ['10', 'Subjects'], ['3', 'Formats'], ['∞', 'Battles']].map(([n, l], i) => (
              <div key={l} style={{
                padding: '12px 22px', textAlign: 'center',
                borderRight: i < 3 ? '1px solid var(--color-border)' : undefined,
              }}>
                <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-.03em', color: 'var(--color-text-primary)' }}>{n}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 1, fontWeight: 400 }}>{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SUBJECTS ────────────────────────────────── */}
      <section className="lp-u d6" style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem 4rem' }}>
        <p style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.1em', color: 'var(--color-text-secondary)', marginBottom: '1rem' }}>Subjects covered</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {SUBJECTS.map(({ label, color }) => (
            <div key={label} style={{
              display: 'inline-flex', alignItems: 'center', gap: 7,
              padding: '6px 12px', borderRadius: 8,
              border: '1px solid var(--color-border)',
              background: 'var(--color-surface)',
              fontSize: 13, fontWeight: 500, color: 'var(--color-text-primary)',
              transition: 'border-color .15s',
              cursor: 'default',
            }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = color}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--color-border)'}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0 }} />
              {label}
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────── */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem 5rem' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 1, border: '1px solid var(--color-border)', borderRadius: 12, overflow: 'hidden',
          background: 'var(--color-border)',
        }}>
          {FEATURES.map(({ icon, title, body }) => (
            <div
              key={title}
              style={{
                background: 'var(--color-surface)',
                padding: '1.75rem',
                transition: 'background .15s',
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'color-mix(in oklch, var(--color-accent) 4%, var(--color-surface))'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--color-surface)'}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 8,
                background: 'color-mix(in oklch, var(--color-accent) 12%, var(--color-bg))',
                border: '1px solid var(--color-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--color-accent)', marginBottom: '1rem',
              }}>
                {icon}
              </div>
              <h3 style={{ fontSize: 14, fontWeight: 600, letterSpacing: '-.015em', marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>{title}</h3>
              <p style={{ fontSize: 13, lineHeight: 1.65, color: 'var(--color-text-secondary)', fontWeight: 400 }}>{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────── */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem 6rem' }}>
        <div style={{
          borderRadius: 14, border: '1px solid var(--color-border)',
          background: 'var(--color-surface)',
          padding: '3rem 2rem', textAlign: 'center', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
            width: '40%', height: 1,
            background: 'linear-gradient(90deg, transparent, var(--color-accent), transparent)',
          }} />
          <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 700, letterSpacing: '-.03em', marginBottom: '.5rem' }}>
            Ready to crack that interview?
          </h2>
          <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', marginBottom: '1.75rem', lineHeight: 1.6, fontWeight: 400 }}>
            Free to use. No credit card. Start prepping in 30 seconds.
          </p>
          <Link
            to="/login"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 14, fontWeight: 600, padding: '10px 24px',
              borderRadius: 10, background: 'var(--color-accent)', color: '#fff',
              textDecoration: 'none', transition: 'opacity .15s',
              letterSpacing: '-.01em',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '.88'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
          >
            Open PrepArena →
          </Link>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────── */}
      <footer style={{
        borderTop: '1px solid var(--color-border)',
        maxWidth: 1100, margin: '0 auto', padding: '1.25rem 1.5rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 8,
        fontSize: 12, color: 'var(--color-text-secondary)',
      }}>
        <span>© 2025 PrepArena</span>
        <span>Built on Cloudflare Workers · Made in India 🇮🇳</span>
      </footer>
    </div>
  )
}
