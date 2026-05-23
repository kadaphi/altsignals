import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service — AltSignals',
  description: 'AltSignals Terms of Service. Read our terms and conditions governing use of our trading platform.'
}

export default function TermsOfService() {
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
        @media(max-width:768px){ nav{padding:16px 20px;} .container{padding:48px 20px;} h1{font-size:32px;} }
      `}</style>

      <nav>
        <Link href="/" style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'18px', fontWeight:'700', textDecoration:'none', color:'#E8E4DC' }}>
          <span style={{ color:'#00E5FF' }}>ALT</span>SIGNALS
        </Link>
        <Link href="/" style={{ fontSize:'10px', fontWeight:'600', letterSpacing:'2px', textTransform:'uppercase', color:'#8A8E99', textDecoration:'none' }}>← Back to Home</Link>
      </nav>

      <div className="container">
        <h1>Terms of Service</h1>
        <span className="effective">Effective Date: January 1, 2026 · Last Updated: May 2026</span>

        <div className="warning">
          <p>IMPORTANT: Please read these Terms of Service carefully before using AltSignals. By accessing or using our services, you agree to be bound by these terms.</p>
        </div>

        <h2>1. Acceptance of Terms</h2>
        <p>These Terms of Service constitute a legally binding agreement between you and AltSignals Ltd governing your access to and use of the AltSignals trading platform, website, and all associated services.</p>

        <h2>2. Eligibility</h2>
        <ul>
          <li>Be at least 18 years of age or the legal age of majority in your jurisdiction</li>
          <li>Have the legal capacity to enter into binding contracts</li>
          <li>Not be a resident of a jurisdiction where our services are prohibited</li>
          <li>Not be subject to any sanctions or restrictions imposed by any government authority</li>
          <li>Provide accurate, complete, and current information during registration</li>
        </ul>

        <h2>3. Account Registration and Security</h2>
        <h3>3.1 Account Creation</h3>
        <p>You must register for an account to access our services. You agree to provide accurate and truthful information. Each user may maintain only one account. Creating multiple accounts is prohibited.</p>

        <h3>3.2 Account Security</h3>
        <p>You are solely responsible for maintaining the confidentiality of your account credentials. Notify us immediately of any unauthorized access. AltSignals will not be liable for losses arising from your failure to protect your account.</p>

        <h2>4. Investment Services</h2>
        <h3>4.1 Fund Management Plans</h3>
        <p>AltSignals offers structured investment plans with defined terms and target returns. Investment capital is deducted from your deposit balance upon plan activation. Returns are credited to your withdrawal balance upon plan maturation.</p>

        <h3>4.2 Copy Trading</h3>
        <p>Our copy trading feature allows users to mirror expert trader strategies. Subscription fees are non-refundable. Target profit amounts are indicative and subject to market conditions.</p>

        <h3>4.3 VIP Membership</h3>
        <p>VIP membership provides access to exclusive trading signals and Telegram groups. Access is granted via single-use invite links issued upon subscription approval. Membership fees are non-refundable.</p>

        <h3>4.4 Trading Challenges</h3>
        <p>Entry fees for trading challenges are non-refundable. Challenge results are determined by our team based on performance criteria. Prizes are awarded at our discretion.</p>

        <h2>5. Deposits and Withdrawals</h2>
        <p>All deposits are processed via cryptocurrency payment gateways. Withdrawals are subject to manual review. We reserve the right to request additional verification before processing withdrawals. KYC verification is required for accounts with withdrawal balances of $5,000 or more.</p>

        <h2>6. Prohibited Activities</h2>
        <ul>
          <li>Money laundering or any illegal financial activities</li>
          <li>Using automated systems or bots to access our platform</li>
          <li>Attempting to hack or test the vulnerability of our systems</li>
          <li>Creating multiple accounts or using false identities</li>
          <li>Engaging in market manipulation or fraudulent activities</li>
          <li>Sharing account access with third parties</li>
        </ul>

        <h2>7. Disclaimers and Limitation of Liability</h2>
        <div className="warning">
          <p>THE SERVICES ARE PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. ALTSIGNALS DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED. IN NO EVENT SHALL ALTSIGNALS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES.</p>
        </div>

        <h2>8. Governing Law</h2>
        <p>These Terms shall be governed by and construed in accordance with the laws of the United Kingdom. Any disputes shall be resolved through binding arbitration in London, England.</p>

        <h2>9. Contact Information</h2>
        <p>For questions regarding these Terms, contact us at legal@altsignals.finance or support@altsignals.finance.</p>
      </div>
    </div>
  )
}