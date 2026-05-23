import Link from 'next/link'

export const metadata = {
  title: 'About Us — AltSignals',
  description: 'Learn about AltSignals, a professional trading signals and fund management platform built by traders for traders.'
}

export default function AboutPage() {
  return (
    <div style={{ background: '#0A0A0F', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@600;700&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        nav { position:sticky; top:0; background:rgba(10,10,15,0.97); border-bottom:1px solid rgba(0,229,255,0.12); padding:20px 60px; display:flex; align-items:center; justify-content:space-between; z-index:100; backdrop-filter:blur(12px); }
        .hero { padding:120px 60px 80px; max-width:1200px; margin:0 auto; }
        .eyebrow { font-size:10px; font-weight:600; letter-spacing:4px; text-transform:uppercase; color:#00E5FF; margin-bottom:20px; display:flex; align-items:center; gap:14px; }
        .eyebrow::before { content:''; display:block; width:40px; height:1px; background:#00E5FF; }
        h1 { font-family:'Space Grotesk',sans-serif; font-size:clamp(40px,5vw,68px); font-weight:700; color:#E8E4DC; line-height:1.1; margin-bottom:24px; }
        h1 span { color:#00E5FF; }
        .lead { font-size:15px; font-weight:300; line-height:1.9; color:#8A8E99; max-width:620px; }
        section { padding:80px 60px; max-width:1200px; margin:0 auto; }
        h2 { font-family:'Space Grotesk',sans-serif; font-size:36px; font-weight:700; color:#E8E4DC; margin-bottom:20px; }
        h2 span { color:#00E5FF; }
        p { font-size:14px; font-weight:300; line-height:1.9; color:#8A8E99; margin-bottom:16px; }
        .stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:2px; background:rgba(0,229,255,0.08); margin:60px 0; }
        .stat-block { background:#0F0F1A; padding:40px 32px; }
        .stat-num { font-family:'Space Grotesk',sans-serif; font-size:48px; font-weight:700; color:#00E5FF; line-height:1; margin-bottom:8px; }
        .stat-label { font-size:10px; font-weight:600; letter-spacing:2px; text-transform:uppercase; color:#8A8E99; }
        .values-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-top:40px; }
        .value-card { background:#0F0F1A; border:1px solid rgba(0,229,255,0.08); padding:32px; position:relative; }
        .value-card::before { content:''; position:absolute; top:0; left:0; width:100%; height:2px; background:linear-gradient(90deg,#00E5FF,transparent); }
        .value-title { font-family:'Space Grotesk',sans-serif; font-size:18px; font-weight:700; color:#E8E4DC; margin-bottom:12px; }
        .value-desc { font-size:13px; color:#8A8E99; line-height:1.8; margin:0; }
        .team-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; margin-top:40px; }
        .team-card { background:#0F0F1A; border:1px solid rgba(0,229,255,0.08); overflow:hidden; }
        .team-photo { height:160px; background:linear-gradient(135deg,rgba(0,229,255,0.1),rgba(0,229,255,0.02)); display:flex; align-items:center; justify-content:center; font-family:'Space Grotesk',sans-serif; font-size:56px; font-weight:700; color:rgba(0,229,255,0.2); }
        .team-info { padding:24px; }
        .team-name { font-family:'Space Grotesk',sans-serif; font-size:18px; font-weight:700; color:#E8E4DC; margin-bottom:4px; }
        .team-role { font-size:9px; font-weight:600; letter-spacing:2px; text-transform:uppercase; color:#00E5FF; margin-bottom:10px; }
        .team-bio { font-size:12px; color:#8A8E99; line-height:1.7; margin:0; }
        .cta-block { background:#0F0F1A; border:1px solid rgba(0,229,255,0.12); padding:60px; text-align:center; margin:0 60px 80px; position:relative; }
        .cta-block::before { content:''; position:absolute; top:0; left:0; width:100%; height:2px; background:linear-gradient(90deg,#00E5FF,transparent); }
        .btn { display:inline-flex; align-items:center; background:#00E5FF; color:#0A0A0F; padding:14px 32px; font-size:11px; font-weight:700; letter-spacing:2px; text-transform:uppercase; text-decoration:none; clip-path:polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%); }
        @media(max-width:900px){ nav{padding:16px 20px;} .hero,.cta-block{padding:60px 20px;} section{padding:60px 20px;} .stats-grid{grid-template-columns:1fr 1fr;} .values-grid{grid-template-columns:1fr;} .team-grid{grid-template-columns:1fr;} .cta-block{margin:0 20px 60px;} }
      `}</style>

      <nav>
        <Link href="/" style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'18px', fontWeight:'700', textDecoration:'none', color:'#E8E4DC' }}>
          <span style={{ color:'#00E5FF' }}>ALT</span>SIGNALS
        </Link>
        <div style={{ display:'flex', gap:'32px', alignItems:'center' }}>
          <Link href="/contact" style={{ fontSize:'10px', fontWeight:'500', letterSpacing:'2px', textTransform:'uppercase', color:'#8A8E99', textDecoration:'none' }}>Contact</Link>
          <Link href="/auth/register" style={{ fontSize:'10px', fontWeight:'700', letterSpacing:'2px', textTransform:'uppercase', color:'#0A0A0F', background:'#00E5FF', padding:'10px 24px', textDecoration:'none', clipPath:'polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)' }}>Get Started</Link>
        </div>
      </nav>

      <div className="hero">
        <div className="eyebrow">Est. 2019 · London, UK</div>
        <h1>Built by traders.<br />Built for <span>winners.</span></h1>
        <p className="lead">AltSignals was born from frustration with mediocre signals and unreliable platforms. We built the platform we always wanted — professional, transparent, and consistently profitable.</p>
      </div>

      <div style={{ padding:'0 60px', maxWidth:'1200px', margin:'0 auto' }}>
        <div className="stats-grid">
          {[
            { num:'95%', label:'Signal Win Rate' },
            { num:'12K+', label:'Active Members' },
            { num:'$48M+', label:'Profits Generated' },
            { num:'5 Yrs', label:'Track Record' },
          ].map((s,i) => (
            <div key={i} className="stat-block">
              <div className="stat-num">{s.num}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <section>
        <div className="eyebrow">Our Story</div>
        <h2>Where <span>precision</span> meets profit</h2>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'48px' }}>
          <div>
            <p>AltSignals was founded in 2019 by a team of professional traders who had spent years trading at institutional desks and were tired of the noise in retail trading. The signals market was flooded with charlatans promising 100x returns with no accountability.</p>
            <p>We set out to build something different — a platform where every signal is backed by live trading results, where fund management is transparent, and where members are treated as serious investors deserving of real information.</p>
          </div>
          <div>
            <p>Today, AltSignals serves over 12,000 active members across 40+ countries. Our fund management program has generated over $48 million in documented profits for our members, with a signal win rate that has consistently exceeded 90% over five years.</p>
            <p>We operate with a simple philosophy: <strong style={{color:'#E8E4DC'}}>if our members win, we win.</strong> Every decision we make is guided by that principle.</p>
          </div>
        </div>
      </section>

      <section style={{ background:'#0F0F1A', maxWidth:'100%', padding:'80px 60px' }}>
        <div style={{ maxWidth:'1200px', margin:'0 auto' }}>
          <div className="eyebrow">Our Values</div>
          <h2>The principles that <span>guide</span> every decision</h2>
          <div className="values-grid">
            {[
              { title:'Radical Transparency', desc:'Every signal we send is tracked. Every fund management result is documented. We publish our performance because we have nothing to hide and everything to prove.' },
              { title:'Disciplined Process', desc:'Our trading decisions are guided by rigorous research and consistent risk management. We do not chase trends or make emotional decisions. Our edge is in the discipline of our methodology.' },
              { title:'Member Alignment', desc:'We invest our own capital alongside our members. When our members succeed, we succeed. This alignment of interests ensures that every decision we make is in the best long-term interest of our community.' },
              { title:'Continuous Education', desc:'Markets evolve. Strategies that worked yesterday may not work tomorrow. We invest heavily in educating our members so they can adapt and grow as independent traders.' },
              { title:'Risk Management First', desc:'Preservation of capital is as important as its growth. We employ sophisticated risk management frameworks across all our services, ensuring downside protection is always a primary consideration.' },
              { title:'Community Driven', desc:'AltSignals is more than a platform — it is a community of serious traders helping each other grow. Our Telegram groups, challenges, and mentorship programs reflect this commitment.' },
            ].map((v,i) => (
              <div key={i} className="value-card">
                <div className="value-title">{v.title}</div>
                <p className="value-desc">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="eyebrow">Leadership</div>
        <h2>The team behind <span>your results</span></h2>
        <div className="team-grid">
          {[
            { initials:'MK', name:'Marcus Kane', role:'Founder & Head Trader', bio:'15 years of professional trading across crypto, forex and commodities. Former quantitative analyst at a leading London hedge fund. Architect of the AltSignals proprietary signal framework.' },
            { initials:'SR', name:'Sofia Reyes', role:'Director of Fund Management', bio:'Specialist in structured investment strategies and portfolio management. Previously managed a $200M crypto fund. Oversees all AltSignals fund management operations and risk protocols.' },
            { initials:'JT', name:'James Thornton', role:'Head of Education & Coaching', bio:'Professional trading coach with 10 years of experience training retail traders. Developed the AltSignals trading curriculum and mentorship programme used by thousands of members.' },
          ].map((m,i) => (
            <div key={i} className="team-card">
              <div className="team-photo">{m.initials}</div>
              <div className="team-info">
                <div className="team-name">{m.name}</div>
                <div className="team-role">{m.role}</div>
                <p className="team-bio">{m.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="cta-block">
        <div style={{ fontSize:'9px', fontWeight:'600', letterSpacing:'4px', textTransform:'uppercase', color:'#00E5FF', marginBottom:'20px' }}>Join AltSignals</div>
        <h2 style={{ marginBottom:'16px' }}>Ready to start <span>winning?</span></h2>
        <p style={{ maxWidth:'440px', margin:'0 auto 32px', fontSize:'14px' }}>Join over 12,000 traders already growing their wealth with AltSignals. Start with as little as $2,000.</p>
        <Link href="/auth/register" className="btn">Create Account →</Link>
      </div>

      <div style={{ padding:'32px 60px', borderTop:'1px solid rgba(0,229,255,0.08)', textAlign:'center', fontSize:'11px', color:'#8A8E99' }}>
        © 2026 AltSignals Ltd. ·{' '}
        <Link href="/legal/privacy-policy" style={{ color:'#8A8E99', textDecoration:'none' }}>Privacy Policy</Link> ·{' '}
        <Link href="/legal/terms-of-service" style={{ color:'#8A8E99', textDecoration:'none' }}>Terms of Service</Link>
      </div>
    </div>
  )
}