import Link from 'next/link'

export const metadata = {
  title: 'Risk Disclosure — AltSignals',
  description: 'AltSignals Risk Disclosure Statement. Understanding the risks associated with trading and investment activities.'
}

export default function RiskDisclosure() {
  return (
    <div style={{ background: '#0A0A0F', minHeight: '100vh', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Space+Grotesk:wght@600;700&display=swap');
        * { margin:0; padding:0; box-sizing:border-box; }
        nav { position:sticky; top:0; background:rgba(10,10,15,0.97); border-bottom:1px solid rgba(0,229,255,0.12); padding:20px 60px; display:flex; align-items:center; justify-content:space-between; z-index:100; backdrop-filter:blur(12px); }
        .container { max-width:860px; margin:0 auto; padding:80px 40px; }
        h1 { font-family:'Space Grotesk',sans-serif; font-size:48px; font-weight:700; color:#E8E4DC; margin-bottom:12px; }
        h2 { font-family:'Space Grotesk',sans-serif; font-size:22px; font-weight:600; color:#E8E4DC; margin:48px 0 16px; padding-bottom:12px; border-bottom:1px solid rgba(0,229,255,0.1); }
        h3 { font-size:11px; font-weight:700; letter-spacing:2px; color:#00E5FF; margin:24px 0 10px; text-transform:uppercase; }
        p { font-size:14px; font-weight:300; line-height:1.9; color:#8A8E99; margin-bottom:16px; }
        ul { padding-left:20px; margin-bottom:16px; }
        li { font-size:14px; font-weight:300; line-height:1.9; color:#8A8E99; margin-bottom:6px; }
        .effective { font-size:11px; letter-spacing:2px; text-transform:uppercase; color:#00E5FF; margin-bottom:48px; display:block; }
        .warning { background:rgba(255,68,68,0.06); border-left:3px solid #FF4444; padding:20px 24px; margin:24px 0; }
        .warning p { margin:0; color:#FF6666; }
        .highlight { background:rgba(0,229,255,0.04); border-left:3px solid #00E5FF; padding:20px 24px; margin:24px 0; }
        .highlight p { margin:0; }
        @media(max-width:768px){ nav{padding:16px 20px;} .container{padding:48px 20px;} h1{font-size:32px;} }
      `}</style>

      <nav>
        <Link href="/" style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'18px', fontWeight:'700', textDecoration:'none', color:'#E8E4DC' }}>
          <span style={{ color:'#00E5FF' }}>ALT</span>SIGNALS
        </Link>
        <Link href="/" style={{ fontSize:'10px', fontWeight:'600', letterSpacing:'2px', textTransform:'uppercase', color:'#8A8E99', textDecoration:'none' }}>← Back to Home</Link>
      </nav>

      <div className="container">
        <h1>Risk Disclosure</h1>
        <span className="effective">Effective Date: January 1, 2026 · Last Updated: May 2026</span>

        <div className="warning">
          <p>WARNING: Trading and investment activities involve substantial risk of loss. You may lose some or all of your invested capital. Only invest funds you can afford to lose. Past performance is not indicative of future results.</p>
        </div>

        <h2>1. General Investment Risks</h2>
        <p>Before using AltSignals investment services, carefully consider whether such activities are appropriate for you in light of your financial circumstances, investment objectives, and risk tolerance. AltSignals strongly recommends seeking independent financial advice before making investment decisions.</p>

        <div className="highlight">
          <p>All investments carry risk. The value of investments can go down as well as up. Never invest money you cannot afford to lose entirely. AltSignals does not provide personalised financial advice.</p>
        </div>

        <h2>2. Cryptocurrency and Digital Asset Risks</h2>
        <h3>2.1 Market Volatility</h3>
        <p>Cryptocurrency markets are highly volatile and unpredictable. Digital asset prices can fluctuate dramatically within short periods, resulting in significant gains or losses. The market operates 24 hours a day, 7 days a week, and prices can change substantially at any time.</p>

        <h3>2.2 Regulatory Risk</h3>
        <p>The regulatory landscape for cryptocurrencies is evolving rapidly. Changes in laws or government policies could adversely affect the value of digital assets and our ability to operate in certain markets.</p>

        <h3>2.3 Technology Risk</h3>
        <p>Blockchain technology is subject to technical risks including software bugs, protocol vulnerabilities, network attacks, and unforeseen technical failures that could result in loss of funds.</p>

        <h2>3. Platform-Specific Risks</h2>
        <h3>3.1 Fund Management Plans</h3>
        <p>While our structured investment plans offer defined target returns, these targets are based on our trading strategies and market conditions. We cannot guarantee that target returns will be achieved within the specified timeframe.</p>

        <h3>3.2 Copy Trading Risks</h3>
        <p>Copy trading involves replicating expert trader strategies. Even experienced traders incur losses, and past performance does not guarantee future results. Performance may differ from historical results due to changing market conditions.</p>

        <h3>3.3 Signal Service Risks</h3>
        <p>Trading signals are provided for informational purposes only and do not constitute financial advice. Signal accuracy rates are based on historical data and are not guaranteed. Acting on signals involves significant risk of financial loss.</p>

        <h2>4. Operational Risks</h2>
        <p>Our platform may experience downtime due to maintenance, technical failures, or cyberattacks. Despite robust security measures, no online platform is completely immune to cybersecurity threats. We are not liable for losses incurred during platform unavailability.</p>

        <h2>5. Financial Risks</h2>
        <p>There is a risk that you may lose all or a significant portion of your invested capital. Withdrawal requests are subject to manual review and processing times may vary. Exchange rate movements can materially affect the real value of your investment returns.</p>

        <h2>6. Acknowledgment of Risk</h2>
        <div className="warning">
          <p>By using AltSignals services, you acknowledge that: you have read and understood this Risk Disclosure; you understand that all investments carry risk and you may lose your entire invested capital; you are making investment decisions based on your own independent judgment; and you are not relying on any representations made by AltSignals regarding investment returns or outcomes.</p>
        </div>

        <h2>7. Contact Us</h2>
        <p>For questions about the risks associated with our services, contact us at support@altsignals.finance.</p>
      </div>
    </div>
  )
}