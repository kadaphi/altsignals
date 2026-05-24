'use client'
import { useEffect, useRef, useState } from 'react'

const SYMBOLS = [
  { label: 'BTC/USDT', value: 'BINANCE:BTCUSDT' },
  { label: 'ETH/USDT', value: 'BINANCE:ETHUSDT' },
  { label: 'SOL/USDT', value: 'BINANCE:SOLUSDT' },
  { label: 'BNB/USDT', value: 'BINANCE:BNBUSDT' },
  { label: 'XRP/USDT', value: 'BINANCE:XRPUSDT' },
  { label: 'ADA/USDT', value: 'BINANCE:ADAUSDT' },
  { label: 'DOGE/USDT', value: 'BINANCE:DOGEUSDT' },
  { label: 'EUR/USD', value: 'FOREXCOM:EURUSD' },
  { label: 'GBP/USD', value: 'FOREXCOM:GBPUSD' },
  { label: 'Gold', value: 'TVC:GOLD' },
]

export default function MarketsPage() {
  const chartRef = useRef(null)
  const tickerRef = useRef(null)
  const [activeSymbol, setActiveSymbol] = useState('BINANCE:BTCUSDT')
  const [activeLabel, setActiveLabel] = useState('BTC/USDT')
  const chartScriptRef = useRef(null)

  useEffect(() => {
    if (tickerRef.current && !tickerRef.current.hasChildNodes()) {
      const script = document.createElement('script')
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js'
      script.async = true
      script.innerHTML = JSON.stringify({
        symbols: SYMBOLS.map(s => ({ proName: s.value, title: s.label })),
        showSymbolLogo: true,
        isTransparent: true,
        displayMode: 'adaptive',
        colorTheme: 'dark',
        locale: 'en'
      })
      tickerRef.current.appendChild(script)
    }
  }, [])

  useEffect(() => {
    if (!chartRef.current) return
    chartRef.current.innerHTML = ''
    const container = document.createElement('div')
    container.className = 'tradingview-widget-container__widget'
    container.style.height = '100%'
    container.style.width = '100%'
    chartRef.current.appendChild(container)
    const script = document.createElement('script')
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
    script.async = true
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: activeSymbol,
      interval: '15',
      timezone: 'Etc/UTC',
      theme: 'dark',
      style: '1',
      locale: 'en',
      enable_publishing: false,
      backgroundColor: '#0A0A0F',
      gridColor: 'rgba(0,229,255,0.04)',
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
    })
    chartRef.current.appendChild(script)
  }, [activeSymbol])

  return (
    <div style={{ maxWidth:'1100px', height:'calc(100vh - 140px)', display:'flex', flexDirection:'column' }}>
      <div style={{ marginBottom:'16px' }}>
        <div style={{ fontSize:'9px', fontWeight:'600', letterSpacing:'3px', textTransform:'uppercase', color:'#00E5FF', marginBottom:'8px' }}>Live Data</div>
        <h1 style={{ fontFamily:"'Space Grotesk',sans-serif", fontSize:'32px', fontWeight:'700', color:'#E8E4DC' }}>Markets</h1>
      </div>

      <div ref={tickerRef} style={{ marginBottom:'12px', height:'46px', overflow:'hidden' }}></div>

      <div style={{ display:'flex', gap:'6px', marginBottom:'12px', flexWrap:'wrap' }}>
        {SYMBOLS.map(s => (
          <button key={s.value} onClick={() => { setActiveSymbol(s.value); setActiveLabel(s.label) }}
            style={{ background: activeSymbol === s.value ? 'rgba(0,229,255,0.15)' : '#0F0F1A', border:`1px solid ${activeSymbol === s.value ? '#00E5FF' : 'rgba(0,229,255,0.08)'}`, color: activeSymbol === s.value ? '#00E5FF' : '#8A8E99', padding:'8px 14px', fontSize:'10px', fontWeight:'600', letterSpacing:'1px', cursor:'pointer', fontFamily:'Inter,sans-serif', transition:'all 0.2s' }}>
            {s.label}
          </button>
        ))}
      </div>

      <div style={{ flex:1, background:'#0A0A0F', border:'1px solid rgba(0,229,255,0.08)', overflow:'hidden', position:'relative' }}>
        <div ref={chartRef} className="tradingview-widget-container" style={{ height:'100%', width:'100%' }}></div>
      </div>
    </div>
  )
}