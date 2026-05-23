import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy — AltSignals',
  description: 'AltSignals Privacy Policy. Learn how we collect, use, and protect your personal information.'
}

export default function PrivacyPolicy() {
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
        <h1>Privacy Policy</h1>
        <span className="effective">Effective Date: January 1, 2026 · Last Updated: May 2026</span>

        <div className="highlight">
          <p>This Privacy Policy describes how AltSignals Ltd ("AltSignals," "we," "us," or "our") collects, uses, discloses, and safeguards your information when you use our platform and services.</p>
        </div>

        <h2>1. Information We Collect</h2>
        <h3>1.1 Personal Identification Information</h3>
        <p>When you register or use our services, we collect information including your full legal name, email address, telephone number, country of residence, and government-issued identification documents for KYC verification.</p>

        <h3>1.2 Financial Information</h3>
        <p>To facilitate deposits, withdrawals, and investment activities, we collect cryptocurrency wallet addresses, transaction history, account balances, and payment confirmations.</p>

        <h3>1.3 Technical and Usage Information</h3>
        <p>We automatically collect IP address, browser type, operating system, device identifiers, pages visited, features used, and log files when you access our platform.</p>

        <h2>2. How We Use Your Information</h2>
        <ul>
          <li><strong style={{color:'#E8E4DC'}}>Account Management:</strong> To create, maintain, and secure your account and verify your identity</li>
          <li><strong style={{color:'#E8E4DC'}}>Service Delivery:</strong> To process transactions, execute investments, and provide copy trading services</li>
          <li><strong style={{color:'#E8E4DC'}}>Regulatory Compliance:</strong> To comply with KYC/AML requirements and applicable financial regulations</li>
          <li><strong style={{color:'#E8E4DC'}}>Communications:</strong> To send account notifications, security alerts, and service updates</li>
          <li><strong style={{color:'#E8E4DC'}}>Fraud Prevention:</strong> To detect, investigate, and prevent fraudulent transactions</li>
        </ul>

        <h2>3. Information Sharing</h2>
        <p>We do not sell, trade, or rent your personal information to third parties. We may share your information only with trusted service providers (NOWPayments, Resend, Supabase, Vercel) who are contractually obligated to maintain confidentiality, or when required by law.</p>

        <h2>4. Data Security</h2>
        <p>AltSignals implements industry-standard security measures including 256-bit SSL/TLS encryption, bcrypt password hashing, JWT-based authentication, email-based two-factor authentication, and strict access controls.</p>

        <h2>5. Your Rights</h2>
        <ul>
          <li><strong style={{color:'#E8E4DC'}}>Access:</strong> Request a copy of the personal information we hold about you</li>
          <li><strong style={{color:'#E8E4DC'}}>Correction:</strong> Request correction of inaccurate personal information</li>
          <li><strong style={{color:'#E8E4DC'}}>Deletion:</strong> Request deletion of your personal information, subject to legal retention requirements</li>
          <li><strong style={{color:'#E8E4DC'}}>Portability:</strong> Request transfer of your personal information</li>
        </ul>

        <h2>6. Data Retention</h2>
        <p>We retain your personal information for as long as your account is active or as needed to provide services, comply with legal obligations (typically 5-7 years for financial records), and resolve disputes.</p>

        <h2>7. Contact Us</h2>
        <p>For questions about this Privacy Policy, contact us at privacy@altsignals.finance or support@altsignals.finance.</p>
      </div>
    </div>
  )
}