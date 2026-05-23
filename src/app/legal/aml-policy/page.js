import Link from 'next/link'

export const metadata = {
  title: 'AML Policy — AltSignals',
  description: 'AltSignals Anti-Money Laundering Policy. Our commitment to preventing financial crime and maintaining regulatory compliance.'
}

export default function AMLPolicy() {
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
        <h1>AML Policy</h1>
        <span className="effective">Effective Date: January 1, 2026 · Last Updated: May 2026</span>

        <div className="highlight">
          <p>AltSignals Ltd is committed to the highest standards of Anti-Money Laundering (AML) and Counter-Terrorist Financing (CTF) compliance. This policy outlines our framework for detecting, preventing, and reporting financial crime.</p>
        </div>

        <h2>1. Introduction and Commitment</h2>
        <p>AltSignals Ltd maintains a robust AML/CTF compliance program in accordance with applicable international standards, including FATF recommendations and relevant regulatory frameworks. We are committed to ensuring our platform is not used for money laundering, terrorist financing, fraud, or any other financial crime.</p>

        <h2>2. Know Your Customer (KYC) Program</h2>
        <h3>2.1 Customer Identification</h3>
        <p>All users are required to complete our identity verification process for withdrawals above $5,000. Our KYC program includes collection of full legal name and country of residence, verification of government-issued photo identification, and biometric verification through selfie with identification document.</p>

        <h3>2.2 Acceptable Identification Documents</h3>
        <ul>
          <li>Valid national passport</li>
          <li>Government-issued national identity card</li>
          <li>Valid driver's licence (where accepted as primary ID)</li>
          <li>Residence permit issued by competent authority</li>
        </ul>

        <h3>2.3 Enhanced Due Diligence</h3>
        <p>AltSignals applies enhanced due diligence to customers presenting higher AML/CTF risks, including Politically Exposed Persons (PEPs), customers from high-risk jurisdictions, and customers conducting unusually large or frequent transactions.</p>

        <h2>3. Transaction Monitoring</h2>
        <p>We implement comprehensive transaction monitoring to detect suspicious activity, including automated screening against sanctions lists, review of large transactions exceeding defined thresholds, analysis of rapid succession deposits and withdrawals, and monitoring of geographic risk factors and IP addresses.</p>

        <h2>4. Suspicious Activity Reporting</h2>
        <p>When suspicious activity is identified, our compliance team will document all relevant information, file Suspicious Activity Reports with relevant authorities as required, freeze affected accounts pending investigation where appropriate, and cooperate fully with law enforcement.</p>

        <div className="warning">
          <p>We are prohibited by law from informing any person that a suspicious activity report has been filed or that an investigation is underway. This is known as the "tipping-off" prohibition.</p>
        </div>

        <h2>5. Sanctions Compliance</h2>
        <p>AltSignals screens all customers and transactions against applicable sanctions lists maintained by the United Nations Security Council, European Union, United States OFAC, and UK OFSI. We will not conduct business with individuals or entities subject to applicable sanctions.</p>

        <h2>6. Prohibited Activities</h2>
        <ul>
          <li>Depositing funds derived from criminal activity</li>
          <li>Using our platform to transfer or conceal proceeds of crime</li>
          <li>Financing or supporting terrorist organisations or activities</li>
          <li>Evading taxes or other financial obligations</li>
          <li>Violating applicable sanctions or export controls</li>
          <li>Using our platform from sanctioned jurisdictions</li>
        </ul>

        <h2>7. Record Keeping</h2>
        <p>AltSignals maintains comprehensive records of all customer identification information, transaction records, and AML/CTF compliance activities for a minimum period of five years, or longer where required by applicable law.</p>

        <h2>8. Consequences of Violations</h2>
        <ul>
          <li>Immediate suspension or termination of your account</li>
          <li>Freezing of account balances pending investigation</li>
          <li>Reporting to relevant law enforcement and regulatory authorities</li>
          <li>Forfeiture of funds identified as proceeds of crime</li>
          <li>Civil and criminal liability under applicable laws</li>
        </ul>

        <h2>9. Contact Our Compliance Team</h2>
        <p>For questions about our AML policy or to report suspicious activity, contact us at compliance@altsignals.finance or support@altsignals.finance.</p>
      </div>
    </div>
  )
}