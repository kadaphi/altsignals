'use client'
import { useEffect, useRef } from 'react'

export default function MarketsPage() {
  const chartRef = useRef(null)
  const tickerRef = useRef(null)

  useEffect(() => {
    if (chartRef.current) {
      const script = document.createElement('script')
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js'
      script.async = true
      script.innerHTML = JSON.stringify({
        autosize: true,
        symbol: 'BINANCE:BTCUSDT',
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
        calendar: false,
        hide_volume: false,
      })
      chartRef.current.appendChild(script)
    }

    if (tickerRef.current) {
      const script2 = document.createElement('script')
      script2.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js'
      script2.async = true
      script2.innerHTML = JSON.stringify({
        symbols: [
          { proName: 'BINANCE:BTCUSDT', title: 'BTC/USDT' },
          { proName: 'BINANCE:ETHUSDT', title: 'ETH/USDT' },
          { proName: 'BINANCE:SOLUSDT', title: 'SOL/USDT' },
          { proName: 'BINANCE:BNBUSDT', title: 'BNB/USDT' },
          { proName: 'BINANCE:XRPUSDT', title: 'XRP/USDT' },
          { proName: 'FOREXCOM:EURUSD', title: 'EUR/USD' },
          { proName: 'FOREXCOM:GBPUSD', title: 'GBP/USD' },
          { proName: 'TVC:GOLD', title: 'Gold' },
        ],
        showSymbolLogo: true,
        isTransparent: true,
        displayMode: 'adaptive',
        colorTheme: 'dark',
        locale: 'en'
      })
      tickerRef.current.appendChild(script2)
    }
  }, [])

  return (
    <div style={{ maxWidth: '1100px', height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '9px', fontWeight: '600', letterSpacing: '3px', textTransform: 'uppercase', color: '#00E5FF', marginBottom: '8px' }}>Live Data</div>
        <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '32px', fontWeight: '700', color: '#E8E4DC' }}>Markets</h1>
      </div>

      <div ref={tickerRef} style={{ marginBottom: '16px', height: '46px', overflow: 'hidden' }}></div>

      <div style={{ flex: 1, background: '#0A0A0F', border: '1px solid rgba(0,229,255,0.08)', overflow: 'hidden', position: 'relative' }}>
        <div ref={chartRef} className="tradingview-widget-container" style={{ height: '100%', width: '100%' }}>
          <div className="tradingview-widget-container__widget" style={{ height: '100%', width: '100%' }}></div>
        </div>
      </div>
    </div>
  )
}