'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface QrScannerProps {
  onScan: (code: string) => void
  autoStart?: boolean
}

export default function QrScanner({ onScan, autoStart = false }: QrScannerProps) {
  const scannerRef = useRef<any>(null)
  const mountedRef = useRef(true)
  const containerId = 'qr-scanner-container'
  const [scanning, setScanning] = useState(false)
  const [error, setError] = useState('')
  const [permissionDenied, setPermissionDenied] = useState(false)

  const stopScan = useCallback(async () => {
    const scanner = scannerRef.current
    if (scanner) {
      scannerRef.current = null // clear ref FIRST to prevent double-stop
      try {
        await scanner.stop()
        scanner.clear()
      } catch (e) {
        // already stopped, ignore
      }
    }
    if (mountedRef.current) setScanning(false)
  }, [])

  const startScan = useCallback(async () => {
    if (scannerRef.current) return // already running
    setError('')
    setPermissionDenied(false)
    setScanning(true)

    try {
      const { Html5Qrcode } = await import('html5-qrcode')
      
      // Check if the container element exists
      const container = document.getElementById(containerId)
      if (!container) {
        setError('Scanner container not found. Please try again.')
        setScanning(false)
        return
      }

      const scanner = new Html5Qrcode(containerId)
      scannerRef.current = scanner

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText: string) => {
          // Extract code from URL if it was a QR link
          const url = (() => { try { return new URL(decodedText) } catch { return null } })()
          const code = url ? (url.searchParams.get('code') || decodedText) : decodedText.trim()
          onScan(code.toUpperCase())
          stopScan()
        },
        () => { /* ignore scan errors (no QR found in frame) */ }
      )
    } catch (err: any) {
      const msg = err?.message || ''
      if (msg.includes('NotAllowedError') || msg.includes('Permission')) {
        setPermissionDenied(true)
        setError('Izin kamera ditolak. Aktifkan di pengaturan browser, lalu coba lagi.')
      } else if (msg.includes('NotFoundError') || msg.includes('Requested device not found')) {
        setError('Kamera tidak ditemukan di perangkat ini.')
      } else {
        setError('Kamera tidak tersedia. Masukkan kode manual.')
      }
      scannerRef.current = null
      if (mountedRef.current) setScanning(false)
    }
  }, [onScan, stopScan])

  // Auto-start camera when component mounts (if autoStart is true)
  useEffect(() => {
    if (autoStart) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => { startScan() }, 300)
      return () => clearTimeout(timer)
    }
  }, [autoStart, startScan])

  // Cleanup on unmount
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      stopScan()
    }
  }, [stopScan])

  return (
    <div className="space-y-3">
      {!scanning ? (
        <button
          type="button"
          onClick={startScan}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: 'var(--surface-hover)',
            border: '2px dashed var(--border-strong)',
            color: 'var(--text-primary)',
          }}
        >
          <span className="text-2xl">📷</span>
          <span>{permissionDenied ? 'Coba Buka Kamera Lagi' : 'Buka Kamera & Scan QR'}</span>
        </button>
      ) : (
        <div className="space-y-2">
          <div
            id={containerId}
            className="rounded-2xl overflow-hidden border-2"
            style={{ borderColor: 'var(--accent)', minHeight: '280px' }}
          />
          <button
            type="button"
            onClick={stopScan}
            className="w-full py-2 text-sm font-bold rounded-xl transition-all"
            style={{ color: 'var(--text-muted)', background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            ✕ Tutup Kamera
          </button>
        </div>
      )}
      {error && (
        <p className="text-xs text-center py-2 font-medium" style={{ color: 'var(--danger)' }}>
          {error}
        </p>
      )}
    </div>
  )
}
