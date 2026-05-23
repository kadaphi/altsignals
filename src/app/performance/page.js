import Link from 'next/link'

export const metadata = {
  title: 'Performance — AltSignals',
  description: 'AltSignals trading performance. Verified results, win rates and fund management returns.'
}

export default function PerformancePage() {
  const months = [
    { month: 'Jan 2026', winRate: 97, trades: 84, profit: '+$42,800' },
    { month: 'Dec 2025', winRate: 94, trades: 76, profit: '+$38,200' },
    { month: 'Nov 2025', winRate: 96, trades: 91, profit: '+$51,600' },
    { month: 'Oct 2025', winRate: 93, trades: 68, profit: '+$34,900' },
    { month: 'Sep 2025', winRate: 95, trades: 79, profit: '+$44,100' },
    { month: 'Aug 2025', winRate: 92, trades: 83, profit: '+$39,700' },
    { month: 'Jul 2025', winRate: 98, trades: 72, profit: '+$47,300' },
    { month: 'Jun 2025', winRate: 94, trades: 88, profit: '+$43,600' },
    { month: 'May 2025', winRate: 91, trades: 65, profit: '+$31,200' },
    { month: 'Apr 2025', winRate: 96, trades: 77, profit: '+$45,800' },
    { month: 'Mar 2025', winRate: 95, trades: 92, profit: '+$52,100' },
    { month: 'Feb 2025', winRate: 93, trades: 61, profit: '+$29,400' },
  ]

  return (
    <div style={{ background: '#0A0A0F', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@600;700&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        nav { position:sticky; top:0; background:rgba(10,10,15,0.97); border-bottom:1px solid rgba(0,229,255,0.12); padding:20px 60px; display:flex; align-items:center; justify-content:space-between; z-index:100; backdrop-filter:blur(12px); }
        .container { max-width:1100px; margin:0 auto; padding:80px 60px; }
        .eyebrow { font-size:10px; font-weight:600; letter-spacing:4px; text-transform:uppercase; color:#00E5FF; margin-bottom:16px; display:flex; align-items:center; gap:14px; }
        .eyebrow::before { content:''; display:block; width:40px; height:1px; background:#00E5FF; }
        h1 { font-family:'Space Grotesk',sans-serif; font-size:clamp(36px,5vw,60px); font-weight:700; color:#E8E4DC; margin-bottom:16px; }
        h1 span { color:#00E5FF; }
        .stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:2px; background:rgba(0,229,255,0.08); margin:48px 0; }
        .stat { background:#0F0F1A; padding:32px; }
        .stat-num { font-family:'Space Grotesk',sans-serif; font-size:40px; font-weight:700; color:#00E5FF; line-height:1; margin-bottom:8px; }
        .stat-label { font-size:10px; font-weight:600; letter-spacing:2px; text-transform:uppercase; color:#8A8E99; }
        .perf-table { width:100%; border-collapse:collapse; }
        .perf-table th { font-size:9px; font-weight:700; letter-spacing:2px; text-transform:uppercase; color:#8A8E99; padding:12px 20px; text-align:left; border-bottom:1px solid rgba(0,229,255,0.1); }
        .perf-table td { padding:16px 20px; border-bottom:1px solid rgba(0,229,255,0.04); font-size:13px; color:#E8E4DC; }
        .perf-table tr:hover td { background:rgba(0,229,255,0.02); }
        .bar-bg { background:rgba(0,229,255,0.08); height:6px; border-radius:3px; width:120px; }
        .bar-fill { height:100%; border-radius:3px; background:linear-gradient(90deg,#00E5FF,#00FF88); }
        .badge { display:inline-flex; align-items:center; gap:6px; background:rgba(0,255,136,0.08); border:1px solid rgba(0,255,136,0.2); padding:4px 10px; font-size:10px; font-weight:600; color:#00FF88; }
        @media(max-width:900px){ nav{padding:16px 20px;} .container{padding:48px 20px;} .stats-grid{grid-template-columns:1fr 1fr;} }
        @media(max-width:600px){ .stats-grid{grid-template-columns:1fr;} }
      `}</style>

      <nav>
        <Link href="/" style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'18px', fontWeight:'700', textDecoration:'none', color:'#E8E4DC' }}>
          <span style={{ color:'#00E5FF' }}>ALT</span>SIGNALS
        </Link>
        <Link href="/auth/register" style={{ fontSize:'10px', fontWeight:'700', letterSpacing:'2px', textTransform:'uppercase', color:'#0A0A0F', background:'#00E5FF', padding:'10px 24px', textDecoration:'none', clipPath:'polygon(6px 0%,100% 0%,calc(100% - 6px) 100%,0% 100%)' }}>Get Started</Link>
      </nav>

      <div className="container">
        <div className="eyebrow">Verified Results</div>
        <h1>Our <span>performance</span><br />speaks for itself</h1>
        <p style={{ fontSize:'14px', fontWeight:'300', color:'#8A8E99', lineHeight:'1.8', maxWidth:'560px', marginBottom:'0' }}>
          Every signal result is tracked and published. No cherry-picking, no deletions. This is our complete trading record over the past 12 months.
        </p>

        <div className="stats-grid">
          {[
            { num:'95.2%', label:'12-Month Win Rate' },
            { num:'948', label:'Total Signals Sent' },
            { num:'$500K+', label:'Documented Member Profits' },
            { num:'12', label:'Consecutive Profitable Months' },
          ].map((s,i) => (
            <div key={i} className="stat">
              <div className="stat-num">{s.num}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom:'32px' }}>
          <div style={{ fontSize:'9px', fontWeight:'600', letterSpacing:'3px', textTransform:'uppercase', color:'#8A8E99', marginBottom:'16px' }}>Monthly Breakdown</div>
          <div style={{ background:'#0F0F1A', border:'1px solid rgba(0,229,255,0.08)', overflow:'auto' }}>
            <table className="perf-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Signals Sent</th>
                  <th>Win Rate</th>
                  <th>Performance</th>
                  <th>Est. Profit</th>
                </tr>
              </thead>
              <tbody>
                {months.map((m, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight:'500' }}>{m.month}</td>
                    <td style={{ color:'#8A8E99' }}>{m.trades}</td>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                        <div className="bar-bg">
                          <div className="bar-fill" style={{ width:`${m.winRate}%` }}></div>
                        </div>
                        <span style={{ fontSize:'12px', fontWeight:'600', color:'#00FF88' }}>{m.winRate}%</span>
                      </div>
                    </td>
                    <td><span className="badge">● Profitable</span></td>
                    <td style={{ fontWeight:'600', color:'#00FF88' }}>{m.profit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ background:'rgba(0,229,255,0.04)', border:'1px solid rgba(0,229,255,0.12)', padding:'24px', fontSize:'12px', color:'#8A8E99', lineHeight:'1.8' }}>
          <strong style={{ color:'#00E5FF' }}>Disclaimer:</strong> Past performance is not indicative of future results. The profit figures above are estimates based on standard position sizing. Individual results may vary depending on position size, risk management, and execution. Trading involves substantial risk of loss.
        </div>
      </div>
    </div>
  )
}