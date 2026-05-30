'use client'
import { useRouter } from 'next/navigation'

export default function LandingPage() {
  const router = useRouter()

  function handleProtectedRoute(path) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('as_token') : null
    if (token) {
      router.push(path)
    } else {
      router.push('/auth/login?redirect=' + path)
    }
  }

  return (
    <div style={{
      fontFamily: "'Inter', 'Montserrat', sans-serif",
      background: '#0A0A0F',
      color: '#E8E4DC',
      overflowX: 'hidden',
      minHeight: '100vh'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
        :root {
          --cyan: #00E5FF;
          --cyan-dim: rgba(0,229,255,0.15);
          --cyan-border: rgba(0,229,255,0.2);
          --black: #0A0A0F;
          --deep: #0F0F1A;
          --surface: #111320;
          --surface2: #161830;
          --text: #E8E4DC;
          --muted: #8A8E99;
          --border: rgba(0,229,255,0.12);
          --green: #00FF88;
          --purple: #7B61FF;
        }
        * { margin:0; padding:0; box-sizing:border-box; }
        html { scroll-behavior:smooth; }
        .nav {
          position:fixed; top:0; left:0; right:0; z-index:100;
          display:flex; align-items:center; justify-content:space-between;
          padding:20px 60px;
          background:rgba(10,10,15,0.95);
          backdrop-filter:blur(12px);
          border-bottom:1px solid var(--border);
        }
        .nav-logo { display:flex; align-items:center; gap:10px; text-decoration:none; cursor:pointer; }
        .nav-logo-text { font-family:'Space Grotesk',sans-serif; font-size:20px; font-weight:700; letter-spacing:1px; color:var(--text); }
        .nav-logo-text span { color:var(--cyan); }
        .nav-links { display:flex; gap:32px; align-items:center; }
        .nav-links a { font-size:11px; font-weight:500; letter-spacing:1.5px; text-transform:uppercase; color:var(--muted); text-decoration:none; transition:color 0.3s; }
        .nav-links a:hover { color:var(--cyan); }
        .nav-cta { font-size:11px; font-weight:600; letter-spacing:1.5px; text-transform:uppercase; color:var(--black); background:var(--cyan); padding:10px 24px; text-decoration:none; transition:all 0.3s; cursor:pointer; border:none; clip-path:polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%); }
        .nav-cta:hover { background:#33EEFF; }
        .hero { min-height:100vh; display:flex; align-items:center; padding:120px 60px 80px; position:relative; overflow:hidden; }
        .hero-bg { position:absolute; inset:0; background:radial-gradient(ellipse 70% 70% at 60% 40%, rgba(0,229,255,0.06) 0%, transparent 60%), linear-gradient(135deg, #0A0A0F 0%, #0F0F1A 50%, #0A0A0F 100%); }
        .hero-grid { position:absolute; inset:0; background-image:linear-gradient(rgba(0,229,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.03) 1px, transparent 1px); background-size:60px 60px; }
        .hero-glow { position:absolute; top:20%; right:10%; width:400px; height:400px; background:radial-gradient(circle, rgba(0,229,255,0.08) 0%, transparent 70%); border-radius:50%; }
        .hero-inner { position:relative; z-index:2; width:100%; display:flex; align-items:center; justify-content:space-between; gap:48px; }
        .hero-content { flex:1; min-width:0; max-width:620px; }
        .hero-badge { display:inline-flex; align-items:center; gap:8px; background:rgba(0,229,255,0.08); border:1px solid rgba(0,229,255,0.2); padding:6px 14px; margin-bottom:24px; }
        .hero-badge-dot { width:6px; height:6px; background:var(--cyan); border-radius:50%; animation:pulse 2s infinite; }
        .hero-badge-text { font-size:10px; font-weight:600; letter-spacing:2px; text-transform:uppercase; color:var(--cyan); }
        .hero-title { font-family:'Space Grotesk',sans-serif; font-size:clamp(40px,5vw,72px); font-weight:700; line-height:1.05; color:var(--text); margin-bottom:20px; }
        .hero-title span { color:var(--cyan); }
        .hero-sub { font-size:15px; font-weight:300; line-height:1.8; color:var(--muted); max-width:480px; margin-bottom:40px; }
        .hero-actions { display:flex; gap:16px; align-items:center; flex-wrap:wrap; }
        .btn-primary { font-size:11px; font-weight:600; letter-spacing:2px; text-transform:uppercase; color:var(--black); background:var(--cyan); padding:14px 32px; text-decoration:none; display:inline-flex; align-items:center; gap:10px; transition:all 0.3s; cursor:pointer; border:none; clip-path:polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%); white-space:nowrap; }
        .btn-primary:hover { background:#33EEFF; transform:translateY(-2px); }
        .btn-ghost { font-size:11px; font-weight:600; letter-spacing:2px; text-transform:uppercase; color:var(--cyan); text-decoration:none; display:inline-flex; align-items:center; gap:8px; transition:all 0.3s; cursor:pointer; background:none; border:1px solid rgba(0,229,255,0.3); padding:13px 28px; }
        .btn-ghost:hover { border-color:var(--cyan); background:rgba(0,229,255,0.05); }
        .hero-panel { flex-shrink:0; width:300px; }
        .hero-panel-inner { background:var(--surface); border:1px solid var(--border); padding:28px; position:relative; }
        .hero-panel-inner::before { content:''; position:absolute; top:0; left:0; width:100%; height:2px; background:linear-gradient(90deg,var(--cyan),transparent); }
        .panel-label { font-size:9px; font-weight:600; letter-spacing:3px; text-transform:uppercase; color:var(--cyan); margin-bottom:20px; }
        .panel-metric { margin-bottom:16px; padding-bottom:16px; border-bottom:1px solid var(--border); }
        .panel-metric:last-of-type { border-bottom:none; margin-bottom:0; padding-bottom:0; }
        .panel-metric-label { font-size:9px; font-weight:500; letter-spacing:1.5px; text-transform:uppercase; color:var(--muted); margin-bottom:4px; }
        .panel-metric-value { font-family:'Space Grotesk',sans-serif; font-size:28px; font-weight:700; color:var(--text); line-height:1; }
        .panel-metric-value span { color:var(--cyan); font-size:16px; }
        .panel-metric-sub { font-size:10px; color:var(--green); margin-top:3px; }
        .ticker-strip { background:var(--surface); border-top:1px solid var(--border); border-bottom:1px solid var(--border); padding:12px 0; overflow:hidden; white-space:nowrap; }
        .ticker-inner { display:inline-flex; gap:60px; animation:marquee 30s linear infinite; }
        .ticker-item { display:inline-flex; align-items:center; gap:8px; font-size:10px; font-weight:500; letter-spacing:1.5px; text-transform:uppercase; color:var(--muted); }
        .up { color:var(--green); }
        .down { color:#FF4444; }
        @keyframes marquee { from{transform:translateX(0);}to{transform:translateX(-50%);} }
        @keyframes pulse { 0%,100%{opacity:1;}50%{opacity:0.4;} }
        section { padding:100px 60px; }
        .section-tag { display:inline-flex; align-items:center; gap:8px; background:rgba(0,229,255,0.06); border:1px solid rgba(0,229,255,0.15); padding:5px 12px; margin-bottom:16px; }
        .section-tag-text { font-size:9px; font-weight:600; letter-spacing:3px; text-transform:uppercase; color:var(--cyan); }
        .section-title { font-family:'Space Grotesk',sans-serif; font-size:clamp(30px,4vw,48px); font-weight:700; line-height:1.15; color:var(--text); }
        .section-title span { color:var(--cyan); }
        .plans-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:2px; background:var(--border); margin-top:60px; }
        .plan-card { background:var(--deep); padding:32px 28px; position:relative; overflow:hidden; transition:background 0.3s; cursor:pointer; }
        .plan-card:hover { background:var(--surface); }
        .plan-card::before { content:''; position:absolute; top:0; left:0; width:100%; height:2px; background:linear-gradient(90deg,var(--cyan),transparent); transform:scaleX(0); transform-origin:left; transition:transform 0.4s; }
        .plan-card:hover::before { transform:scaleX(1); }
        .plan-tier { font-size:9px; font-weight:700; letter-spacing:3px; text-transform:uppercase; color:var(--cyan); margin-bottom:16px; }
        .plan-amount { font-family:'Space Grotesk',sans-serif; font-size:36px; font-weight:700; color:var(--text); line-height:1; margin-bottom:6px; }
        .plan-return { font-family:'Space Grotesk',sans-serif; font-size:18px; font-weight:600; color:var(--green); margin-bottom:12px; }
        .plan-duration { font-size:10px; font-weight:500; letter-spacing:1.5px; text-transform:uppercase; color:var(--muted); margin-bottom:20px; }
        .plan-cta { font-size:9px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:var(--cyan); }
        .stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:32px; margin-top:60px; }
        .stat-card { border-left:2px solid var(--cyan-border); padding-left:20px; }
        .stat-num { font-family:'Space Grotesk',sans-serif; font-size:44px; font-weight:700; color:var(--cyan); line-height:1; }
        .stat-label { font-size:10px; font-weight:500; letter-spacing:1.5px; text-transform:uppercase; color:var(--muted); margin-top:6px; }
        .services-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:2px; background:var(--border); margin-top:60px; }
        .service-card { background:var(--deep); padding:40px 32px; position:relative; overflow:hidden; transition:background 0.3s; cursor:pointer; }
        .service-card:hover { background:var(--surface); }
        .service-num { font-family:'Space Grotesk',sans-serif; font-size:56px; font-weight:700; color:rgba(0,229,255,0.06); line-height:1; margin-bottom:20px; }
        .service-title { font-family:'Space Grotesk',sans-serif; font-size:20px; font-weight:600; color:var(--text); margin-bottom:10px; }
        .service-desc { font-size:13px; font-weight:300; line-height:1.8; color:var(--muted); margin-bottom:20px; }
        .service-tags { display:flex; flex-wrap:wrap; gap:8px; }
        .service-tag { font-size:9px; font-weight:600; letter-spacing:1.5px; text-transform:uppercase; color:var(--cyan); border:1px solid rgba(0,229,255,0.2); padding:4px 10px; }
        .vip-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:20px; margin-top:60px; }
        .vip-card { background:var(--surface); border:1px solid var(--border); padding:32px; position:relative; transition:all 0.3s; cursor:pointer; }
        .vip-card:hover { border-color:var(--cyan); transform:translateY(-4px); }
        .vip-card.featured { border-color:rgba(0,229,255,0.4); background:var(--surface2); }
        .vip-card.featured::before { content:'MOST POPULAR'; position:absolute; top:-12px; left:50%; transform:translateX(-50%); background:var(--cyan); color:var(--black); font-size:8px; font-weight:700; letter-spacing:2px; padding:4px 12px; white-space:nowrap; }
        .vip-tier { font-size:9px; font-weight:700; letter-spacing:3px; text-transform:uppercase; color:var(--cyan); margin-bottom:12px; }
        .vip-price { font-family:'Space Grotesk',sans-serif; font-size:48px; font-weight:700; color:var(--text); line-height:1; margin-bottom:4px; }
        .vip-period { font-size:11px; color:var(--muted); margin-bottom:24px; }
        .vip-features { list-style:none; margin-bottom:28px; }
        .vip-features li { font-size:12px; color:var(--muted); padding:6px 0; border-bottom:1px solid rgba(255,255,255,0.04); display:flex; align-items:center; gap:8px; }
        .vip-features li::before { content:'✓'; color:var(--cyan); font-weight:700; flex-shrink:0; }
        .cta-section { background:var(--deep); padding:120px 60px; text-align:center; position:relative; overflow:hidden; }
        .cta-section::before { content:''; position:absolute; inset:0; background:radial-gradient(ellipse 60% 60% at 50% 50%, rgba(0,229,255,0.05) 0%, transparent 70%); }
        .cta-title { font-family:'Space Grotesk',sans-serif; font-size:clamp(32px,5vw,60px); font-weight:700; line-height:1.1; margin-bottom:16px; position:relative; z-index:1; }
        .cta-title span { color:var(--cyan); }
        .cta-sub { font-size:14px; font-weight:300; color:var(--muted); max-width:440px; margin:0 auto 40px; line-height:1.8; position:relative; z-index:1; }
        .cta-actions { display:flex; justify-content:center; gap:16px; position:relative; z-index:1; flex-wrap:wrap; }
        footer { background:#050508; padding:60px; border-top:1px solid var(--border); }
        .footer-top { display:grid; grid-template-columns:2fr 1fr 1fr 1fr; gap:60px; margin-bottom:48px; }
        .footer-logo-text { font-family:'Space Grotesk',sans-serif; font-size:18px; font-weight:700; letter-spacing:1px; margin-bottom:12px; }
        .footer-logo-text span { color:var(--cyan); }
        .footer-tagline { font-size:12px; font-weight:300; line-height:1.8; color:var(--muted); max-width:260px; }
        .footer-col-title { font-size:9px; font-weight:700; letter-spacing:3px; text-transform:uppercase; color:var(--cyan); margin-bottom:16px; }
        .footer-col a { display:block; font-size:12px; font-weight:300; color:var(--muted); text-decoration:none; margin-bottom:8px; transition:color 0.3s; }
        .footer-col a:hover { color:var(--text); }
        .footer-bottom { display:flex; align-items:center; justify-content:space-between; padding-top:32px; border-top:1px solid var(--border); flex-wrap:wrap; gap:16px; }
        .footer-legal { font-size:10px; color:var(--muted); }
        .footer-disclaimer { font-size:9px; color:rgba(138,142,153,0.5); max-width:480px; text-align:right; line-height:1.7; }
        @media(max-width:1100px){
          .nav{padding:16px 32px;}
          .nav-links{gap:20px;}
          .hero{padding:100px 32px 60px;}
          section{padding:80px 32px;}
          .plans-grid{grid-template-columns:repeat(2,1fr);}
          .footer-top{grid-template-columns:1fr 1fr;gap:40px;}
          .vip-grid{grid-template-columns:repeat(2,1fr);}
        }
        @media(max-width:800px){
          .nav{padding:14px 20px;}
          .nav-links{display:none;}
          .hero{padding:90px 20px 60px;}
          .hero-inner{flex-direction:column;}
          .hero-panel{width:100%;}
          section{padding:64px 20px;}
          .plans-grid{grid-template-columns:1fr;}
          .services-grid{grid-template-columns:1fr;}
          .stats-grid{grid-template-columns:1fr 1fr;gap:24px;}
          .footer-top{grid-template-columns:1fr 1fr;gap:32px;}
          .cta-section{padding:80px 20px;}
          footer{padding:40px 20px;}
          .vip-grid{grid-template-columns:1fr;}
        }
        @media(max-width:480px){
          .stats-grid{grid-template-columns:1fr;}
          .footer-top{grid-template-columns:1fr;}
          .footer-disclaimer{text-align:left;}
        }
      `}</style>

      {/* NAV */}
      <nav className="nav">
        <div className="nav-logo" onClick={() => router.push('/')}>
          <span className="nav-logo-text"><span>ALT</span>SIGNALS</span>
        </div>
        <div className="nav-links">
          <a href="/about">About</a>
          <a href="/performance">Performance</a>
          <a href="#plans">Plans</a>
          <a href="#services">Services</a>
          <a href="/contact">Contact</a>
        </div>
        <button className="nav-cta" onClick={() => router.push('/auth/register')}>
          Get Started
        </button>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-bg"></div>
        <div className="hero-grid"></div>
        <div className="hero-glow"></div>
        <div className="hero-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <div className="hero-badge-dot"></div>
              <span className="hero-badge-text">Live Trading — 95% Win Rate</span>
            </div>
            <h1 className="hero-title">
              Trade Smarter.<br />
              Earn <span>Consistently.</span><br />
              Scale Fast.
            </h1>
            <p className="hero-sub">
              AltSignals delivers institutional-grade trading signals, expert fund management and copy trading for traders who demand results. Join thousands of profitable traders worldwide.
            </p>
            <div className="hero-actions">
              <button className="btn-primary" onClick={() => router.push('/auth/register')}>
                Start Trading →
              </button>
              <button className="btn-ghost" onClick={() => router.push('/auth/login')}>
                Member Login
              </button>
            </div>
          </div>
          <div className="hero-panel">
            <div className="hero-panel-inner">
              <div className="panel-label">Live Performance</div>
              <div className="panel-metric">
                <div className="panel-metric-label">Total Members</div>
                <div className="panel-metric-value">12,<span>847</span></div>
                <div className="panel-metric-sub">▲ 340 joined this week</div>
              </div>
              <div className="panel-metric">
                <div className="panel-metric-label">Avg. Weekly ROI</div>
                <div className="panel-metric-value">+42<span>%</span></div>
                <div className="panel-metric-sub">▲ Across all plans</div>
              </div>
              <div className="panel-metric">
                <div className="panel-metric-label">Win Rate</div>
                <div className="panel-metric-value">95<span>%</span></div>
                <div className="panel-metric-sub">▲ Last 30 days</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TICKER */}
      <div className="ticker-strip">
        <div className="ticker-inner">
          {[...Array(2)].map((_, i) => (
            <span key={i} style={{display:'inline-flex',gap:'60px'}}>
              <span className="ticker-item">BTC/USDT <span className="up">▲ 2.4%</span></span>
              <span className="ticker-item">ETH/USDT <span className="up">▲ 3.1%</span></span>
              <span className="ticker-item">SOL/USDT <span className="up">▲ 5.2%</span></span>
              <span className="ticker-item">BNB/USDT <span className="down">▼ 0.8%</span></span>
              <span className="ticker-item">XRP/USDT <span className="up">▲ 1.9%</span></span>
              <span className="ticker-item">AltSignals Fund <span className="up">▲ 42% Weekly</span></span>
            </span>
          ))}
        </div>
      </div>

      {/* ABOUT */}
      <section id="about" style={{background:'#0F0F1A'}}>
        <div style={{maxWidth:'1200px',margin:'0 auto'}}>
          <div className="section-tag"><span className="section-tag-text">Why AltSignals</span></div>
          <h2 className="section-title" style={{marginBottom:'16px'}}>
            Where <span>precision</span> meets profitability
          </h2>
          <p style={{color:'var(--muted)',fontSize:'14px',fontWeight:'300',lineHeight:'1.8',maxWidth:'600px',marginBottom:'0'}}>
            AltSignals was built by professional traders tired of mediocre signals and unreliable platforms. Every signal, every trade, every decision is backed by years of market experience and rigorous analysis.
          </p>
          <div className="stats-grid">
            <div className="stat-card"><div className="stat-num">95%</div><div className="stat-label">Signal Win Rate</div></div>
            <div className="stat-card"><div className="stat-num">12K+</div><div className="stat-label">Active Members</div></div>
            <div className="stat-card"><div className="stat-num">$48M+</div><div className="stat-label">Profits Generated</div></div>
            <div className="stat-card"><div className="stat-num">5 Yrs</div><div className="stat-label">Track Record</div></div>
          </div>
        </div>
      </section>

      {/* PLANS */}
      <section id="plans" style={{background:'#0A0A0F'}}>
        <div style={{maxWidth:'1200px',margin:'0 auto'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',flexWrap:'wrap',gap:'24px'}}>
            <div>
              <div className="section-tag"><span className="section-tag-text">Fund Management</span></div>
              <h2 className="section-title">Choose your <span>growth</span> plan</h2>
            </div>
            <button className="btn-primary" onClick={() => handleProtectedRoute('/dashboard/plans')}>
              Start Investing →
            </button>
          </div>
          <div className="plans-grid">
            {[
              {tier:'Beginner', amount:'$2,000', weekly:'$2,100/wk', total:'$8,400', duration:'4 Weeks'},
              {tier:'Basic', amount:'$5,000', weekly:'$3,200/wk', total:'$19,200', duration:'6 Weeks'},
              {tier:'Elite', amount:'$10,000', weekly:'$5,500/wk', total:'$44,000', duration:'8 Weeks'},
              {tier:'Pro', amount:'$20,000', weekly:'$8,100/wk', total:'$129,600', duration:'4 Months'},
              {tier:'Corporate', amount:'$50,000', weekly:'$16,000/wk', total:'$384,000', duration:'6 Months'},
            ].map((plan, i) => (
              <div key={i} className="plan-card" onClick={() => handleProtectedRoute('/dashboard/plans')}>
                <div className="plan-tier">{plan.tier} Plan</div>
                <div className="plan-amount">{plan.amount}</div>
                <div className="plan-return">{plan.weekly}</div>
                <div className="plan-duration">{plan.duration} · Total: {plan.total}</div>
                <div className="plan-cta">Get Started →</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* VIP */}
      <section id="vip" style={{background:'#0F0F1A'}}>
        <div style={{maxWidth:'1200px',margin:'0 auto'}}>
          <div className="section-tag"><span className="section-tag-text">VIP Membership</span></div>
          <h2 className="section-title">Unlock <span>elite</span> access</h2>
          <div className="vip-grid">
            {[
              {
                tier:'Monthly',
                price:'$199',
                period:'per month',
                features:[
                  'VIP Futures Signals',
                  '95% Win Rate Signals',
                  '24/7 Trading Support'
                ]
              },
              {
                tier:'Lifetime',
                price:'$999',
                period:'one time',
                featured:true,
                features:[
                  'All Monthly VIP Benefits',
                  '1:1 Private Mentorship',
                  'Exclusive Private Signals',
                  'Copy Trading Access',
                  'Priority Support',
                  'Strategy Deep Dives',
                  'Portfolio Review Sessions'
                ]
              },
              {
                tier:'Premium',
                price:'$599',
                period:'180 days',
                features:[
                  'VIP Futures Signals',
                  '95% Win Rate Signals',
                  '24/7 Trading Support',
                  'Live Trading Sessions',
                  'All Future Updates',
                  'Daily Market Analysis',
                  'Members Only Community'
                ]
              }
            ].map((plan, i) => (
              <div key={i} className={`vip-card${plan.featured?' featured':''}`} onClick={() => handleProtectedRoute('/dashboard/vip')}>
                <div className="vip-tier">{plan.tier}</div>
                <div className="vip-price">{plan.price}</div>
                <div className="vip-period">{plan.period}</div>
                <ul className="vip-features">
                  {plan.features.map((f, j) => <li key={j}>{f}</li>)}
                </ul>
                <button className="btn-primary" style={{width:'100%',justifyContent:'center'}}>
                  Get {plan.tier} →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" style={{background:'#0A0A0F'}}>
        <div style={{maxWidth:'1200px',margin:'0 auto'}}>
          <div className="section-tag"><span className="section-tag-text">Our Services</span></div>
          <h2 className="section-title">Everything you need to <span>win</span></h2>
          <div className="services-grid">
            {[
              {num:'01', title:'Fund Management', desc:'Put your capital to work with our professional fund management program. Weekly returns paid consistently with full transparency on every trade.', tags:['Weekly Payouts','Fixed Returns','Bybit Sub-Account'], path:'/dashboard/plans'},
              {num:'02', title:'Copy Trading', desc:'Automatically mirror the trades of our expert traders in real time. Zero experience required — your account grows alongside ours.', tags:['Auto Mirror','Real Time','Risk Managed'], path:'/dashboard/copy-trading'},
              {num:'03', title:'VIP Signals', desc:'Receive high-precision futures and spot signals with entry, stop loss and take profit levels. 95% win rate backed by years of live trading.', tags:['Futures','Spot','95% Win Rate'], path:'/dashboard/vip'},
              {num:'04', title:'Trading Challenges', desc:'Prove your skills, earn rewards and gain access to funded accounts. Four tiers from Rookie to the exclusive Black Card Invitational.', tags:['4 Tiers','Prizes','Leaderboard'], path:'/dashboard/challenges'},
              {num:'05', title:'Trading Courses', desc:'Master the markets with our professional trading education. From beginner foundations to advanced institutional strategies.', tags:['6 Courses','1-on-1 Coaching','Lifetime Access'], path:'/dashboard/courses'},
              {num:'06', title:'Live Markets', desc:'Access real-time market data across crypto, forex and commodities. Professional-grade charting and analysis tools at your fingertips.', tags:['Real-Time','Multi-Asset','TradingView'], path:'/dashboard/markets'},
            ].map((s, i) => (
              <div key={i} className="service-card" onClick={() => handleProtectedRoute(s.path)}>
                <div className="service-num">{s.num}</div>
                <div className="service-title">{s.title}</div>
                <p className="service-desc">{s.desc}</p>
                <div className="service-tags">
                  {s.tags.map((t, j) => <span key={j} className="service-tag">{t}</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="section-tag" style={{justifyContent:'center',marginBottom:'24px'}}>
          <span className="section-tag-text">Join AltSignals</span>
        </div>
        <h2 className="cta-title">
          Stop guessing.<br />
          Start <span>winning.</span>
        </h2>
        <p className="cta-sub">
          Join over 12,000 traders already growing their wealth with AltSignals. Start with as little as $2,000.
        </p>
        <div className="cta-actions">
          <button className="btn-primary" onClick={() => router.push('/auth/register')}>Create Account →</button>
          <button className="btn-ghost" onClick={() => router.push('/auth/login')}>Sign In</button>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-top">
          <div>
            <div className="footer-logo-text"><span>ALT</span>SIGNALS</div>
            <p className="footer-tagline">Professional trading signals and fund management for traders who demand consistent results. Est. 2019.</p>
          </div>
          <div className="footer-col">
            <div className="footer-col-title">Platform</div>
            <a href="#" onClick={e=>{e.preventDefault();handleProtectedRoute('/dashboard/plans')}}>Fund Management</a>
            <a href="#" onClick={e=>{e.preventDefault();handleProtectedRoute('/dashboard/copy-trading')}}>Copy Trading</a>
            <a href="#" onClick={e=>{e.preventDefault();handleProtectedRoute('/dashboard/vip')}}>VIP Signals</a>
            <a href="#" onClick={e=>{e.preventDefault();handleProtectedRoute('/dashboard/challenges')}}>Challenges</a>
            <a href="#" onClick={e=>{e.preventDefault();handleProtectedRoute('/dashboard/courses')}}>Courses</a>
          </div>
          <div className="footer-col">
            <div className="footer-col-title">Company</div>
            <a href="/about">About Us</a>
            <a href="/performance">Performance</a>
            <a href="/contact">Contact</a>
          </div>
          <div className="footer-col">
            <div className="footer-col-title">Legal</div>
            <a href="/legal/privacy-policy">Privacy Policy</a>
            <a href="/legal/terms-of-service">Terms of Service</a>
            <a href="/legal/risk-disclosure">Risk Disclosure</a>
            <a href="/legal/aml-policy">AML Policy</a>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-legal">© 2026 AltSignals Ltd. All rights reserved.</div>
          <div className="footer-disclaimer">
            Trading involves significant risk of loss. Past performance is not indicative of future results. This platform is for informational purposes only and does not constitute financial advice.
          </div>
        </div>
      </footer>
    </div>
  )
}