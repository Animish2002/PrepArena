import { Link } from 'react-router-dom'

const CSS = `
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#08090E;--surface:#0D1018;--surface-2:#141822;--border:#1C2235;
  --text:#DDE3EE;--text-2:#566075;--accent:#FF5525;--accent-a:rgba(255,85,37,.1);
  --green:#2CB87A;--gold:#F0B429;--red:#E85454;--purple:#A78BFA;--blue:#60A5FA;
  --sans:-apple-system,'Segoe UI',system-ui,sans-serif;
  --mono:'Cascadia Code','Fira Code','Consolas','Courier New',monospace;
}
@media(prefers-color-scheme:light){:root{
  --bg:#EFF1F8;--surface:#FFFFFF;--surface-2:#E6EAF3;--border:#CDD4E8;
  --text:#0D1018;--text-2:#6B7890;--accent:#E84510;--accent-a:rgba(232,69,16,.09);
}}
:root[data-theme="dark"]{--bg:#08090E;--surface:#0D1018;--surface-2:#141822;--border:#1C2235;--text:#DDE3EE;--text-2:#566075;--accent:#FF5525;--accent-a:rgba(255,85,37,.1)}
:root[data-theme="light"]{--bg:#EFF1F8;--surface:#FFFFFF;--surface-2:#E6EAF3;--border:#CDD4E8;--text:#0D1018;--text-2:#6B7890;--accent:#E84510;--accent-a:rgba(232,69,16,.09)}

.lp{font-family:var(--sans);background:var(--bg);color:var(--text);-webkit-font-smoothing:antialiased;line-height:1.5;min-height:100vh}
a{text-decoration:none;color:inherit}

.lp-nav{position:sticky;top:0;z-index:100;background:var(--bg);border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;height:56px;padding:0 2.5rem}
.lp-logo{display:flex;align-items:center;gap:9px;font-size:15px;font-weight:700;letter-spacing:-.025em}
.lp-logo-badge{width:29px;height:29px;background:var(--accent);border-radius:7px;display:flex;align-items:center;justify-content:center;font-family:var(--mono);font-size:9.5px;font-weight:700;color:#fff}
.btn{display:inline-flex;align-items:center;gap:.4rem;padding:.48rem 1.1rem;border-radius:7px;font-size:.875rem;font-weight:600;letter-spacing:-.01em;cursor:pointer;transition:opacity .14s,border-color .14s;border:1px solid transparent}
.btn-fill{background:var(--accent);color:#fff}
.btn-fill:hover{opacity:.86}
.btn-ghost{background:transparent;color:var(--text);border-color:var(--border)}
.btn-ghost:hover{border-color:var(--text-2)}
.btn-x{background:#000;color:#fff;border-color:transparent;display:inline-flex;align-items:center;gap:.45rem}
.btn-x:hover{opacity:.82}
.btn-lg{padding:.72rem 1.6rem;font-size:.95rem}

.lp-hero{max-width:1160px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;align-items:center;gap:3.5rem;padding:5rem 2.5rem 4.5rem}
.lp-eyebrow{display:inline-flex;align-items:center;gap:7px;margin-bottom:1.5rem;font-size:.68rem;font-weight:600;text-transform:uppercase;letter-spacing:.1em;color:var(--accent);border:1px solid rgba(255,85,37,.28);border-radius:100px;padding:.28rem .75rem}
:root[data-theme="light"] .lp-eyebrow,:root[data-theme="light"] .lp-eyebrow{border-color:rgba(232,69,16,.28)}
@media(prefers-color-scheme:light){.lp-eyebrow{border-color:rgba(232,69,16,.28)}}
.lp-eyebrow-dot{width:5px;height:5px;border-radius:50%;background:var(--accent)}
@keyframes lp-blink{0%,100%{opacity:1}50%{opacity:.3}}
@media(prefers-reduced-motion:no-preference){.lp-eyebrow-dot{animation:lp-blink 2.2s ease-in-out infinite}}
.lp-hero h1{font-size:clamp(2.5rem,4.5vw,4rem);font-weight:900;letter-spacing:-.042em;line-height:1.04;text-wrap:balance;margin-bottom:1.25rem}
.lp-hero h1 em{font-style:normal;color:var(--accent)}
.lp-hero-sub{font-size:1.05rem;line-height:1.72;color:var(--text-2);max-width:42ch;margin-bottom:2rem}
.lp-hero-cta{display:flex;gap:.7rem;flex-wrap:wrap}

.lp-mockup{background:var(--surface);border:1px solid var(--border);border-radius:12px;overflow:hidden;box-shadow:0 36px 90px rgba(0,0,0,.38)}
.m-chrome{background:var(--surface-2);border-bottom:1px solid var(--border);display:flex;align-items:center;gap:5px;padding:.65rem 1rem}
.m-dot{width:9px;height:9px;border-radius:50%}
.m-dot:nth-child(1){background:#FF5F57}
.m-dot:nth-child(2){background:#FEBC2E}
.m-dot:nth-child(3){background:#28C840}
.m-url{margin-left:8px;flex:1;background:var(--border);border-radius:4px;padding:.18rem .55rem;font-family:var(--mono);font-size:.61rem;color:var(--text-2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.m-tabs{display:flex;padding:.4rem .75rem 0;gap:0;border-bottom:1px solid var(--border);overflow-x:auto;scrollbar-width:none}
.m-tabs::-webkit-scrollbar{display:none}
.m-tab{padding:.3rem .6rem;font-size:.68rem;font-weight:600;white-space:nowrap;color:var(--text-2);border-radius:5px 5px 0 0;border:1px solid transparent;margin-bottom:-1px}
.m-tab.on{color:var(--accent);background:var(--bg);border-color:var(--border);border-bottom-color:var(--bg)}
.m-row{display:flex;align-items:center;gap:.6rem;padding:.58rem .9rem;border-bottom:1px solid var(--border);font-size:.72rem;transition:background .1s}
.m-row:last-child{border-bottom:none}
.m-row:hover{background:var(--surface-2)}
.m-n{width:16px;flex-shrink:0;font-family:var(--mono);font-size:.61rem;color:var(--text-2);text-align:right}
.m-t{flex:1;font-weight:500;color:var(--text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tag{flex-shrink:0;font-size:.58rem;font-weight:700;text-transform:uppercase;letter-spacing:.04em;padding:.13rem .42rem;border-radius:100px}
.tag-theory{background:rgba(96,165,250,.14);color:var(--blue)}
.tag-mcq{background:rgba(167,139,250,.14);color:var(--purple)}
.tag-easy{background:rgba(44,184,122,.14);color:var(--green)}
.tag-medium{background:rgba(240,180,41,.14);color:var(--gold)}
.tag-hard{background:rgba(232,84,84,.14);color:var(--red)}
.chk{width:13px;height:13px;flex-shrink:0}
.chk-empty{color:var(--border)}

.lp-subjects{max-width:1160px;margin:0 auto;padding:0 2.5rem 4.5rem}
.lp-label{font-size:.68rem;font-weight:600;text-transform:uppercase;letter-spacing:.1em;color:var(--text-2);margin-bottom:1.2rem}
.lp-pill-row{display:flex;flex-wrap:wrap;gap:.55rem}
.lp-pill{display:inline-flex;align-items:center;gap:.45rem;padding:.44rem .9rem;font-size:.8rem;font-weight:500;background:var(--surface);border:1px solid var(--border);border-radius:100px;color:var(--text);transition:border-color .14s}
.lp-pill:hover{border-color:var(--accent)}

.lp-features{max-width:1160px;margin:0 auto;padding:0 2.5rem 5rem}
.lp-f-grid{display:grid;grid-template-columns:1fr 1fr;border:1px solid var(--border);border-radius:11px;overflow:hidden}
.lp-f-cell{padding:2.25rem;background:var(--surface);border-right:1px solid var(--border);border-bottom:1px solid var(--border);transition:background .14s}
.lp-f-cell:hover{background:var(--surface-2)}
.lp-f-cell:nth-child(2n){border-right:none}
.lp-f-cell:nth-last-child(-n+2){border-bottom:none}
.lp-f-num{font-family:var(--mono);font-size:.66rem;color:var(--accent);margin-bottom:.8rem;letter-spacing:.06em}
.lp-f-cell h3{font-size:.95rem;font-weight:700;letter-spacing:-.025em;margin-bottom:.5rem;color:var(--text)}
.lp-f-cell p{font-size:.84rem;line-height:1.7;color:var(--text-2)}

.lp-stats{border-top:1px solid var(--border);border-bottom:1px solid var(--border);margin-bottom:5rem}
.lp-stats-inner{max-width:1160px;margin:0 auto;padding:0 2.5rem;display:grid;grid-template-columns:repeat(4,1fr)}
.lp-s-cell{padding:2.25rem 1.25rem;text-align:center;border-right:1px solid var(--border)}
.lp-s-cell:last-child{border-right:none}
.lp-s-num{display:block;font-size:2.5rem;font-weight:900;letter-spacing:-.05em;margin-bottom:.2rem}
.lp-s-lbl{font-size:.79rem;color:var(--text-2)}

.lp-cta-wrap{max-width:1160px;margin:0 auto 6rem;padding:0 2.5rem}
.lp-cta-box{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:4rem 2rem;text-align:center;position:relative;overflow:hidden}
.lp-cta-line{position:absolute;top:0;left:50%;transform:translateX(-50%);width:52%;height:1px;background:linear-gradient(90deg,transparent,var(--accent),transparent)}
.lp-cta-box h2{font-size:clamp(1.7rem,3vw,2.5rem);font-weight:900;letter-spacing:-.042em;text-wrap:balance;margin-bottom:.7rem}
.lp-cta-box p{font-size:1rem;color:var(--text-2);margin-bottom:2rem}
.lp-cta-btns{display:flex;justify-content:center;gap:.7rem;flex-wrap:wrap}

.lp-footer{max-width:1160px;margin:0 auto;padding:1.5rem 2.5rem;border-top:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;font-size:.78rem;color:var(--text-2)}

@media(max-width:860px){
  .lp-hero{grid-template-columns:1fr;gap:2.5rem;padding:3rem 1.5rem}
  .lp-hero-sub{max-width:none}
}
@media(max-width:680px){
  .lp-nav{padding:0 1.25rem}
  .lp-subjects,.lp-features,.lp-cta-wrap{padding-left:1.25rem;padding-right:1.25rem}
  .lp-stats-inner{grid-template-columns:1fr 1fr;padding:0 1.25rem}
  .lp-s-cell:nth-child(2){border-right:none}
  .lp-s-cell:nth-child(3){border-top:1px solid var(--border)}
  .lp-f-grid{grid-template-columns:1fr}
  .lp-f-cell{border-right:none!important;border-bottom:1px solid var(--border)!important}
  .lp-f-cell:last-child{border-bottom:none!important}
  .lp-footer{flex-direction:column;gap:.4rem;text-align:center}
}
`

const TWEET_URL =
  'https://twitter.com/intent/tweet?text=I+built+PrepArena+%E2%80%94+a+free+interview+prep+platform+with+DSA%2C+Java%2C+SQL%2C+System+Design%2C+React+%26+more.+Theory%2C+MCQs%2C+and+real-time+coding+battles.+%F0%9F%9A%80%0A%0ACheck+it+out%3A+https%3A%2F%2Fprep-arena.animishchopade.in'

export default function LandingPage() {
  return (
    <div className="lp">
      <style>{CSS}</style>

      {/* NAV */}
      <nav className="lp-nav">
        <div className="lp-logo">
          <div className="lp-logo-badge">PA</div>
          PrepArena
        </div>
        <Link to="/login" className="btn btn-fill">Start Free →</Link>
      </nav>

      {/* HERO */}
      <section className="lp-hero">
        <div>
          <div className="lp-eyebrow">
            <span className="lp-eyebrow-dot" />
            Built for 10 LPA+ roles
          </div>
          <h1>Crack your next<br /><em>tech interview.</em></h1>
          <p className="lp-hero-sub">
            DSA, System Design, Java, SQL, React — theory, MCQs, and coding problems in one platform,
            with real-time battles to sharpen your edge.
          </p>
          <div className="lp-hero-cta">
            <Link to="/login" className="btn btn-fill btn-lg">Start Preparing →</Link>
            <Link to="/login" className="btn btn-ghost btn-lg">Explore subjects</Link>
          </div>
        </div>

        {/* product mockup */}
        <div className="lp-mockup" role="img" aria-label="PrepArena problem list interface preview">
          <div className="m-chrome">
            <span className="m-dot" /><span className="m-dot" /><span className="m-dot" />
            <span className="m-url">prep-arena.animishchopade.in/problems</span>
          </div>
          <div className="m-tabs">
            <span className="m-tab">DSA</span>
            <span className="m-tab on">Java</span>
            <span className="m-tab">SQL</span>
            <span className="m-tab">System Design</span>
            <span className="m-tab">React</span>
          </div>
          <div className="m-row">
            <span className="m-n">1</span>
            <span className="m-t">JVM Memory Model &amp; Heap vs Stack</span>
            <span className="tag tag-theory">Theory</span>
            <span className="tag tag-medium">Medium</span>
            <svg className="chk" viewBox="0 0 13 13" fill="none" aria-label="solved"><circle cx="6.5" cy="6.5" r="6" stroke="#2CB87A" strokeWidth="1.1"/><path d="M3.5 6.5l2 2 4-3" stroke="#2CB87A" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div className="m-row">
            <span className="m-n">2</span>
            <span className="m-t">HashMap Internals &amp; Collision Handling</span>
            <span className="tag tag-mcq">MCQ</span>
            <span className="tag tag-medium">Medium</span>
            <svg className="chk chk-empty" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="6" stroke="currentColor" strokeWidth="1.1"/></svg>
          </div>
          <div className="m-row">
            <span className="m-n">3</span>
            <span className="m-t">Multithreading: synchronized vs volatile</span>
            <span className="tag tag-theory">Theory</span>
            <span className="tag tag-hard">Hard</span>
            <svg className="chk" viewBox="0 0 13 13" fill="none" aria-label="solved"><circle cx="6.5" cy="6.5" r="6" stroke="#2CB87A" strokeWidth="1.1"/><path d="M3.5 6.5l2 2 4-3" stroke="#2CB87A" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
          <div className="m-row">
            <span className="m-n">4</span>
            <span className="m-t">Spring Boot DI vs IoC Container</span>
            <span className="tag tag-mcq">MCQ</span>
            <span className="tag tag-easy">Easy</span>
            <svg className="chk chk-empty" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="6" stroke="currentColor" strokeWidth="1.1"/></svg>
          </div>
          <div className="m-row">
            <span className="m-n">5</span>
            <span className="m-t">Design a URL Shortener (System Design)</span>
            <span className="tag tag-theory">Theory</span>
            <span className="tag tag-hard">Hard</span>
            <svg className="chk chk-empty" viewBox="0 0 13 13" fill="none"><circle cx="6.5" cy="6.5" r="6" stroke="currentColor" strokeWidth="1.1"/></svg>
          </div>
        </div>
      </section>

      {/* SUBJECTS */}
      <section className="lp-subjects">
        <p className="lp-label">10+ subjects covered</p>
        <div className="lp-pill-row">
          {['🌲 DSA','☕ Java','🗄️ SQL','📐 OOPs','🍃 Spring Boot','🏗️ System Design','⚡ JavaScript','⚛️ React','🔺 Angular','🔁 RxJS'].map((s) => (
            <span key={s} className="lp-pill">{s}</span>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="lp-features">
        <div className="lp-f-grid">
          {[
            ['01','Theory, MCQ, and Coding — all in one','Every topic covered in three formats. Read the concept, verify it with a quiz, prove it with a problem. No more bouncing between five different sites.'],
            ['02','Real-time battles','Challenge friends to live coding duels — same problem, one timer, race to solve. Competitive pressure before the real interview makes the real interview easier.'],
            ['03','10+ subjects, not just DSA','Java, Spring Boot, System Design, React, SQL, RxJS — everything that actually gets asked at 10 LPA+ companies, not just LeetCode arrays.'],
            ['04','Progress that tells you what to fix','Rate your confidence after every problem. Earn XP, track your streak, get flagged on weak topics. Know exactly what to study next — no guessing.'],
          ].map(([num, title, desc]) => (
            <div key={num} className="lp-f-cell">
              <div className="lp-f-num">{num}</div>
              <h3>{title}</h3>
              <p>{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* STATS */}
      <div className="lp-stats">
        <div className="lp-stats-inner">
          {[['560+','Problems seeded'],['10','Subjects covered'],['3','Question formats'],['∞','Battles to fight']].map(([n,l]) => (
            <div key={l} className="lp-s-cell">
              <span className="lp-s-num">{n}</span>
              <span className="lp-s-lbl">{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <section className="lp-cta-wrap">
        <div className="lp-cta-box">
          <div className="lp-cta-line" />
          <h2>Ready to crack that 10 LPA+ offer?</h2>
          <p>Stop grinding alone. Prep smarter across every subject that gets asked.</p>
          <div className="lp-cta-btns">
            <Link to="/login" className="btn btn-fill btn-lg">Open PrepArena →</Link>
            <a href={TWEET_URL} target="_blank" rel="noopener noreferrer" className="btn btn-x btn-lg">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.261 5.632 5.904-5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              Post on X
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="lp-footer">
        <span>© 2025 PrepArena</span>
        <span>Built on Cloudflare Workers · Made in India 🇮🇳</span>
      </footer>
    </div>
  )
}
