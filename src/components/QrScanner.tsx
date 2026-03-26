'use client'

import { useEffect, useRef, useState } from 'react'

interface QrScannerProps {
  onScan: (code: string) => void
}

export default function QrScanner({ onScan }: QrScannerProps) {
  const scannerRef = useRef<unknown>(null)
  const containerId = 'qr-scanner-container'
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState('')

  async function startScan() {
    setError('')
    setScanning(true)
    try {
      const { Html5QrcodeScanner } = await import('html5-qrcode')
      if (scannerRef.current) return

      const scanner = new Html5QrcodeScanner(
        containerId,
        { fps: 10, qrbox: { width: 220, height: 220 }, aspectRatio: 1.0 },
        false
      )

      scanner.render(
        (decodedText: string) => {
          // Extract code from URL if it was a QR link
          const url = (() => { try { return new URL(decodedText) } catch { return null } })()
          const code = url ? (url.searchParams.get('code') || decodedText) : decodedText.trim()
          onScan(code.toUpperCase())
          stopScan()
        },
        () => { /* scan error, ignore */ }
      )
      scannerRef.current = scanner
    } catch {
      setError('Kamera tidak tersedia. Masukkan kode manual.')
      setScanning(false)
    }
  }

  function stopScan() {
    if (scannerRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (scannerRef.current as any).clear().catch(console.error)
      scannerRef.current = null
    }
    setScanning(false)
  }

  useEffect(() => { return () => { stopScan() } }, [])

  return (
    <div className="space-y-3">
      {!scanning ? (
        <button
          type="button"
          onClick={startScan}
          className="btn-secondary !rounded-xl gap-2"
          style={{ borderStyle: 'dashed' }}
        >
          <span className="text-lg">📷</span>
          <span>Scan QR Code</span>
        </button>
      ) : (
        <div className="space-y-2">
          <div id={containerId} className="rounded-xl overflow-hidden" />
          <button
            type="button"
            onClick={stopScan}
            className="w-full py-2 text-sm font-bold rounded-xl"
            style={{ color: 'var(--text-muted)', background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            Batal
          </button>
        </div>
      )}
      {error && <p className="text-xs text-center py-2 font-medium" style={{ color: 'var(--danger)' }}>{error}</p>}
    </div>
  )
}
